import jwt from 'jsonwebtoken';
import { User, IUserDocument } from '../models/User';
import { config } from '../config/env';
import { RegisterInput, LoginInput } from '../validators/authValidators';

export class AuthService {
  /**
   * Generates a signed JWT access token with payload claims
   */
  public static generateToken(user: { _id: any; email: string; name: string }): string {
    return jwt.sign(
      {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
      },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn as any }
    );
  }

  /**
   * Registers a new user account
   */
  public static async register(input: RegisterInput): Promise<{ user: any; token: string }> {
    const existing = await User.findOne({ email: input.email.toLowerCase() });
    if (existing) {
      const err: any = new Error('An account with this email address already exists.');
      err.statusCode = 409;
      throw err;
    }

    const user = await User.create({
      name: input.name.trim(),
      email: input.email.toLowerCase().trim(),
      password: input.password,
    });

    const token = this.generateToken(user);

    return {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
      token,
    };
  }

  /**
   * Authenticates user credentials and generates access token
   */
  public static async login(input: LoginInput): Promise<{ user: any; token: string }> {
    const user = await User.findOne({ email: input.email.toLowerCase().trim() }).select('+password');
    if (!user) {
      const err: any = new Error('Invalid email or password.');
      err.statusCode = 401;
      throw err;
    }

    const isMatch = await user.comparePassword(input.password);
    if (!isMatch) {
      const err: any = new Error('Invalid email or password.');
      err.statusCode = 401;
      throw err;
    }

    const token = this.generateToken(user);

    return {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
      token,
    };
  }

  /**
   * Retrieves user profile by ID
   */
  public static async getProfile(userId: string): Promise<any> {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      const err: any = new Error('User not found.');
      err.statusCode = 404;
      throw err;
    }
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };
  }
}
