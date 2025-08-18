import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    // Parse the request body to get email and password
    const { email, password } = await request.json();

    // Validate that both email and password are provided
    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    // Use Prisma Client to find a user with the provided email and include their roles
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
      include: {
        userRoles: true,
      },
    });

    // If user is not found, return error
    if (!user) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Use bcrypt to securely compare the provided password with the hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Extract roles from userRoles
    const roles = user.userRoles.map(userRole => userRole.role);

    // If user is found and password matches, return success
    return NextResponse.json(
      { 
        message: "Login successful",
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          roles: roles,
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
