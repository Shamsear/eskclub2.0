import PublicNavigation from "@/components/public/PublicNavigation";
import PublicFooter from "@/components/public/PublicFooter";
import { SkipToContent } from "@/components/public/SkipToContent";
import { NavigationProgress } from "@/components/public/NavigationProgress";
import { PageTransitionWrapper } from "@/components/public/PageTransitionWrapper";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#0D0D0D]">
      <NavigationProgress />
      <SkipToContent />
      <PublicNavigation />
      <main id="main-content" className="flex-1" tabIndex={-1}>
        <PageTransitionWrapper>{children}</PageTransitionWrapper>
      </main>
      <PublicFooter />
    </div>
  );
}
