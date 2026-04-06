import { OnboardingGuard } from "@/components/OnboardingGuard";

export default function AppRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <OnboardingGuard>
      {children}
    </OnboardingGuard>
  );
}
