import { asyncHandler } from "@utils/essential.util.js";
import env from "@configs/env.config.js";
import refreshService from "@services/user/refresh.service.js";

const REFRESH_COOKIE = "sia_cookie";

const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies[REFRESH_COOKIE];

  if (!refreshToken) {
    throw new Error("Refresh token missing.");
  }

  const { accessToken, newRefreshToken } = await refreshService(refreshToken);

  const isProduction = env.NODE_ENV === "production";

  res.cookie(REFRESH_COOKIE, newRefreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });

  return res.status(200).json({
    success: true,
    message: "Token refreshed successfully.",
    accessToken,
  });
});

export default refresh;
