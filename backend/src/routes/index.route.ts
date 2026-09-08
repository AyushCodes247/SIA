import { Router } from "express";
import { router as userRouter } from "@routes/user/index.route.js";
import { router as chatRouter } from "@/routes/chat/index.route.js";

const router: Router = Router();

router.get("/", (req, res) => {
  res.status(200).json({ message: "Welcome to the BACKEND API." });
});

router.use("/users", userRouter);

router.use("/chats", chatRouter);

export default router;
