import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../common/database/database.service";
import { hash } from "bcrypt";

type UserRecord = {
  id: number;
  email: string;
  username: string | null;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class UsersService {
  constructor(private readonly prisma: DatabaseService) {}

  private mapUser(user: UserRecord) {
    return {
      id: user.id,
      email: user.email,
      username: user.username ?? undefined,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  private success<T>(data: T, message: string) {
    return { success: true, data, message };
  }

  private failure(message: string) {
    return { success: false, data: null, message };
  }

  async getUserById(id: number) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        return this.failure(`User ${id} not found`);
      }

      return this.success(this.mapUser(user), "User retrieved successfully");
    } catch (error) {
      return this.failure(
        error instanceof Error ? error.message : "Failed to get user"
      );
    }
  }

  async getUserByEmail(email: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return this.failure(`User with email ${email} not found`);
      }

      return this.success(this.mapUser(user), "User retrieved successfully");
    } catch (error) {
      return this.failure(
        error instanceof Error ? error.message : "Failed to get user"
      );
    }
  }

  async createUser(data: { email: string; password: string; username?: string }) {
    try {
      const existing = await this.prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existing) {
        return this.failure("Email is already in use");
      }

      const passwordHash = await hash(data.password, 10);
      const user = await this.prisma.user.create({
        data: {
          email: data.email,
          username: data.username ?? data.email,
          password: passwordHash,
        },
      });

      return this.success(this.mapUser(user), "User created successfully");
    } catch (error) {
      return this.failure(
        error instanceof Error ? error.message : "Failed to create user"
      );
    }
  }

  async updateUser(data: { id: number; email?: string; username?: string }) {
    try {
      const user = await this.prisma.user.update({
        where: { id: data.id },
        data: {
          email: data.email,
          username: data.username,
        },
      });

      return this.success(this.mapUser(user), "User updated successfully");
    } catch (error) {
      return this.failure(
        error instanceof Error ? error.message : "Failed to update user"
      );
    }
  }

  async deleteUser(id: number) {
    try {
      await this.prisma.user.delete({
        where: { id },
      });

      return { success: true, message: "User deleted successfully" };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to delete user",
      };
    }
  }
}
