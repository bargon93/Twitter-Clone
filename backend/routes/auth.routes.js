import express from 'express';
import {body} from 'express-validator';
import {Validate} from "../models/validate.model.js";

import {signup, login, logout} from '../controllers/auth.controller.js';

const router = express.Router();

router.post("/signup",
body('email').isEmail().withMessage("Not a valid email"),
Validate,
signup);

router.post("/login", login);

router.post("/logout", logout);

export default router;