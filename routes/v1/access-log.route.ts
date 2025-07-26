import { authenticateToken } from "../../middleware/authentication";
import { authorizeRoles } from "../../middleware/authorization";
import express, { Router } from "express";
import { AccessLogController } from "../../controller/v1/access-log.controller";
import path from "path";

const router: Router = Router()

router.use(authenticateToken)

router.get("/", authorizeRoles(['ADMIN', 'AUDITOR']), AccessLogController.getLastTenAccess)
router.get("/access-list", authorizeRoles(['ADMIN', 'AUDITOR']), AccessLogController.getLastTenAccess)
router.use('/image', express.static(path.join(__dirname, '../../log_camera')));

export default router