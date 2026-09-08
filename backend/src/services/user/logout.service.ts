import { AppError } from "@utils/essential.util.js";
import { verifyRefreshToken } from "@utils/auth.util.js";
import { deleteSession } from "../redis.service.js";

const logoutService = async (refreshToken: string): Promise<void> => {
  try {
    const payload = verifyRefreshToken(refreshToken);
    if(!payload){
        throw new AppError("Invalid session",401);
    }

    await deleteSession(payload.publicId);
  } catch (error) {
    throw error;
  }
};

export default logoutService;
