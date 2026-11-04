create table shop_days (
  date date primary key,
  capacity int not null default 2 check (capacity between 1 and 4)
);

create table appointments (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  start_minute int not null check (start_minute >= 0 and start_minute < 1440),
  duration_min int not null check (duration_min in (30, 60)),
  chair_index int not null check (chair_index >= 0 and chair_index <= 3),
  source text not null check (source in ('web', 'walkin')),
  customer_name text,
  customer_phone text,
  customer_email text,
  cancel_token text unique,
  status text not null default 'booked' check (status in ('booked', 'cancelled')),
  created_at timestamptz not null default now(),
  cancelled_at timestamptz
);

create table occupancy (
  date date not null,
  chair_index int not null,
  slot_minute int not null,
  appointment_id uuid not null references appointments (id) on delete cascade,
  primary key (date, chair_index, slot_minute)
);

create index occupancy_date_idx on occupancy (date);
create index appointments_phone_idx on appointments (customer_phone) where status = 'booked';

create table owner_sessions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

alter table shop_days enable row level security;
alter table appointments enable row level security;
alter table occupancy enable row level security;
alter table owner_sessions enable row level security;

create policy shop_days_read on shop_days for select using (true);
create policy occupancy_read on occupancy for select using (true);

create or replace function chair_is_free(p_date date, p_chair int, p_start int, p_duration int)
returns boolean
language sql
stable
as $$
  select
    not exists (
      select 1
      from occupancy o
      join appointments a on a.id = o.appointment_id
      where a.status = 'booked'
        and o.date = p_date
        and o.chair_index = p_chair
        and o.slot_minute = p_start
    )
    and (
      p_duration = 30
      or not exists (
        select 1
        from occupancy o
        join appointments a on a.id = o.appointment_id
        where a.status = 'booked'
          and o.date = p_date
          and o.chair_index = p_chair
          and o.slot_minute = p_start + 30
      )
    );
$$;

create or replace function day_capacity(p_date date)
returns int
language sql
stable
as $$
  select coalesce((select capacity from shop_days where date = p_date), 2);
$$;

create or replace function day_hours(p_date date, out open_minute int, out close_minute int)
language plpgsql
stable
as $$
begin
  if extract(dow from p_date) = 0 then
    open_minute := 10 * 60;
    close_minute := 18 * 60;
  else
    open_minute := 10 * 60;
    close_minute := 20 * 60;
  end if;
end;
$$;

create or replace function public_day(p_date date)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  cap int;
  hours record;
  starts30 int[] := '{}';
  starts60 int[] := '{}';
  t int;
  chair int;
  today date;
  now_min int;
  found boolean;
begin
  cap := day_capacity(p_date);
  select * into hours from day_hours(p_date);
  today := (timezone('America/Toronto', now()))::date;
  now_min := extract(hour from timezone('America/Toronto', now()))::int * 60
    + extract(minute from timezone('America/Toronto', now()))::int;

  t := hours.open_minute;
  while t <= hours.close_minute - 30 loop
    if p_date > today or (p_date = today and t > now_min) then
      found := false;
      for chair in 0 .. cap - 1 loop
        if chair_is_free(p_date, chair, t, 30) then
          found := true;
          exit;
        end if;
      end loop;
      if found then starts30 := array_append(starts30, t); end if;
    end if;
    t := t + 30;
  end loop;

  t := hours.open_minute;
  while t <= hours.close_minute - 60 loop
    if p_date > today or (p_date = today and t > now_min) then
      found := false;
      for chair in 0 .. cap - 1 loop
        if chair_is_free(p_date, chair, t, 60) then
          found := true;
          exit;
        end if;
      end loop;
      if found then starts60 := array_append(starts60, t); end if;
    end if;
    t := t + 30;
  end loop;

  return jsonb_build_object(
    'date', p_date,
    'capacity', cap,
    'openMinute', hours.open_minute,
    'closeMinute', hours.close_minute,
    'starts30', to_jsonb(starts30),
    'starts60', to_jsonb(starts60)
  );
end;
$$;

grant execute on function public_day(date) to anon, authenticated;

create or replace function book_slot(
  p_date date,
  p_start int,
  p_duration int,
  p_name text,
  p_phone text,
  p_email text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  cap int;
  hours record;
  chair int;
  chosen int := -1;
  new_id uuid;
  token text;
  today date;
  now_min int;
  upcoming int;
begin
  perform pg_advisory_xact_lock(hashtext(p_date::text));

  if p_duration not in (30, 60) then raise exception 'LENGTH'; end if;
  if length(trim(p_name)) < 2 then raise exception 'NAME'; end if;
  if p_phone is null or length(p_phone) < 12 then raise exception 'PHONE'; end if;
  if p_email is null or position('@' in p_email) < 2 then raise exception 'EMAIL'; end if;

  today := (timezone('America/Toronto', now()))::date;
  now_min := extract(hour from timezone('America/Toronto', now()))::int * 60
    + extract(minute from timezone('America/Toronto', now()))::int;
  if p_date < today or p_date > today + 14 then raise exception 'HORIZON'; end if;
  if p_date = today and p_start <= now_min then raise exception 'PAST'; end if;

  select * into hours from day_hours(p_date);
  if p_start < hours.open_minute or p_start + p_duration > hours.close_minute or p_start % 30 <> 0 then
    raise exception 'HOURS';
  end if;

  select count(*) into upcoming
  from appointments
  where status = 'booked'
    and customer_phone = p_phone
    and (date > today or (date = today and start_minute > now_min));
  if upcoming >= 3 then raise exception 'LIMIT'; end if;

  cap := day_capacity(p_date);
  for chair in 0 .. cap - 1 loop
    if chair_is_free(p_date, chair, p_start, p_duration) then
      chosen := chair;
      exit;
    end if;
  end loop;
  if chosen < 0 then raise exception 'UNAVAILABLE'; end if;

  new_id := gen_random_uuid();
  token := encode(gen_random_bytes(24), 'base64');
  insert into appointments (
    id, date, start_minute, duration_min, chair_index, source, customer_name, customer_phone, customer_email, cancel_token, status
  ) values (
    new_id, p_date, p_start, p_duration, chosen, 'web', trim(p_name), p_phone, lower(trim(p_email)), token, 'booked'
  );
  insert into occupancy (date, chair_index, slot_minute, appointment_id)
  values (p_date, chosen, p_start, new_id);
  if p_duration = 60 then
    insert into occupancy (date, chair_index, slot_minute, appointment_id)
    values (p_date, chosen, p_start + 30, new_id);
  end if;

  return jsonb_build_object(
    'id', new_id,
    'date', p_date,
    'startMinute', p_start,
    'durationMin', p_duration,
    'name', trim(p_name),
    'phone', p_phone,
    'email', lower(trim(p_email)),
    'cancelToken', token
  );
end;
$$;
