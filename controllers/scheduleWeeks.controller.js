const db = require("../db/knex");

function toYYYYMMDD(d) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}
function addDays(date, n) {
    const d = new Date(date);
    d.setDate(d.getDate() + n);
    return d;
}

function startOfWeekSaturday(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = (day + 1) % 7; // go back to Saturday
    d.setDate(d.getDate() - diff);
    d.setHours(0, 0, 0, 0);
    return d;
}

exports.list = async (req, res, next) => {
    try {
        const { store_id } = req.query;
        if (!store_id) return res.status(400).json({ message: "store_id is required" });

        const rows = await db("schedule_weeks as w")
            .select(
                "w.id",
                "w.store_id",
                "w.week_start_date",
                "w.week_end_date",
                "w.status",
                "w.total_hours_budget",
                "w.created_at"
            )
            .where("w.store_id", store_id)
            .orderBy("w.week_start_date", "asc");

        res.json(rows);
    } catch (err) {
        next(err);
    }
};

// Creates the "3rd week ahead" as draft if not exists
exports.dropNext = async (req, res, next) => {
    try {
        const { store_id } = req.query;
        if (!store_id) return res.status(400).json({ message: "store_id is required" });

        // Find latest week in DB for this store
        const latest = await db("schedule_weeks")
            .where({ store_id })
            .orderBy("week_start_date", "desc")
            .first();

        const baseStart = latest
            ? new Date(latest.week_start_date)
            : startOfWeekSaturday(new Date());

        const nextStart = addDays(baseStart, 7);
        const nextEnd = addDays(nextStart, 6);

        const existing = await db("schedule_weeks")
            .where({ store_id, week_start_date: toYYYYMMDD(nextStart) })
            .first();

        if (existing) return res.status(200).json({ message: "Week already exists", week: existing });

        const [created] = await db("schedule_weeks")
            .insert({
                store_id,
                week_start_date: toYYYYMMDD(nextStart),
                week_end_date: toYYYYMMDD(nextEnd),
                status: "draft",
                total_hours_budget: 0,
                created_by: req.user.sub,
            })
            .returning(["id", "store_id", "week_start_date", "week_end_date", "status", "total_hours_budget"]);

        res.status(201).json({ week: created });
    } catch (err) {
        next(err);
    }
};

exports.publish = async (req, res, next) => {
    try {
        const { id } = req.params;

        const week = await db("schedule_weeks").where({ id }).first();
        if (!week) return res.status(404).json({ message: "Week not found" });

        if (week.status === "published") {
            return res.json({ message: "Already published", week });
        }

        const [updated] = await db("schedule_weeks")
            .where({ id })
            .update({ status: "published", updated_at: db.fn.now() })
            .returning(["id", "store_id", "week_start_date", "week_end_date", "status", "total_hours_budget"]);

        res.json({ week: updated });
    } catch (err) {
        next(err);
    }
};


exports.update = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { total_hours_budget, status } = req.body;

        const patch = {};
        if (total_hours_budget !== undefined) patch.total_hours_budget = Number(total_hours_budget);
        if (status !== undefined) patch.status = status; // optional (draft/published/locked)

        if (Object.keys(patch).length === 0) {
            return res.status(400).json({ message: "No fields to update" });
        }

        const [updated] = await db("schedule_weeks")
            .where({ id })
            .update({ ...patch, updated_at: db.fn.now() })
            .returning(["id", "store_id", "week_start_date", "week_end_date", "status", "total_hours_budget"]);

        res.json({ week: updated });
    } catch (err) {
        next(err);
    }
};