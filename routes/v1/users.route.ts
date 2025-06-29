import { authenticateToken } from "../../middleware/authentication";
import { authorizeRoles } from "../../middleware/authorization";
import { Router } from "express";
import { upload } from "../../middleware/uploadfile";
import { userCreateSchema, userUpdateSchema } from "../../schemas/usersSchemas";
import { usersController } from "../../controller/v1/users.controller";
import { validateCreateUser } from "../../middleware/validation";

const router: Router = Router()

router.use(authenticateToken)

router.get("/", authorizeRoles(['ADMIN', 'AUDITOR']), usersController.readAllUser)
router.patch("/update/:id", authorizeRoles(['ADMIN']), upload.single('image'), validateCreateUser(userUpdateSchema), usersController.updateUser)
router.post("/create", authorizeRoles(['ADMIN']), upload.single('image'), validateCreateUser(userCreateSchema), usersController.createUser)
router.delete("/delete/:id", authorizeRoles(['ADMIN']), usersController.deleteUser)

export default router