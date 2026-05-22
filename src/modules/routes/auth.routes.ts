import express, { type Router } from "express";
import { userController } from "../controllers/auth.controller";

const router: Router = express.Router();
router.post("/signup", userController.createUser);
export const AuthRoutes = router;
