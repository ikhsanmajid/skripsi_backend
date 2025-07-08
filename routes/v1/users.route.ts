import { authenticateToken } from "../../middleware/authentication";
import { authorizeRoles } from "../../middleware/authorization";
import express, { Router } from "express";
import { upload } from "../../middleware/uploadfile";
import { userCreateSchema, userUpdateSchema } from "../../schemas/usersSchemas";
import { usersController } from "../../controller/v1/users.controller";
import { validateCreateUser } from "../../middleware/validation";
import path from "path";

const router: Router = Router()

router.use(authenticateToken)

router.get("/", authorizeRoles(['ADMIN', 'AUDITOR']), usersController.readAllUser)
router.get("/count", authorizeRoles(['ADMIN', 'AUDITOR']), usersController.getCountUser)
router.get("/:id", authorizeRoles(['ADMIN', 'AUDITOR']), usersController.getUser)
router.patch("/update/:id", authorizeRoles(['ADMIN']), upload.single('image'), validateCreateUser(userUpdateSchema), usersController.updateUser)
router.post("/create", authorizeRoles(['ADMIN']), upload.single('image'), validateCreateUser(userCreateSchema), usersController.createUser)
router.delete("/delete/:id", authorizeRoles(['ADMIN']), usersController.deleteUser)
router.use('/faces', express.static(path.join(__dirname, '../../face_image_dir')));

export default router