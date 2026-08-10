import { prisma } from '../../infrastructure/database/prisma';

export class DepartmentService {
  /**
   * Get all departments under a specific college
   */
  async getDepartmentsByCollege(collegeId: string) {
    return prisma.department.findMany({
      where: { collegeId },
      orderBy: { name: 'asc' }
    });
  }

  /**
   * Admin: Add a new department under a college
   */
  async createDepartment(collegeId: string, name: string, code: string) {
    const college = await prisma.college.findUnique({ where: { id: collegeId } });
    if (!college) {
      throw new Error('Associated college does not exist.');
    }

    const codeUpper = code.toUpperCase();
    const existing = await prisma.department.findUnique({
      where: {
        collegeId_code: {
          collegeId,
          code: codeUpper
        }
      }
    });

    if (existing) {
      throw new Error(`Department code '${codeUpper}' already exists under ${college.name}.`);
    }

    return prisma.department.create({
      data: {
        collegeId,
        name,
        code: codeUpper
      }
    });
  }
}

export const departmentService = new DepartmentService();
