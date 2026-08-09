import express, { Express } from "express";
import session from "express-session";
import { requestLogger } from "./core/middleware/logger.js";
import { globalErrorHandler } from "./core/errors/error.js";
import router from "./routes.js";
import cors from "cors";
import cookieparser from "cookie-parser";

const allowedOrigins = [  
   "http://localhost:3000"
];
const app : Express = express();

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(express.json());
app.use(cookieparser());
app.use(requestLogger);
app.use("/api", router);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});



app.use(globalErrorHandler);


export default app;