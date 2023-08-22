const request = require("supertest");
const app = require("../src/app"); // Assuming this is your Express app
const knex = require("../src/db/connection"); // Import knex here

describe("Reservation API Endpoints", () => {
  beforeAll(async () => {
    await knex.migrate.latest();
    await knex.seed.run();
  });

  afterAll(async () => {
    await knex.migrate.rollback(null, true);
    await knex.destroy();
  });

  describe("GET /reservations/:id", () => {
    test("returns a specific reservation by ID if it exists", async () => {
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

      const response = await request(app).get(
        `/reservations/${createdReservation.reservation_id}`
      );

      expect(response.status).toBe(200);

      // Check if the response body contains the correct reservation data
      expect(response.body.data).toBeDefined();
      expect(response.body.data.full_name).toBe(testReservation.full_name);
      expect(response.body.data.email).toBe(testReservation.email);
      // Additional assertions based on data
      // ...
    });

    test("returns an error if reservation with ID does not exist", async () => {
      // Make a request to get a reservation with a non-existing ID
      const response = await request(app).get("/reservations/12345");

      // Check if the response status is 404 Not Found
      expect(response.status).toBe(404);

      // Check if the response body contains an error message
      expect(response.body.error).toBe("Reservation not found");
    });
  });
   describe("GET /reservations/:full_name/:phone_number", () => {
     test("returns a list of reservations by full name and phone number", async () => {
       const testFullName = "Test Reservation";
       const testPhoneNumber = "1234567890";

       const response = await request(app).get(
         `/reservations/${testFullName}/${testPhoneNumber}`
       );

       // Check if the response status is 200 OK
       expect(response.status).toBe(200);

       // Check if the response body contains a list of reservations
       expect(response.body.data).toBeDefined();
       expect(Array.isArray(response.body.data)).toBe(true);
       // Additional assertions based on data
       // ...

       // Check if the response body is not empty
       expect(response.body.data.length).toBeGreaterThan(0);
     });

     test("returns a 404 if no reservations match full name and phone number", async () => {
       const nonExistentFullName = "Non Existent Name";
       const nonExistentPhoneNumber = "9876543210";

       const response = await request(app).get(
         `/reservations/${nonExistentFullName}/${nonExistentPhoneNumber}`
       );

       // Check if the response status is 404 Not Found
       expect(response.status).toBe(404);

       // Check if the response body contains an error message
       expect(response.body.error).toBe("No reservations found");
     });
   });
  describe("GET /reservations", () => {
    test("returns a list of reservations", async () => {
      // Make a request to get the list of reservations
      const response = await request(app).get("/reservations");

      // Check if the response status is 200 OK
      expect(response.status).toBe(200);

      // Check if the response body contains a list of reservations
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      // Additional assertions based on data
      // ...
    });
  });

  // Other test cases...
});
