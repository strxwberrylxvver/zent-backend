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
app.use(express.urlencoded({ extended: true }));

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

const create = async (sql) => {
  try {
    const status = await database.query(sql);
    const recoverRecordSql = buildTransactionsSelectSQL(
      status[0].insertId,
      null
    );
    const { isSuccess, result, message } = await read(recoverRecordSql);

    return isSuccess
      ? { isSuccess: true, result, message: "Record successfully recovered." }
      : {
          isSuccess: false,
          result: null,
          message: `Failed to recover inserted record : ${message}`,
        };
  } catch (error) {
    return {
      isSuccess: false,
      result: null,
      message: `Failed to execute query: ${error.message}`,
    };
  }
};

const buildTransactionsInsertSQL = (record) => {
  let table = "transactions";
  let mutablefields = ["Name", "Date", "Amount", "Category", "PaymentMethod"];
  return `INSERT INTO ${table} SET 
  Name="${record["Name"]}",
  Date="${record["Date"]}",
  Amount=${record["Amount"]},
  Category="${record["Category"]}",
  PaymentMethod="${record["PaymentMethod"]}"`;
};

const buildTransactionsSelectSQL = (id, variant) => {
  let sql = "";
  let table =
    "transactions INNER JOIN users ON transactions.UserID=users.UserID";
  let fields = [
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

const getTransactionsController = async (res, id, variant) => {
  const sql = buildTransactionsSelectSQL(id, variant);
  const { isSuccess, result, message: accessorMessage } = await read(sql);
  if (!isSuccess) return res.status(400).json({ message: accessorMessage });

  res.status(200).json(result);
};

const postTransactionsController = async (req, res) => {
  const sql = buildTransactionsInsertSQL(req.body);
  const { isSuccess, result, message: accessorMessage } = await create(sql);
  if (!isSuccess) return res.status(404).json({ message: accessorMessage });

  res.status(201).json(result);
};

app.get("/api/transactions", (req, res) =>
  getTransactionsController(res, null, null)
);
app.get("/api/transactions/:id", (req, res) =>
  getTransactionsController(res, req.params.id, null)
);
app.get("/api/transactions/users/:id", (req, res) =>
  getTransactionsController(res, req.params.id, "user")
);

app.post("/api/transactions", postTransactionsController);

//  Start server ---------------------------
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
