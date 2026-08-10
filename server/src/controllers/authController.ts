import { Response } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest } from '../middlewares/auth';
import { isMockDB } from '../config/db';
import User from '../models/User';
import { mockUsers } from '../config/mockStore';

const JWT_SECRET = process.env.JWT_SECRET || 'campusmart_secret_key_123';

// Temporary OTP store
const otpCache = new Map<string, { code: string; expires: number }>();

/**
 * Send OTP to College Email
 */
export async function sendOTP(req: AuthenticatedRequest, res: Response) {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'College email is required.' });
  }

  // Validate college domain (optional validation, check for common extensions or domains)
  const isCollegeEmail = email.endsWith('.edu') || email.endsWith('.ac.in') || email.includes('student') || email.endsWith('.org');
  if (!isCollegeEmail) {
    return res.status(400).json({
      success: false,
      message: 'Please enter a valid student email address (e.g., student@domain.edu or student@domain.ac.in).'
    });
  }

  // Generate 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

  otpCache.set(email, { code, expires });

  console.log('\x1b[36m%s\x1b[0m', `✉️ CAMPUSMART EMAIL SERVICE [MOCK]: Sent OTP to ${email}. Code: ${code}`);

  return res.status(200).json({
    success: true,
    message: 'Verification OTP sent to your college email address (simulated).',
    // In dev mock mode, we can return the code in response to make it easy for testing
    devOtp: code
  });
}

/**
 * Verify OTP & Issue Token
 */
export async function verifyOTP(req: AuthenticatedRequest, res: Response) {
  const { email, code, name } = req.body;

  if (!email || !code) {
    return res.status(400).json({ success: false, message: 'Email and OTP code are required.' });
  }

  const cached = otpCache.get(email);
  if (!cached || cached.expires < Date.now() || cached.code !== code) {
    return res.status(400).json({ success: false, message: 'Invalid or expired OTP code.' });
  }

  otpCache.delete(email); // consume

  let user: any;

  if (isMockDB) {
    user = mockUsers.find(u => u.email === email);
    if (!user) {
      // Auto-create new user
      const defaultName = name || email.split('@')[0].replace('.', ' ');
      const newUser = {
        _id: `u_${Date.now()}`,
        email,
        name: defaultName.charAt(0).toUpperCase() + defaultName.slice(1),
        avatar: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(email)}`,
        joinedDate: new Date(),
        department: 'Undecided',
        year: 1,
        branch: 'General Science',
        ratings: [],
        badges: ['Verified Student', 'New Joiner'],
        isVerified: true,
        isAdmin: false
      };
      mockUsers.push(newUser);
      user = newUser;
    }
  } else {
    try {
      user = await User.findOne({ email });
      if (!user) {
        // Create new Mongoose User
        const defaultName = name || email.split('@')[0].replace('.', ' ');
        user = new User({
          email,
          name: defaultName.charAt(0).toUpperCase() + defaultName.slice(1),
          avatar: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(email)}`,
          department: 'Undecided',
          year: 1,
          branch: 'General Science',
          isVerified: true,
          badges: ['Verified Student', 'New Joiner']
        });
        await user.save();
      }
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // Issue Token
  const token = jwt.sign({ id: user._id || user.id, email: user.email, isAdmin: user.isAdmin }, JWT_SECRET, {
    expiresIn: '7d'
  });

  return res.status(200).json({
    success: true,
    token: `mock_token_${user._id || user.id}`, // Client will use this mock_token_ format or decode the JWT
    realJwt: token,
    user
  });
}

/**
 * Simulate Google OAuth Signup/Login
 */
export async function googleLogin(req: AuthenticatedRequest, res: Response) {
  const { email, name, avatar } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Google email is required.' });
  }

  // Auto-verify if it has a college ending, otherwise give them student badge but flag
  const isCollegeEmail = email.endsWith('.edu') || email.endsWith('.ac.in') || email.includes('student');

  let user: any;

  if (isMockDB) {
    user = mockUsers.find(u => u.email === email);
    if (!user) {
      user = {
        _id: `u_${Date.now()}`,
        email,
        name: name || 'Student User',
        avatar: avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(email)}`,
        joinedDate: new Date(),
        department: 'Undecided',
        year: 1,
        branch: 'General',
        ratings: [],
        badges: isCollegeEmail ? ['Verified Student'] : ['Guest Student'],
        isVerified: true,
        isAdmin: false
      };
      mockUsers.push(user);
    }
  } else {
    try {
      user = await User.findOne({ email });
      if (!user) {
        user = new User({
          email,
          name: name || 'Student User',
          avatar: avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(email)}`,
          department: 'Undecided',
          year: 1,
          branch: 'General',
          isVerified: true,
          badges: isCollegeEmail ? ['Verified Student'] : ['Guest Student']
        });
        await user.save();
      }
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  const token = jwt.sign({ id: user._id || user.id, email: user.email, isAdmin: user.isAdmin }, JWT_SECRET, {
    expiresIn: '7d'
  });

  return res.status(200).json({
    success: true,
    token: `mock_token_${user._id || user.id}`,
    realJwt: token,
    user
  });
}

/**
 * Get Profile
 */
export async function getProfile(req: AuthenticatedRequest, res: Response) {
  const userId = req.user?.id;

  if (isMockDB) {
    const user = mockUsers.find(u => u._id === userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    return res.status(200).json({ success: true, user });
  } else {
    try {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      return res.status(200).json({ success: true, user });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}

/**
 * Update Profile
 */
export async function updateProfile(req: AuthenticatedRequest, res: Response) {
  const userId = req.user?.id;
  const { name, department, branch, year, avatar } = req.body;

  if (isMockDB) {
    const userIndex = mockUsers.findIndex(u => u._id === userId);
    if (userIndex === -1) return res.status(404).json({ success: false, message: 'User not found' });

    mockUsers[userIndex] = {
      ...mockUsers[userIndex],
      name: name || mockUsers[userIndex].name,
      department: department || mockUsers[userIndex].department,
      branch: branch || mockUsers[userIndex].branch,
      year: year ? parseInt(year) : mockUsers[userIndex].year,
      avatar: avatar || mockUsers[userIndex].avatar
    };

    return res.status(200).json({ success: true, user: mockUsers[userIndex], message: 'Profile updated successfully.' });
  } else {
    try {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });

      if (name) user.name = name;
      if (department) user.department = department;
      if (branch) user.branch = branch;
      if (year) user.year = parseInt(year);
      if (avatar) user.avatar = avatar;

      await user.save();
      return res.status(200).json({ success: true, user, message: 'Profile updated successfully.' });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}
