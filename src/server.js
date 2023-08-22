const { PORT = 5001 } = process.env;
const app = require("./app");
const knex = require("./db/connection");

knex.migrate
  .latest()
  .then(() => {
    console.log("Database migrations ran successfully.");
    app.listen(PORT, listener);
  })
  .catch((error) => {
    console.error("Database migrations failed:", error);
    knex.destroy();
  });

function listener() {
  console.log(`Listening on Port ${PORT}!`);
}
