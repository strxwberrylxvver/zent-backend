class Accessor {
  constructor(model, database) {
    this.model = model;
    this.database = database;
  }

  #ok = (result) => ({ isSuccess: true, result, message: "Record(s) successfully recovered." });
  #fail = (message) => ({ isSuccess: false, result: null, message });

  read = async (id, variant) => {
    try {
      const { sql, data } = this.model.buildReadQuery(id, variant);
      const [result] = await this.database.query(sql, data);
      return this.#ok(result);
    } catch (error) {
      return this.#fail(`Failed to execute query: ${error.message}`);
    }
  };

  create = async (record) => {
    try {
      const { sql, data } = this.model.buildCreateQuery(record);
      const [status] = await this.database.query(sql, data);
      const idValue = record[this.model.idField];
      const read = await this.read(idValue, null);
      return read.isSuccess && read.result.length > 0
        ? this.#ok(read.result)
        : this.#fail(`Failed to recover inserted record.`);
    } catch (error) {
      return this.#fail(`Failed to execute query: ${error.message}`);
    }
  };

  update = async (record, id) => {
    try {
      const { sql, data } = this.model.buildUpdateQuery(record, id);
      await this.database.query(sql, data);
      const read = await this.read(id, null);
      return read.isSuccess
        ? this.#ok(read.result)
        : this.#fail(`Failed to recover updated record: ${read.message}`);
    } catch (error) {
      return this.#fail(`Failed to execute query: ${error.message}`);
    }
  };

  delete = async (id) => {
    try {
      const { sql, data } = this.model.buildDeleteQuery(id);
      const [status] = await this.database.query(sql, data);
      return status.affectedRows === 0
        ? this.#fail(`Failed to delete record ${id}`)
        : this.#ok(null);
    } catch (error) {
      return this.#fail(`Failed to execute query: ${error.message}`);
    }
  };
}

export default Accessor;