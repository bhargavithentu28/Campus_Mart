import { prisma } from '../../infrastructure/database/prisma';

export class AdminService {
  /**
   * Log administrative action for security auditing
   */
  private async logAction(adminId: string, action: string, target?: string, details?: any) {
    return prisma.adminLog.create({
      data: {
        adminId,
        action,
        target,
        details: details ? JSON.parse(JSON.stringify(details)) : undefined
      }
    }).catch(err => console.error('Failed to log admin action:', err));
  }

  /**
   * Get platform overview metrics
   */
  async getOverviewStats(adminUser: any) {
    const isCollegeAdmin = adminUser.role === 'COLLEGE_ADMIN';
    const collegeId = isCollegeAdmin ? adminUser.collegeId : undefined;

    const totalUsers = await prisma.user.count({
      where: collegeId ? { collegeId } : undefined
    });

    const totalProducts = await prisma.product.count({
      where: collegeId ? { collegeId } : undefined
    });

    const activeListings = await prisma.product.count({
      where: {
        status: 'ACTIVE',
        ...(collegeId ? { collegeId } : {})
      }
    });

    const pendingReports = await prisma.report.count({
      where: { status: 'PENDING' }
    });

    const totalTransactions = await prisma.product.count({
      where: {
        status: { in: ['SOLD', 'RENTED', 'BORROWED', 'EXCHANGED', 'DONATED'] },
        ...(collegeId ? { collegeId } : {})
      }
    });

    // Category distribution
    const categories = await prisma.product.groupBy({
      by: ['categorySlug'],
      _count: { id: true },
      where: collegeId ? { collegeId } : undefined
    });

    return {
      totalUsers,
      totalProducts,
      activeListings,
      pendingReports,
      totalTransactions,
      categoryDistribution: categories.map(c => ({ name: c.categorySlug, count: c._count.id }))
    };
  }

  /**
   * Get moderation report queue
   */
  async getReportsQueue(adminUser: any, status = 'PENDING') {
    return prisma.report.findMany({
      where: status !== 'ALL' ? { status: status as any } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        reporter: { select: { id: true, name: true, email: true, avatar: true } },
        reportedProduct: {
          select: {
            id: true,
            title: true,
            price: true,
            seller: { select: { id: true, name: true, email: true } }
          }
        }
      }
    });
  }

  /**
   * Resolve or dismiss moderation report
   */
  async resolveReport(adminUser: any, reportId: string, action: string, notes?: string) {
    const report = await prisma.report.findUnique({ where: { id: reportId } });
    if (!report) throw new Error('Report not found.');

    const newStatus = action === 'dismiss' ? 'REVIEWED' : 'REVIEWED';

    await prisma.report.update({
      where: { id: reportId },
      data: { status: newStatus as any }
    });

    if (action === 'remove_listing' && report.reportedProductId) {
      await prisma.product.update({
        where: { id: report.reportedProductId },
        data: { status: 'REJECTED' }
      });
    }

    await this.logAction(adminUser.id, `REPORT_${action.toUpperCase()}`, reportId, { notes, action });

    return { success: true, message: `Report processed. Action: ${action}` };
  }

  /**
   * Get users list for administration
   */
  async getUsersList(adminUser: any, search?: string) {
    const isCollegeAdmin = adminUser.role === 'COLLEGE_ADMIN';
    const collegeId = isCollegeAdmin ? adminUser.collegeId : undefined;

    const users = await prisma.user.findMany({
      where: {
        ...(collegeId ? { collegeId } : {}),
        ...(search ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } }
          ]
        } : {})
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        badges: true,
        isVerified: true,
        createdAt: true,
        deletedAt: true,
        college: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    return users.map(u => ({
      ...u,
      isSuspended: Boolean(u.deletedAt)
    }));
  }

  /**
   * Toggle student suspension
   */
  async toggleUserSuspension(adminUser: any, targetUserId: string, suspend: boolean, reason?: string) {
    const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!targetUser) throw new Error('Student user not found.');

    if (targetUser.role === 'SUPER_ADMIN') {
      throw new Error('Super Admin accounts cannot be suspended.');
    }

    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: { deletedAt: suspend ? new Date() : null }
    });

    await this.logAction(
      adminUser.id,
      suspend ? 'USER_SUSPENDED' : 'USER_UNSUSPENDED',
      targetUserId,
      { reason }
    );

    return {
      ...updatedUser,
      isSuspended: Boolean(updatedUser.deletedAt)
    };
  }

  /**
   * Get append-only audit logs
   */
  async getAuditLogs(adminUser: any) {
    return prisma.adminLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        admin: { select: { id: true, name: true, email: true, role: true } }
      }
    });
  }

  /**
   * Get feature flags
   */
  async getFeatureFlags() {
    const flags = await prisma.featureFlag.findMany({ orderBy: { key: 'asc' } });
    if (flags.length === 0) {
      return [
        { key: 'AI_PRICE_SUGGESTIONS', enabled: true, description: 'Gemini AI pricing prediction' },
        { key: 'AI_SEARCH', enabled: true, description: 'Natural language search interpretation' },
        { key: 'CAMPUS_HEATMAP', enabled: true, description: 'Anonymized trade activity heatmap' }
      ];
    }
    return flags;
  }

  /**
   * Toggle feature flag state
   */
  async toggleFeatureFlag(adminUser: any, key: string, enabled: boolean) {
    const flag = await prisma.featureFlag.upsert({
      where: { key },
      update: { enabled },
      create: { key, enabled, description: `Feature flag for ${key}` }
    });

    await this.logAction(adminUser.id, 'FEATURE_FLAG_TOGGLED', key, { enabled });

    return flag;
  }
}

export const adminService = new AdminService();
