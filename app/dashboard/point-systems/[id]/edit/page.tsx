import { requireAuth } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { PointSystemForm } from "@/components/PointSystemForm";
import { Card } from "@/components/ui/Card";
import { notFound } from "next/navigation";

async function getPointSystemTemplate(id: number) {
  const template = await prisma.pointSystemTemplate.findUnique({
    where: { id },
    include: {
      conditionalRules: {
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  });

  if (!template) {
    notFound();
  }

  return template;
}

export default async function EditPointSystemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAuth();

  const { id } = await params;
  const templateId = parseInt(id, 10);
  if (isNaN(templateId)) {
    notFound();
  }

  const template = await getPointSystemTemplate(templateId);

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Edit Point System Template
        </h1>
        <p className="text-gray-600 mt-1">
          Update the configuration for &quot;{template.name}&quot;
        </p>
      </div>

      <Card padding="lg">
        <PointSystemForm
          mode="edit"
          initialData={{
            id: template.id,
            name: template.name,
            description: template.description,
            pointsPerWin: template.pointsPerWin,
            pointsPerDraw: template.pointsPerDraw,
            pointsPerLoss: template.pointsPerLoss,
            pointsPerGoalScored: template.pointsPerGoalScored,
            pointsPerGoalConceded: template.pointsPerGoalConceded,
            pointsForWalkoverWin: template.pointsForWalkoverWin,
            pointsForWalkoverLoss: template.pointsForWalkoverLoss,
            pointsPerStageWin: template.pointsPerStageWin,
            pointsPerStageDraw: template.pointsPerStageDraw,
            pointsPerCleanSheet: template.pointsPerCleanSheet,
            conditionalRules: template.conditionalRules.map((rule) => ({
              id: rule.id,
              conditionType: rule.conditionType as any,
              operator: rule.operator as any,
              threshold: rule.threshold,
              pointAdjustment: rule.pointAdjustment,
            })),
          }}
        />
      </Card>
    </div>
  );
}
