import express from "express";
import {
  signUp,
  signIn,
  verifyEmail,
  sendPasswordResetEmail,
  resetPassword,
  getUser,
  searchUser,
  signOut,
} from "../controllers/user.controller.js";
import { isAdmin, verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/signup", signUp);
router.post("/signin", signIn);
router.get("/signout", verifyJWT, signOut);
router.get("/verifyEmail/:token", verifyEmail);
router.post("/sendPasswordResetEmail", sendPasswordResetEmail);
router.post("/resetPassword", resetPassword);
router.get("/getUser/:userId", verifyJWT, getUser);
router.get("/searchUser", verifyJWT, isAdmin, searchUser);

export default router;
