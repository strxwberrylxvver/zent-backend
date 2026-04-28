const XP_PER_LEVEL = 100;
const xpForLevel = (level) => level * XP_PER_LEVEL;

class XPController {
  constructor(accessor) {
    this.accessor = accessor;
  }

  getMyXP = async (req, res) => {
    const { isSuccess, result, message } = await this.accessor.read(req.user.userID, null);
    if (!isSuccess) return res.status(404).json({ message });
    res.status(200).json(result[0]);
  };

  award = async (userID, amount = 10) => {
    const { isSuccess, result } = await this.accessor.read(userID, null);
    
    if (!isSuccess || !result?.length) {
      await this.accessor.create({ UserID: userID, CurrentXP: amount, Level: 1 });
      return;
    }

    const current = result[0];
    let newXP = current.CurrentXP + amount;
    let newLevel = current.Level;

    while (newXP >= xpForLevel(newLevel + 1)) {
      newLevel++;
    }

    await this.accessor.update(
      { CurrentXP: newXP, Level: newLevel },
      userID
    );
  };

  awardRoute = async (req, res) => {
    const { amount = 10 } = req.body;
    await this.award(req.user.userID, amount);
    const { result } = await this.accessor.read(req.user.userID, null);
    res.status(200).json(result[0]);
  };
}

export default XPController;