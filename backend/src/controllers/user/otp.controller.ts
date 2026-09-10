import { asyncHandler } from "@utils/essential.util.js";
import otpService from "@services/user/otp.service.js";

const otp = asyncHandler(async (req, res) => {
  const info = await otpService({
    username: req.user?.username,
    email: req.user?.email,
  });

  return res.status(200).json({
    success: true,
    message: "verification otp sent successfully.",
    email: req.user?.email,
    mail: info,
  });
});

export default otp;
