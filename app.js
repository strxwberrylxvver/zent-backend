//  Imports --------------------------------
import express from "express";
import database from "./database.js";
import cors from "cors";
//  Configure express app ------------------
const app = new express();

//  Configure middleware -------------------
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());

//  Controllers ----------------------------
const read = async (selectSql) => {
  try {
    const [result] = await database.query(selectSql);
    return result.length === 0
      ? { isSuccess: false, result: null, message: "No record(s) found." }
      : {
          isSuccess: true,
          result,
          message: "Record(s) successfully recovered.",
        };
  } catch (error) {
    return {
      isSuccess: false,
      result: null,
      message: `Failed to execute query: ${error.message}`,
    };
  }
};

const buildModulesSelectSQL = (id, variant) => {
  let sql = "";
  const table =
    "transactions INNER JOIN users ON transactions.UserID=users.UserID";
  const fields = [
    "TransactionID",
    "Name",
    "Date",
    "Amount",
    "Category",
    "PaymentMethod",
    "CONCAT(FirstName,'',LastName) AS UserName",
  ];

  switch (variant) {
    case "user":
      sql = `SELECT ${fields} FROM ${table} WHERE transactions.UserID = '${id}'`;
      break;
    default:
      sql = `SELECT ${fields} FROM ${table} `;
      if (id) sql += ` WHERE TransactionID = '${id}'`;
  }
  return sql;
};

const getTransactionsController = async (req, res, variant) => {
  const id = req.params.id;
  const sql = buildModulesSelectSQL(id, variant);

  const { isSuccess, result, message } = await read(sql);
  if (!isSuccess) return res.status(404).json({ message });

  res.status(200).json(result);
};

app.get("/api/transactions", (req, res) =>
  getTransactionsController(req, res, null)
);
app.get("/api/:id/transactions", (req, res) =>
  getTransactionsController(req, res, null)
);
app.get("/api/transactions/users/:id", (req, res) =>
  getTransactionsController(req, res, "user")
);

//  Start server ---------------------------
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
