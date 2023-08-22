const request = require("supertest");
const app = require("../src/app");
const knex = require("../src/db/connection");

// Ensure that the database is in a known state before each test
beforeEach(async () => {
  await knex.migrate.rollback();
  await knex.migrate.latest();
});

// Clean up the database after all tests
afterAll(async () => {
  await knex.destroy();
});

describe("Reservation API Endpoints", () => {
  describe("POST /reservations", () => {
    test("creates a new reservation if data is valid", async () => {
      // Prepare the request data for creating a reservation
      const newReservation = {
        full_name: "John Doe",
        email: "john@example.com",
        phone_number: "1234567890",
        checkIn_date: "2023-08-24",
        checkOut_date: "2023-08-29",
        type_of_room: "Suite",
        number_of_guest: 2,
        number_of_rooms: 1,
      };

      // Make a request to create a reservation
      const response = await request(app)
        .post("/reservations")
        .send(newReservation);

      // Check if the response status is 201 Created
      expect(response.status).toBe(201);

      // Check if the response body contains the created reservation data
      expect(response.body.data).toBeDefined();
      expect(response.body.data.full_name).toBe(newReservation.full_name);
      expect(response.body.data.email).toBe(newReservation.email);
      // Additional assertions based on data
      // ...
    });

    test("returns an error if data is invalid", async () => {
      // Prepare invalid reservation data that violates validation rules
      const invalidReservation = {
        full_name: "", // Empty full_name violates validation
        email: "invalid_email", // Invalid email format violates validation
        // Add more fields that violate validation
      };

      // Make a request with invalid data
      const response = await request(app)
        .post("/reservations")
        .send(invalidReservation);

      // Check if the response status is 400 Bad Request
      expect(response.status).toBe(400);

      // Additional assertions based on validation rules
      // ...
    });
  });

  // Other test cases...
});
