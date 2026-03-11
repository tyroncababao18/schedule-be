const db = require("../db/knex");

function startOfWeekSaturday(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = (day + 1) % 7;
    d.setDate(d.getDate() - diff);
    d.setHours(0, 0, 0, 0);
    return d;
}

function addDays(date, n) {
    const d = new Date(date);
    d.setDate(d.getDate() + n);
    d.setHours(0, 0, 0, 0);
    return d;
}

function toYYYYMMDD(d) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

async function ensureWeek(store_id, weekStartStr, weekEndStr, status) {
    const existing = await db("schedule_weeks")
        .where({ store_id, week_start_date: weekStartStr })
        .first();

    if (!existing) {
        await db("schedule_weeks").insert({
            store_id,
            week_start_date: weekStartStr,
            week_end_date: weekEndStr,
            status,
            total_hours_budget: 0,
            created_by: null,
        });
        return;
    }

    if (existing.status !== "locked" && existing.status !== status) {
        await db("schedule_weeks")
            .where({ id: existing.id })
            .update({ status, updated_at: db.fn.now() });
    }
}

async function enforceForStore(store_id) {
    const currentStart = startOfWeekSaturday(new Date());

    const targets = [
        { offset: 0, status: "published" },
        { offset: 1, status: "published" },
        { offset: 2, status: "published" },
        { offset: 3, status: "draft" },
    ];

    for (const t of targets) {
        const ws = addDays(currentStart, 7 * t.offset);
        const we = addDays(ws, 6);
        await ensureWeek(store_id, toYYYYMMDD(ws), toYYYYMMDD(we), t.status);
    }
}

async function enforceScheduleWeeks() {
    const stores = await db("stores").select("id");
    for (const s of stores) {
        await enforceForStore(s.id);
    }
    console.log("[enforceScheduleWeeks] done");
}

module.exports = { enforceScheduleWeeks };