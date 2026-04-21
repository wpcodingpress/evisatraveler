import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const [
      totalUsers,
      totalCountries,
      visaRulesCount,
      allApplications,
      recentApplications,
      notifications,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.country.count(),
      prisma.visaRule.count({ where: { isActive: true } }),
      prisma.application.findMany({
        orderBy: { createdAt: 'desc' },
      }),
      prisma.application.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
          visaRule: { include: { toCountry: { select: { name: true, code: true, flag: true } } } },
        },
      }),
      prisma.notification.findMany({
        take: 20,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const totalApplications = allApplications.length;
    const pendingApplications = allApplications.filter(a => a.status === 'pending').length;
    const processingApplications = allApplications.filter(a => a.status === 'processing').length;
    const approvedApplications = allApplications.filter(a => a.status === 'approved').length;
    const completedApplications = allApplications.filter(a => a.status === 'completed').length;
    const rejectedApplications = allApplications.filter(a => a.status === 'rejected').length;
    const totalRevenue = allApplications.reduce((sum, app) => sum + Number(app.totalAmount || 0), 0);
    const paidRevenue = allApplications
      .filter(a => a.status === 'completed')
      .reduce((sum, app) => sum + Number(app.totalAmount || 0), 0);

    const recentApps = recentApplications.map((app: any) => {
      const fd = app.formData as Record<string, any>;
      return {
        id: app.id,
        applicationNumber: app.applicationNumber,
        status: app.status,
        totalAmount: app.totalAmount,
        createdAt: app.createdAt,
        paymentStatus: app.paymentStatus,
        user: app.user || { firstName: fd?.firstName || 'Unknown', lastName: fd?.lastName || 'User', email: fd?.email || 'N/A' },
        visaRule: { toCountry: app.visaRule?.toCountry || { name: 'N/A', code: 'N/A', flag: '' } },
      };
    });

    return NextResponse.json({
      stats: {
        totalApplications,
        pendingApplications,
        processingApplications,
        approvedApplications,
        completedApplications,
        rejectedApplications,
        totalUsers,
        totalCountries,
        visaRulesCount,
        totalRevenue,
        paidRevenue,
        approvalRate: totalApplications > 0
          ? Math.round((approvedApplications / totalApplications) * 10000) / 100
          : 0,
      },
      recentApplications: recentApps,
      notifications: notifications.map(n => ({
        id: n.id,
        title: n.title,
        message: n.message,
        type: n.type,
        isRead: n.isRead,
        createdAt: n.createdAt,
      })),
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}