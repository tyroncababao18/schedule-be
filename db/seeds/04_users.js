exports.seed = async function (knex) {
  // bcrypt hash for "Password123!"
  const PASSWORD_HASH =
    "$2b$10$k8p7m3mVt1T8r7Zbqg6lLe1d8bWqj1m2oZcFzKkq3wYl5p4nFq6q2";

  const users = [];

  // 1 Admin
  users.push({
    first_name: "Alex",
    last_name: "Admin",
    email: "admin@company.com",
    password_hash: PASSWORD_HASH,
    status: "active",
  });

  // 2 HR
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

  // 2 Coaches
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
    }
  );

  // 4 Team Leads
  for (let i = 1; i <= 4; i++) {
    users.push({
      first_name: `Taylor${i}`,
      last_name: "Lead",
      email: `lead${i}@company.com`,
      password_hash: PASSWORD_HASH,
      status: "active",
    });
  }

  // 32 Associates
  for (let i = 1; i <= 32; i++) {
    users.push({
      first_name: `Associate${i}`,
      last_name: "Demo",
      email: `associate${i}@company.com`,
      password_hash: PASSWORD_HASH,
      status: i % 12 === 0 ? "inactive" : "active",
    });
  }

  await knex("users").insert(users);
};