import express from 'express';
import { getUserProfile, updateUserProfile, selectAvatarUpload } from '../controllers/user_controller.js';
import { protectedRoute } from '../middleware/authMiddleware.js';
const router_user = express.Router();
router_user.get("/profile",protectedRoute,getUserProfile);
router_user.put("/profile",protectedRoute, selectAvatarUpload, updateUserProfile);
export default router_user;