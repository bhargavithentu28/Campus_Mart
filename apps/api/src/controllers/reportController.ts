import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import { reportService } from '../modules/reports/reportService';

export async function createReport(req: AuthenticatedRequest, res: Response) {
  try {
    const reporterId = req.user!.id;
    const { productId, reason } = req.body;

    if (!productId || !reason) {
      return res.status(400).json({ success: false, message: 'productId and reason are required.' });
    }

    const report = await reportService.createReport(reporterId, productId, reason);
    return res.status(201).json({
      success: true,
      message: 'Report submitted. Product flagged for moderation review.',
      report
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
}

export async function getReports(req: AuthenticatedRequest, res: Response) {
  try {
    const reports = await reportService.getReports();
    return res.status(200).json({ success: true, reports });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function resolveReport(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'delete_product' | 'dismiss'

    if (!action) {
      return res.status(400).json({ success: false, message: 'action is required.' });
    }

    const updated = await reportService.resolveReport(id, action);
    return res.status(200).json({
      success: true,
      message: `Report updated. Action: ${action}`,
      report: updated
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
}
