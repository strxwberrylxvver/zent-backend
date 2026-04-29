import joi from "joi";

class Validator {
  idSchema = joi.string().uuid();

  constructor(schema) {
    this.getSchema = joi.object({
      id: this.idSchema.optional(),
    });

    this.postSchema = schema.recordSchema;

    const mutableSchema = joi
      .object(
        Object.fromEntries(
          schema.mutableFields.map((field) => {
            try {
              return [field, schema.recordSchema.extract(field).optional()];
            } catch {
              return [field, joi.any().optional()];
            }
          })
        )
      )
      .or(...schema.mutableFields)
      .unknown(true);

    this.putSchema = joi.object({
      id: this.idSchema.required(),
      record: mutableSchema,
    });

    this.deleteSchema = joi.object({
      id: this.idSchema.required(),
    });
  }

  #reportErrors = (error) => error.details.map((d) => d.message);

  #validate = (schema, value) => {
    const { error } = schema.validate(value, { abortEarly: false });
    return error
      ? { isValid: false, messages: this.#reportErrors(error) }
      : { isValid: true, messages: null };
  };

  get = (value) => this.#validate(this.getSchema, value);

  post = (value) => this.#validate(this.postSchema, value);

  put = (id, record) => this.#validate(this.putSchema, { id, record });

  delete = (value) => this.#validate(this.deleteSchema, value);

  middleware = (method) => (req, res, next) => {
    let result;

    switch (method) {
      case "get":
        result = this.get({ id: req.params.id });
        break;
      case "post":
        result = this.post(req.body);
        break;
      case "put":
        result = this.put(req.params.id, req.body);
        break;
      case "delete":
        result = this.delete({ id: req.params.id });
        break;
      default:
        return next();
    }

    if (!result.isValid) {
      return res.status(400).json({ messages: result.messages });
    }

    next();
  };
}

export default Validator;
