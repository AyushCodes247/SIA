import { AppError } from "@utils/essential.util.js";
import {
  verifyRefreshToken,
  generateAccessToken,
  generateRefreshToken,
} from "@utils/auth.util.js";
import { verifySession, rotateSession } from "../redis.service.js";

export interface RefreshResponse {
  accessToken: string;
  newRefreshToken: string;
}

const refreshService = async (
  refreshToken: string,
): Promise<RefreshResponse> => {
  try {
    const payload = verifyRefreshToken(refreshToken);

    const validSession = await verifySession(payload.publicId, refreshToken);

    if (!validSession) {
      throw new AppError("Session expired.", 401);
    }

    const jwtPayload = {
      publicId: payload.publicId,
      username: payload.username,
    };

    const newAccessToken = generateAccessToken(jwtPayload);

    const newRefreshToken = generateRefreshToken(jwtPayload);

    await rotateSession(payload.publicId, newRefreshToken);

    return {
      accessToken: newAccessToken,
      newRefreshToken,
    };
  } catch (error) {
    throw error;
  }
};

export default refreshService;
