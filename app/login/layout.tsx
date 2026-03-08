import PublicNavigation from '@/components/public/PublicNavigation';

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PublicNavigation />
      {children}
    </>
  );
}
