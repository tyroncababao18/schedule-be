exports.up = function (knex) {
  return knex.schema.createTable("stores", (tb) => {
    tb.increments("id").primary();
    tb.integer("store_number").notNullable().unique();
    tb.string("name", 120).notNullable();
    tb.string("timezone", 64).notNullable().defaultTo("America/Chicago");
    tb.string("address_line1", 120);
    tb.string("city", 80);
    tb.string("state", 2);
    tb.string("zip", 10);
    tb.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    tb.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("stores");
};