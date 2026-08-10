import { ReportStatus } from '@prisma/client';
import { prisma } from '../../infrastructure/database/prisma';

export class ReportService {
  /**
   * Submit report for product listing
   */
  async createReport(reporterId: string, reportedProductId: string, reason: string) {
    const product = await prisma.product.findUnique({ where: { id: reportedProductId } });
    if (!product) {
      throw new Error('Reported product listing not found.');
    }

    const report = await prisma.report.create({
      data: {
        reporterId,
        reportedProductId,
        reason,
        status: ReportStatus.PENDING
      }
    });

    // Increment scam risk score for reported product
    if (product.id) {
      await prisma.aIAnalysis.updateMany({
        where: { productId: product.id },
        data: {
          scamScore: { increment: 20 },
          isFlagged: true
        }
      });
    }

    return report;
  }

  /**
   * Admin: Get all open reports
   */
  async getReports() {
    return prisma.report.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        reporter: { select: { id: true, name: true, email: true } },
        reportedProduct: {
          include: {
            seller: { select: { id: true, name: true, email: true } }
          }
        }
      }
    });
  }

  /**
   * Admin: Action & resolve report
   */
  async resolveReport(reportId: string, action: 'delete_product' | 'dismiss') {
    const report = await prisma.report.findUnique({ where: { id: reportId } });
    if (!report) {
      throw new Error('Report not found.');
    }

    if (action === 'delete_product' && report.reportedProductId) {
      await prisma.product.update({
        where: { id: report.reportedProductId },
        data: { deletedAt: new Date(), status: 'ARCHIVED' }
      });
    }

    return prisma.report.update({
      where: { id: reportId },
      data: {
        status: action === 'delete_product' ? ReportStatus.RESOLVED : ReportStatus.DISMISSED
      }
    });
  }
}

export const reportService = new ReportService();
