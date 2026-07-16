const dotenv = require("dotenv");
dotenv.config();

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {

  // development: {
  //   client: "postgresql",
  //   useNullAsDefault: true,
  //   connection: {
  //     database: process.env.DB_DATABASE_NAME,
  //     user: "postgres",
  //     password: process.env.DEVELOPMENT_DB_PASSWORD,
  //   },
  //   pool: {
  //     min: 0,
  //     max: 20,
  //   },
  //   migrations: {
  //     directory: "./db/migrations",
  //   },
  //   seeds: {
  //     directory: "./db/seeds",
  //   },
  // },

  development: {
    client: "pg",
    connection: {
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
    },
    pool: {
      min: 0,
      max: 20,
    },
    migrations: {
      directory: "./db/migrations",
      tableName: "knex_migrations",
    },
    seeds: {
      directory: "./db/seeds",
    },
  },

  production: {
    client: "pg",
    connection: {
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    },
    pool: { min: 0, max: 20 },
    migrations: {
      directory: "./db/migrations",
      tableName: "knex_migrations",
    },
    seeds: {
      directory: "./db/seeds",
    },
  }

};
