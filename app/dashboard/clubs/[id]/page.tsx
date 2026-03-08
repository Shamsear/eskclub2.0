import { requireAuth } from "@/lib/auth-utils";
import { notFound } from "next/navigation";
import { ClubDetails } from "@/components/ClubDetails";
import { getClubHierarchy } from "@/lib/data/clubs";

export default async function ClubDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAuth();

  const { id } = await params;
  const clubData = await getClubHierarchy(id);

  if (!clubData) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto">
      <ClubDetails clubData={clubData} />
    </div>
  );
}
