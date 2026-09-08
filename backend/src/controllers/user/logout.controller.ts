import { asyncHandler } from "@utils/essential.util.js";
import env from "@configs/env.config.js";
import logoutService from "@services/user/logout.service.js";

const REFRESH_COOKIE = "sia_cookie";

const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.[REFRESH_COOKIE];

  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      message: "refresh token is missing",
    });
  }

  await logoutService(refreshToken);

  const isProduction = env.NODE_ENV === "production";

  res.clearCookie(REFRESH_COOKIE, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
  });

  return res.status(200).json({
    success: true,
    message: "User logged out successfully.",
  });
});

export default logout;
