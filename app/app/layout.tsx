import { OnboardingGuard } from "@/components/OnboardingGuard";
import { JoinGroupListener } from "@/components/JoinGroupListener";
import { Suspense } from "react";

export default function AppRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <OnboardingGuard>
      <Suspense fallback={null}>
        <JoinGroupListener />
      </Suspense>
      {children}
    </OnboardingGuard>
  );
}
