const db = require("../db/knex");

exports.getWeek = async (req, res, next) => {
    try {
        const { store_id, start_date, end_date, department_id } = req.query;
        if (!store_id || !start_date || !end_date) {
            return res.status(400).json({ message: "store_id, start_date, end_date are required" });
        }

        let q = db("shifts as s")
            .leftJoin("users as u", "u.id", "s.user_id")
            .select(
                "s.id",
                "s.store_id",
                "s.department_id",
                "s.shift_date",
                "s.start_time",
                "s.end_time",
                "s.status",
                "s.user_id",
                "u.first_name",
                "u.last_name",
                "u.email"
            )
            .where("s.store_id", store_id)
            .whereBetween("s.shift_date", [start_date, end_date])
            .orderBy("s.shift_date", "asc")
            .orderBy("s.start_time", "asc");

        if (department_id) q = q.andWhere("s.department_id", department_id);

        const rows = await q;
        res.json({ shifts: rows });
    } catch (err) {
        next(err);
    }
};