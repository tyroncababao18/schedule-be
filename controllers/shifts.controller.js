const db = require("../db/knex");

exports.list = async (req, res, next) => {
    try {
        const { store_id, department_id, date } = req.query;
        let q = db("shifts as s")
            .select(
                "s.id",
                "s.store_id",
                "s.department_id",
                "s.shift_date",
                "s.start_time",
                "s.end_time",
                "s.status"
            )
            .orderBy("s.shift_date", "asc")
            .orderBy("s.start_time", "asc");
        if (store_id) q = q.where("s.store_id", store_id);
        if (department_id) q = q.where("s.department_id", department_id);
        if (date) q = q.where("s.shift_date", date);
        const rows = await q;
        res.json(rows);
    } catch (err) {
        next(err);
    }
};

exports.create = async (req, res, next) => {
    try {
        const { store_id, department_id, shift_date, start_time, end_time, status } =
            req.body;

        if (!store_id || !department_id || !shift_date || !start_time || !end_time) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const [id] = await db("shifts").insert({
            store_id,
            department_id,
            shift_date,
            start_time,
            end_time,
            status: status || "draft",
            created_by: req.user.sub,
        });

        res.status(201).json({ id });
    } catch (err) {
        next(err);
    }
};

exports.addAssignment = async (req, res, next) => {
    try {
        const { shiftId } = req.params;
        const { user_id, assignment_role_id } = req.body;

        if (!user_id || !assignment_role_id) {
            return res
                .status(400)
                .json({ message: "user_id and assignment_role_id required" });
        }

        const [id] = await db("shift_assignments").insert({
            shift_id: shiftId,
            user_id,
            assignment_role_id,
        });

        res.status(201).json({ id });
    } catch (err) {
        res.status(400).json({ message: "Could not add assignment" });
    }
};

exports.removeAssignment = async (req, res, next) => {
    try {
        const { assignmentId } = req.params;

        const count = await db("shift_assignments").where({ id: assignmentId }).del();
        if (!count) return res.status(404).json({ message: "Assignment not found" });

        res.json({ message: "Removed" });
    } catch (err) {
        next(err);
    }
};