const db = require("../db/knex");

exports.listByStore = async (req, res, next) => {
    try {
        const { store_id } = req.query;
        if (!store_id) return res.status(400).json({ message: "store_id is required" });

        const rows = await db("user_assignments as ua")
            .join("users as u", "u.id", "ua.user_id")
            .select("u.id", "u.first_name", "u.last_name", "u.email")
            .where("ua.store_id", store_id)
            .whereNull("ua.end_date")
            .groupBy("u.id", "u.first_name", "u.last_name", "u.email")
            .orderBy("u.first_name", "asc");

        res.json(rows);
    } catch (err) {
        next(err);
    }
};