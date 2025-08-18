import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const storyTypes = await prisma.storyType.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(storyTypes);
  } catch (error) {
    console.error("Error fetching story types:", error);
    return NextResponse.json(
      { error: "خطا در دریافت انواع استوری" },
      { status: 500 }
    );
  }
}
