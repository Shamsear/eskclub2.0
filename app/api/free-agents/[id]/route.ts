import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const freeAgent = await prisma.player.findUnique({
      where: {
        id: parseInt(id),
        clubId: null,
      },
    });

    if (!freeAgent) {
      return NextResponse.json(
        { error: "Free agent not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(freeAgent);
  } catch (error) {
    console.error("Error fetching free agent:", error);
    return NextResponse.json(
      { error: "Failed to fetch free agent" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, email, phone, dateOfBirth, state, district } = body;

    // Check if free agent exists
    const existingFreeAgent = await prisma.player.findUnique({
      where: {
        id: parseInt(id),
        clubId: null,
      },
    });

    if (!existingFreeAgent) {
      return NextResponse.json(
        { error: "Free agent not found" },
        { status: 404 }
      );
    }

    // Check if email is being changed and if it's already taken
    if (email !== existingFreeAgent.email) {
      const emailTaken = await prisma.player.findUnique({
        where: { email },
      });

      if (emailTaken) {
        return NextResponse.json(
          { error: "A player with this email already exists" },
          { status: 400 }
        );
      }
    }

    const updatedFreeAgent = await prisma.player.update({
      where: { id: parseInt(id) },
      data: {
        name,
        email,
        phone,
        dateOfBirth: new Date(dateOfBirth),
        state,
        district,
      },
    });

    return NextResponse.json(updatedFreeAgent);
  } catch (error) {
    console.error("Error updating free agent:", error);
    return NextResponse.json(
      { error: "Failed to update free agent" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if free agent exists
    const freeAgent = await prisma.player.findUnique({
      where: {
        id: parseInt(id),
        clubId: null,
      },
    });

    if (!freeAgent) {
      return NextResponse.json(
        { error: "Free agent not found" },
        { status: 404 }
      );
    }

    await prisma.player.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: "Free agent deleted successfully" });
  } catch (error) {
    console.error("Error deleting free agent:", error);
    return NextResponse.json(
      { error: "Failed to delete free agent" },
      { status: 500 }
    );
  }
}
