exports.up = function (knex) {
    return knex.schema.createTable("time_off_requests", (tb) => {
        tb.increments("id").primary();
        tb
            .integer("user_id")
            .unsigned()
            .notNullable()
            .references("id")
            .inTable("users")
            .onDelete("CASCADE");
        tb.date("start_date").notNullable();
        tb.date("end_date").notNullable();
        tb.time("start_time");
        tb.time("end_time");
        tb.string("reason", 255);
        tb
            .enu("status", ["pending", "approved", "denied"])
            .notNullable()
            .defaultTo("pending");
        tb
            .integer("reviewed_by")
            .unsigned()
            .references("id")
            .inTable("users")
            .onDelete("SET NULL");
        tb.timestamp("reviewed_at");
        tb.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
        tb.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());

        tb.index(["user_id"]);
        tb.index(["status"]);
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists("time_off_requests");
};