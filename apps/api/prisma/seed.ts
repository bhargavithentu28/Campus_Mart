import { PrismaClient, UserRole, TransactionType, ProductStatus, ProductCondition } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Prisma database seeding...');

  // 1. Seed Colleges
  const coep = await prisma.college.upsert({
    where: { code: 'COEP' },
    update: {},
    create: {
      name: 'College of Engineering Pune (COEP)',
      code: 'COEP',
      domains: ['coep.ac.in', 'student.coep.ac.in'],
      city: 'Pune',
      state: 'Maharashtra',
      country: 'India'
    }
  });

  const iitb = await prisma.college.upsert({
    where: { code: 'IITB' },
    update: {},
    create: {
      name: 'Indian Institute of Technology Bombay (IITB)',
      code: 'IITB',
      domains: ['iitb.ac.in', 'student.iitb.ac.in'],
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India'
    }
  });

  // 2. Seed Departments
  const cseDept = await prisma.department.upsert({
    where: { collegeId_code: { collegeId: coep.id, code: 'CSE' } },
    update: {},
    create: {
      collegeId: coep.id,
      name: 'Computer Engineering & IT',
      code: 'CSE'
    }
  });

  const eceDept = await prisma.department.upsert({
    where: { collegeId_code: { collegeId: coep.id, code: 'ECE' } },
    update: {},
    create: {
      collegeId: coep.id,
      name: 'Electronics & Telecommunication',
      code: 'ECE'
    }
  });

  // 3. Seed Categories
  const categories = [
    { name: 'Cycles', slug: 'cycles', icon: 'Bike', description: 'Campus bicycles and accessories' },
    { name: 'Electronics', slug: 'electronics', icon: 'Laptop', description: 'Gadgets, iPads, monitors & chargers' },
    { name: 'Books', slug: 'books', icon: 'BookOpen', description: 'Academic textbooks and competitive manuals' },
    { name: 'Furniture', slug: 'furniture', icon: 'Armchair', description: 'Study desks, chairs & hostel furniture' },
    { name: 'Lab Equipment', slug: 'lab-equipment', icon: 'FlaskConical', description: 'Drawing boards, lab manuals & kits' },
    { name: 'Notes & Study Material', slug: 'notes', icon: 'FileText', description: 'Handwritten notes & lecture prints' },
    { name: 'Hostel Essentials', slug: 'hostel-essentials', icon: 'Home', description: 'Bucket sets, kettles & room decor' }
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat
    });
  }

  // 4. Seed Seed Users
  const studentRohan = await prisma.user.upsert({
    where: { email: 'rohan.sharma2023@coep.ac.in' },
    update: {},
    create: {
      email: 'rohan.sharma2023@coep.ac.in',
      name: 'Rohan Sharma',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
      role: UserRole.STUDENT,
      collegeId: coep.id,
      departmentId: cseDept.id,
      year: 3,
      branch: 'B.Tech Software',
      badges: ['Verified Student', 'Top Rated Seller', 'Cycle Owner'],
      isVerified: true,
      isAdmin: false
    }
  });

  const studentPriya = await prisma.user.upsert({
    where: { email: 'priya.patel2024@coep.ac.in' },
    update: {},
    create: {
      email: 'priya.patel2024@coep.ac.in',
      name: 'Priya Patel',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      role: UserRole.STUDENT,
      collegeId: coep.id,
      departmentId: eceDept.id,
      year: 2,
      branch: 'B.Tech VLSI',
      badges: ['Verified Student', 'Helper'],
      isVerified: true,
      isAdmin: false
    }
  });

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin.campusmart@coep.ac.in' },
    update: {},
    create: {
      email: 'admin.campusmart@coep.ac.in',
      name: 'CampusMart Administrator',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      role: UserRole.SUPER_ADMIN,
      collegeId: coep.id,
      badges: ['Moderator', 'Staff Verified'],
      isVerified: true,
      isAdmin: true
    }
  });

  console.log('✅ Prisma database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
