import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// Enhanced security configuration
const JWT_SECRET = process.env.JWT_SECRET;
const BCRYPT_ROUNDS = 14; // Increased from 12 for better security
const JWT_EXPIRES_IN = '24h'; // Reduced from 7d for better security
const REFRESH_TOKEN_EXPIRES_IN = '7d';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

export interface JWTPayload {
  userId: string;
  email: string;
  username: string;
  iat?: number;
  exp?: number;
}

export interface RefreshTokenPayload {
  userId: string;
  tokenId: string;
  iat?: number;
  exp?: number;
}

// Enhanced password hashing with additional security
export const hashPassword = async (password: string): Promise<string> => {
  // Validate password strength
  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters long');
  }
  
  // Add additional entropy with a random salt
  const additionalSalt = crypto.randomBytes(16).toString('hex');
  const passwordWithSalt = password + additionalSalt;
  
  // Hash with bcrypt (which includes its own salt)
  const hashedPassword = await bcrypt.hash(passwordWithSalt, BCRYPT_ROUNDS);
  
  // Store both the additional salt and the hashed password
  return `${additionalSalt}:${hashedPassword}`;
};

export const verifyPassword = async (password: string, storedPassword: string): Promise<boolean> => {
  try {
    // Extract the additional salt and hashed password
    const [additionalSalt, hashedPassword] = storedPassword.split(':');
    
    if (!additionalSalt || !hashedPassword) {
      return false;
    }
    
    // Recreate the password with the additional salt
    const passwordWithSalt = password + additionalSalt;
    
    // Compare with bcrypt
    return await bcrypt.compare(passwordWithSalt, hashedPassword);
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
};

// Generate access token (short-lived)
export const generateAccessToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { 
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'sologains',
    audience: 'sologains-users'
  });
};

// Generate refresh token (longer-lived)
export const generateRefreshToken = (userId: string): string => {
  const tokenId = crypto.randomUUID();
  const payload: RefreshTokenPayload = {
    userId,
    tokenId
  };
  
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    issuer: 'sologains',
    audience: 'sologains-refresh'
  });
};

// Verify access token
export const verifyAccessToken = (token: string): JWTPayload | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'sologains',
      audience: 'sologains-users'
    }) as JWTPayload;
    
    return decoded;
  } catch (error) {
    console.error('Access token verification error:', error);
    return null;
  }
};

// Verify refresh token
export const verifyRefreshToken = (token: string): RefreshTokenPayload | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'sologains',
      audience: 'sologains-refresh'
    }) as RefreshTokenPayload;
    
    return decoded;
  } catch (error) {
    console.error('Refresh token verification error:', error);
    return null;
  }
};

// Legacy function for backward compatibility
export const generateToken = generateAccessToken;
export const verifyToken = verifyAccessToken;

// Password strength validation
export const validatePasswordStrength = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (password.length > 128) {
    errors.push('Password must be less than 128 characters');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Generate secure random password (for admin use)
export const generateSecurePassword = (length: number = 16): string => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
  let password = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, charset.length);
    password += charset[randomIndex];
  }
  
  return password;
};
