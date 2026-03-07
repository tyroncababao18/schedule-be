exports.up = function (knex) {
    return knex.schema.createTable("user_assignments", (tb) => {
        tb.increments("id").primary();
        tb
            .integer("user_id")
            .unsigned()
            .notNullable()
            .references("id")
            .inTable("users")
            .onDelete("CASCADE");
        tb
            .integer("store_id")
            .unsigned()
            .notNullable()
            .references("id")
            .inTable("stores")
            .onDelete("CASCADE");
        tb
            .integer("department_id")
            .unsigned()
            .notNullable()
            .references("id")
            .inTable("departments")
            .onDelete("CASCADE");
        tb
            .integer("role_id")
            .unsigned()
            .notNullable()
            .references("id")
            .inTable("roles")
            .onDelete("CASCADE");
        tb.date("start_date").notNullable().defaultTo(knex.fn.now());
        tb.date("end_date");
        tb.unique(["user_id", "store_id", "department_id", "role_id", "start_date"]);
        tb.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
        tb.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists("user_assignments");
};