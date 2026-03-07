exports.up = function (knex) {
    return knex.schema.createTable("shift_swap_requests", (tb) => {
        tb.increments("id").primary();
        tb
            .integer("requester_id")
            .unsigned()
            .notNullable()
            .references("id")
            .inTable("users")
            .onDelete("CASCADE");
        tb
            .integer("shift_id")
            .unsigned()
            .notNullable()
            .references("id")
            .inTable("shifts")
            .onDelete("CASCADE");
        tb
            .integer("acceptor_id")
            .unsigned()
            .references("id")
            .inTable("users")
            .onDelete("SET NULL");
        tb
            .enu("status", ["pending", "approved", "denied", "canceled"])
            .notNullable()
            .defaultTo("pending");
        tb.string("notes", 255);
        tb
            .integer("reviewed_by")
            .unsigned()
            .references("id")
            .inTable("users")
            .onDelete("SET NULL");
        tb.timestamp("reviewed_at");
        tb.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
        tb.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());
        tb.unique(["shift_id"]);
        tb.index(["requester_id"]);
        tb.index(["acceptor_id"]);
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists("shift_swap_requests");
};