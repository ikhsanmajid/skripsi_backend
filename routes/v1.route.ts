import { NextFunction, Router } from "express"
import { Request, Response } from "express"
import { authenticateToken } from "../middleware/authentication";
import usersLogin from './v1/userslogin.route'
import users from './v1/users.route'
import rooms from './v1/rooms.route'
import rfid from './v1/rfid.route'
import { authorizeRoles } from "../middleware/authorization";

const router: Router = Router()

router.use("/users_login", usersLogin)
router.use("/users", users)
router.use("/rooms", rooms)
router.use("/rfid", rfid)

router.get("/time", (req: Request, res: Response) => {
    res.json({ time: new Date().toISOString() })
})
 
export default router;