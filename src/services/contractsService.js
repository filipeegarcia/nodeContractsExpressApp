const { Op } = require('sequelize');

/**
 * Returns a list of contracts belonging to a user (client or contractor), the list should only contain non terminated contracts.
 */
 exports.getUserContracts = async (req, res) => {
  const { Contract } = req.app.get('models');
  const profile = req.profile;
  const contract = await Contract.findAll({
    where: {
      status: { [Op.ne]: 'terminated' },
      [Op.or]: [
        { ContractorId: profile.id },
        { ClientId: profile.id },
      ],
    },
  });
  if (contract === null) return res.status(404).end();
  res.json(contract);
}

/**
 * Returns the contract received on the Id, if it belongs to the profile calling.
 */
 exports.getUserContractById = async (req, res) => {
  const { Contract } = req.app.get('models');
  const { profile } = req;
  const { id } = req.params;
  const contract = await Contract.findOne({
    where: {
      id,
      [Op.or]: [
        { ContractorId: profile.id },
        { ClientId: profile.id },
      ],
    },
  });
  if (contract === null) return res.status(404).end();
  res.json(contract);
}