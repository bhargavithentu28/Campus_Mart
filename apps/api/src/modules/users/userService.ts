import { prisma } from '../../infrastructure/database/prisma';

export interface UpdateUserProfileInput {
  name?: string;
  avatar?: string;
  departmentId?: string;
  year?: number;
  branch?: string;
  bio?: string;
}

export class UserService {
  /**
   * Get user's own profile with full details
   */
  async getMyProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        college: true,
        department: true,
        _count: {
          select: {
            products: true,
            wishlists: true,
            reviewsReceived: true
          }
        }
      }
    });

    if (!user) {
      throw new Error('User profile not found.');
    }

    // Omit sensitive password hashes or token arrays
    const { passwordHash, googleId, trustedDevices, ...safeProfile } = user;
    return safeProfile;
  }

  /**
   * Update user's own profile (protected against modifying role/reputation/college)
   */
  async updateMyProfile(userId: string, data: UpdateUserProfileInput) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error('User profile not found.');
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name ?? user.name,
        avatar: data.avatar ?? user.avatar,
        departmentId: data.departmentId ?? user.departmentId,
        year: data.year ?? user.year,
        branch: data.branch ?? user.branch,
        bio: data.bio ?? user.bio
      },
      include: {
        college: true,
        department: true
      }
    });

    const { passwordHash, googleId, trustedDevices, ...safeProfile } = updatedUser;
    return safeProfile;
  }

  /**
   * Get public student profile by ID
   */
  async getPublicProfile(targetUserId: string) {
    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        name: true,
        avatar: true,
        role: true,
        year: true,
        branch: true,
        bio: true,
        badges: true,
        isVerified: true,
        createdAt: true,
        college: {
          select: { id: true, name: true, code: true, logo: true }
        },
        department: {
          select: { id: true, name: true, code: true }
        },
        _count: {
          select: {
            products: true,
            reviewsReceived: true
          }
        }
      }
    });

    if (!user) {
      throw new Error('User profile not found.');
    }

    return user;
  }
}

export const userService = new UserService();
