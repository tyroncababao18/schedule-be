const cron = require("node-cron");
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

// Saturday-start week
function startOfWeekSaturday(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = (day + 1) % 7;
    d.setDate(d.getDate() - diff);
    d.setHours(0, 0, 0, 0);
    return d;
}

async function ensureThirdWeekDraftForStore(storeId) {
    const now = new Date();
    const currentWeekStart = startOfWeekSaturday(now);

    // 3rd week ahead start = currentWeekStart + 21 days
    const thirdWeekStart = addDays(currentWeekStart, 21);
    const thirdWeekEnd = addDays(thirdWeekStart, 6);

    const weekStartStr = toYYYYMMDD(thirdWeekStart);
    const weekEndStr = toYYYYMMDD(thirdWeekEnd);

    const exists = await db("schedule_weeks")
        .where({ store_id: storeId, week_start_date: weekStartStr })
        .first();

    if (exists) return { created: false, week: exists };

    const [createdWeek] = await db("schedule_weeks")
        .insert({
            store_id: storeId,
            week_start_date: weekStartStr,
            week_end_date: weekEndStr,
            status: "draft",
            total_hours_budget: 0,
            created_by: null,
        })
        .returning([
            "id",
            "store_id",
            "week_start_date",
            "week_end_date",
            "status",
            "total_hours_budget",
        ]);

    return { created: true, week: createdWeek };
}

async function runDropJob() {
    const stores = await db("stores").select("id");
    const results = [];
    for (const s of stores) {
        const r = await ensureThirdWeekDraftForStore(s.id);
        results.push({ store_id: s.id, ...r });
    }

    console.log("[scheduleWeekJob] ran:", results);
}

function startScheduleWeekJob() {
    cron.schedule(
        "0 2 * * 6",
        async () => {
            try {
                await runDropJob();
            } catch (err) {
                console.error("[scheduleWeekJob] error:", err);
            }
        },
        {
            timezone: "America/Chicago",
        }
    );

    console.log("[scheduleWeekJob] scheduled (Sat 2:00 AM America/Chicago)");
}

module.exports = { startScheduleWeekJob, runDropJob };