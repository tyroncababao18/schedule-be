const db = require("../db/knex");

exports.list = async (req, res, next) => {
    try {
        const { store_id, status = "pending" } = req.query;
        const role = req.user.role_code;
        const userId = req.user.sub;

        let q = db("time_off_requests as r")
            .select(
                "r.id",
                "r.user_id",
                "r.start_date",
                "r.end_date",
                "r.start_time",
                "r.end_time",
                "r.reason",
                "r.status",
                "r.reviewed_by",
                "r.reviewed_at",
                "u.first_name",
                "u.last_name"
            )
            .join("users as u", "u.id", "r.user_id")
            .orderBy("r.start_date", "asc");

        if (status) q = q.where("r.status", status);

        if (role === "ASSOCIATE") {
            q = q.where("r.user_id", userId);
        } else {
            if (!store_id) return res.status(400).json({ message: "store_id is required" });

            // filter by store using user_assignments
            q = q.join("user_assignments as ua", "ua.user_id", "r.user_id")
                .where("ua.store_id", store_id)
                .whereNull("ua.end_date");
        }

        const rows = await q;
        res.json(rows);
    } catch (err) {
        console.log(err)
        next(err);
    }
};

// placeholders for later
exports.create = async (req, res) => res.status(400).json({ message: "Not implemented yet" });
exports.update = async (req, res) => res.status(400).json({ message: "Not implemented yet" });