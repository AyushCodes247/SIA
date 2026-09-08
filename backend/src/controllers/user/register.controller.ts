import { asyncHandler } from "@utils/essential.util.js";
import env from "@configs/env.config.js";
import { validationResult } from "express-validator";
import registerService from "@services/user/register.service.js";

const REFRESH_COOKIE = "sia_cookie";

const register = asyncHandler(async (req, res) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: error.array(),
    });
  }

  const { username, email, password } = req.body;

  const { user, accessToken, refreshToken } = await registerService({
    username,
    email,
    password,
  });

  const isProduction = env.NODE_ENV === "production";

  res.cookie(REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });

  return res.status(201).json({
    success: true,
    message: "User registered successfully.",
    user,
    accessToken,
  });
});

export default register;
