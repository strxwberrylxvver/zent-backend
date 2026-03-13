class Model {
  constructor(model) {
    this.table = model.table;
    this.fields = model.fields;
    this.idField = model.idField;
    this.buildReadQuery = model.buildReadQuery;
  }

  formatRecordForDatabase = (record) => {
    const formattedRecord = { ...record };
    if (formattedRecord.Date) {
      formattedRecord.Date = new Date(formattedRecord.Date)
        .toISOString()
        .split("T")[0];
    }

    return formattedRecord;
  };

  buildSetFields = (fields) =>
    fields.reduce(
      (setSQL, field, index) =>
        setSQL +
        `${field} =:${field}` +
        (index === fields.length - 1 ? "" : ", "),
      "SET "
    );
  buildCreateQuery = (record) => {
    const sql = `INSERT INTO ${this.table}` + this.buildSetFields(this.fields);
    return { sql, data: this.formatRecordForDatabase(record) };
  };

  buildUpdateQuery = (record, id) => {
    const sql =
      `UPDATE ${this.table}` +
      this.buildSetFields(this.fields) +
      `WHERE ${this.idField}=:${this.idField}`;
    return {
      sql,
      data: { ...this.formatRecordForDatabase(record), [this.idField]: id },
    };
  };

  buildDeleteQuery = (id) => {
    const sql = `DELETE FROM ${this.table} WHERE ${this.idField}=:${this.idField}`;
    return { sql, data: { [this.idField]: id } };
  };
}
export default Model;
