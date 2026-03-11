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
  // ---------- TIME OFF REQUESTS ----------
  const hasTimeOff = await knex.schema.hasTable("time_off_requests");
  if (hasTimeOff) {
    const hasStartDate = await knex.schema.hasColumn("time_off_requests", "start_date");
    const hasEndDate = await knex.schema.hasColumn("time_off_requests", "end_date");
    const hasStartTime = await knex.schema.hasColumn("time_off_requests", "start_time");
    const hasEndTime = await knex.schema.hasColumn("time_off_requests", "end_time");
    const hasReason = await knex.schema.hasColumn("time_off_requests", "reason");
    const hasStatus = await knex.schema.hasColumn("time_off_requests", "status");
    const hasReviewedBy = await knex.schema.hasColumn("time_off_requests", "reviewed_by");
    const hasReviewedAt = await knex.schema.hasColumn("time_off_requests", "reviewed_at");

    const associates = await knex("users")
      .select("id")
      .where("email", "like", "associate%@company.com")
      .andWhere({ status: "active" })
      .limit(20);

    if (associates.length) {
      const baseWeek = startOfWeekSaturday(new Date());
      const rows = associates.slice(0, 12).map((u, idx) => {
        const day = addDays(baseWeek, 2 + (idx % 10)); // upcoming days
        const row = { user_id: u.id };

        if (hasStartDate) row.start_date = toYYYYMMDD(day);
        if (hasEndDate) row.end_date = toYYYYMMDD(day);

        if (hasStartTime) row.start_time = "09:00";
        if (hasEndTime) row.end_time = "17:00";

        if (hasReason) row.reason = idx % 2 ? "Family event" : "Doctor appointment";
        if (hasStatus) row.status = "pending";

        if (hasReviewedBy) row.reviewed_by = null;
        if (hasReviewedAt) row.reviewed_at = knex.fn.now();

        return row;
      });

      // Avoid empty insert
      if (rows.length) {
        await knex("time_off_requests").insert(rows);
        console.log(`08_requests_optional: Inserted ${rows.length} time_off_requests`);
      }
    }
  }

  // ---------- SHIFT SWAP REQUESTS ----------
  const hasSwap = await knex.schema.hasTable("shift_swap_requests");
  if (hasSwap) {
    const hasRequesterId = await knex.schema.hasColumn("shift_swap_requests", "requester_id");
    const hasShiftId = await knex.schema.hasColumn("shift_swap_requests", "shift_id");
    const hasStatus = await knex.schema.hasColumn("shift_swap_requests", "status");
    const hasNotes = await knex.schema.hasColumn("shift_swap_requests", "notes");
    const hasCreatedAt = await knex.schema.hasColumn("shift_swap_requests", "created_at");

    const someShifts = await knex("shifts")
      .select("id", "user_id")
      .whereNotNull("user_id")
      .limit(12);

    const rows = someShifts
      .filter((s) => s.user_id)
      .map((s, idx) => {
        const row = {};
        if (hasRequesterId) row.requester_id = s.user_id;
        if (hasShiftId) row.shift_id = s.id;
        if (hasStatus) row.status = "pending";
        if (hasNotes) row.notes = idx % 2 ? "Swap requested" : "Need coverage";
        if (hasCreatedAt) row.created_at = knex.fn.now();
        return row;
      });

    const canInsert =
      (!hasRequesterId || rows.every((r) => "requester_id" in r)) &&
      (!hasShiftId || rows.every((r) => "shift_id" in r));

    if (rows.length && canInsert) {
      await knex("shift_swap_requests").insert(rows);
      console.log(`08_requests_optional: Inserted ${rows.length} shift_swap_requests`);
    }
  }
};