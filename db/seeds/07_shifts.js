

function makeRng(seed = 12345) {
  let s = seed >>> 0;

  return function rnd() {
    s = (1664525 * s + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function addDays(date, days) {
  const d = new Date(date);

  if (Number.isNaN(d.getTime())) {
    throw new Error(`Invalid week start date: ${date}`);
  }

  d.setUTCDate(d.getUTCDate() + days);

  return d;
}

function toDateString(date) {
  const d = new Date(date);

  if (Number.isNaN(d.getTime())) {
    throw new Error(`Invalid shift date: ${date}`);
  }

  return d.toISOString().slice(0, 10);
}

exports.seed = async function (knex) {

  const rnd = makeRng(20261002);

  await knex("shifts").del();

    const createdByUser = await knex("users")
    .where({ email: "demo@company.com" })
    .first("id");

  if (!createdByUser) {
    throw new Error("Demo admin user not found.");
  }

  const assignments = await knex("user_assignments as ua")
    .join("users as u", "u.id", "ua.user_id")
    .join("roles as r", "r.id", "ua.role_id")
    .select(
      "ua.user_id",
      "ua.store_id",
      "ua.department_id",
      "r.code as role_code",
      "u.status"
    )
    .whereNull("ua.end_date")
    .where("r.code", "ASSOCIATE")
    .where("u.status", "active");

  if (!assignments.length) {
    throw new Error("No active associate assignments found.");
  }

  const scheduleWeeks = await knex("schedule_weeks")
    .select(
      "id",
      "store_id",
      "week_start_date",
      "week_end_date",
      "status"
    )
    .orderBy("week_start_date", "asc");

  if (!scheduleWeeks.length) {
    throw new Error("No schedule weeks found.");
  }

  const shifts = [];

  const shiftTemplates = [
    { start: "06:00", end: "14:00" },
    { start: "07:00", end: "15:00" },
    { start: "08:00", end: "16:00" },
    { start: "09:00", end: "17:00" },
    { start: "10:00", end: "18:00" },
    { start: "11:00", end: "19:00" },
    { start: "12:00", end: "20:00" },
    { start: "13:00", end: "21:00" },
  ];

  for (const week of scheduleWeeks) {
    for (const assignment of assignments) {
      if (Number(assignment.store_id) !== Number(week.store_id)) {
        continue;
      }

      // 60% get 5 days, 40% get 4 days
      const daysToWork = rnd() < 0.6 ? 5 : 4;

      const availableDays = [0, 1, 2, 3, 4, 5, 6];

      for (let i = 0; i < daysToWork; i++) {
        const index = Math.floor(rnd() * availableDays.length);
        const dayOffset = availableDays.splice(index, 1)[0];

        const shiftDate = addDays(
          week.week_start_date,
          dayOffset
        );

        const template =
          shiftTemplates[
          Math.floor(rnd() * shiftTemplates.length)
          ];

        shifts.push({
          user_id: assignment.user_id,
          store_id: assignment.store_id,
          department_id: assignment.department_id,
          schedule_week_id: week.id,
          shift_date: toDateString(shiftDate),
          start_time: template.start,
          end_time: template.end,

          created_by: createdByUser.id,
        });
      }
    }
  }

  if (!shifts.length) {
    throw new Error("No shifts were generated.");
  }

  await knex("shifts").insert(shifts);

  console.log(
    `Seeded ${shifts.length} shifts for ${assignments.length} active associates across ${scheduleWeeks.length} weeks`
  );
};