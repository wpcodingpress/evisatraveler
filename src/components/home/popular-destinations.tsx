'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { VisaRule } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface PopularDestinationsProps {
  visaRules: VisaRule[];
}

export function PopularDestinations({ visaRules }: PopularDestinationsProps) {
  const router = useRouter();

  const handleExplore = (rule: VisaRule) => {
    router.push(`/visa/${rule.fromCountry.code}-to-${rule.toCountry.code}`);
  };

  if (visaRules.length === 0) return null;

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Popular Destinations
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Discover trending visa options preferred by travelers worldwide
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visaRules.slice(0, 6).map((rule) => (
            <Card
              key={rule.id}
              className="overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer"
            >
              <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 text-white">
                <div className="text-4xl mb-2">{rule.toCountry.flag}</div>
                <h3 className="text-xl font-bold">{rule.toCountry.name}</h3>
                <p className="text-blue-200 text-sm">{rule.visaType} Visa</p>
              </div>
              <CardContent className="p-6">
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Processing</span>
                    <span className="font-medium text-slate-700">{rule.processingTime}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Stay</span>
                    <span className="font-medium text-slate-700">{rule.maxStayDays} days</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Entry</span>
                    <span className="font-medium text-slate-700">{rule.entryType}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div>
                    <span className="text-2xl font-bold text-blue-600">{formatCurrency(rule.price)}</span>
                    <span className="text-slate-400 text-sm"> / person</span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleExplore(rule)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  >
                    Apply Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}