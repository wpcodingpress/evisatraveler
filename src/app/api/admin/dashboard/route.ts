import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const [
      totalApplications,
      pendingApplications,
      approvedApplications,
      rejectedApplications,
      totalUsers,
      totalCountries,
      visaRulesCount,
    ] = await Promise.all([
      prisma.application.count(),
      prisma.application.count({ where: { status: 'pending' } }),
      prisma.application.count({ where: { status: 'approved' } }),
      prisma.application.count({ where: { status: 'rejected' } }),
      prisma.user.count({ where: { role: 'user' } }),
      prisma.country.count(),
      prisma.visaRule.count(),
    ]);

    const applicationsWithRevenue = await prisma.application.findMany({
      where: { paymentStatus: 'paid' },
      select: { totalAmount: true },
    });
    const totalRevenue = applicationsWithRevenue.reduce((sum, app) => sum + app.totalAmount, 0);

    const recentApps = await prisma.application.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        visaRule: {
          include: {
            toCountry: { select: { name: true, code: true } },
          },
        },
      },
    });

    const monthlyStats = await prisma.application.groupBy({
      by: ['status'],
      _count: true,
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), 0, 1),
        },
      },
    });

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