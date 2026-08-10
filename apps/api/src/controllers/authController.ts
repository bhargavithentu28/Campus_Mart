import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import { authService } from '../modules/auth/authService';
import { collegeService } from '../modules/colleges/collegeService';
import { sendOtpSchema, verifyOtpSchema, googleLoginSchema } from '@campusmart/validation';

const IS_PROD = process.env.NODE_ENV === 'production';

// Helper to set HTTP-only authentication cookies
function setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: 'lax',
    maxAge: 15 * 60 * 1000 // 15 minutes
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: 'lax',
    path: '/api/v1/auth/refresh',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
}

// Clear cookies on logout
function clearAuthCookies(res: Response) {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken', { path: '/api/v1/auth/refresh' });
}

export async function getColleges(req: AuthenticatedRequest, res: Response) {
  try {
    const colleges = await collegeService.getColleges();
    return res.status(200).json({ success: true, colleges });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function sendOTP(req: AuthenticatedRequest, res: Response) {
  try {
    const parseResult = sendOtpSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        message: parseResult.error.errors[0]?.message || 'Invalid input'
      });
    }

    const result = await authService.sendOtp(parseResult.data.email);
    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
}

export async function verifyOTP(req: AuthenticatedRequest, res: Response) {
  try {
    const parseResult = verifyOtpSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        message: parseResult.error.errors[0]?.message || 'Invalid input'
      });
    }

    const deviceInfo = req.headers['user-agent'] || 'Web Browser';
    const { user, accessToken, refreshToken } = await authService.verifyOtp(
      parseResult.data.email,
      parseResult.data.code,
      parseResult.data.name,
      deviceInfo
    );

    setAuthCookies(res, accessToken, refreshToken);

    return res.status(200).json({
      success: true,
      message: 'Authentication successful.',
      accessToken,
      user
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
}

export async function googleLogin(req: AuthenticatedRequest, res: Response) {
  try {
    const parseResult = googleLoginSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        message: parseResult.error.errors[0]?.message || 'Invalid input'
      });
    }

    const deviceInfo = req.headers['user-agent'] || 'Web Browser';
    const { user, accessToken, refreshToken } = await authService.googleLogin(
      parseResult.data.email,
      parseResult.data.name,
      parseResult.data.avatar,
      req.body.googleId,
      deviceInfo
    );

    setAuthCookies(res, accessToken, refreshToken);

    return res.status(200).json({
      success: true,
      message: 'Google login successful.',
      accessToken,
      user
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
}

export async function refreshSession(req: AuthenticatedRequest, res: Response) {
  try {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'Refresh token missing.' });
    }

    const deviceInfo = req.headers['user-agent'] || 'Web Browser';
    const { accessToken, refreshToken: newRefreshToken } = await authService.refreshSession(refreshToken, deviceInfo);

    setAuthCookies(res, accessToken, newRefreshToken);

    return res.status(200).json({
      success: true,
      accessToken
    });
  } catch (err: any) {
    clearAuthCookies(res);
    return res.status(401).json({ success: false, message: err.message });
  }
}

export async function logout(req: AuthenticatedRequest, res: Response) {
  try {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
    await authService.logout(refreshToken);
    clearAuthCookies(res);

    return res.status(200).json({ success: true, message: 'Logged out successfully.' });
  } catch (err: any) {
    clearAuthCookies(res);
    return res.status(200).json({ success: true, message: 'Logged out.' });
  }
}

export async function logoutAll(req: AuthenticatedRequest, res: Response) {
  try {
    if (req.user?.id) {
      await authService.logoutAll(req.user.id);
    }
    clearAuthCookies(res);
    return res.status(200).json({ success: true, message: 'Logged out from all devices.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getProfile(req: AuthenticatedRequest, res: Response) {
  return res.status(200).json({ success: true, user: req.user });
}
