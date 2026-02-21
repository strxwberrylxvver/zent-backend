const model = {};

model.table = "transactions";
model.fields = [
  "TransactionID",
  "Name",
  "Date",
  "Amount",
  "Category",
  "PaymentMethod",
  "transactions.UserID",
];
model.idField = "TransactionID";

model.buildReadQuery = (id, variant) => {
  const resolvedTable =
    "transactions INNER JOIN users ON transactions.UserID=users.UserID";
  const resolvedfields = [
    model.idField,
    ...model.fields,
    "CONCAT(FirstName,' ',LastName) AS UserName",
  ];
  let sql = "";

  switch (variant) {
    case "user":
      sql = `SELECT ${resolvedfields.join(
        ","
      )} FROM ${resolvedTable} WHERE transactions.UserID = :ID`;
      break;
    default:
      sql = `SELECT ${resolvedfields.join(",")} FROM ${resolvedTable} `;
      if (id) sql += ` WHERE TransactionID = :ID`;
  }
  return { sql, data: { ID: id } };
};

export default model;
