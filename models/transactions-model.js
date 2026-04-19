const transactionsModel = {
  table: "transactions",
  idField: "TransactionID",

  // No table prefix here — these are used in INSERT/UPDATE SET clauses
  fields: ["TransactionID", "Name", "Date", "Amount", "Category", "PaymentMethod", "UserID"],

  buildReadQuery(id, variant) {
    const table = "transactions INNER JOIN users ON transactions.UserID = users.UserID";
    const fields = [
      "transactions.TransactionID",
      "transactions.Name",
      "transactions.Date",
      "transactions.Amount",
      "transactions.Category",
      "transactions.PaymentMethod",
      "transactions.UserID",
      "CONCAT(FirstName,' ',LastName) AS UserName",
    ].join(", ");

    switch (variant) {
      case "user":
        return {
          sql: `SELECT ${fields} FROM ${table} WHERE transactions.UserID = :ID`,
          data: { ID: id },
        };
      default:
        return {
          sql: `SELECT ${fields} FROM ${table}${id ? " WHERE transactions.TransactionID = :ID" : ""}`,
          data: { ID: id },
        };
    }
  },
};

export default transactionsModel;