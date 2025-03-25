import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const prisma = new PrismaClient();

// Input validation schemas
const userCreateSchema = z.object({
  phoneNumber: z.string().min(10).max(15),
  role: z.string().optional(),
  name: z.string().min(2).max(50).optional(),
  email: z.string().email().optional(),
  address: z.string().min(5).max(200).optional(),
  password: z.string().min(6).optional()
});

const userUpdateSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  email: z.string().email().optional(),
  address: z.string().min(5).max(200).optional(),
  role: z.string().optional()
});

class UserError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'UserError';
  }
}

export interface UserCreateInput {
  phoneNumber: string;
  role?: string;
  name?: string;
  email?: string;
  address?: string;
  password?: string;
}

export interface UserUpdateInput {
  name?: string;
  email?: string;
  address?: string;
  role?: string;
}

export const userDb = {
  // Create a new user
  create: async (data: UserCreateInput) => {
    try {
      // Validate input data
      const validatedData = userCreateSchema.parse(data);
      
      // Hash password if provided
      const hashedPassword = validatedData.password 
        ? await bcrypt.hash(validatedData.password, 10)
        : undefined;

      return await prisma.user.create({
        data: {
          ...validatedData,
          password: hashedPassword,
          role: validatedData.role || 'client'
        }
      });
    } catch (error: any) {
      console.error('Error creating user:', error);
      if (error instanceof z.ZodError) {
        throw new UserError('Invalid input data: ' + error.errors.map(e => e.message).join(', '), 'VALIDATION_ERROR');
      }
      if (error.code === 'P2002') {
        throw new UserError('Phone number already exists', 'DUPLICATE_PHONE');
      }
      throw new UserError(error.message || 'Failed to create user', 'INTERNAL_ERROR');
    }
  },

  // Get user by ID
  getById: async (id: string) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          orders: true,
          cart: true
        }
      });
      if (!user) throw new Error('User not found');
      return user;
    } catch (error: any) {
      console.error('Error fetching user:', error);
      throw new Error(error.message || 'Failed to fetch user');
    }
  },

  // Get user by phone number
  getByPhoneNumber: async (phoneNumber: string) => {
    try {
      const user = await prisma.user.findUnique({
        where: { phoneNumber },
      });
      if (!user) throw new Error('User not found');
      return user;
    } catch (error: any) {
      console.error('Error fetching user:', error);
      throw new Error(error.message || 'Failed to fetch user');
    }
  },

  // Get user by email
  getByEmail: async (email: string) => {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
      });
      if (!user) throw new Error('User not found');
      return user;
    } catch (error: any) {
      console.error('Error fetching user:', error);
      throw new Error(error.message || 'Failed to fetch user');
    }
  },

  // Update user
  update: async (id: string, data: UserUpdateInput) => {
    try {
      // Validate input data
      const validatedData = userUpdateSchema.parse(data);
      
      // Check if user exists
      const existingUser = await prisma.user.findUnique({ where: { id } });
      if (!existingUser) {
        throw new UserError('User not found', 'NOT_FOUND');
      }

      return await prisma.user.update({
        where: { id },
        data: validatedData
      });
    } catch (error: any) {
      console.error('Error updating user:', error);
      throw new Error(error.message || 'Failed to update user');
    }
  },

  // Delete user
  delete: async (id: string) => {
    try {
      return await prisma.user.delete({
        where: { id }
      });
    } catch (error: any) {
      console.error('Error deleting user:', error);
      throw new Error(error.message || 'Failed to delete user');
    }
  },

  // List all users with optional pagination
  list: async (page = 1, limit = 10) => {
    try {
      const skip = (page - 1) * limit;
      const [users, total] = await Promise.all([
        prisma.user.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            orders: true,
            cart: true
          }
        }),
        prisma.user.count()
      ]);

      return {
        users,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error: any) {
      console.error('Error listing users:', error);
      throw new Error(error.message || 'Failed to list users');
    }
  }
};