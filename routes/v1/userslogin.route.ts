import { Router } from "express";
import { validateTextOnly } from "../../middleware/validation";
import { registerUserSchema } from "../../schemas/usersloginSchemas";
import { usersLoginController } from "../../controller/v1/userslogin.controller";
import { authorizeRoles } from "../../middleware/authorization";
import { authenticateToken } from "../../middleware/authentication";

const router: Router = Router()

router.post("/register", authenticateToken, authorizeRoles(['ADMIN']), validateTextOnly(registerUserSchema), usersLoginController.register)

export default router