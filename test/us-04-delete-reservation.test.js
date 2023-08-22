const request = require("supertest");
const app = require("../src/app");
const knex = require("../src/db/connection");

describe("Delete Reservation API Endpoint", () => {
  beforeAll(() => {
    return knex.migrate
      .forceFreeMigrationsLock()
      .then(() => knex.migrate.rollback(null, true))
      .then(() => knex.migrate.latest());
  });

  beforeEach(() => {
    return knex.seed.run();
  });

  afterAll(async () => {
    return await knex.migrate.rollback(null, true).then(() => knex.destroy());
  });

  // jest.setTimeout(30000); // Set the timeout to 30 seconds

  test("deletes a reservation if it exists", async () => {
    const testReservation = {
      full_name: "Test Reservation",
      email: "test@example.com",
      phone_number: "1234567890",
      checkIn_date: "2023-08-24",
      checkOut_date: "2023-08-29",
      type_of_room: "Standard",
      number_of_guest: 1,
      number_of_rooms: 1,
    };
    const [createdReservation] = await knex("reservations")
      .insert(testReservation)
      .returning("*");

    // Make a request to delete the reservation
    const response = await request(app).delete(
      `/reservations/${createdReservation.reservation_id}`
    );

    // Check if the response status is 204 No Content
    expect(response.status).toBe(204);

    // Check if the reservation is actually deleted from the database
    const deletedReservation = await knex("reservations")
      .where({ reservation_id: createdReservation.reservation_id })
      .first();
    expect(deletedReservation).toBeUndefined();
  });

  test("returns an error if reservation with ID does not exist", async () => {
    // Make a request to delete a reservation with a non-existing ID
    const response = await request(app).delete("/reservations/12345");

    // Check if the response status is 404 Not Found
    expect(response.status).toBe(404);

    // Check if the response body contains an error message
    expect(response.body.error).toBe("Reservation not found");
  });
});
