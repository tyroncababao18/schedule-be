exports.up = function (knex) {
    return knex.schema.createTable("availability_rules", (tb) => {
        tb.increments("id").primary();
        tb
            .integer("user_id")
            .unsigned()
            .notNullable()
            .references("id")
            .inTable("users")
            .onDelete("CASCADE");
        tb.integer("day_of_week").notNullable();
        tb.time("start_time").notNullable();
        tb.time("end_time").notNullable();
        tb
            .enu("type", ["available", "unavailable"])
            .notNullable()
            .defaultTo("available");
        tb.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
        tb.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());
        tb.index(["user_id"]);
        tb.unique(["user_id", "day_of_week", "start_time", "end_time", "type"]);
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists("availability_rules");
};
