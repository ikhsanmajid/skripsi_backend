import { authenticateToken } from "../../middleware/authentication";
import { authorizeRoles } from "../../middleware/authorization";
import { Router } from "express";
import { rfidController } from "../../controller/v1/rfid.controller";
import { validateTextOnly } from "../../middleware/validation";
import { rfidCreateSchema, rfidUpdateSchema } from "../../schemas/rfidSchemas";

const router: Router = Router()

router.use(authenticateToken)

router.get("/", authorizeRoles(['ADMIN', 'AUDITOR']), rfidController.readAllRFID)
router.get("/getUnassigned", authorizeRoles(['ADMIN']), rfidController.getUnassignedRFID)
router.patch("/update/:id", authorizeRoles(['ADMIN']), validateTextOnly(rfidUpdateSchema), rfidController.updateRFID)
router.post("/create", authorizeRoles(['ADMIN']), validateTextOnly(rfidCreateSchema), rfidController.createRFID)
router.delete("/delete/:id", authorizeRoles(['ADMIN']), rfidController.deleteRFID)

export default router