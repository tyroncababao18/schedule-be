exports.up = function (knex) {
    return knex.schema.createTable("shift_templates", (tb) => {
        tb.increments("id").primary();
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
        tb.string("name", 80).notNullable();
        tb.integer("day_of_week").notNullable();
        tb.time("start_time").notNullable();
        tb.time("end_time").notNullable();
        tb.integer("default_required_people").notNullable().defaultTo(1);
        tb.date("active_from");
        tb.date("active_to");
        tb.unique(["store_id", "department_id", "name"]);
        tb.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
        tb.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists("shift_templates");
};