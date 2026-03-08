import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const freeAgents = await prisma.player.findMany({
      where: {
        clubId: null,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(freeAgents);
  } catch (error) {
    console.error("Error fetching free agents:", error);
    return NextResponse.json(
      { error: "Failed to fetch free agents" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, phone, dateOfBirth, state, district } = body;

    // Validate required fields
    if (!name || !email || !phone || !dateOfBirth || !state || !district) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingPlayer = await prisma.player.findUnique({
      where: { email },
    });

    if (existingPlayer) {
      return NextResponse.json(
        { error: "A player with this email already exists" },
        { status: 400 }
      );
    }

    const freeAgent = await prisma.player.create({
      data: {
        name,
        email,
        phone,
        dateOfBirth: new Date(dateOfBirth),
        gender: "MALE",
        state,
        district,
        clubId: null, // Explicitly set to null for free agents
      },
    });

    return NextResponse.json(freeAgent, { status: 201 });
  } catch (error) {
    console.error("Error creating free agent:", error);
    return NextResponse.json(
      { error: "Failed to create free agent" },
      { status: 500 }
    );
  }
}
