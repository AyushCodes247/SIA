import db from "@/index.js";
import { eq } from "drizzle-orm";
import { userTable } from "@schemas/user.schema.js";
import { AppError } from "@utils/essential.util.js";
import {
  generateAccessToken,
  generateRefreshToken,
  hashPassword,
} from "@utils/auth.util.js";
import { storeSession } from "../redis.service.js";

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface GlobalReturnDataType {
  user: {
    publicId: string;
    username: string;
    email: string;
    isVerified: boolean;
  };
  accessToken: string;
  refreshToken: string;
}

const registerService = async (
  data: RegisterData,
): Promise<GlobalReturnDataType> => {
  try {
    const existingUser = await db.query.userTable.findFirst({
      where: eq(userTable.email, data.email),
    });

    if (existingUser) {
      throw new AppError("User already exists.", 409);
    }

    const hashedPassword = await hashPassword(data.password);

    const [user] = await db
      .insert(userTable)
      .values({
        username: data.username,
        email: data.email,
        passwordHash: hashedPassword,
      })
      .returning({
        publicId: userTable.publicId,
        username: userTable.username,
        email: userTable.email,
        isVerified: userTable.isVerified,
      });

    if (!user) {
      throw new AppError("Failed to register user.", 500);
    }

    const payload = {
      publicId: user.publicId,
      username: user.username,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await storeSession(user.publicId, refreshToken);

    return {
      user,
      accessToken,
      refreshToken,
    };
  } catch (error) {
    throw error;
  }
};

export default registerService;
