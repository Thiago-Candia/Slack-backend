import authRouter from "./routes/auth.router.js";
import ENVIRONMENT from "./config/environment.config.js";
import express from "express";
import "./config/mongoDB.config.js";
import cors from "cors";
import workspace_router from "./routes/workspace.router.js";
import channel_router from "./routes/channel.router.js";
import profile_router from "./routes/profile.router.js";
import directmessage_router from "./routes/directmessage.router.js";

const allowedOrigins = ENVIRONMENT.URL_FRONTEND
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

const app = express();

app.use(
    cors({
        origin(origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            return callback(new Error("Origin not allowed by CORS"));
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"]
    })
) 

app.use(express.json(
    {
        limit: '2mb'
    }
))

app.use('/api/auth', authRouter)

app.use('/api/workspaces', workspace_router)

app.use('/api/channels', channel_router)

app.use('/api/profile', profile_router)

app.use('/api/dm', directmessage_router)


app.listen(ENVIRONMENT.PORT, () => {
    console.log(`Server listening on port ${ENVIRONMENT.PORT}`)
})
