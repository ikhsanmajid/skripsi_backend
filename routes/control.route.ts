import { NextFunction, Router } from "express"
import { Request, Response } from "express"
import { authenticateEsp } from "../middleware/authentication-esp";
import { controlController } from "../controller/control.controller";
import { uploadFromEsp } from "../middleware/uploadfilefromesp";

const router: Router = Router()

router.use(authenticateEsp)

router.post("/unlock", uploadFromEsp.single("image"), controlController.unlockDoor)
 
export default router;