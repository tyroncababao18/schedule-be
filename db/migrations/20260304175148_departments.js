exports.up = function (knex) {
    return knex.schema.createTable("departments", (tb) => {
        tb.increments("id").primary();
        tb
            .integer("store_id")
            .unsigned()
            .notNullable()
            .references("id")
            .inTable("stores")
            .onDelete("CASCADE");
        tb.string("name", 80).notNullable();
        tb.unique(["store_id", "name"]);
        tb.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
        tb.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists("departments");
};