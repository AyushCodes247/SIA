import db from "@/index.js";
import { eq } from "drizzle-orm";
import { userTable } from "@schemas/user.schema.js";
import { AppError } from "@utils/essential.util.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyPassword,
} from "@utils/auth.util.js";
import { storeSession } from "../redis.service.js";
import type { GlobalReturnDataType } from "./register.service.js";

export interface LoginData {
  email: string;
  password: string;
}

const loginService = async (data: LoginData): Promise<GlobalReturnDataType> => {
  try {
    const user = await db.query.userTable.findFirst({
      where: eq(userTable.email, data.email),
    });

    if (!user) {
      throw new AppError("Invalid email or password.", 401);
    }

    const isValidPassword = await verifyPassword(
      user.passwordHash,
      data.password,
    );

    if (!isValidPassword) {
      throw new AppError("Invalid email or password.", 401);
    }

    await db
      .update(userTable)
      .set({
        lastLoginAt: new Date(),
      })
      .where(eq(userTable.publicId, user.publicId));

    const payload = {
      publicId: user.publicId,
      username: user.username,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await storeSession(user.publicId, refreshToken);

    return {
      user: {
        publicId: user.publicId,
        username: user.username,
        email: user.email,
        isVerified: user.isVerified,
      },
      accessToken,
      refreshToken,
    };
  } catch (error) {
    throw error;
  }
};

export default loginService;
