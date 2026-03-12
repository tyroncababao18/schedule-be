// db/seeds/08_requests.js

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

// deterministic RNG so you always get same data
function makeRng(seed = 12345) {
  let s = seed >>> 0;
  return function rnd() {
    s = (1664525 * s + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function pick(arr, rnd) {
  return arr[Math.floor(rnd() * arr.length)];
}

function pickWeighted(items, rnd) {
  // items: [{value, w}]
  const total = items.reduce((s, x) => s + x.w, 0);
  let r = rnd() * total;
  for (const it of items) {
    r -= it.w;
    if (r <= 0) return it.value;
  }
  return items[items.length - 1].value;
}

exports.seed = async function (knex) {
  const rnd = makeRng(20260313);

  const admin = await knex("users").first("id").where({ email: "admin@company.com" });
  if (!admin) throw new Error("08_requests: admin@company.com not found");

  const hr = await knex("users")
    .select("id")
    .where("email", "like", "hr%@company.com")
    .limit(2);

  const reviewers = [admin.id, ...(hr.map((x) => x.id))];

  const associates = await knex("users")
    .select("id")
    .where("email", "like", "associate%@company.com")
    .andWhere({ status: "active" });

  if (!associates.length) throw new Error("08_requests: no active associates found");

  // -----------------------
  // TIME OFF REQUESTS (BIG)
  // -----------------------
  const reasons = [
    "Doctor appointment",
    "Family event",
    "School meeting",
    "Religious holiday",
    "Vacation",
    "Car issue",
    "Sick day",
    "Personal matter",
    "Travel",
    "Childcare",
  ];

  const timeOffRows = [];
  const base = startOfWeekSaturday(new Date());

  const TIME_OFF_COUNT = 120;

  for (let i = 0; i < TIME_OFF_COUNT; i++) {
    const user = pick(associates, rnd).id;

    // spread requests across a range: some past, mostly future
    const dayOffset = Math.floor(rnd() * 60) - 10; // [-10..49]
    const start = addDays(base, dayOffset);

    // 1–3 day ranges
    const lengthDays = pickWeighted(
      [
        { value: 1, w: 0.65 },
        { value: 2, w: 0.25 },
        { value: 3, w: 0.10 },
      ],
      rnd
    );
    const end = addDays(start, lengthDays - 1);

    const status = pickWeighted(
      [
        { value: "pending", w: 0.55 },
        { value: "approved", w: 0.30 },
        { value: "denied", w: 0.15 },
      ],
      rnd
    );

    const row = {
      user_id: user,
      start_date: toYYYYMMDD(start),
      end_date: toYYYYMMDD(end),
      start_time: rnd() < 0.45 ? "09:00" : null,
      end_time: rnd() < 0.45 ? "17:00" : null,
      reason: pick(reasons, rnd),
      status,
      reviewed_by: null,
      reviewed_at: null,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    };

    if (status !== "pending") {
      row.reviewed_by = pick(reviewers, rnd);
      row.reviewed_at = knex.fn.now();
    }

    timeOffRows.push(row);
  }

  await knex("time_off_requests").insert(timeOffRows);
  console.log(`08_requests: Inserted ${timeOffRows.length} time_off_requests`);

  // ------------------------
  // SHIFT SWAP REQUESTS (BIG)
  // unique(["shift_id"]) => pick unique shifts
  // ------------------------
  const shifts = await knex("shifts")
    .select("id", "user_id", "store_id", "shift_date")
    .whereNotNull("user_id");

  if (!shifts.length) {
    console.log("08_requests: No assigned shifts found. Skipping swap requests.");
    return;
  }

  const swapNotes = [
    "Need coverage",
    "Swap requested",
    "Schedule conflict",
    "Doctor appointment same day",
    "School pickup",
    "Family emergency",
    "Car trouble",
    "Can swap for another day",
    "Prefer morning shift",
    "Prefer closing shift",
  ];

  const SWAP_COUNT = Math.min(60, shifts.length); // can't exceed shifts due to unique(shift_id)

  // pick unique shifts
  const usedShiftIds = new Set();
  const swapRows = [];

  while (swapRows.length < SWAP_COUNT) {
    const s = pick(shifts, rnd);
    if (usedShiftIds.has(s.id)) continue;
    usedShiftIds.add(s.id);

    const requester_id = s.user_id;

    // optional acceptor_id sometimes
    const acceptor_id = rnd() < 0.35 ? pick(associates, rnd).id : null;

    const status = pickWeighted(
      [
        { value: "pending", w: 0.55 },
        { value: "approved", w: 0.20 },
        { value: "denied", w: 0.15 },
        { value: "canceled", w: 0.10 },
      ],
      rnd
    );

    const row = {
      requester_id,
      shift_id: s.id,
      acceptor_id,
      status,
      notes: pick(swapNotes, rnd),
      reviewed_by: null,
      reviewed_at: null,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    };

    if (status === "approved" || status === "denied") {
      row.reviewed_by = pick(reviewers, rnd);
      row.reviewed_at = knex.fn.now();
    }

    swapRows.push(row);
  }

  await knex("shift_swap_requests").insert(swapRows);
  console.log(`08_requests: Inserted ${swapRows.length} shift_swap_requests`);
};