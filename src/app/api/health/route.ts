import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // 1. Direct raw SQL check through Neon connection (cast current_database to text)
    const rawResult = await prisma.$queryRaw<Array<{ now: Date; current_database: string }>>`
      SELECT NOW() as now, CURRENT_DATABASE()::text as current_database
    `;

    // 2. Prisma ORM model query check
    const productCount = await prisma.product.count();
    const userCount = await prisma.user.count();

    return NextResponse.json({
      status: "healthy",
      service: "neon-postgres",
      branch: process.env.NEON_BRANCH || "production",
      database: rawResult[0]?.current_database || "neondb",
      timestamp: rawResult[0]?.now,
      counts: {
        products: productCount,
        users: userCount,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { status: "error", message },
      { status: 500 }
    );
  }
}
