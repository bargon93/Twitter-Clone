import express from 'express';
import {body} from 'express-validator';
import {Validate} from "../middlewares/validate.middleware.js";
import { protectRoute } from '../middlewares/protectRoute.middleware.js';

import {signup, login, logout, getUser} from '../controllers/auth.controller.js';

const router = express.Router();

router.get("/user", protectRoute, getUser);

router.post("/signup", body('email').isEmail().withMessage("Not a valid email"), Validate, signup);

router.post("/login", login);

router.post("/logout", logout);

export default router;