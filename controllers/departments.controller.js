const db = require("../db/knex");

exports.list = async (req, res, next) => {
  try {
    const { store_id } = req.query;

    let q = db("departments as d")
      .select("d.id", "d.store_id", "d.name")
      .orderBy("d.name", "asc");

    if (store_id) q = q.where("d.store_id", store_id);

    const rows = await q;
    res.json(rows);
  } catch (err) {
    next(err);
  }
};