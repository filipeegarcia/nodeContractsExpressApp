const { sequelize } = require("../model");
const Sequelize = require("sequelize");
const { Op } = require("sequelize");

/**
 * Get all unpaid jobs for a user (either a client or contractor), for active contracts only.
 */
 exports.getAllUserUnpaidJobs = async (req, res) => {
  const { Job } = req.app.get("models");
  const { Contract } = req.app.get("models");
  const { profile } = req;
  const job = await Job.findAll({
    include: {
      model: Contract,
      where: {
        [Op.or]: [{ ClientId: profile.id }, { ContractorId: profile.id }],
      },
    },
    where: {
      paid: { [Op.or]: [{ [Op.eq]: null }, { [Op.eq]: false }] },
    },
  });
  res.json(job);
};

/**
 *Pay for a job, a client can only pay if his balance >= the amount to pay. The amount should be moved from the client's balance to the contractor balance.
 */
exports.payJobById = async (req, res) => {
  const { Job } = req.app.get("models");
  const { Profile } = req.app.get("models");
  const { Contract } = req.app.get("models");
  const { jobId } = req.params;
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

  const job = await Job.findOne(
    {
      include: {
        model: Contract,
        where: {
          ClientId: profile.id,
        },
      },
      where: {
        [Op.and]: [
          { id: jobId },
          { paid: { [Op.or]: [{ [Op.eq]: null }, { [Op.eq]: false }] } },
        ],
      },
    },
    { transaction: transaction }
  );
  if (job === null) {
    await transaction.rollback();
    return res.status(404).end();
  }
  const contractorProfile = await Profile.findOne(
    { where: { id: job.Contract.ContractorId } },
    { transaction: transaction }
  );

  if (job.price > clientProfile.balance) {
    await transaction.rollback();
    return res
      .status(406)
      .send("You need to deposit more funds to your balance to pay this job.");
  }
  await clientProfile.update(
    { balance: clientProfile.balance - job.price },
    { transaction: transaction }
  );
  await contractorProfile.update(
    { balance: contractorProfile.balance + job.price },
    { transaction: transaction }
  );
  await job.update({ paid: true }, { transaction: transaction });
  await transaction.commit();
  return res.status(204).end();
};