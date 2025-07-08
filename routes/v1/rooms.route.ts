import { authenticateToken } from "../../middleware/authentication";
import { authorizeRoles } from "../../middleware/authorization";
import { Router } from "express";
import { roomsController } from "../../controller/v1/rooms.controller";
import { validateTextOnly } from "../../middleware/validation";
import { roomCreateSchema, roomUpdateSchema } from "../../schemas/roomsSchemas";

const router: Router = Router()

router.use(authenticateToken)

router.get("/", authorizeRoles(['ADMIN', 'AUDITOR']), roomsController.readAllRoom)
router.get("/count", authorizeRoles(['ADMIN', 'AUDITOR']), roomsController.getCountRoom)
router.patch("/update/:id", authorizeRoles(['ADMIN']), validateTextOnly(roomUpdateSchema), roomsController.updateRoom)
router.post("/create", authorizeRoles(['ADMIN']), validateTextOnly(roomCreateSchema), roomsController.createRoom)
router.delete("/delete/:id", authorizeRoles(['ADMIN']), roomsController.deleteRoom)

export default router