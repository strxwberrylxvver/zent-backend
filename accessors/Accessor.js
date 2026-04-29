class Accessor {
  constructor(model, database) {
    this.model = model;
    this.database = database;
  }

  #ok   = (result)  => ({ isSuccess: true,  result, message: "Record(s) successfully recovered." });
  #fail = (message) => ({ isSuccess: false, result: null, message });

  read = async (id, variant, filters = {}) => {
    try {
      const { sql, data } = this.model.buildReadQuery(id, variant, filters);
      const [result] = await this.database.query(sql, data);
      return this.#ok(result);
    } catch (error) {
      return this.#fail(`Failed to execute query: ${error.message}`);
    }
  };

  create = async (record) => {
    try {
      const { sql, data } = this.model.buildCreateQuery(record);
      console.log("CREATE SQL:", sql);
      console.log("CREATE DATA:", JSON.stringify(data, null, 2));
      const [insertResult] = await this.database.query(sql, data);
      console.log("INSERT RESULT:", insertResult);
      const idValue = record[this.model.idField];
      console.log("READING BACK WITH ID:", idValue);
      const read = await this.read(idValue, null);
      console.log("READ BACK:", JSON.stringify(read, null, 2));
      return read.isSuccess
        ? this.#ok(read.result)
        : this.#fail("Failed to recover inserted record.");
    } catch (error) {
      console.log("CREATE ERROR:", error.message);
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