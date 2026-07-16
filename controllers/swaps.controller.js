const db = require("../db/knex");

exports.list = async (req, res, next) => {
  try {
    const { store_id, status = "pending" } = req.query;
    const role = req.user.role_code;
    const userId = req.user.sub;

    let q = db("shift_swap_requests as r")
      .select(
        "r.id",
        "r.requester_id",
        "r.shift_id",
        "r.status",
        "r.notes",
        "r.created_at",
        "u.first_name",
        "u.last_name",
        "s.shift_date",
        "s.start_time",
        "s.end_time",
        "s.department_id"
      )
      .join("users as u", "u.id", "r.requester_id")
      .join("shifts as s", "s.id", "r.shift_id")
      .orderBy("r.created_at", "desc");

    if (status) q = q.where("r.status", status);
    if (role === "ASSOCIATE") {
      q = q.andWhere("r.requester_id", req.user.sub);
    } else {
      if (!store_id) return res.status(400).json({ message: "store_id is required" });
      q = q.where("s.store_id", store_id);
    }

    const rows = await q;
    res.json(rows);
  } catch (err) {
    next(err);
  }
};