import { Router } from "express";

const router: Router = Router();

router.get("/", (req, res) => {
  res.status(200).json({ message: "Welcome to the BACKEND API." });
});

export default router;
