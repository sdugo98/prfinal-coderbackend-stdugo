import { Router } from "express";

import { passportCall, securityAcces } from "../utils.js";
import { ChatController } from "../controller/chatController.js";
export const router = Router();

router.get("/", passportCall('jwt'),securityAcces(["user"]),ChatController.render);
