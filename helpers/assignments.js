const db = require("../db/knex");

async function getAllowedDepartmentIds({ store_id, user_id }) {
  const rows = await db("user_assignments as ua")
    .select("ua.department_id")
    .where("ua.store_id", store_id)
    .where("ua.user_id", user_id)
    .whereNull("ua.end_date");

  return new Set(rows.map((r) => r.department_id));
}


module.exports = { getAllowedDepartmentIds };