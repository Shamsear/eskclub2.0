import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createErrorResponse, UnauthorizedError } from "@/lib/errors";
import { RoleType } from "@prisma/client";
import { revalidatePath } from "next/cache";

interface BulkMember {
  name: string;
  email?: string;
  phone?: string;
  country?: string;
  state?: string;
  district?: string;
  dateOfBirth?: string;
  role?: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      throw new UnauthorizedError();
    }

    const { id } = await params;
    const clubId = parseInt(id);

    if (isNaN(clubId)) {
      return NextResponse.json(
        { error: "Invalid club ID" },
        { status: 400 }
      );
    }

    // Verify club exists
    const club = await prisma.club.findUnique({
      where: { id: clubId },
    });

    if (!club) {
      return NextResponse.json(
        { error: "Club not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { members } = body as { members: BulkMember[] };

    console.log('Received members:', JSON.stringify(members, null, 2));

    if (!Array.isArray(members) || members.length === 0) {
      return NextResponse.json(
        { error: "No members provided" },
        { status: 400 }
      );
    }

    let added = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const member of members) {
      try {
        console.log('Processing member:', member.name, 'Email:', member.email);
        
        // Check if player with this email already exists (only if email is provided)
        if (member.email && member.email.trim() !== '') {
          console.log('Checking for existing email:', member.email);
          const existing = await prisma.player.findUnique({
            where: { email: member.email },
          });

          if (existing) {
            console.log('Found existing player with email:', member.email);
            skipped++;
            continue;
          }
        }

        // Prepare place field
        let place = null;
        if (member.country === 'India' && member.district && member.state) {
          place = `${member.district}, ${member.state}, India`;
        } else if (member.country === 'India' && member.state) {
          place = `${member.state}, India`;
        } else if (member.country) {
          place = member.country;
        }

        // Prepare date of birth
        const dateOfBirth = member.dateOfBirth
          ? new Date(member.dateOfBirth)
          : null;

        // Determine role (default to PLAYER)
        const role = member.role && Object.values(RoleType).includes(member.role as RoleType)
          ? (member.role as RoleType)
          : RoleType.PLAYER;

        // Generate email if not provided (required by schema unique constraint)
        const playerEmail = member.email && member.email.trim() !== ''
          ? member.email
          : `noemail_${Date.now()}_${Math.random().toString(36).substring(7)}@placeholder.local`;

        // Create player with role
        await prisma.player.create({
          data: {
            clubId,
            name: member.name,
            email: playerEmail,
            phone: member.phone || null,
            place,
            dateOfBirth,
            roles: {
              create: {
                role,
              },
            },
          },
        });

        console.log('Successfully added:', member.name);
        added++;
      } catch (error) {
        console.error('Error adding member:', member.name, error);
        errors.push(`Failed to add ${member.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Revalidate relevant paths
    revalidatePath('/dashboard');
    revalidatePath(`/dashboard/clubs/${clubId}`);
    
    return NextResponse.json({
      success: true,
      added,
      skipped,
      errors: errors.length > 0 ? errors : undefined,
      message: `Successfully added ${added} member(s)`,
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}
