import { Router } from "express";
import { validateTextOnly } from "../../middleware/validation";
import { registerUserSchema } from "../../schemas/usersloginSchemas";
import { usersLoginController } from "../../controller/v1/userslogin.controller";
import { authorizeRoles } from "../../middleware/authorization";
import { authenticateToken } from "../../middleware/authentication";

const router: Router = Router()

router.use(authenticateToken)

router.post("/register", authorizeRoles(['ADMIN']), validateTextOnly(registerUserSchema), usersLoginController.register)
router.get("/", authorizeRoles(['ADMIN', 'AUDITOR']), usersLoginController.readAllUser)
router.get("/count", authorizeRoles(['ADMIN', 'AUDITOR']), usersLoginController.getCountUser)
router.get("/:id", authorizeRoles(['ADMIN', 'AUDITOR']), usersLoginController.getUser)
router.patch("/update/:id", authorizeRoles(['ADMIN']), validateTextOnly(registerUserSchema), usersLoginController.updateUser)
router.delete("/delete/:id", authorizeRoles(['ADMIN']), usersLoginController.deleteUser)

export default router