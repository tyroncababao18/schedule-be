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

function makeRng(seed = 123) {
  let s = seed >>> 0;
  return function rnd() {
    s = (1664525 * s + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
function pick(arr, rnd) {
  return arr[Math.floor(rnd() * arr.length)];
}
function pickShiftTime(rnd) {
  const templates = [
    ["07:00", "16:00"],
    ["08:00", "17:00"],
    ["09:00", "18:00"],
    ["10:00", "19:00"],
    ["11:00", "20:00"],
    ["12:00", "21:00"],
    ["13:00", "22:00"],
  ];
  return pick(templates, rnd);
}

exports.seed = async function (knex) {
  const rnd = makeRng(20260312);

  const store = await knex("stores").first("id").orderBy("id", "asc");
  if (!store) throw new Error("07_shifts: No store found. Run store seed first.");
  const store_id = store.id;

  const admin = await knex("users").first("id").where({ email: "admin@company.com" });
  if (!admin) throw new Error("07_shifts: admin@company.com not found. Run users seed first.");

  const hasScheduleWeekId = await knex.schema.hasColumn("shifts", "schedule_week_id");

  //  current + next 3
  const currentStart = startOfWeekSaturday(new Date());
  const weekStarts = [0, 1, 2, 3].map((o) => addDays(currentStart, 7 * o));
  const weekStartKeys = weekStarts.map((d) => toYYYYMMDD(d));

  const weeks = await knex("schedule_weeks")
    .where({ store_id })
    .whereIn("week_start_date", weekStartKeys)
    .select("id", "week_start_date", "week_end_date", "status");

  if (!weeks || weeks.length === 0) {
    throw new Error(
      `07_shifts: No schedule_weeks found for store_id=${store_id} for week_start_date in [${weekStartKeys.join(
        ", "
      )}]. Run 06_schedule_weeks seed first (and make sure it uses Saturday start).`
    );
  }

  const weekByStart = new Map(weeks.map((w) => [String(w.week_start_date).slice(0, 10), w]));

  const deptIds = await knex("departments").where({ store_id }).pluck("id");
  if (!deptIds || deptIds.length === 0) throw new Error("07_shifts: No departments found. Run departments seed first.");

  const associates = await knex("users")
    .select("id")
    .where("email", "like", "associate%@company.com")
    .andWhere({ status: "active" });

  if (!associates || associates.length === 0) {
    throw new Error("07_shifts: No active associates found (associate%@company.com).");
  }

  const assignments = await knex("user_assignments")
    .select("user_id", "department_id")
    .where({ store_id })
    .whereNull("end_date");

  if (!assignments || assignments.length === 0) {
    throw new Error("07_shifts: No user_assignments found. Run user_assignments seed first.");
  }

  const deptByUser = new Map();
  for (const a of assignments) {
    if (!deptByUser.has(a.user_id)) deptByUser.set(a.user_id, []);
    deptByUser.get(a.user_id).push(a.department_id);
  }

  const shifts = [];

  for (const ws of weekStarts) {
    const wsKey = toYYYYMMDD(ws);
    const weekRow = weekByStart.get(wsKey);
    if (!weekRow) continue;

    const forcedStatus = weekRow.status === "published" ? "published" : "draft";

    // each associate 3–5 shifts/week
    for (const u of associates) {
      const deptChoices = deptByUser.get(u.id) || [];
      if (deptChoices.length === 0) continue;

      const shiftsThisWeek = rnd() < 0.5 ? 4 : 5;
      const daysPicked = new Set();

      while (daysPicked.size < shiftsThisWeek) {
        daysPicked.add(Math.floor(rnd() * 7));
      }

      for (const dayOffset of daysPicked) {
        const day = addDays(ws, dayOffset);
        const shift_date = toYYYYMMDD(day);

        const department_id = pick(deptChoices, rnd);
        const [start_time, end_time] = pickShiftTime(rnd);

        const row = {
          store_id,
          department_id,
          user_id: u.id,
          shift_date,
          start_time,
          end_time,
          status: forcedStatus,
          created_by: admin.id,
        };

        if (hasScheduleWeekId) row.schedule_week_id = weekRow.id;

        shifts.push(row);
      }
    }

    // unassigned shifts
    for (let i = 0; i < 10; i++) {
      const day = addDays(ws, Math.floor(rnd() * 7));
      const shift_date = toYYYYMMDD(day);
      const department_id = pick(deptIds, rnd);
      const [start_time, end_time] = pickShiftTime(rnd);

      const row = {
        store_id,
        department_id,
        user_id: null,
        shift_date,
        start_time,
        end_time,
        status: forcedStatus,
        created_by: admin.id,
      };

      if (hasScheduleWeekId) row.schedule_week_id = weekRow.id;

      shifts.push(row);
    }
  }

  if (shifts.length === 0) {
    console.log("07_shifts: No shifts generated — skipping insert (avoid empty query).");
    return;
  }

  await knex("shifts").insert(shifts);
  console.log(`07_shifts: Inserted ${shifts.length} shifts.`);
};