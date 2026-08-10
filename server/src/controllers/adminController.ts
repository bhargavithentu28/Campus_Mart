import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import { isMockDB } from '../config/db';
import User from '../models/User';
import Product from '../models/Product';
import Report from '../models/Report';
import { mockProducts, mockUsers, mockReports } from '../config/mockStore';

/**
 * Get Platform Stats / Analytics
 */
export async function getStats(req: AuthenticatedRequest, res: Response) {
  try {
    let totalUsers = 0;
    let totalProducts = 0;
    let soldProducts = 0;
    let pendingReports = 0;
    let categoryStats: { [key: string]: number } = {};
    let scamStats = { flagged: 0, safe: 0 };
    let revenue = 0;

    if (isMockDB) {
      totalUsers = mockUsers.length;
      totalProducts = mockProducts.length;
      soldProducts = mockProducts.filter(p => p.isSold).length;
      pendingReports = mockReports.filter(r => r.status === 'pending').length;

      mockProducts.forEach(p => {
        categoryStats[p.category] = (categoryStats[p.category] || 0) + 1;
        if (p.aiAnalysis.isFlagged) {
          scamStats.flagged += 1;
        } else {
          scamStats.safe += 1;
        }
        if (p.isSold) {
          revenue += p.price;
        }
      });
    } else {
      totalUsers = await User.countDocuments();
      totalProducts = await Product.countDocuments();
      soldProducts = await Product.countDocuments({ isSold: true });
      pendingReports = await Report.countDocuments({ status: 'pending' });

      const products = await Product.find();
      products.forEach((p: any) => {
        categoryStats[p.category] = (categoryStats[p.category] || 0) + 1;
        if (p.aiAnalysis?.isFlagged) {
          scamStats.flagged += 1;
        } else {
          scamStats.safe += 1;
        }
        if (p.isSold) {
          revenue += p.price;
        }
      });
    }

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalProducts,
        soldProducts,
        pendingReports,
        revenue,
        categoryDistribution: Object.entries(categoryStats).map(([name, value]) => ({ name, value })),
        scamRiskRatio: [
          { name: 'Flagged Listings', value: scamStats.flagged },
          { name: 'Safe Listings', value: scamStats.safe }
        ]
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Get Flagged Reports List
 */
export async function getReports(req: AuthenticatedRequest, res: Response) {
  try {
    if (isMockDB) {
      const populatedReports = mockReports.map(r => {
        const reporterUser = mockUsers.find(u => u._id === r.reporter) || null;
        const productObj = mockProducts.find(p => p._id === r.reportedProduct) || null;
        return {
          ...r,
          reporter: reporterUser,
          reportedProduct: productObj
        };
      });

      return res.status(200).json({ success: true, reports: populatedReports });
    } else {
      const reports = await Report.find()
        .populate('reporter', 'name email avatar')
        .populate({
          path: 'reportedProduct',
          populate: { path: 'seller', select: 'name email' }
        })
        .sort({ createdAt: -1 });

      return res.status(200).json({ success: true, reports });
    }
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Resolve/Action Report
 */
export async function resolveReport(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  const { action } = req.body; // 'delete', 'ignore'

  try {
    if (isMockDB) {
      const rIndex = mockReports.findIndex(r => r._id === id);
      if (rIndex === -1) return res.status(404).json({ success: false, message: 'Report not found.' });

      mockReports[rIndex].status = 'resolved';
      const report = mockReports[rIndex];

      if (action === 'delete' && report.reportedProduct) {
        // Delete product from mock store
        const pIndex = mockProducts.findIndex(p => p._id === report.reportedProduct);
        if (pIndex !== -1) {
          mockProducts.splice(pIndex, 1);
        }
      }

      return res.status(200).json({ success: true, message: `Report resolved. Action taken: ${action}` });
    } else {
      const report = await Report.findById(id);
      if (!report) return res.status(404).json({ success: false, message: 'Report not found.' });

      report.status = 'resolved';
      await report.save();

      if (action === 'delete' && report.reportedProduct) {
        await Product.findByIdAndDelete(report.reportedProduct);
      }

      return res.status(200).json({ success: true, message: `Report resolved. Action taken: ${action}` });
    }
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Toggle Admin badge or student badge verification
 */
export async function verifyUserBadge(req: AuthenticatedRequest, res: Response) {
  const { userId } = req.params;
  const { badge, add } = req.body; // badge name, add (boolean)

  try {
    if (isMockDB) {
      const uIndex = mockUsers.findIndex(u => u._id === userId);
      if (uIndex === -1) return res.status(404).json({ success: false, message: 'Student not found.' });

      let badges = [...mockUsers[uIndex].badges];
      if (add) {
        if (!badges.includes(badge)) badges.push(badge);
      } else {
        badges = badges.filter(b => b !== badge);
      }

      mockUsers[uIndex].badges = badges;
      return res.status(200).json({ success: true, user: mockUsers[uIndex], message: 'Student badges updated.' });
    } else {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ success: false, message: 'Student not found.' });

      if (add) {
        if (!user.badges.includes(badge)) {
          user.badges.push(badge);
        }
      } else {
        user.badges = user.badges.filter((b: string) => b !== badge);
      }

      await user.save();
      return res.status(200).json({ success: true, user, message: 'Student badges updated.' });
    }
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
