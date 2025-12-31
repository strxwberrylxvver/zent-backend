import express from "express";
import database from "./database.js";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";

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

const read = async (sql, id) => {
  try {
    const [result] = await database.query(sql, {ID:id});
    return result.length === 0
      ? { isSuccess: false, result: null, message: "No record(s) found." }
      : { isSuccess: true, result, message: "Record(s) successfully recovered.", };
  } catch (error) {
    return { isSuccess: false, result: null, message: `Failed to execute query: ${error.message}`,
    };
  }
};

const buildSetFields = (fields) =>
  fields.reduce(
    (setSQL, field, index) =>
      setSQL + `${field}=:${field}` + (index === fields.length - 1 ? "" : ","),
    "SET"
  );

const createTransactions = async (sql, record) => {
  try {
    const status = await database.query(sql, record);
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

const modifyTransactions = async (sql, id, record) => {
  try {
    const status = await database.query(sql, { ...record, TransactionID: id });
    const recoverRecordSql = buildTransactionsSelectSQL(id, null);
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

const deleteTransactions = async (sql, id) => {
  try {
    const status = await database.query(sql, { TransactionID: id });

    return status[0].affectedRows === 0
      ? {
          isSuccess: false,
          result: null,
          message: `Failed to delete record : Record not found.`,
        }
      : {
          isSuccess: true,
          result: null,
          message: "Record successfully removed.",
        };
  } catch (error) {
    return {
      isSuccess: false,
      result: null,
      message: `Failed to execute query: ${error.message}`,
    };
  }
};

const buildTransactionsModifySQL = (record) => {
  const table = "transactions";

  const mutableFields = [
    "Name",
    "Date",
    "Amount",
    "Category",
    "PaymentMethod",
    "UserID",
  ];

  const keys = mutableFields.filter((f) => record[f] !== undefined);
  const setClause = keys.map((f) => `${f} = :${f}`).join(", ");

  return `UPDATE ${table} SET ${setClause} WHERE TransactionID = :TransactionID`;
};

const buildTransactionsInsertSQL = () => {
  const table = "transactions";
  const fields = [
    "TransactionID",
    "Name",
    "Date",
    "Amount",
    "Category",
    "PaymentMethod",
    "UserID",
  ];

  const columns = fields.join(", ");
  const placeholders = fields.map((f) => `:${f}`).join(", ");

  return `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`;
};
const buildTransactionsDeleteSQL = () => {
  return `DELETE FROM transactions WHERE TransactionID = :TransactionID`;
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
    "CONCAT(FirstName,' ',LastName) AS UserName",
  ];

  switch (variant) {
    case "user":
      sql = `SELECT ${fields} FROM ${table} WHERE transactions.UserID = :ID`;
      break;
    default:
      sql = `SELECT ${fields} FROM ${table} `;
      if (id) sql += ` WHERE TransactionID = :ID`;
  }
  return sql;
};

const getTransactionsController = async (req, res, variant) => {
  const id = req.params.id;
  const sql = buildTransactionsSelectSQL(id, variant);
  const { isSuccess, result, message: accessorMessage } = await read(sql, id);
  if (!isSuccess) return res.status(400).json({ message: accessorMessage });

  res.status(200).json(result);
};

const postTransactionsController = async (req, res) => {
  const record = req.body;

  // const record = { TransactionID: id, ...req.body };
  // const transactionId = uuidv4();
  // const record = { TransactionID: transactionId, ...req.body };
  const sql = buildTransactionsInsertSQL();
  const {
    isSuccess,
    result,
    message: accessorMessage,
  } = await createTransactions(sql, record);
  if (!isSuccess) return res.status(404).json({ message: accessorMessage });
  res.status(201).json(result);
};

const putTransactionsController = async (req, res) => {
  const id = req.params.id;
  const record = req.body;

  const sql = buildTransactionsModifySQL(id, record);
  const {
    isSuccess,
    result,
    message: accessorMessage,
  } = await modifyTransactions(sql, id, record);

  if (!isSuccess) return res.status(404).json({ message: accessorMessage });
  res.status(200).json(result);
};

const deleteTransactionsController = async (req, res) => {
  const id = req.params.id;

  const sql = buildTransactionsDeleteSQL();
  const {
    isSuccess,
    result,
    message: accessorMessage,
  } = await deleteTransactions(sql, id);

  if (!isSuccess) return res.status(404).json({ message: accessorMessage });
  res.status(200).json(result);
};

app.get("/api/transactions", (req, res) =>
  getTransactionsController(req, res, null)
);
app.get("/api/transactions/:id", (req, res) =>
  getTransactionsController(req, res, null)
);
app.get("/api/transactions/users/:id", (req, res) =>
  getTransactionsController(req, res, "user")
);

app.post("/api/transactions", postTransactionsController);
app.put("/api/transactions/:id", putTransactionsController);
app.delete("/api/transactions/:id", deleteTransactionsController);

//  Start server ---------------------------
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
