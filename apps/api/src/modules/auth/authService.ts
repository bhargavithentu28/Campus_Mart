import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { UserRole } from '@prisma/client';
import { prisma } from '../../infrastructure/database/prisma';
import { collegeService } from '../colleges/collegeService';

import { JWT_SECRET, JWT_REFRESH_SECRET } from '../../config/env';

const otpMap = new Map<string, { code: string; expires: number }>();

export class AuthService {
  /**
   * Send Email OTP to verified university email address
   */
  async sendOtp(email: string) {
    const domainCheck = await collegeService.verifyCollegeDomain(email);
    if (!domainCheck.isValid) {
      throw new Error(domainCheck.reason);
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 10 * 60 * 1000; // 10 minutes

    otpMap.set(email.toLowerCase(), { code, expires });

    if (process.env.NODE_ENV !== 'production') {
      console.log('\x1b[36m%s\x1b[0m', `✉️ CAMPUSMART EMAIL SERVICE: OTP sent to ${email}. Verification Code: ${code}`);
    }

    return {
      success: true,
      message: `OTP verification code sent to ${email}`,
      devCode: process.env.NODE_ENV !== 'production' ? code : undefined,
      college: domainCheck.college
    };
  }

  /**
   * Verify OTP and issue JWT access token + refresh token session
   */
  async verifyOtp(email: string, code: string, name?: string, deviceInfo?: string) {
    const emailLower = email.toLowerCase();
    const cached = otpMap.get(emailLower);

    if (!cached || cached.expires < Date.now() || cached.code !== code) {
      throw new Error('Invalid or expired OTP verification code.');
    }

    otpMap.delete(emailLower);

    const domainCheck = await collegeService.verifyCollegeDomain(emailLower);
    if (!domainCheck.isValid || !domainCheck.college) {
      throw new Error('University email domain not registered.');
    }

    let user = await prisma.user.findUnique({
      where: { email: emailLower },
      include: { college: true, department: true }
    });

    if (!user) {
      const defaultName = name || emailLower.split('@')[0].replace('.', ' ');
      const formattedName = defaultName.charAt(0).toUpperCase() + defaultName.slice(1);

      user = await prisma.user.create({
        data: {
          email: emailLower,
          name: formattedName,
          avatar: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(emailLower)}`,
          collegeId: domainCheck.college.id,
          role: UserRole.STUDENT,
          badges: ['Verified Student', 'New Joiner'],
          isVerified: true
        },
        include: { college: true, department: true }
      });
    }

    const tokens = await this.generateTokenSession(user.id, user.email, user.role, user.isAdmin, deviceInfo);
    return { user, ...tokens };
  }

  /**
   * Google OAuth login handler
   */
  async googleLogin(email: string, name?: string, avatar?: string, googleId?: string, deviceInfo?: string) {
    const emailLower = email.toLowerCase();
    const domainCheck = await collegeService.verifyCollegeDomain(emailLower);

    let user = await prisma.user.findUnique({
      where: { email: emailLower },
      include: { college: true, department: true }
    });

    if (!user) {
      if (!domainCheck.isValid || !domainCheck.college) {
        throw new Error('Google account must belong to a recognized university email domain.');
      }

      user = await prisma.user.create({
        data: {
          email: emailLower,
          name: name || 'Student User',
          avatar: avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(emailLower)}`,
          googleId,
          collegeId: domainCheck.college.id,
          role: UserRole.STUDENT,
          badges: ['Verified Student', 'Google Login'],
          isVerified: true
        },
        include: { college: true, department: true }
      });
    } else if (googleId && !user.googleId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId },
        include: { college: true, department: true }
      });
    }

    const tokens = await this.generateTokenSession(user.id, user.email, user.role, user.isAdmin, deviceInfo);
    return { user, ...tokens };
  }

  /**
   * Refresh Token Rotation: Invalidate old refresh token and issue new token pair
   */
  async refreshSession(refreshToken: string, deviceInfo?: string) {
    try {
      const decoded: any = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
      
      const session = await prisma.deviceSession.findUnique({
        where: { refreshToken }
      });

      if (!session || session.expiresAt < new Date()) {
        throw new Error('Refresh token session expired or revoked.');
      }

      // Delete old session (Rotation)
      await prisma.deviceSession.delete({ where: { id: session.id } });

      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        include: { college: true }
      });

      if (!user) {
        throw new Error('User not found.');
      }

      return this.generateTokenSession(user.id, user.email, user.role, user.isAdmin, deviceInfo);
    } catch (err) {
      throw new Error('Invalid refresh token.');
    }
  }

  /**
   * Logout session
   */
  async logout(refreshToken: string) {
    if (!refreshToken) return;
    await prisma.deviceSession.deleteMany({
      where: { refreshToken }
    });
  }

  /**
   * Logout from all devices
   */
  async logoutAll(userId: string) {
    await prisma.deviceSession.deleteMany({
      where: { userId }
    });
  }

  /**
   * Generate JWT Access Token & Refresh Token + Save Device Session
   */
  private async generateTokenSession(userId: string, email: string, role: UserRole, isAdmin: boolean, deviceInfo?: string) {
    const accessToken = jwt.sign(
      { id: userId, email, role, isAdmin },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { id: userId },
      JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await prisma.deviceSession.create({
      data: {
        userId,
        token: accessToken,
        refreshToken,
        deviceInfo: deviceInfo || 'Web Browser',
        expiresAt
      }
    });

    return { accessToken, refreshToken };
  }
}

export const authService = new AuthService();
