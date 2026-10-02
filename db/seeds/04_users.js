const bcrypt = require("bcrypt");

exports.seed = async function (knex) {
  const PASSWORD = "Password123!";
  const PASSWORD_HASH = await bcrypt.hash(PASSWORD, 10);

  const DEMO_PASSWORD_HASH = await bcrypt.hash("Demo123!", 10);

  const departments = await knex("departments")
    .select("id", "name")
    .orderBy("id", "asc");

  if (!departments.length) {
    throw new Error("No departments found. Seed departments first.");
  }

  const users = [];

  // Demo Admin
  users.push({
    first_name: "Demo",
    last_name: "Manager",
    email: "demo@company.com",
    password_hash: DEMO_PASSWORD_HASH,
    status: "active",
  });

  // Admin
  users.push({
    first_name: "Alex",
    last_name: "Admin",
    email: "admin@company.com",
    password_hash: PASSWORD_HASH,
    status: "active",
  });

  // HR
  users.push(
    {
      first_name: "Hannah",
      last_name: "HR",
      email: "hr1@company.com",
      password_hash: PASSWORD_HASH,
      status: "active",
    },
    {
      first_name: "Harry",
      last_name: "HR",
      email: "hr2@company.com",
      password_hash: PASSWORD_HASH,
      status: "active",
    }
  );

  // Coaches
  users.push(
    {
      first_name: "Cory",
      last_name: "Coach",
      email: "coach1@company.com",
      password_hash: PASSWORD_HASH,
      status: "active",
    },
    {
      first_name: "Casey",
      last_name: "Coach",
      email: "coach2@company.com",
      password_hash: PASSWORD_HASH,
      status: "active",
    },
    {
      first_name: "Jordan",
      last_name: "Coach",
      email: "coach3@company.com",
      password_hash: PASSWORD_HASH,
      status: "active",
    }
  );

  // Team Leads
  for (let i = 1; i <= Math.max(6, departments.length); i++) {
    users.push({
      first_name: `Taylor${i}`,
      last_name: "Lead",
      email: `lead${i}@company.com`,
      password_hash: PASSWORD_HASH,
      status: "active",
    });
  }

  // --------------------------------------------------
  // Associates
  // 10 associates for EVERY department
  // --------------------------------------------------

  const ASSOCIATES_PER_DEPARTMENT = 10;

  let associateNumber = 1;

  for (const department of departments) {
    for (let i = 1; i <= ASSOCIATES_PER_DEPARTMENT; i++) {
      users.push({
        first_name: `Associate${associateNumber}`,
        last_name: "Demo",
        email: `associate${associateNumber}@company.com`,
        password_hash: PASSWORD_HASH,

        // Make occasional inactive associates
        status: associateNumber % 19 === 0 ? "inactive" : "active",
      });

      associateNumber++;
    }
  }

  // Makes the seed rerunnable without duplicate emails
  await knex("users")
    .insert(users)
    .onConflict("email")
    .merge([
      "first_name",
      "last_name",
      "password_hash",
      "status",
    ]);

  console.log(
    `Seeded ${associateNumber - 1} associates across ${departments.length} departments`
  );
};