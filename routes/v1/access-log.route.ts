import { authenticateToken } from "../../middleware/authentication";
import { authorizeRoles } from "../../middleware/authorization";
import { Router } from "express";
import { rfidController } from "../../controller/v1/rfid.controller";

const router: Router = Router()

router.use(authenticateToken)

router.get("/", authorizeRoles(['ADMIN', 'AUDITOR']), rfidController.readAllRFID)

export default router