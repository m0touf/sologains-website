// Quick test to show password validation error messages
const { z } = require('zod');

const signupSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
});

// Test cases
const testCases = [
  { email: 'test@example.com', username: 'testuser', password: 'weak' },
  { email: 'test@example.com', username: 'testuser', password: 'weakpassword' },
  { email: 'test@example.com', username: 'testuser', password: 'WeakPassword' },
  { email: 'test@example.com', username: 'testuser', password: 'WeakPassword1' },
  { email: 'test@example.com', username: 'test user', password: 'WeakPassword1!' },
  { email: 'invalid-email', username: 'testuser', password: 'WeakPassword1!' },
];

console.log('🔍 Password Validation Test Results:\n');

testCases.forEach((testCase, index) => {
  const result = signupSchema.safeParse(testCase);
  console.log(`Test ${index + 1}:`);
  console.log(`Input: ${JSON.stringify(testCase)}`);
  
  if (!result.success) {
    const errorMessage = result.error.issues.map(issue => issue.message).join(', ');
    console.log(`❌ Error: ${errorMessage}`);
  } else {
    console.log('✅ Valid');
  }
  console.log('---');
});
