import { photo, type Shot } from "./media"

export const heroShot: Shot = {
  src: photo("hero.jpg"),
  alt: "A barber lining a beard with shears while a client sits in profile",
  width: 2000,
  height: 3000,
  position: "object-[62%_30%]",
}

export const introShot: Shot = {
  src: photo("intro.jpg"),
  alt: "Clippers working through a textured crop, seen from behind the chair",
  width: 1800,
  height: 1200,
  position: "object-[center_40%]",
}

export const chairShot: Shot = {
  src: photo("chair.jpg"),
  alt: "A barber's hands setting a hard part with a comb",
  width: 1800,
  height: 1201,
  position: "object-[center_45%]",
}

export const toolsShot: Shot = {
  src: photo("shop-tools.jpg"),
  alt: "A row of barber shears hanging on a dark rail",
  width: 2000,
  height: 1333,
  position: "object-center",
}

export const floorShot: Shot = {
  src: photo("look-crop.jpg"),
  alt: "White sneakers under a striped barber cape, on a concrete floor",
  width: 1800,
  height: 1200,
  position: "object-[center_60%]",
}

export type Look = {
  index: string
  title: string
  image: Shot
  span: string
  aspect: string
}

export const lookbook: Look[] = [
  {
    index: "01",
    title: "Skin fade",
    span: "md:col-span-7",
    aspect: "aspect-[4/5]",
    image: {
      src: photo("look-fade.jpg"),
      alt: "A skin fade being lined with a comb against the head",
      width: 1800,
      height: 2696,
      position: "object-[center_35%]",
    },
  },
  {
    index: "02",
    title: "Hard line",
    span: "md:col-span-5 md:mt-16",
    aspect: "aspect-[4/5]",
    image: {
      src: photo("look-line.jpg"),
      alt: "Clippers carving a hard line into a short fade",
      width: 1800,
      height: 1200,
      position: "object-[center_40%]",
    },
  },
  {
    index: "03",
    title: "Beard",
    span: "md:col-span-5",
    aspect: "aspect-[4/5]",
    image: {
      src: photo("look-beard.jpg"),
      alt: "A beard being shaped with a straight razor against a plain wall",
      width: 1800,
      height: 1200,
      position: "object-[center_30%]",
    },
  },
  {
    index: "04",
    title: "In the chair",
    span: "md:col-span-7",
    aspect: "aspect-[4/3]",
    image: floorShot,
  },
]
