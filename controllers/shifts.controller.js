const db = require("../db/knex");

function toDateKey(val) {
  if (!val) return null;

  if (val instanceof Date) {
    const yyyy = val.getFullYear();
    const mm = String(val.getMonth() + 1).padStart(2, "0");
    const dd = String(val.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  const s = String(val);

  if (s.length >= 10 && s[4] === "-" && s[7] === "-") return s.slice(0, 10);

  const d = new Date(val);
  if (!Number.isNaN(d.getTime())) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  return null;
}

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


function isPastDay(dateKeyStr) {
  if (!dateKeyStr) return true;
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  const d = new Date(`${dateKeyStr}T00:00:00`);
  return d < t;
}

function isWithinEditableWeeks(shiftDateKey, weeksAhead) {
  const d = new Date(`${shiftDateKey}T00:00:00`);
  const shiftWeekStart = startOfWeekSaturday(d);

  const currentWeekStart = startOfWeekSaturday(new Date());
  const lastAllowedWeekStart = addDays(currentWeekStart, 7 * weeksAhead);

  return shiftWeekStart >= currentWeekStart && shiftWeekStart <= lastAllowedWeekStart;
}

async function getWeekForDate(store_id, shift_date) {
  const key = toDateKey(shift_date);
  if (!key) return null;

  const day = new Date(`${key}T00:00:00`);
  const weekStart = startOfWeekSaturday(day);

  return db("schedule_weeks")
    .where({ store_id, week_start_date: toYYYYMMDD(weekStart) })
    .first();
}

async function isDeptAllowedForUser(store_id, user_id, department_id) {
  const row = await db("user_assignments")
    .where({ store_id, user_id, department_id })
    .whereNull("end_date")
    .first();
  return Boolean(row);
}

exports.list = async (req, res, next) => {
  try {
    const { store_id, department_id, date, start_date, end_date } = req.query;
    if (!store_id) return res.status(400).json({ message: "store_id is required" });

    let q = db("shifts as s")
      .select(
        "s.id",
        "s.store_id",
        "s.department_id",
        "s.user_id",
        "s.shift_date",
        "s.start_time",
        "s.end_time",
        "s.status",
        "s.schedule_week_id"
      )
      .where("s.store_id", store_id)
      .orderBy("s.shift_date", "asc")
      .orderBy("s.start_time", "asc");

    if (department_id) q = q.andWhere("s.department_id", department_id);
    if (date) q = q.andWhere("s.shift_date", toDateKey(date));
    if (start_date && end_date) {
      q = q.andWhereBetween("s.shift_date", [toDateKey(start_date), toDateKey(end_date)]);
    }

    const rows = await q;
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { store_id, department_id, user_id, shift_date, start_time, end_time } = req.body;

    if (!store_id || !department_id || !shift_date || !start_time || !end_time) {
      return res.status(400).json({
        message: "store_id, department_id, shift_date, start_time, end_time are required",
      });
    }

    const shiftDateKey = toDateKey(shift_date);
    if (!shiftDateKey) return res.status(400).json({ message: "Invalid shift_date" });

    // no past days
    if (isPastDay(shiftDateKey)) {
      return res.status(403).json({ message: "Cannot create shifts for past days." });
    }

    // only current + next 3 weeks
    const EDITABLE_WEEKS_AHEAD = 3;
    if (!isWithinEditableWeeks(shiftDateKey, EDITABLE_WEEKS_AHEAD)) {
      return res.status(403).json({
        message: "You can only create shifts for the current week and the next 3 weeks.",
      });
    }

    // schedule week -> status
    const week = await getWeekForDate(store_id, shiftDateKey);
    if (!week) return res.status(400).json({ message: "No schedule week exists for this date." });
    if (week.status === "locked") return res.status(403).json({ message: "This week is locked." });

    const forcedStatus = week.status === "published" ? "published" : "draft";

    const parsedUserId = user_id ? Number(user_id) : null;

    // dept restriction only if user is assigned
    if (parsedUserId) {
      const ok = await isDeptAllowedForUser(store_id, parsedUserId, Number(department_id));
      if (!ok) return res.status(403).json({ message: "This associate is not assigned to that department." });
    }

    const [created] = await db("shifts")
      .insert({
        store_id,
        department_id: Number(department_id),
        user_id: parsedUserId,
        shift_date: shiftDateKey,
        start_time,
        end_time,
        status: forcedStatus,
        created_by: req.user?.sub ?? null,
        schedule_week_id: week.id,
      })
      .returning([
        "id",
        "store_id",
        "department_id",
        "user_id",
        "shift_date",
        "start_time",
        "end_time",
        "status",
        "schedule_week_id",
      ]);

    res.status(201).json({ shift: created });
  } catch (err) {
    if (String(err?.message || "").toLowerCase().includes("duplicate key value")) {
      return res.status(400).json({ message: "This associate already has a shift for that date." });
    }
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { shiftId } = req.params;
    const { department_id, shift_date, start_time, end_time, user_id } = req.body;

    const current = await db("shifts").where({ id: shiftId }).first();
    if (!current) return res.status(404).json({ message: "Shift not found" });

    const effectiveDateKey = toDateKey(shift_date !== undefined ? shift_date : current.shift_date);
    if (!effectiveDateKey) return res.status(400).json({ message: "Invalid shift_date" });

    const effectiveUserId = user_id !== undefined ? (user_id ? Number(user_id) : null) : current.user_id;
    const effectiveDeptId =
      department_id !== undefined ? (department_id ? Number(department_id) : null) : current.department_id;

    // no past days
    if (isPastDay(effectiveDateKey)) {
      return res.status(403).json({ message: "Cannot edit shifts for past days." });
    }

    // only current + next 3 weeks
    const EDITABLE_WEEKS_AHEAD = 3;
    if (!isWithinEditableWeeks(effectiveDateKey, EDITABLE_WEEKS_AHEAD)) {
      return res.status(403).json({
        message: "You can only edit shifts for the current week and the next 3 weeks.",
      });
    }

    // schedule week -> status
    const week = await getWeekForDate(current.store_id, effectiveDateKey);
    if (!week) return res.status(400).json({ message: "No schedule week exists for this date." });
    if (week.status === "locked") return res.status(403).json({ message: "This week is locked." });

    const forcedStatus = week.status === "published" ? "published" : "draft";

    // dept restriction only if assigned
    if (effectiveUserId && effectiveDeptId) {
      const ok = await isDeptAllowedForUser(current.store_id, effectiveUserId, effectiveDeptId);
      if (!ok) return res.status(403).json({ message: "This associate is not assigned to that department." });
    }

    const patch = {};
    if (department_id !== undefined) patch.department_id = effectiveDeptId;
    if (shift_date !== undefined) patch.shift_date = effectiveDateKey;
    if (start_time !== undefined) patch.start_time = start_time;
    if (end_time !== undefined) patch.end_time = end_time;
    if (user_id !== undefined) patch.user_id = effectiveUserId;

    // forced status from week
    patch.status = forcedStatus;
    patch.schedule_week_id = week.id;

    const [updated] = await db("shifts")
      .where({ id: shiftId })
      .update({ ...patch, updated_at: db.fn.now() })
      .returning([
        "id",
        "store_id",
        "department_id",
        "user_id",
        "shift_date",
        "start_time",
        "end_time",
        "status",
        "schedule_week_id",
      ]);

    res.json({ shift: updated });
  } catch (err) {
    if (String(err?.message || "").toLowerCase().includes("duplicate key value")) {
      return res.status(400).json({ message: "This associate already has a shift for that date." });
    }
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const { shiftId } = req.params;

    const shift = await db("shifts").where({ id: shiftId }).first();
    if (!shift) return res.status(404).json({ message: "Shift not found" });

    const shiftDateKey = toDateKey(shift.shift_date);
    if (!shiftDateKey) return res.status(400).json({ message: "Invalid shift_date on shift" });

    // no past days
    if (isPastDay(shiftDateKey)) {
      return res.status(403).json({ message: "Cannot delete shifts for past days." });
    }

    // only current + next 3 weeks
    const EDITABLE_WEEKS_AHEAD = 3;
    if (!isWithinEditableWeeks(shiftDateKey, EDITABLE_WEEKS_AHEAD)) {
      return res.status(403).json({
        message: "You can only delete shifts for the current week and the next 3 weeks.",
      });
    }

    // locked week block
    const week = await getWeekForDate(shift.store_id, shiftDateKey);
    if (!week) return res.status(400).json({ message: "No schedule week exists for this date." });
    if (week.status === "locked") return res.status(403).json({ message: "This week is locked." });

    await db("shifts").where({ id: shiftId }).del();
    res.json({ message: "Shift deleted" });
  } catch (err) {
    next(err);
  }
};



function toMinutes(hhmm) {
  const [h, m] = String(hhmm).slice(0, 5).split(":").map(Number);
  return h * 60 + m;
}

// Overlap: next.start < prev.end
function countOverlaps(shifts) {
  // group by user_id + shift_date
  const groups = new Map();

  for (const s of shifts) {
    if (!s.user_id) continue; // ignore unassigned
    const dateKey = toDateKey(s.shift_date);
    if (!dateKey) continue;
    const key = `${s.user_id}__${dateKey}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(s);
  }

  let conflictCount = 0;
  const conflicts = [];

  for (const [key, list] of groups.entries()) {
    // sort by start_time
    list.sort((a, b) => String(a.start_time).localeCompare(String(b.start_time)));

    for (let i = 1; i < list.length; i++) {
      const prev = list[i - 1];
      const cur = list[i];

      const prevStart = toMinutes(prev.start_time);
      const prevEnd = toMinutes(prev.end_time);
      const curStart = toMinutes(cur.start_time);
      const curEnd = toMinutes(cur.end_time);

      const overlap = curStart < prevEnd;

      if (overlap) {
        conflictCount += 1;
        conflicts.push({
          user_id: prev.user_id,
          shift_date: toDateKey(prev.shift_date),
          a: { id: prev.id, start_time: prev.start_time, end_time: prev.end_time },
          b: { id: cur.id, start_time: cur.start_time, end_time: cur.end_time },
        });
      }
    }
  }

  return { conflictCount, conflicts };
}

exports.conflicts = async (req, res, next) => {
  try {
    const { store_id, start_date, end_date } = req.query;
    const role = req.user.role_code;
    const userId = req.user.sub;

    if (!start_date || !end_date) {
      return res.status(400).json({ message: "start_date and end_date are required" });
    }

    const isAssociate = role === "ASSOCIATE";

    let q = db("shifts as s")
      .select("s.id", "s.user_id", "s.shift_date", "s.start_time", "s.end_time")
      .whereBetween("s.shift_date", [toDateKey(start_date), toDateKey(end_date)]);

    if (isAssociate) {
      q = q.where("s.user_id", userId);
    } else {
      if (!store_id) return res.status(400).json({ message: "store_id is required" });
      q = q.where("s.store_id", store_id);
    }

    const rows = await q;

    const { conflictCount, conflicts } = countOverlaps(rows);

    res.json({
      count: conflictCount,
      conflicts: conflicts.slice(0, 50),
    });
  } catch (err) {
    next(err);
  }
};