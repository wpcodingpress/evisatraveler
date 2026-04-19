import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Since applications table doesn't exist yet, return mock data for now
    const totalApplications = 0;
    const pendingApplications = 0;
    const approvedApplications = 0;
    const rejectedApplications = 0;
    const totalRevenue = 0;

    const [
      totalUsers,
      totalCountries,
      visaRulesCount,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.country.count(),
      prisma.visaRule.count({ where: { isActive: true } }),
    ]);

    // Mock recent applications since table doesn't exist
    const recentApps = [];

    return NextResponse.json({
      stats: {
        totalApplications,
        pendingApplications,
        approvedApplications,
        rejectedApplications,
        totalUsers,
        totalCountries,
        visaRulesCount,
        totalRevenue,
        approvalRate: totalApplications > 0 
          ? Math.round((approvedApplications / totalApplications) * 10000) / 100 
          : 0,
      },
      recentApplications: recentApps,
      monthlyStats,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}