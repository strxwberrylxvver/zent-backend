import express from "express";
import cors from "cors";
import authRouter from "./routers/auth-router.js";
import collectiveRouter from "./routers/collective-router.js";
import xpRouter, { xpController } from "./routers/xp-router.js";
import linksRouter from "./routers/links-router.js";
import authenticate from "./middleware/auth.js";
import transactionsModel from "./models/transactions-model.js";
import goalsModel from "./models/goals-model.js";
import budgetsModel from "./models/budgets-model.js";
import usersModel from "./models/users-model.js";

const app = express();

app.use(cors({
  origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRouter);
app.use("/api/transactions", authenticate, collectiveRouter(transactionsModel, xpController));
app.use("/api/savingsgoals", authenticate, collectiveRouter(goalsModel, xpController));
app.use("/api/budgets",      authenticate, collectiveRouter(budgetsModel, xpController));
app.use("/api/users",        authenticate, collectiveRouter(usersModel));
app.use("/api/xp",           authenticate, xpRouter);
app.use("/api/links",        authenticate, linksRouter);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));