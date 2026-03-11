const db = require("../db/knex");

exports.list = async (req, res, next) => {
    try {
        const { store_id, user_id } = req.query;
        if (!store_id || !user_id) {
            return res.status(400).json({ message: "store_id and user_id are required" });
        }

        const rows = await db("user_assignments as ua")
            .join("departments as d", "d.id", "ua.department_id")
            .join("roles as r", "r.id", "ua.role_id")
            .select(
                "ua.department_id",
                "d.name as department_name",
                "ua.role_id",
                "r.code as role_code"
            )
            .where("ua.store_id", store_id)
            .where("ua.user_id", user_id)
            .whereNull("ua.end_date")
            .orderBy("d.name", "asc");

        res.json(rows);
    } catch (err) {
        next(err);
    }
};


exports.allowedDepartments = async (req, res, next) => {
    try {
        const { store_id, user_id } = req.query;
        if (!store_id || !user_id) {
            return res.status(400).json({ message: "store_id and user_id are required" });
        }

        const rows = await db("user_assignments as ua")
            .join("departments as d", "d.id", "ua.department_id")
            .select("d.id", "d.name")
            .where("ua.store_id", store_id)
            .where("ua.user_id", user_id)
            .whereNull("ua.end_date")
            .groupBy("d.id", "d.name")
            .orderBy("d.name", "asc");

        res.json(rows);
    } catch (err) {
        next(err);
    }
};


exports.usersByDepartment = async (req, res, next) => {
    try {
        const { store_id, department_id } = req.query;
        if (!store_id || !department_id) {
            return res.status(400).json({ message: "store_id and department_id are required" });
        }

        const rows = await db("user_assignments as ua")
            .join("users as u", "u.id", "ua.user_id")
            .select("u.id", "u.first_name", "u.last_name", "u.email")
            .where("ua.store_id", store_id)
            .where("ua.department_id", department_id)
            .whereNull("ua.end_date")
            .groupBy("u.id", "u.first_name", "u.last_name", "u.email")
            .orderBy("u.first_name", "asc");

        res.json(rows);
    } catch (err) {
        next(err);
    }
};