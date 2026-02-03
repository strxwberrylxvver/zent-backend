import { Router } from "express";
import database from "../database.js";
import { v4 as uuidv4 } from "uuid";

const router = Router();

const formatRecordForDatabase = (record) => {
  const formattedRecord = { ...record };
  if (formattedRecord.Date) {
    formattedRecord.Date = new Date(formattedRecord.Date)
      .toISOString()
      .split("T")[0];
  }

  return formattedRecord;
};

const read = async (id, variant) => {
  try {
    const { sql, data } = buildTransactionsReadQuery(id, variant);
    const [result] = await database.query(sql, data);
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

const create = async (createQuery) => {
  try {
    const { sql, data } = buildTransactionsCreateQuery(record);
    const status = await database.query(sql, data);
    const { isSuccess, result, message } = await read(status[0].insertId, null);

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

const update = async (record, id) => {
  try {
    const { sql, data } = buildTransactionsUpdateQuery(record, id);
    const status = await database.query(sql, data);

    const { isSuccess, result, message } = await read(id, null);

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

const delet3 = async (id) => {
  try {
    const {sql, data} = buildTransactionsDeleteQuery(id);
    const status = await database.query(sql, data);

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
      sql = `SELECT ${fields.join(
        ","
      )} FROM ${table} WHERE transactions.UserID = :ID`;
      break;
    default:
      sql = `SELECT ${fields.join(",")} FROM ${table} `;
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
  return { sql, data: formatRecordForDatabase(record) };
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
  const formattedRecord = formatRecordForDatabase(record);
  const keys = mutableFields.filter((f) => record[f] !== undefined);
  const setClause = keys.map((f) => `${f} = :${f}`).join(", ");
  const sql = `UPDATE ${table} SET ${setClause} WHERE TransactionID = :TransactionID`;
  return { sql, data: { ...formattedRecord, TransactionID: id } };
};

const buildTransactionsDeleteQuery = (id) => {
  const sql = `DELETE FROM transactions WHERE TransactionID = :TransactionID`;
  return { sql, data: { TransactionID: id } };
};

const getTransactionsController = async (req, res, variant) => {
  const id = req.params.id;
  const { isSuccess, result, message: accessorMessage } = await read(query);
  if (!isSuccess) return res.status(400).json({ message: accessorMessage });

  res.status(200).json(result);
};

const postTransactionsController = async (req, res) => {
  const record = req.body;
  record.TransactionID = uuidv4();
  const { isSuccess, result, message: accessorMessage } = await create(record);
  if (!isSuccess) return res.status(404).json({ message: accessorMessage });
  res.status(201).json(result);
};

const putTransactionsController = async (req, res) => {
  const id = req.params.id;
  const record = req.body;
  const {
    isSuccess,
    result,
    message: accessorMessage,
  } = await update(record, id);

  if (!isSuccess) return res.status(404).json({ message: accessorMessage });
  res.status(200).json(result);
};

const deleteTransactionsController = async (req, res) => {
  const id = req.params.id;
  const {
    isSuccess,
    result,
    message: accessorMessage,
  } = await delet3(id);

  if (!isSuccess) return res.status(404).json({ message: accessorMessage });
  res.status(200).json(result);
};

router.get("/users/:id", (req, res) =>
  getTransactionsController(req, res, "user")
);
router.get("/:id", (req, res) => getTransactionsController(req, res, null));
router.get("/", (req, res) => getTransactionsController(req, res, null));

router.post("/", postTransactionsController);
router.put("/:id", putTransactionsController);
router.delete("/:id", deleteTransactionsController);

export default router;
