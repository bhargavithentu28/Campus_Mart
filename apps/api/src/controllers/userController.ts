import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import { userService } from '../modules/users/userService';

export async function getMe(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const profile = await userService.getMyProfile(userId);
    return res.status(200).json({ success: true, user: profile });
  } catch (err: any) {
    return res.status(404).json({ success: false, message: err.message });
  }
}

export async function updateMe(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const { name, avatar, departmentId, year, branch, bio } = req.body;

    const updated = await userService.updateMyProfile(userId, {
      name,
      avatar,
      departmentId,
      year: year ? parseInt(year, 10) : undefined,
      branch,
      bio
    });

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: updated
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
}

export async function getUserById(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const profile = await userService.getPublicProfile(id);
    return res.status(200).json({ success: true, user: profile });
  } catch (err: any) {
    return res.status(404).json({ success: false, message: err.message });
  }
}
