import express from "express";
import cors from "cors";
import transactionsRouter from "./routers/transactions-router.js";
import goalsRouter from "./routers/goals-router.js";

const app = new express();

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/transactions", transactionsRouter);
app.use("/api/savingsgoals", goalsRouter);

//  Start server ---------------------------
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
