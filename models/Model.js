class Model {
  constructor({ table, fields, idField, buildReadQuery }) {
    this.table = table;
    this.fields = fields;
    this.idField = idField;
    this.buildReadQuery = buildReadQuery;
  }

  #formatRecord = (record) => {
    if (!record.Date) return { ...record };
    return { ...record, Date: new Date(record.Date).toISOString().split("T")[0] };
  };

  #buildSetClause = (fields) =>
    "SET " + fields.map((f) => `${f}=:${f}`).join(", ");

  buildCreateQuery = (record) => ({
    sql: `INSERT INTO ${this.table} ${this.#buildSetClause(this.fields)}`,
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