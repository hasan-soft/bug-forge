import express, { type Router } from "express";
import { userController } from "../controllers/auth.controller";

const router: Router = express.Router();
router.post("/signup", userController.createUser);
router.post("/login", userController.loginUser);
export const AuthRoutes = router;


