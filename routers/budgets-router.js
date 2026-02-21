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

const createBudgets = async (createQuery) => {
  try {
    const status = await database.query(createQuery.sql, createQuery.data);
    const readQuery = buildBudgetsReadQuery(status[0].insertId, null);
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

const updateBudgets = async (updateQuery) => {
  try {
    const status = await database.query(updateQuery.sql, updateQuery.data);
    const readQuery = buildBudgetsReadQuery(updateQuery.data.BudgetID, null);
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

const deleteBudgets = async (deleteQuery) => {
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

const buildBudgetsReadQuery = (id, variant) => {
  let sql = "";
  let table = "budgets INNER JOIN users ON budgets.UserID=users.UserID";
  let fields = [
    "BudgetID",
    "BudgetName",
    "UsedAmount",
    "TotalAmount",
    "BudgetDate",
    "CONCAT(FirstName,' ',LastName) AS UserName",
  ];

  switch (variant) {
    case "user":
      sql = `SELECT ${fields.join(
        ","
      )} FROM ${table} WHERE budgets.UserID = :ID`;
      break;
    default:
      sql = `SELECT ${fields.join(",")} FROM ${table} `;
      if (id) sql += ` WHERE BudgetID = :ID`;
  }
  return { sql, data: { ID: id } };
};

const buildBudgetsCreateQuery = (record) => {
  const table = "budgets";
  const fields = [
    "BudgetID",
    "BudgetName",
    "UsedAmount",
    "TotalAmount",
    "BudgetDate",
    "UserID",
    "CategoryID",
  ];

  const columns = fields.join(", ");
  const placeholders = fields.map((f) => `:${f}`).join(", ");
  const sql = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`;
  return { sql, data: formatRecordForDatabase(record) };
};

const buildBudgetsUpdateQuery = (record, id) => {
  const table = "budgets";

  const mutableFields = [
    "BudgetName",
    "UsedAmount",
    "TotalAmount",
    "BudgetDate",
    "UserID",
    "CategoryID",
  ];
  const formattedRecord = formatRecordForDatabase(record);
  const keys = mutableFields.filter((f) => record[f] !== undefined);
  const setClause = keys.map((f) => `${f} = :${f}`).join(", ");
  const sql = `UPDATE ${table} SET ${setClause} WHERE BudgetID = :BudgetID`;
  return { sql, data: { ...formattedRecord, BudgetID: id } };
};

const buildBudgetsDeleteQuery = (id) => {
  const sql = `DELETE FROM budgets WHERE BudgetID = :BudgetID`;
  return { sql, data: { BudgetID: id } };
};

const getBudgetsController = async (req, res, variant) => {
  const id = req.params.id;
  const query = buildBudgetsReadQuery(id, variant);
  const { isSuccess, result, message: accessorMessage } = await read(query);
  if (!isSuccess) return res.status(400).json({ message: accessorMessage });

  res.status(200).json(result);
};

const postBudgetsController = async (req, res) => {
  const record = req.body;
  record.BudgetID = uuidv4();
  const query = buildBudgetsCreateQuery(record);
  const {
    isSuccess,
    result,
    message: accessorMessage,
  } = await createBudgets(query);
  if (!isSuccess) return res.status(404).json({ message: accessorMessage });
  res.status(201).json(result);
};

const putBudgetsController = async (req, res) => {
  const id = req.params.id;
  const record = req.body;

  const query = buildBudgetsUpdateQuery(record, id);
  const {
    isSuccess,
    result,
    message: accessorMessage,
  } = await updateBudgets(query);

  if (!isSuccess) return res.status(404).json({ message: accessorMessage });
  res.status(200).json(result);
};

const deleteBudgetsController = async (req, res) => {
  const id = req.params.id;

  const query = buildBudgetsDeleteQuery(id);
  const {
    isSuccess,
    result,
    message: accessorMessage,
  } = await deleteBudgets(query);

  if (!isSuccess) return res.status(404).json({ message: accessorMessage });
  res.status(200).json(result);
};

router.get("/users/:id", (req, res) => getBudgetsController(req, res, "user"));
router.get("/:id", (req, res) => getBudgetsController(req, res, null));
router.get("/", (req, res) => getBudgetsController(req, res, null));

router.post("/", postBudgetsController);
router.put("/:id", putBudgetsController);
router.delete("/:id", deleteBudgetsController);

export default router;
