import { Router } from "express";

export const router: Router = Router();

router.get("/", async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Chat router working properly.",
  });
});
