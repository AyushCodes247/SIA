import crypto from "crypto";
import redis from "@configs/redis.config.js";

const OTP_PREFIX = "otp";
const OTP_TTL = 5 * 60;

const hashOtp = (otp: string): string =>
  crypto.createHash("sha256").update(otp).digest("hex");

const getOtpKey = (email: string): string => `${OTP_PREFIX}:${email}`;

export const storeOtp = async (email: string, otp: string): Promise<void> => {
  await redis.set(getOtpKey(email), hashOtp(otp), "EX", OTP_TTL);
};

export const verifyOtp = async (
  email: string,
  otp: string,
): Promise<boolean> => {
  const storedOtp = await redis.get(getOtpKey(email));

  if (!storedOtp) {
    return false;
  }

  return storedOtp === hashOtp(otp);
};

export const deleteOtp = async (email: string): Promise<void> => {
  await redis.del(getOtpKey(email));
};

export const getOtpTTL = async (email: string): Promise<number> => {
  return redis.ttl(getOtpKey(email));
};