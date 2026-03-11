exports.up = function (knex) {
  return knex.schema.createTable("shifts", (tb) => {
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
    tb.date("shift_date").notNullable();
    tb.time("start_time").notNullable();
    tb.time("end_time").notNullable();
    tb
      .integer("created_by")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("RESTRICT");
    tb
      .integer("schedule_week_id")
      .unsigned()
      .references("id")
      .inTable("schedule_weeks")
      .onDelete("SET NULL");

    tb
      .integer("user_id")
      .unsigned()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    tb.index(["user_id"]);
    tb.unique(["store_id", "user_id", "shift_date"]);
    tb.index(["schedule_week_id"]);
    tb
      .enu("status", ["draft", "published", "canceled"])
      .notNullable()
      .defaultTo("draft");
    tb.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    tb.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());
    tb.index(["store_id", "department_id", "shift_date"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("shifts");
};
