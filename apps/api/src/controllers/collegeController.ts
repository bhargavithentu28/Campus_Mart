import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import { collegeService } from '../modules/colleges/collegeService';

export async function getColleges(req: AuthenticatedRequest, res: Response) {
  try {
    const colleges = await collegeService.getColleges();
    return res.status(200).json({ success: true, colleges });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getCollegeById(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const college = await collegeService.getCollegeById(id);
    if (!college) {
      return res.status(404).json({ success: false, message: 'College not found.' });
    }
    return res.status(200).json({ success: true, college });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function createCollege(req: AuthenticatedRequest, res: Response) {
  try {
    const { name, code, domains, city, state, logo } = req.body;
    if (!name || !code || !domains || !Array.isArray(domains) || !city || !state) {
      return res.status(400).json({
        success: false,
        message: 'Name, code, domains array, city, and state are required.'
      });
    }

    const college = await collegeService.createCollege({
      name,
      code,
      domains,
      city,
      state,
      logo
    });

    return res.status(201).json({
      success: true,
      message: 'College created successfully.',
      college
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
}

export async function updateCollege(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const updated = await collegeService.updateCollege(id, req.body);
    return res.status(200).json({
      success: true,
      message: 'College updated successfully.',
      college: updated
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
}

export async function deleteCollege(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    await collegeService.deleteCollege(id);
    return res.status(200).json({ success: true, message: 'College soft-deleted successfully.' });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
}
