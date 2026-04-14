import express, { Express } from "express";
import routes from "./routes";
import { requestLogger } from "./core/middleware/logger";
import { globalErrorHandler } from "./core/errors/error";
const app : Express = express();

app.use(express.json());
app.use(requestLogger);
app.use("/api", routes);


app.use(globalErrorHandler);

export default app;