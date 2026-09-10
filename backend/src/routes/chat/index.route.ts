import verifyUser from "@/middlewares/user.middleware.js";
import { Router } from "express";

export const router: Router = Router();

router.post("/", verifyUser);

router.get("/", async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Chat router working properly.",
  });
});
