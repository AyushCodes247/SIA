import { asyncHandler } from "@/utils/essential.util.js";
import { verifyAccessToken } from "@/utils/auth.util.js";
import { AppError } from "@utils/essential.util.js";
import db from "@/index.js";
import { userTable } from "@schemas/user.schema.js";
import { eq } from "drizzle-orm";

const verifyUser = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    throw new AppError("Unauthorized", 401);
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    throw new AppError("Unauthorized", 401);
  }

  let payload;

  try {
    payload = verifyAccessToken(token);
  } catch {
    throw new AppError("Unauthorized", 401);
  }

  const user = await db.query.userTable.findFirst({
    where: eq(userTable.publicId, payload.publicId),
    columns: {
      publicId: true,
      username: true,
      email: true,
      isVerified: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new AppError("Unauthorized", 401);
  }

  req.user = {
    publicId: user.publicId,
    username: user.username,
    email: user.email,
    verified: user.isVerified,
    createdAt: user.createdAt,
  };

  return next();
});

export default verifyUser;
