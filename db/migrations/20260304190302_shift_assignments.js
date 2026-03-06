exports.up = function (knex) {
    return knex.schema.createTable("shift_assignments", (tb) => {
        tb.increments("id").primary();
        tb
            .integer("shift_id")
            .unsigned()
            .notNullable()
            .references("id")
            .inTable("shifts")
            .onDelete("CASCADE");
        tb
            .integer("user_id")
            .unsigned()
            .notNullable()
            .references("id")
            .inTable("users")
            .onDelete("CASCADE");
        tb
            .integer("assignment_role_id")
            .unsigned()
            .notNullable()
            .references("id")
            .inTable("roles")
            .onDelete("RESTRICT");
        tb.unique(["shift_id", "user_id"]);
        tb.index(["shift_id"]);
        tb.index(["user_id"]);
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists("shift_assignments");
};