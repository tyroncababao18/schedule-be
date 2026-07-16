const db = require("../db/knex");

exports.summary = async (req, res, next) => {
    try {
        const role = req.user.role_code;
        const userId = req.user.sub;
        const { store_id } = req.query;

        const isAssociate = role === "ASSOCIATE";
        if (!isAssociate && !store_id) {getUserContext 
            return res.status(400).json({ message: "store_id is required" });
        }

        // TIME OFF pending
        let timeOffCountQ = db("time_off_requests as r")
            .count("* as count")
            .where("r.status", "pending");

        // SWAPS pending
        let swapCountQ = db("shift_swap_requests as r")
            .count("* as count")
            .where("r.status", "pending");

        if (isAssociate) {
            timeOffCountQ = timeOffCountQ.andWhere("r.user_id", userId);
            swapCountQ = swapCountQ.andWhere("r.requester_id", userId);
        } else {
            // scope to store via assignments/shifts
            timeOffCountQ = timeOffCountQ
                .join("user_assignments as ua", "ua.user_id", "r.user_id")
                .where("ua.store_id", store_id)
                .whereNull("ua.end_date");

            swapCountQ = swapCountQ
                .join("shifts as s", "s.id", "r.shift_id")
                .where("s.store_id", store_id);
        }

        const [timeOffCountRow, swapCountRow] = await Promise.all([
            timeOffCountQ.first(),
            swapCountQ.first(),
        ]);

        const timeOffPending = Number(timeOffCountRow?.count || 0);
        const swapPending = Number(swapCountRow?.count || 0);

        // latest time off (pending)
        let latestTO = db("time_off_requests as r")
            .join("users as u", "u.id", "r.user_id")
            .select(
                "r.id",
                "r.start_date",
                "r.reason",
                "u.first_name",
                "u.last_name",
                "r.user_id",
                "r.created_at"
            )
            .where("r.status", "pending")
            .orderBy("r.created_at", "desc")
            .limit(10);

        // latest swaps (pending)
        let latestSW = db("shift_swap_requests as r")
            .join("users as u", "u.id", "r.requester_id")
            .join("shifts as s", "s.id", "r.shift_id")
            .select(
                "r.id",
                "r.notes",
                "s.shift_date",
                "u.first_name",
                "u.last_name",
                "r.requester_id",
                "r.created_at"
            )
            .where("r.status", "pending")
            .orderBy("r.created_at", "desc")
            .limit(10);

        if (isAssociate) {
            latestTO = latestTO.andWhere("r.user_id", userId);
            latestSW = latestSW.andWhere("r.requester_id", userId);
        } else {
            latestTO = latestTO
                .join("user_assignments as ua", "ua.user_id", "r.user_id")
                .where("ua.store_id", store_id)
                .whereNull("ua.end_date");

            latestSW = latestSW.where("s.store_id", store_id);
        }

        const [toRows, swRows] = await Promise.all([latestTO, latestSW]);

        const latest = [
            ...(toRows || []).map((r) => ({
                id: `to-${r.id}`,
                type: "Time Off",
                who: `${r.first_name || ""} ${r.last_name || ""}`.trim() || `User #${r.user_id}`,
                when: String(r.start_date || "").slice(0, 10),
                note: r.reason || "",
                created_at: r.created_at,
            })),
            ...(swRows || []).map((r) => ({
                id: `sw-${r.id}`,
                type: "Swap",
                who: `${r.first_name || ""} ${r.last_name || ""}`.trim() || `User #${r.requester_id}`,
                when: String(r.shift_date || "").slice(0, 10),
                note: r.notes || "",
                created_at: r.created_at,
            })),
        ]
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 6)
            .map(({ created_at, ...rest }) => rest);

        res.json({ timeOffPending, swapPending, latest });
    } catch (err) {
        next(err);
    }
};