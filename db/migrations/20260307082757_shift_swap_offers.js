exports.up = function (knex) {
    return knex.schema.createTable("shift_swap_offers", (tb) => {
        tb.increments("id").primary();
        tb
            .integer("swap_request_id")
            .unsigned()
            .notNullable()
            .references("id")
            .inTable("shift_swap_requests")
            .onDelete("CASCADE");
        tb
            .integer("offered_user_id")
            .unsigned()
            .notNullable()
            .references("id")
            .inTable("users")
            .onDelete("CASCADE");
        tb.timestamp("accepted_at");
        tb.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
        tb.unique(["swap_request_id", "offered_user_id"]);
        tb.index(["swap_request_id"]);
        tb.index(["offered_user_id"]);
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists("shift_swap_offers");
};