//  Imports --------------------------------
import express from "express";
import database from "./database.js";

//  Configure express app ------------------
const app = new express();

//  Configure middleware -------------------

//  Controllers ----------------------------

const transactionsController = async (req, res) => {
  const id = req.params.id;
  //BUILD SQL
  const table = "transactions";
  const idField = "TransactionID";
  const fields = [
    "TransactionID",
    "Name",
    "Date",
    "Amount",
    "Category",
    "PaymentMethod",
  ];
  const extendedTable = `${table} INNER JOIN users ON transactions.UserID=users.UserID`;
  const extendedFields = `${fields}, CONCAT(FirstName," ",LastName) AS UserName`;
  let sql = `SELECT ${extendedFields} FROM ${extendedTable}`;
  if (id) sql += ` WHERE ${idField} = '${id}'`;

  // Execute query
  let isSuccess = false;
  let message = "";
  let result = null;
  try {
    [result] = await database.query(sql);
    if (result.length === 0) message = "No record(s) found.";
    else {
      isSuccess = true;
      message = "Record(s) successfully recovered.";
    }
  } catch (error) {
    message = `Failed to execute query: ${error.message}`;
  }
  // Responses

  isSuccess ? res.status(200).json(result) : res.status(400).json({ message });
};



const transactionsOfStudentController = async (req, res) => {
    const id = req.params.id;
    //BUILD SQL
  
    const table = "transactions";
    const whereField = "transactions.UserID";
    const fields = [
      "TransactionID",
      "Name",
      "Date",
      "Amount",
      "Category",
      "PaymentMethod",
    ];
    const extendedTable = `${table} INNER JOIN users ON transactions.UserID=users.UserID`;
    const extendedFields = `${fields}, CONCAT(FirstName," ",LastName) AS UserName`;
    const sql = `SELECT ${extendedFields} FROM ${extendedTable} WHERE ${whereField} = '${id}'`;
  
    // Execute query
    let isSuccess = false;
    let message = "";
    let result = null;
    try {
      [result] = await database.query(sql);
      if (result.length === 0) message = "No record(s) found.";
      else {
        isSuccess = true;
        message = "Record(s) successfully recovered.";
      }
    } catch (error) {
      message = `Failed to execute query: ${error.message}`;
    }
    // Responses

    isSuccess ? res.status(200).json(result) : res.status(400).json({ message });
  };
  

//  Endpoints ------------------------------
app.get("/api/transactions", transactionsController);
app.get("/api/transactions/:id", transactionsController);
app.get("/api/users/:id/transactions", transactionsOfStudentController);

//  Start server ---------------------------
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
