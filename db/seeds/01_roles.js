exports.seed = async function (knex) {
  await knex("roles").insert([
    { code: "ADMIN", name: "Admin" },
    { code: "HR", name: "HR" },
    { code: "COACH", name: "Coach" },
    { code: "TEAM_LEAD", name: "Team Lead" },
    { code: "ASSOCIATE", name: "Associate" },
  ]);
};