exports.seed = async function (knex) {
  await knex.raw(`
    TRUNCATE
      shift_swap_offers,
      shift_swap_requests,
      time_off_requests,
      shift_assignments,
      shifts,
      schedule_weeks,
      user_assignments,
      users,
      departments,
      roles,
      stores
    RESTART IDENTITY CASCADE;
  `);
};