import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const [
      totalUsers,
      totalCountries,
      visaRulesCount,
      applications,
      notifications,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.country.count(),
      prisma.visaRule.count({ where: { isActive: true } }),
      prisma.application.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
          visaRule: { include: { toCountry: { select: { name: true, code: true, flag: true } } } },
        },
      }),
      prisma.notification.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const totalApplications = applications.length;
    const pendingApplications = applications.filter(a => a.status === 'pending').length;
    const processingApplications = applications.filter(a => a.status === 'processing').length;
    const approvedApplications = applications.filter(a => a.status === 'approved').length;
    const rejectedApplications = applications.filter(a => a.status === 'rejected').length;
    const totalRevenue = applications.reduce((sum, app) => sum + Number(app.totalAmount), 0);
    const paidRevenue = applications
      .filter(a => a.paymentStatus === 'paid')
      .reduce((sum, app) => sum + Number(app.totalAmount), 0);

    const recentApps = applications.slice(0, 5).map(app => ({
      id: app.id,
      applicationNumber: app.applicationNumber,
      status: app.status,
      totalAmount: app.totalAmount,
      createdAt: app.createdAt,
      paymentStatus: app.paymentStatus,
      user: app.user || { firstName: app.formData?.firstName || 'Unknown', lastName: app.formData?.lastName || 'User', email: app.formData?.email || 'N/A' },
      visaRule: { toCountry: app.visaRule?.toCountry || { name: 'N/A', code: 'N/A', flag: '' } },
    }));

    return NextResponse.json({
      stats: {
        totalApplications,
        pendingApplications,
        processingApplications,
        approvedApplications,
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