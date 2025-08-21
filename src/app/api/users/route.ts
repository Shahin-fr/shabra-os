import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
      orderBy: {
        firstName: 'asc',
      },
    });

    return NextResponse.json(users);
  } catch {
    return NextResponse.json(
      { error: "خطا در دریافت لیست کاربران" },
      { status: 500 }
    );
  }
}
