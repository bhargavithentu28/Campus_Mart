import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import { departmentService } from '../modules/departments/departmentService';

export async function getDepartments(req: AuthenticatedRequest, res: Response) {
  try {
    const { collegeId } = req.query;
    if (!collegeId || typeof collegeId !== 'string') {
      return res.status(400).json({ success: false, message: 'collegeId query parameter is required.' });
    }

    const departments = await departmentService.getDepartmentsByCollege(collegeId);
    return res.status(200).json({ success: true, departments });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function createDepartment(req: AuthenticatedRequest, res: Response) {
  try {
    const { collegeId, name, code } = req.body;
    if (!collegeId || !name || !code) {
      return res.status(400).json({ success: false, message: 'collegeId, name, and code are required.' });
    }

    const department = await departmentService.createDepartment(collegeId, name, code);
    return res.status(201).json({
      success: true,
      message: 'Department created successfully.',
      department
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
}
