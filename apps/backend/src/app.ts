import express, { Express } from "express";
import routes from "./routes.js";
import { requestLogger } from "./core/middleware/logger.js";
import { globalErrorHandler } from "./core/errors/error.js";
import router from "./routes.js";
const app : Express = express();

app.use(express.json());
app.use(requestLogger);
app.use("/api", router);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// router.get("/hello", (req, res) => {
//   res.json({ message: "Hello World" });
// });


app.use(globalErrorHandler);


export default app;