const { sequelize } = require("../model");
const Sequelize = require("sequelize");
const { Op } = require("sequelize");

/**
 *Deposits money into the the the balance of a client, a client can't deposit more than 25% his total of jobs to pay. (at the deposit moment)
 */
exports.depositBalance = async (req, res) => {
  const { Job } = req.app.get("models");
  const { Profile } = req.app.get("models");
  const { Contract } = req.app.get("models");
  const { amount } = req.params;
  const { profile } = req;
  const transaction = await sequelize.transaction({
    isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE,
    lock: Sequelize.Transaction.LOCK.UPDATE,
    types: Sequelize.Transaction.TYPES.IMMEDIATE,
  });
  const clientProfile = await Profile.findOne(
    { where: { id: profile.id } },
    { transaction: transaction }
  );

  if (clientProfile.type === "contractor") {
    await transaction.rollback();
    return res.status(401).end();
  }
  const job = await Job.sum("price", {
    include: {
      model: Contract,
      where: {
        ClientId: profile.id,
      },
    },
    where: {
      paid: { [Op.or]: [{ [Op.eq]: null }, { [Op.eq]: false }] },
    },
  });

  if (job === null) {
    await transaction.rollback();
    return res.status(404).end();
  }

  if (parseInt(job) / 4 < parseInt(amount)) {
    await transaction.rollback();
    return res.status(401).send("Cannot deposit more than 25% of jobs to pay");
  }

  await clientProfile.update(
    { balance: clientProfile.balance + parseInt(amount) },
    { transaction: transaction }
  );
  await transaction.commit();
  return res.status(204).end();
};