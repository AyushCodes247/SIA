import db from "@/index.js";
import { eq, and } from "drizzle-orm";
import { userTable } from "@schemas/user.schema.js";
import { AppError } from "@utils/essential.util.js";
import { verifyOtp, deleteOtp } from "../otpRedis.service.js";

export interface VerifyOtpData {
  publicId: string | undefined;
  email: string | undefined;
  otp: string;
}

export interface VerifyOtpResponse {
  isVerified: boolean;
}

const verifyOtpService = async (
  data: VerifyOtpData,
): Promise<VerifyOtpResponse> => {
  const eventId = crypto.randomUUID();

  try {
    const isValidOtp = await verifyOtp(String(data.email), String(data.otp));

    if (!isValidOtp) {
      throw new AppError("Invalid or expired OTP.", 400);
    }

    const [user] = await db
      .update(userTable)
      .set({
        isVerified: true,
        emailVerifiedAt: new Date(),
      })
      .where(
        and(
          eq(userTable.publicId, String(data.publicId)),
          eq(userTable.email, String(data.email)),
          eq(userTable.isVerified, false),
        ),
      )
      .returning({
        publicId: userTable.publicId,
      });

    if (!user) {
      throw new AppError("User not found or already verified.", 404);
    }

    await deleteOtp(String(data.email));
    return {
      isVerified: true,
    };
  } catch (error) {
    throw error;
  }
};

export default verifyOtpService;
