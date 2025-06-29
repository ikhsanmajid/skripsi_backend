import { Router, Request, Response } from 'express'
import { loginController } from '../controller/login.controller'

const router: Router = Router()

router.post("/", loginController.login)

export default router