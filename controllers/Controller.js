import { v4 as uuidv4 } from "uuid";

class Controller {
  constructor(accessor, xpController = null) {
    this.accessor = accessor;
    this.xpController = xpController;
  }

  get = async (req, res, variant, overrideId) => {
    const id = overrideId ?? req.params.id;
    const { isSuccess, result, message } = await this.accessor.read(id, variant);
    if (!isSuccess) return res.status(404).json({ message });
    res.status(200).json(result);
  };

  post = async (req, res) => {
    const record = { ...req.body };
    const idField = this.accessor.model.idField;
    if (idField) record[idField] = uuidv4();

    const { isSuccess, result, message } = await this.accessor.create(record);
    if (!isSuccess) return res.status(500).json({ message });

    if (this.xpController && req.user?.userID) {
      await this.xpController.award(req.user.userID, 10).catch(() => {});
    }

    res.status(201).json(result);
  };

  put = async (req, res) => {
    const { id } = req.params;
    const { isSuccess, result, message } = await this.accessor.update(req.body, id);
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