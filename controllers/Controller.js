import { v4 as uuidv4 } from "uuid";

class Controller {
  constructor(accessor, xpController = null) {
    this.accessor = accessor;
    this.xpController = xpController;
  }

  get = async (req, res, variant, overrideId) => {
    const id = overrideId ?? req.params.id;
    const filters = variant
      ? {
          month:    req.query.month    ?? null,
          category: req.query.category ?? null,
          type:     req.query.type     ?? null,
          search:   req.query.search   ?? null,
          sort:     req.query.sort     ?? "date",
          order:    req.query.order    ?? "desc",
        }
      : {};

    const { isSuccess, result, message } = await this.accessor.read(id, variant, filters);
    if (!isSuccess) return res.status(500).json({ message });
    if (id && !variant && result.length === 0)
      return res.status(404).json({ message: "Record not found." });
    res.status(200).json(result);
  };

  post = async (req, res) => {
    const record = { ...req.body };
    const idField = this.accessor.model.idField;
    if (idField) record[idField] = uuidv4();
    record.UserID = req.user.userID;

    const { isSuccess, result, message } = await this.accessor.create(record);
    if (!isSuccess) return res.status(500).json({ message });

    if (this.xpController && req.user?.userID) {
      await this.xpController.award(req.user.userID, 10).catch(() => {});
    }

    res.status(201).json(result);
  };

  put = async (req, res) => {
    const { id } = req.params;
    const mutableFields = this.accessor.model.mutableFields;
    const record = mutableFields
      ? Object.fromEntries(
          mutableFields
            .map((f) => [f, req.body[f]])
            .filter(([, v]) => v !== undefined)
        )
      : req.body;

    const { isSuccess, result, message } = await this.accessor.update(record, id);
    if (!isSuccess) return res.status(404).json({ message });
    res.status(200).json(result);
  };

  delete = async (req, res) => {
    const { id } = req.params;
    const { isSuccess, result, message } = await this.accessor.delete(id);
    if (!isSuccess) return res.status(404).json({ message });
    res.status(200).json(result);
  };
}

export default Controller;