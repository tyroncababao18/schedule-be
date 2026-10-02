function makeRng(seed = 12345) {
  let s = seed >>> 0;

  return function rnd() {
    s = (1664525 * s + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

exports.seed = async function (knex) {
  await knex("user_assignments").del();

  const rnd = makeRng(20261002);

  const store = await knex("stores")
    .first("id")
    .orderBy("id", "asc");

  if (!store) {
    throw new Error("No store found.");
  }

  const store_id = store.id;

  const roles = await knex("roles")
    .select("id", "code");

  const roleId = new Map(
    roles.map((role) => [role.code, role.id])
  );

  const departments = await knex("departments")
    .select("id", "name")
    .where({ store_id })
    .orderBy("id", "asc");

  if (!departments.length) {
    throw new Error("No departments found.");
  }

  const deptIds = departments.map((dept) => dept.id);

  const users = await knex("users")
    .select("id", "email", "status")
    .orderBy("id", "asc");

  const assignments = [];

  function assignUser(user_id, role_code, department_id) {
    assignments.push({
      user_id,
      store_id,
      department_id,
      role_id: roleId.get(role_code),
      start_date: knex.fn.now(),
      end_date: null,
    });
  }

  function assignUserToAllDepartments(user_id, role_code) {
    for (const department of departments) {
      assignUser(user_id, role_code, department.id);
    }
  }

  // --------------------------------------------------
  // Find seeded users
  // --------------------------------------------------

  const demo = users.find(
    (u) => u.email === "demo@company.com"
  );

  const admin = users.find(
    (u) => u.email === "admin@company.com"
  );

  const hrUsers = users.filter((u) =>
    u.email.startsWith("hr")
  );

  const coaches = users.filter((u) =>
    u.email.startsWith("coach")
  );

  const leads = users.filter((u) =>
    u.email.startsWith("lead")
  );

  const associates = users.filter((u) =>
    u.email.startsWith("associate")
  );

  if (!demo) {
    throw new Error("Demo account not found.");
  }

  if (!admin) {
    throw new Error("Admin account not found.");
  }

  // --------------------------------------------------
  // Demo + Admin
  // Full access
  // --------------------------------------------------

  assignUserToAllDepartments(demo.id, "ADMIN");
  assignUserToAllDepartments(admin.id, "ADMIN");

  // --------------------------------------------------
  // HR
  // HR can access all departments
  // --------------------------------------------------

  for (const hr of hrUsers) {
    assignUserToAllDepartments(hr.id, "HR");
  }

  // --------------------------------------------------
  // Coaches
  // Split departments between coaches
  // --------------------------------------------------

  for (let i = 0; i < departments.length; i++) {
    const coach = coaches[i % coaches.length];

    assignUser(
      coach.id,
      "COACH",
      departments[i].id
    );
  }

  // --------------------------------------------------
  // Team Leads
  // One primary department per lead
  // --------------------------------------------------

  for (let i = 0; i < leads.length; i++) {
    const department =
      departments[i % departments.length];

    assignUser(
      leads[i].id,
      "TEAM_LEAD",
      department.id
    );
  }

  // --------------------------------------------------
  // Associates
  //
  // Each associate gets ONE department.
  // --------------------------------------------------

  for (let i = 0; i < associates.length; i++) {
    const associate = associates[i];

    const department =
      departments[i % departments.length];

    assignUser(
      associate.id,
      "ASSOCIATE",
      department.id
    );
  }

  await knex("user_assignments")
    .insert(assignments);

  console.log(
    `Created ${assignments.length} user assignments`
  );

  console.log(
    `Assigned ${associates.length} associates across ${departments.length} departments`
  );
};