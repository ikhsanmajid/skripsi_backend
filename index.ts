import express, { Express, Request, Response, Router } from "express";
import cors, { CorsOptions } from "cors"
import cookieParser from "cookie-parser";

import login from './routes/login.route'
import v1 from './routes/v1.route'
import control from './routes/control.route'

import { handleErrorCustom } from "./middleware/error";
import { loadModels } from "./utils/face-recognition";

loadModels().then(() => {
    console.info('✅ Face-API.js models loaded successfully.');
}).catch((err: unknown) => {
    console.error('❌ Failed to load Face-API.js models on startup:', { error: err });
    process.exit(1);
});

const corsOpttion: CorsOptions = {
    credentials: true,
    origin: ["http://localhost"]
}

const app: Express = express()
const port: number = 3001

app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '50mb' }));
app.use(cookieParser())
app.use(cors(corsOpttion))

app.get("/", (req: Request, res: Response) => {
    res.send("It Works!")
})

app.get("/time", (req: Request, res: Response) => {
    res.json({ time: new Date().toISOString() })
})

app.use('/login', login)
app.use('/api/v1', v1)
app.use("/door", control)
app.use(handleErrorCustom)

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
})