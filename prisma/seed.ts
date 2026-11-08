import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";
import ws from "ws";

// Set WebSocket constructor for Node.js environments (required by Neon serverless driver over WS)
if (typeof WebSocket === "undefined") {
  neonConfig.webSocketConstructor = ws;
}

const connectionString =
  process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL / DATABASE_URL_UNPOOLED not set. Copy .env.example to .env.local first."
  );
}

const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString }),
});

const SELLER_EMAIL = "seller@toxtoe.dev";
const BUYER_EMAIL = "buyer@toxtoe.dev";

const SEED_PRODUCTS = [
  {
    slug: "neon-glitch-shader",
    title: "Neon Glitch Shader",
    price: 1800, // $18.00 USD
    thumbnail_url:
      "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80",
    fileType: "TOX" as const,
    description:
      "A GLSL component that layers chromatic aberration, scanlines, and signal-style glitch breaks over any TOP input. Built for live performance and video-reactive work.",
    delivery_url: "https://drive.google.com/file/d/DUMMY_TOX_GLITCH/view?usp=sharing",
  },
  {
    slug: "audio-reactive-geometry",
    title: "Audio Reactive Geometry",
    price: 3200, // $32.00 USD
    thumbnail_url:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
    fileType: "TOE" as const,
    description:
      "A full .toe project network that drives geometric instances from audio analysis. Includes a performance UI and multiple audio-reactive presets.",
    delivery_url: "https://drive.google.com/file/d/DUMMY_TOE_AUDIO/view?usp=sharing",
  },
  {
    slug: "fluid-sim-particles",
    title: "Fluid Sim Particles",
    price: 4500, // $45.00 USD
    thumbnail_url:
      "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=800&q=80",
    fileType: "TOX" as const,
    description:
      "A GPU fluid simulation component with particle advection, color fields, and multi-resolution controls. Optimized for real-time use.",
    delivery_url: "https://www.mediafire.com/file/DUMMY_TOX_FLUID/file",
  },
  {
    slug: "vj-dashboard-ui",
    title: "VJ Dashboard UI",
    price: 2900, // $29.00 USD
    thumbnail_url:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
    fileType: "BOTH" as const,
    description:
      "A complete dashboard and control surface for VJ workflows. Includes both .tox components and a starter .toe project, ready to map to your own controllers.",
    delivery_url: "https://www.mediafire.com/file/DUMMY_BOTH_VJ/file",
  },
];

async function main() {
  // 1. Upsert the dummy seller user
  const seller = await prisma.user.upsert({
    where: { email: SELLER_EMAIL },
    update: { role: "SELLER", name: "toxtoe Studio" },
    create: {
      email: SELLER_EMAIL,
      name: "toxtoe Studio",
      role: "SELLER",
    },
  });

  console.log(`Seller ready: ${seller.email} (${seller.id})`);

  // 1b. Upsert the dummy buyer user (test login)
  const buyer = await prisma.user.upsert({
    where: { email: BUYER_EMAIL },
    update: { role: "USER", name: "Buyer Test" },
    create: {
      email: BUYER_EMAIL,
      name: "Buyer Test",
      role: "USER",
    },
  });

  console.log(`Buyer ready: ${buyer.email} (${buyer.id})`);

  // 2. Upsert products by unique slug (idempotent)
  for (const product of SEED_PRODUCTS) {
    const created = await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        title: product.title,
        price: product.price,
        thumbnail_url: product.thumbnail_url,
        fileType: product.fileType,
        description: product.description,
        delivery_url: product.delivery_url,
        sellerId: seller.id,
        isPublished: true,
      },
      create: {
        slug: product.slug,
        title: product.title,
        price: product.price,
        thumbnail_url: product.thumbnail_url,
        fileType: product.fileType,
        description: product.description,
        delivery_url: product.delivery_url,
        sellerId: seller.id,
        isPublished: true,
      },
    });
    console.log(`Product ready: ${created.slug} (${created.id})`);
  }

  const count = await prisma.product.count();
  console.log(`Seeding complete. Total products in DB: ${count}`);
}

main()
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
