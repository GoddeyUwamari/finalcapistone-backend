const request = require("supertest");
const app = require("../src/app");
const knex = require("../src/db/connection");

describe("Update Reservation API Endpoint", () => {
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

  // Increase the timeout for these tests
  jest.setTimeout(30000); // Set the timeout to 30 seconds

  test("updates a reservation if data is valid", async () => {
    // Insert a test reservation into the database
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

    // Prepare the updated reservation data
    const updatedReservation = {
      full_name: "Updated Name",
      email: "updated@example.com",
      phone_number: "9876543210",
      checkIn_date: "2023-09-01",
      checkOut_date: "2023-09-05",
      type_of_room: "Suite",
      number_of_guest: 2,
      number_of_rooms: 2,
    };

    // Make a request to update the reservation
    const response = await request(app)
      .put(`/reservations/${createdReservation.reservation_id}`)
      .send(updatedReservation);

    // Check if the response status is 200 OK
    expect(response.status).toBe(200);

    // Check if the response body contains the updated reservation data
    expect(response.body.data).toBeDefined();
    expect(response.body.data.full_name).toBe(updatedReservation.full_name);
    expect(response.body.data.email).toBe(updatedReservation.email);
    // Additional assertions based on data
    // ...
  });

  test("returns an error if reservation with ID does not exist", async () => {
    // Prepare the updated reservation data
    const updatedReservation = {
      full_name: "Updated Name",
      email: "updated@example.com",
      phone_number: "9876543210",
      checkIn_date: "2023-09-01",
      checkOut_date: "2023-09-05",
      type_of_room: "Suite",
      number_of_guest: 2,
      number_of_rooms: 2,
    };

    // Make a request to update a reservation with a non-existing ID
    const response = await request(app)
      .put("/reservations/12345")
      .send(updatedReservation);

    // Check if the response status is 404 Not Found
    expect(response.status).toBe(404);

    // Check if the response body contains an error message
    expect(response.body.error).toBe("Reservation not found");
  });
});
