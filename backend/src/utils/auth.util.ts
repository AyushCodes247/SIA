import env from "@configs/env.config.js";
import argon2 from "argon2";
import jwt from "jsonwebtoken";

export interface TokenPayload {
  publicId: string;
  username: string;
}

const JWT_ISSUER = "sia";
const JWT_AUDIENCE = "sia_api";

const ACCESS_TOKEN_EXPIRY = "20m";
const REFRESH_TOKEN_EXPIRY = "7d";

type Argon2Options = NonNullable<Parameters<typeof argon2.hash>[1]>;

const ARGON2_OPTIONS: Argon2Options = {
  type: argon2.argon2id,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
};

export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
    algorithm: "HS256",
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
  });
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
    algorithm: "HS256",
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
  });
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, env.JWT_ACCESS_SECRET, {
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
  }) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET, {
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
  }) as TokenPayload;
};

export const hashPassword = async (password: string): Promise<string> => {
  return await argon2.hash(password, ARGON2_OPTIONS);
};

export const verifyPassword = async (
  hashedPassword: string,
  plainPassword: string,
): Promise<boolean> => {
  return await argon2.verify(hashedPassword, plainPassword);
};
