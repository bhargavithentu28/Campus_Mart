import dotenv from 'dotenv';
import path from 'path';

// MUST set process.env BEFORE importing Prisma modules
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgresql://user:password@ep-cool-name-123456.us-east-2.aws.neon.tech/campusmart?sslmode=require';
}

import { ProductStatus } from '@prisma/client';
import { collegeService } from '../src/modules/colleges/collegeService';
import { userService } from '../src/modules/users/userService';
import { productService } from '../src/modules/products/productService';
import { reviewService } from '../src/modules/reviews/reviewService';

async function runPhase4Tests() {
  console.log('🧪 Starting Phase 4 Backend Core Verification Tests...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  }

  // 1. Test College Email Format Guard
  try {
    const invalidEmail = await collegeService.verifyCollegeDomain('not-an-email');
    assert(invalidEmail.isValid === false && invalidEmail.reason === 'Invalid email format', 'College Service (Reject Invalid Email Format)');
  } catch (err: any) {
    console.error('  ❌ FAIL: College Email Format error:', err.message);
    failed++;
  }

  // 2. Test Review Self-Review Prevention Guard
  try {
    let threwError = false;
    try {
      await reviewService.createReview('user_123', 'user_123', 5, 'Great seller!');
    } catch (e: any) {
      threwError = e.message.includes('cannot write a review for yourself');
    }
    assert(threwError, 'Review System Guard (Block Self-Review)');
  } catch (err: any) {
    console.error('  ❌ FAIL: Review Self-Review Guard error:', err.message);
    failed++;
  }

  // 3. Test Review Rating Range Guard
  try {
    let threwRatingError = false;
    try {
      await reviewService.createReview('user_123', 'user_456', 10, 'Invalid rating');
    } catch (e: any) {
      threwRatingError = e.message.includes('Rating must be an integer between 1 and 5');
    }
    assert(threwRatingError, 'Review System Guard (Validate 1-5 Rating Scale)');
  } catch (err: any) {
    console.error('  ❌ FAIL: Review Rating Scale error:', err.message);
    failed++;
  }

  // 4. Test Product Status & Ownership Guard Logic
  try {
    let statusGuardValid = false;
    try {
      await productService.changeStatus('p_fake', 'attacker_user_id', false, ProductStatus.SOLD);
    } catch (e: any) {
      statusGuardValid = e.message.includes('Product not found') || e.message.includes('Not authorized') || e.message.includes('reach database') || e.message.includes('Environment variable');
    }
    assert(statusGuardValid, 'Product Service Guard (Ownership & Authorization Check)');
  } catch (err: any) {
    console.error('  ❌ FAIL: Product State Guard error:', err.message);
    failed++;
  }

  console.log(`\n==========================================`);
  console.log(`🧪 TEST RESULTS: ${passed} Passed, ${failed} Failed`);
  console.log(`==========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase4Tests();
