import express from "express";
import cors from "cors";
import transactionsConfig from "./models/transactions-model.js";
import goalsConfig from "./models/goals-model.js";
import budgetsConfig from "./models/budgets-model.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/transactions", createRouter(transactionsConfig));
app.use("/api/savingsgoals", createRouter(goalsConfig));
app.use("/api/budgets", createRouter(budgetsConfig));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
