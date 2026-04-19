const transactionsModel = {
  table: "transactions",
  idField: "TransactionID",
  fields: ["TransactionID", "Name", "Date", "Amount", "Category", "PaymentMethod", "transactions.UserID"],

  buildReadQuery(id, variant) {
    const table = "transactions INNER JOIN users ON transactions.UserID = users.UserID";
    const fields = [
      this.idField,
      ...this.fields,
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
          sql: `SELECT ${fields} FROM ${table}${id ? " WHERE TransactionID = :ID" : ""}`,
          data: { ID: id },
        };
    }
  },
};

export default transactionsModel;