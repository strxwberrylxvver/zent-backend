import { transactionsSchema as schema } from "../schemas.js";

const transactionsModel = {
  schema,
  table: "transactions",
  idField: "TransactionID",
  fields: [
    "TransactionID",
    "Name",
    "Date",
    "Amount",
    "Category",
    "PaymentMethod",
    "UserID",
  ],

  buildReadQuery(id, variant, filters = {}) {
    const table =
      "transactions INNER JOIN users ON transactions.UserID = users.UserID";
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

    if (!variant && id) {
      return {
        sql: `SELECT ${fields} FROM ${table} WHERE transactions.TransactionID = :ID`,
        data: { ID: id },
      };
    }

    if (variant === "user") {
      const conditions = ["transactions.UserID = :ID"];
      const data = { ID: id };

      if (filters.month) {
        conditions.push("DATE_FORMAT(transactions.Date, '%Y-%m') = :month");
        data.month = filters.month;
      }
      if (filters.category) {
        conditions.push("transactions.Category = :category");
        data.category = filters.category;
      }
      if (filters.type === "income") conditions.push("transactions.Amount > 0");
      if (filters.type === "expense")
        conditions.push("transactions.Amount < 0");
      if (filters.search) {
        conditions.push("transactions.Name LIKE :search");
        data.search = `%${filters.search}%`;
      }

      const sortField =
        {
          date: "transactions.Date",
          amount: "transactions.Amount",
          name: "transactions.Name",
          category: "transactions.Category",
        }[filters.sort] ?? "transactions.Date";
      const order = filters.order === "asc" ? "ASC" : "DESC";

      return {
        sql: `SELECT ${fields} FROM ${table} WHERE ${conditions.join(
          " AND "
        )} ORDER BY ${sortField} ${order}`,
        data,
      };
    }

    return { sql: `SELECT ${fields} FROM ${table}`, data: {} };
  },
};

export default transactionsModel;
