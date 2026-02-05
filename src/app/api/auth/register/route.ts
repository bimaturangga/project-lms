import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import { NextRequest, NextResponse } from "next/server";

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    // Check if user exists
    const existingUser = await client.query(api.users.getUserByEmail, {
      email,
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email sudah terdaftar" },
        { status: 400 },
      );
    }

    // Create user
    const userId = await client.mutation(api.users.createUser, {
      name,
      email,
      password, // In production, hash this password
      role: "student",
    });

    // Get created user
    const user = await client.query(api.users.getUserById, { userId });

    if (!user) {
      throw new Error("Failed to create user");
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({ user: userWithoutPassword });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Registrasi gagal" },
      { status: 500 },
    );
  }
}
