exports.up = function (knex) {
  return knex.schema.table("reservations", (table) => {
    table.string("full_name");
    table.string("email");
    table.string("phone_number");
    table.date("checkIn_date");
    table.date("checkOut_date");
    table.string("type_of_room");
    table.integer("number_of_guest");
    table.integer("number_of_rooms");
    // Add other columns as needed
  });
};

exports.down = function (knex) {
  return knex.schema.table("reservations", (table) => {
    table.dropColumn("full_name");
    table.dropColumn("email");
    table.dropColumn("phone_number");
    table.dropColumn("checkIn_date");
    table.dropColumn("checkOut_date");
    table.dropColumn("type_of_room");
    table.dropColumn("number_of_guest");
    table.dropColumn("number_of_rooms");
    // Drop other columns as needed
  });
};
