'use client';

import { HeroSection } from '@/components/HeroSection';
import { ValuePropSection } from '@/components/ValuePropSection';
import { InvoiceSection } from '@/components/InvoiceSection';
import { PricingSection } from '@/components/PricingSection';
import { CurrencySection } from '@/components/CurrencySection';
import { CTASection } from '@/components/CTASection';
import { SiteFooter } from '@/components/SiteFooter';

export default function Home() {
  return (
    <div className="bg-background min-h-screen">
      <HeroSection />
      <ValuePropSection />
      <PricingSection />
      <InvoiceSection />
      <CurrencySection />
      <CTASection />
      <SiteFooter />
    </div>
  );
}
