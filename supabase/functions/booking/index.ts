import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1"

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, x-owner-session, authorization",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
}

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  })
}

function restOfPath(url: URL) {
  const parts = url.pathname.split("/").filter(Boolean)
  const idx = parts.lastIndexOf("booking")
  return `/${parts.slice(idx + 1).join("/")}`.replace(/\/$/, "") || "/"
}

async function sendSms(to: string, body: string) {
  const sid = Deno.env.get("TWILIO_ACCOUNT_SID")
  const token = Deno.env.get("TWILIO_AUTH_TOKEN")
  const from = Deno.env.get("TWILIO_FROM_NUMBER")
  if (!sid || !token || !from) return false
  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`${sid}:${token}`)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ To: to, From: from, Body: body }),
  })
  return response.ok
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors })

  const url = new URL(req.url)
  const path = restOfPath(url)
  const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "")

  try {
    if (req.method === "GET" && path === "/day") {
      const date = url.searchParams.get("date")
      const { data, error } = await supabase.rpc("public_day", { p_date: date })
      if (error) return json(400, { error: error.message })
      return json(200, data)
    }

    if (req.method === "POST" && path === "/book") {
      const body = await req.json()
      const { data, error } = await supabase.rpc("book_slot", {
        p_date: body.date,
        p_start: body.startMinute,
        p_duration: body.durationMin,
        p_name: body.name,
        p_phone: body.phone,
        p_email: body.email,
      })
      if (error) {
        const message = error.message.includes("UNAVAILABLE") ? "That time was just taken." : error.message
        return json(error.message.includes("UNAVAILABLE") ? 409 : 400, { error: message })
      }
      return json(201, data)
    }

    return json(404, { error: "Not found" })
  } catch (error) {
    return json(500, { error: error instanceof Error ? error.message : "Server error" })
  }
})
