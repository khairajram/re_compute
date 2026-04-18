import express, { Express } from "express";
import session from "express-session";
import  passport from "passport"
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

app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());
app.use(cookieparser());
app.use(requestLogger);
app.use("/api", router);



// STEP 2: Callback
app.get("/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
  }),
  (req, res) => {
    // ✅ Successful login

    // Option A: redirect with session
    res.redirect("http://localhost:3000/dashboard");

    // Option B (better): send token
    // const token = jwt.sign({ user: req.user }, "secret");
    // res.redirect(`http://localhost:3000?token=${token}`);
  }
);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});



app.use(globalErrorHandler);


export default app;