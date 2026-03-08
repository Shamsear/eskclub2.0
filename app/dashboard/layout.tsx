import { requireAuth } from "@/lib/auth-utils";
import Navigation from "@/components/Navigation";
import Sidebar from "@/components/Sidebar";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ToastProvider } from "@/components/ui/Toast";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await requireAuth();

    return (
        <ToastProvider>
            <div className="min-h-screen bg-gray-50">
                <Navigation user={session.user} />
                <div className="flex">
                    <Sidebar />
                    <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
                        <ErrorBoundary>
                            {children}
                        </ErrorBoundary>
                    </main>
                </div>
            </div>
        </ToastProvider>
    );
}
