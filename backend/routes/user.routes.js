import express from "express";
import { protectRoute } from "../middlewares/protectRoute.middleware.js";
import { getUserProfile, followOrUnfollowUser } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/profile/:username", protectRoute, getUserProfile)
// router.get("suggested", protectRoute, getUserProfile)
router.post("/follow/:id", protectRoute, followOrUnfollowUser)
// router.post("/update", protectRoute, updateUserProfile)

export default router;