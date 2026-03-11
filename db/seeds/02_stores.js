exports.seed = async function (knex) {
  await knex("stores").insert([
    {
      store_number: 1234,
      name: "Walmart Neighborhood Market (Demo)",
      timezone: "America/Chicago",
      address_line1: "123 Demo Rd",
      city: "Houston",
      state: "TX",
      zip: "77001",
    },
  ]);
};