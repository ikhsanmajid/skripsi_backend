import { NextFunction, Router } from "express"
import { Request, Response } from "express"
import { authenticateToken } from "../middleware/authentication";
import usersLogin from './v1/userslogin.route'
import users from './v1/users.route'
import rooms from './v1/rooms.route'
import rfid from './v1/rfid.route'
import { authorizeRoles } from "../middleware/authorization";

const router: Router = Router()

router.get("/getservertime", authenticateToken, authorizeRoles(['ADMIN']), (req: Request, res: Response, next: NextFunction) => {
    const dateNow = new Date().toLocaleString();
    res.send(dateNow);
});

router.use("/users_login", usersLogin)
router.use("/users", users)
router.use("/rooms", rooms)
router.use("/rfid", rfid)
 
export default router;