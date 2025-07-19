import { authenticateToken } from "../../middleware/authentication";
import { authorizeRoles } from "../../middleware/authorization";
import { Router } from "express";
import { userRfidRoomsController } from "../../controller/v1/userrfid-room.controller";
import { validateTextOnly } from "../../middleware/validation";

const router: Router = Router()

router.use(authenticateToken)

router.get("/accessList/:id", authorizeRoles(['ADMIN', 'AUDITOR']), userRfidRoomsController.getAccessListUsers)
router.get("/getUnassigned/:id", authorizeRoles(['ADMIN', 'AUDITOR']), userRfidRoomsController.getUnassignedUsers)
router.post("/assign/", authorizeRoles(['ADMIN']), userRfidRoomsController.assignUser)
router.delete("/unassign/:id", authorizeRoles(['ADMIN']), userRfidRoomsController.unassignUser)

export default router