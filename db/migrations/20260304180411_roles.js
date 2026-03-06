exports.up = function (knex) {
    return knex.schema.createTable("roles", (tb) => {
        tb.increments("id").primary();
        tb.string("code", 40).notNullable().unique();
        tb.string("name", 80).notNullable().unique();
        tb.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
        tb.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists("roles");
};