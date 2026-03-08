"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { ToastProvider } from "@/components/ui";
import { SWRProvider } from "@/components/public/SWRProvider";

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <SWRProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </SWRProvider>
    </SessionProvider>
  );
}
