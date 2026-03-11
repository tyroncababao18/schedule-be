exports.seed = async function (knex) {
  const store = await knex("stores").first("id").orderBy("id", "asc");
  const store_id = store.id;

  const names = [
    "OPD / Fulfillment",
    "Front End",
    "Grocery",
    "Produce",
    "Deli",
    "Bakery",
    "Meat & Seafood",
    "Frozen/Dairy",
    "GM",
    "Receiving",
    "Maintenance",
    "Pharmacy",
  ];

  await knex("departments").insert(
    names.map((name) => ({
      store_id,
      name,
    }))
  );
};