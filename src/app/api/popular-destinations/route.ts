import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get the top 10 most popular destinations based on visa rules count
    const popularDestinations = await prisma.country.findMany({
      where: {
        visaRulesTo: {
          some: { isActive: true }
        }
      },
      include: {
        visaRulesTo: {
          where: { isActive: true },
          include: {
            fromCountry: true
          },
          orderBy: { price: 'asc' },
          take: 1 // Just get one sample visa rule per destination
        },
        _count: {
          select: {
            visaRulesTo: {
              where: { isActive: true }
            }
          }
        }
      },
      orderBy: {
        visaRulesTo: {
          _count: 'desc'
        }
      },
      take: 10
    });

    const formattedDestinations = popularDestinations.map(country => {
      const sampleVisa = country.visaRulesTo[0];
      return sampleVisa ? {
        ...sampleVisa,
        visaCount: country._count.visaRulesTo
      } : null;
    }).filter(Boolean);

    return NextResponse.json({ destinations: formattedDestinations });
  } catch (error) {
    console.error('Popular destinations fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}