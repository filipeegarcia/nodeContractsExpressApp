const { Op } = require("sequelize");
const { sequelize } = require("../model");

/**
 * Returns the clients the paid the most for jobs in the query time period. limit query parameter should be applied, default limit is 2.
 */
exports.getBestClients = async (req, res) => {
  const { Job } = req.app.get("models");
  const { Profile } = req.app.get("models");
  const { Contract } = req.app.get("models");

  let start;
  let end;
  const limit = 2;

  if (req.query["start"]) start = Date.parse(req.query.start);
  else start = Date.parse("01 Jan 1970 00:00:00 GMT");
  if (req.query["end"]) end = Date.parse(req.query.end);
  else end = Date.now();
  if (req.query["limit"]) limit = parseInt(req.query.limit);

  if (typeof start != "number")
    return res.status(500).send("Invalid input for start date.");
  if (typeof end != "number")
    return res.status(500).send("Invalid input for end date.");
  if (limit <= 0) return res.status(500).send("Invalid input for limit");

  const job = await Job.findAll({
    include: {
      model: Contract,
      attributes: [],
      include: {
        model: Profile,
        as: "Client",
        attributes: ["id", "firstName"],
      },
    },
    where: {
      paid: true,
      paymentDate: { [Op.gte]: start },
      paymentDate: { [Op.lte]: end },
    },
    attributes: [
      [literal('"Contract->Client"."id"'), "id"],
      [
        literal(
          '"Contract->Client"."firstname" || " " || "Contract->Client"."lastname"'
        ),
        "fullName",
      ],
      [sequelize.fn("sum", sequelize.col("price")), "paid"],
    ],
    group: ["Contract.Client.id"],
    order: sequelize.literal("paid DESC"),
    limit: limit,
  });
  res.json(job);
}

/**
 * Returns the profession that earned the most money (sum of jobs paid) for any contactor that worked in the query time range.
 */
exports.getBestProfession = async (req, res) => {
  const { Job } = req.app.get("models");
  const { Profile } = req.app.get("models");
  const { Contract } = req.app.get("models");
  let start;
  let end;

  if (req.query["start"]) start = Date.parse(req.query.start);
  else start = Date.parse("01 Jan 1970 00:00:00 GMT");
  if (req.query["end"]) end = Date.parse(req.query.end);
  else end = Date.now();

  if (typeof start != "number")
    return res.status(500).send("Invalid input for start date.");
  if (typeof end != "number")
    return res.status(500).send("Invalid input for end date");

  const job = await Job.findOne({
    include: {
      model: Contract,
      attributes: [],
      include: {
        model: Profile,
        as: "Contractor",
        attributes: ["profession"],
      },
    },
    where: {
      paid: true,
      paymentDate: { [Op.gte]: start },
      paymentDate: { [Op.lte]: end },
    },
    attributes: [
      [literal('"Contract->Contractor"."profession"'), "profession"],
      [sequelize.fn("sum", sequelize.col("price")), "total_amount"],
    ],
    group: ["Contract.Contractor.profession"],
    order: sequelize.literal("total_amount DESC"),
  });
  res.json(job);
}