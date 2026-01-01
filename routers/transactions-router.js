import { Router } from "express";
import database from "../database.js";

const router = Router();

const read = async (query) => {
  try {
    const [result] = await database.query(query.sql, query.data);
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

const buildSetFields = (fields) =>
  fields.reduce(
    (setSQL, field, index) =>
      setSQL + `${field}=:${field}` + (index === fields.length - 1 ? "" : ","),
    "SET"
  );

const createTransactions = async (createQuery) => {
  try {
    const status = await database.query(createQuery.sql, createQuery.data);
    const readQuery = buildTransactionsReadQuery(status[0].insertId, null);
    const { isSuccess, result, message } = await read(readQuery);

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

const updateTransactions = async (updateQuery) => {
  try {
    const status = await database.query(updateQuery.sql, updateQuery.data);
    const readQuery = buildTransactionsReadQuery(
      updateQuery.data.TransactionID,
      null
    );
    const { isSuccess, result, message } = await read(readQuery);

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

const deleteTransactions = async (deleteQuery) => {
  try {
    const status = await database.query(deleteQuery.sql, deleteQuery.data);

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

const buildTransactionsReadQuery = (id, variant) => {
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
  return { sql, data: { ID: id } };
};

const buildTransactionsCreateQuery = (record) => {
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
  const sql = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`;
  return { sql, data: record };
};

const buildTransactionsUpdateQuery = (record, id) => {
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
  const sql = `UPDATE ${table} SET ${setClause} WHERE TransactionID = :TransactionID`;
  return { sql, data: { ...record, TransactionID: id } };
};

const buildTransactionsDeleteQuery = (id) => {
  const sql = `DELETE FROM transactions WHERE TransactionID = :TransactionID`;
  return { sql, data: { TransactionID: id } };
};

const getTransactionsController = async (req, res, variant) => {
  const id = req.params.id;
  const query = buildTransactionsReadQuery(id, variant);
  const { isSuccess, result, message: accessorMessage } = await read(query);
  if (!isSuccess) return res.status(400).json({ message: accessorMessage });

  res.status(200).json(result);
};

const postTransactionsController = async (req, res) => {
  const record = req.body;
  const query = buildTransactionsCreateQuery(record);
  const {
    isSuccess,
    result,
    message: accessorMessage,
  } = await createTransactions(query);
  if (!isSuccess) return res.status(404).json({ message: accessorMessage });
  res.status(201).json(result);
};

const putTransactionsController = async (req, res) => {
  const id = req.params.id;
  const record = req.body;

  const query = buildTransactionsUpdateQuery(record, id);
  const {
    isSuccess,
    result,
    message: accessorMessage,
  } = await updateTransactions(query);

  if (!isSuccess) return res.status(404).json({ message: accessorMessage });
  res.status(200).json(result);
};

const deleteTransactionsController = async (req, res) => {
  const id = req.params.id;

  const query = buildTransactionsDeleteQuery(id);
  const {
    isSuccess,
    result,
    message: accessorMessage,
  } = await deleteTransactions(query);

  if (!isSuccess) return res.status(404).json({ message: accessorMessage });
  res.status(200).json(result);
};

router.get("/", (req, res) => getTransactionsController(req, res, null));
router.get("/:id", (req, res) => getTransactionsController(req, res, null));
router.get("/users/:id", (req, res) =>
  getTransactionsController(req, res, "user")
);

router.post("/", postTransactionsController);
router.put("/:id", putTransactionsController);
router.delete("/:id", deleteTransactionsController);

export default Router;
