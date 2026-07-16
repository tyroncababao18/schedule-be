function pickMany(arr, count, rnd) {
  const copy = [...arr];
  const out = [];
  while (out.length < count && copy.length) {
    const idx = Math.floor(rnd() * copy.length);
    out.push(copy.splice(idx, 1)[0]);
  }
  return out;
}



function makeRng(seed = 12345) {
  let s = seed >>> 0;
  return function rnd() {
    s = (1664525 * s + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

exports.seed = async function (knex) {
  await knex("user_assignments").del();

  const rnd = makeRng(20260312);

  const store = await knex("stores").first("id").orderBy("id", "asc");
  const store_id = store.id;

  const roles = await knex("roles").select("id", "code");
  const roleId = new Map(roles.map((r) => [r.code, r.id]));

  const departments = await knex("departments").select("id", "name").where({ store_id });
  const deptIds = departments.map((d) => d.id);

  const users = await knex("users").select("id", "email").orderBy("id", "asc");

  const assignments = [];

  function assignUserToDepts(user_id, role_code, dept_list) {
    for (const department_id of dept_list) {
      assignments.push({
        user_id,
        store_id,
        department_id,
        role_id: roleId.get(role_code),
        start_date: knex.fn.now(),
        end_date: null,
      });
    }
  }

  // Identify by email pattern
  const demo = users.find((u) => u.email === "demo@company.com");
  const admin = users.find((u) => u.email === "admin@company.com");
  const hrUsers = users.filter((u) => u.email.startsWith("hr"));
  const coaches = users.filter((u) => u.email.startsWith("coach"));
  const leads = users.filter((u) => u.email.startsWith("lead"));
  const associates = users.filter((u) => u.email.startsWith("associate"));

  // Demo: full access to all departments
  if (!demo) {
    throw new Error("Demo user was not found. Run the users seed first.");
  }

  assignUserToDepts(demo.id, "ADMIN", deptIds);

  // Admin: all depts
  assignUserToDepts(admin.id, "ADMIN", deptIds);

  const deptByName = new Map(departments.map((d) => [d.name, d.id]));
  const coreHR = [
    deptByName.get("OPD / Fulfillment"),
    deptByName.get("Front End"),
    deptByName.get("Receiving"),
  ].filter(Boolean);

  for (const u of hrUsers) {
    const extra = pickMany(deptIds.filter((x) => !coreHR.includes(x)), 1, rnd);
    assignUserToDepts(u.id, "HR", [...coreHR, ...extra]);
  }

  for (let i = 0; i < coaches.length; i++) {
    const slice = deptIds.filter((_, idx) => idx % coaches.length === i);
    assignUserToDepts(coaches[i].id, "COACH", slice);
  }

  for (const u of leads) {
    const depts = pickMany(deptIds, 3, rnd);
    assignUserToDepts(u.id, "TEAM_LEAD", depts);
  }

  for (const u of associates) {
    const count = rnd() < 0.35 ? 2 : 1;
    const depts = pickMany(deptIds, count, rnd);
    assignUserToDepts(u.id, "ASSOCIATE", depts);
  }

  await knex("user_assignments").insert(assignments);
};