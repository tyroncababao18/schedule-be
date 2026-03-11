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

exports.seed = async function (knex) {
  const store = await knex("stores").first("id").orderBy("id", "asc");
  const store_id = store.id;

  const currentStart = startOfWeekSaturday(new Date());

  const weeks = [];
  for (let offset = 0; offset < 12; offset++) {
    const ws = addDays(currentStart, 7 * offset);
    const we = addDays(ws, 6);

    const status = offset <= 2 ? "published" : offset === 3 ? "draft" : "draft";

    weeks.push({
      store_id,
      week_start_date: toYYYYMMDD(ws),
      week_end_date: toYYYYMMDD(we),
      status,
      total_hours_budget: 800 + offset * 15,
      created_by: null,
    });
  }

  await knex("schedule_weeks").insert(weeks);
};