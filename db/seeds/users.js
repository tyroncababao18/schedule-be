const bcrypt = require("bcryptjs");

exports.seed = async function (knex) {
  await knex("shift_swap_offers").del().catch(() => { });
  await knex("shift_swap_requests").del().catch(() => { });
  await knex("time_off_requests").del().catch(() => { });
  await knex("availability_rules").del().catch(() => { });
  await knex("shift_assignments").del().catch(() => { });
  await knex("shifts").del().catch(() => { });
  await knex("user_assignments").del().catch(() => { });
  await knex("departments").del().catch(() => { });
  await knex("stores").del().catch(() => { });
  await knex("roles").del().catch(() => { });
  await knex("users").del();

  const passwordAdmin = await bcrypt.hash("Test123!", 10);
  const passwordTL = await bcrypt.hash("Test123!", 10);
  const passwordAssoc = await bcrypt.hash("Test123!", 10);

  await knex("users").insert([
    {
      id: 1,
      first_name: "test",
      last_name: "1",
      email: "test1@company.com",
      password_hash: passwordAdmin,
      status: "active",
    },
    {
      id: 2,
      first_name: "test",
      last_name: "2",
      email: "test2@company.com",
      password_hash: passwordTL,
      status: "active",
    },
    {
      id: 3,
      first_name: "test",
      last_name: "3",
      email: "test3@company.com",
      password_hash: passwordAssoc,
      status: "active",
    },
  ]);
};