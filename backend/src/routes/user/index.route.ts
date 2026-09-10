import { Router } from "express";
import { registerBodyValidator, loginBodyValidator } from "../validator.js";
import register from "@controllers/user/register.controller.js";
import login from "@controllers/user/login.controller.js";
import logout from "@controllers/user/logout.controller.js";
import refresh from "@controllers/user/refresh.controller.js";
import me from "@controllers/user/me.controller.js";
import verifyUser from "@/middlewares/user.middleware.js";
import otp from "@controllers/user/otp.controller.js";
import verify from "@controllers/user/verify.controller.js";

export const router: Router = Router();

router.post("/register", registerBodyValidator, register);
router.post("/login", loginBodyValidator, login);
router.post("/refresh", refresh);
router.post("/logout", verifyUser, logout);

router.get("/me", verifyUser, me);

router.post("/otp", verifyUser, otp);
router.post("/verify", verifyUser, verify);
