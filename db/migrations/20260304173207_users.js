exports.up = function (knex) {
    return knex.schema.createTable("users", (tb) => {
        tb.increments("id").primary();
        tb.string("first_name", 50).notNullable();
        tb.string("last_name", 50).notNullable();
        tb.string("email", 255).notNullable().unique();
        tb.string("password_hash", 255).notNullable();
        tb.enu("status", ["active", "inactive"], {
            useNative: true,
            enumName: "user_status"
        })
            .notNullable()
            .defaultTo("active");

        tb.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
        tb.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema
        .dropTableIfExists("users")
        .then(() => knex.raw('DROP TYPE IF EXISTS "user_status"'));
};