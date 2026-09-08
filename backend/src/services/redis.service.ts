import crypto from "crypto";
import redis from "@configs/redis.config.js";

const SESSION_PREFIX = "session";
const SESSION_TTL = 7 * 24 * 60 * 60;

const getSessionKey = (publicId: string): string => {
  return `${SESSION_PREFIX}:${publicId}`;
};

const hashToken = (token: string): string => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

export const storeSession = async (
  publicId: string,
  refreshToken: string,
): Promise<void> => {
  const tokenHash = hashToken(refreshToken);

  await redis.set(getSessionKey(publicId), tokenHash, "EX", SESSION_TTL);
};

export const verifySession = async (
  publicId: string,
  refreshToken: string,
): Promise<boolean> => {
  const storedHash = await redis.get(getSessionKey(publicId));

  if (!storedHash) {
    return false;
  }

  return storedHash === hashToken(refreshToken);
};

export const rotateSession = async (
  publicId: string,
  refreshToken: string,
): Promise<void> => {
  await storeSession(publicId, refreshToken);
};

export const deleteSession = async (publicId: string): Promise<void> => {
  await redis.del(getSessionKey(publicId));
};
