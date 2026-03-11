exports.up = function (knex) {
    return knex.schema.createTable("schedule_weeks", (tb) => {
        tb.increments("id").primary();
        tb
            .integer("store_id")
            .unsigned()
            .notNullable()
            .references("id")
            .inTable("stores")
            .onDelete("CASCADE");
        tb.date("week_start_date").notNullable();
        tb.date("week_end_date").notNullable();
        tb
            .enu("status", ["draft", "published", "locked"])
            .notNullable()
            .defaultTo("draft");
        tb.decimal("total_hours_budget", 10, 2).notNullable().defaultTo(0);
        tb
            .integer("created_by")
            .unsigned()
            .references("id")
            .inTable("users")
            .onDelete("SET NULL");
        tb.unique(["store_id", "week_start_date"]);
        tb.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
        tb.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());
        tb.index(["store_id", "week_start_date"]);
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists("schedule_weeks");
};