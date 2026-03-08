import ClubProfileClient from '@/components/public/ClubProfileClient';

interface ClubDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ClubDetailPage({ params }: ClubDetailPageProps) {
  const { id } = await params;
  return <ClubProfileClient clubId={id} />;
}
