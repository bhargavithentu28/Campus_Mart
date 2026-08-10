import { prisma } from '../../infrastructure/database/prisma';

export interface CreateCollegeInput {
  name: string;
  code: string;
  domains: string[];
  city: string;
  state: string;
  logo?: string;
}

export interface UpdateCollegeInput {
  name?: string;
  code?: string;
  domains?: string[];
  city?: string;
  state?: string;
  logo?: string;
  isVerified?: boolean;
}

export class CollegeService {
  /**
   * Verify if an email address belongs to a registered college domain
   */
  async verifyCollegeDomain(email: string) {
    const domain = email.split('@')[1]?.toLowerCase();
    if (!domain) {
      return { isValid: false, college: null, reason: 'Invalid email format' };
    }

    const colleges = await prisma.college.findMany({
      where: { isVerified: true, deletedAt: null }
    });

    const matchingCollege = colleges.find(c =>
      c.domains.some(d => d.toLowerCase() === domain || domain.endsWith('.' + d.toLowerCase()))
    );

    if (!matchingCollege) {
      return {
        isValid: false,
        college: null,
        reason: `Email domain (@${domain}) is not associated with any registered university.`
      };
    }

    return { isValid: true, college: matchingCollege, reason: 'Valid university email' };
  }

  /**
   * Get list of all verified colleges
   */
  async getColleges() {
    return prisma.college.findMany({
      where: { isVerified: true, deletedAt: null },
      select: {
        id: true,
        name: true,
        code: true,
        domains: true,
        city: true,
        state: true,
        logo: true
      },
      orderBy: { name: 'asc' }
    });
  }

  /**
   * Get college details by ID
   */
  async getCollegeById(id: string) {
    return prisma.college.findUnique({
      where: { id },
      include: {
        departments: {
          orderBy: { name: 'asc' }
        }
      }
    });
  }

  /**
   * Admin: Create a new university record
   */
  async createCollege(data: CreateCollegeInput) {
    const existing = await prisma.college.findUnique({
      where: { code: data.code.toUpperCase() }
    });

    if (existing) {
      throw new Error(`College with code '${data.code}' already exists.`);
    }

    return prisma.college.create({
      data: {
        name: data.name,
        code: data.code.toUpperCase(),
        domains: data.domains.map(d => d.toLowerCase()),
        city: data.city,
        state: data.state,
        logo: data.logo,
        isVerified: true
      }
    });
  }

  /**
   * Admin: Update university record
   */
  async updateCollege(id: string, data: UpdateCollegeInput) {
    const college = await prisma.college.findUnique({ where: { id } });
    if (!college) {
      throw new Error('College not found.');
    }

    return prisma.college.update({
      where: { id },
      data: {
        name: data.name ?? college.name,
        code: data.code ? data.code.toUpperCase() : college.code,
        domains: data.domains ? data.domains.map(d => d.toLowerCase()) : college.domains,
        city: data.city ?? college.city,
        state: data.state ?? college.state,
        logo: data.logo ?? college.logo,
        isVerified: data.isVerified ?? college.isVerified
      }
    });
  }

  /**
   * Admin: Soft delete college record
   */
  async deleteCollege(id: string) {
    return prisma.college.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }
}

export const collegeService = new CollegeService();
