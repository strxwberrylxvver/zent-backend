class Model {
  constructor({ table, fields, idField, buildReadQuery, schema }) {
    this.table = table;
    this.fields = fields;
    this.idField = idField;
    this.buildReadQuery = buildReadQuery;
    this.mutableFields = schema?.mutableFields ?? null;
  }

  #skipParse = ["UserID", "BudgetID", "TransactionID", "GoalID", "CategoryID", "LinkID", "PasswordHash"];

  #formatRecord = (record) => {
    const formatted = { ...record };
    if (formatted.Date) {
      formatted.Date = new Date(formatted.Date).toISOString().split("T")[0];
    }
    for (const [key, value] of Object.entries(formatted)) {
      if (
        typeof value === "string" &&
        value !== "" &&
        !isNaN(Number(value)) &&
        !this.#skipParse.includes(key)
      ) {
        formatted[key] = Number(value);
      }
    }
    return formatted;
  };

  #buildSetClause = (fields) =>
    "SET " + fields.map((f) => `${f}=:${f}`).join(", ");

  buildCreateQuery = (record) => ({
    sql: `INSERT INTO ${this.table} ${this.#buildSetClause(Object.keys(record))}`,
    data: this.#formatRecord(record),
  });

  buildUpdateQuery = (record, id) => ({
    sql: `UPDATE ${this.table} ${this.#buildSetClause(Object.keys(record))} WHERE ${this.idField}=:${this.idField}`,
    data: { ...this.#formatRecord(record), [this.idField]: id },
  });

  buildDeleteQuery = (id) => ({
    sql: `DELETE FROM ${this.table} WHERE ${this.idField}=:${this.idField}`,
    data: { [this.idField]: id },
  });
}

export default Model;