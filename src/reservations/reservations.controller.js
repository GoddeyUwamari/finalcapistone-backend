const { body, validationResult } = require("express-validator");
const knex = require("../db/connection");

// List handler for all reservation resources
async function list(req, res) {
  try {
    const reservations = await knex("reservations").select("*");
    res.json({
      data: reservations,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while fetching reservations." });
  }
}
async function getById(req, res, next) {
  try {
    const reservationId = req.params.id;

    if (
      !Number.isInteger(Number(reservationId)) ||
      Number(reservationId) <= 0
    ) {
      return res.status(400).json({ error: "Invalid reservation ID" });
    }

    const reservation = await knex("reservations")
      .select("*")
      .where({ reservation_id: reservationId })
      .first();

    if (!reservation) {
      return res.status(404).json({ error: "Reservation not found" });
    }

    res.json({ data: reservation });
  } catch (error) {
    next(error);
  }
}


async function getByFullNameAndPhoneNumber(req, res) {
  try {
    const { full_name, phone_number } = req.params;

    const reservations = await knex("reservations")
      .select("*")
      .where(function () {
        if (full_name && phone_number) {
          this.where("full_name", "ilike", `%${full_name}%`).andWhere(
            "phone_number",
            phone_number
          );
        } else if (full_name) {
          this.where("full_name", "ilike", `%${full_name}%`);
        } else if (phone_number) {
          this.where("phone_number", phone_number);
        }
      });

    if (reservations.length === 0) {
      return res.status(404).json({ error: "No reservations found" });
    }

    res.json({
      data: reservations,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while fetching reservations." });
  }
}

// Create a reservation
async function create(req, res, next) {
  // Validate the input using express-validator
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const {
      full_name,
      email,
      phone_number,
      checkIn_date,
      checkOut_date,
      type_of_room,
      number_of_guest,
      number_of_rooms,
    } = req.body;

    // Insert the reservation into the database
    const [reservation] = await knex("reservations")
      .insert({
        full_name,
        email,
        phone_number,
        checkIn_date,
        checkOut_date,
        type_of_room,
        number_of_guest,
        number_of_rooms,
      })
      .returning("*");

    res.status(201).json({ data: reservation });
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  // Validate the input using express-validator
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const reservationId = req.params.reservation_id; // Corrected line
    console.log(reservationId);
    const {
      full_name,
      email,
      phone_number,
      checkIn_date,
      checkOut_date,
      type_of_room,
      number_of_guest,
      number_of_rooms,
    } = req.body;

    // Update the reservation in the database
    const [updatedReservation] = await knex("reservations")
      .where({ reservation_id: reservationId }) // Use the correct column name here
      .update({
        full_name: full_name,
        email: email,
        phone_number: phone_number,
        checkIn_date: checkIn_date,
        checkOut_date: checkOut_date,
        type_of_room: type_of_room,
        number_of_guest: number_of_guest,
        number_of_rooms: number_of_rooms,
      })
      .returning("*");

    if (!updatedReservation) {
      return res.status(404).json({ error: "Reservation not found" });
    }

    res.status(200).json({ data: updatedReservation });
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    const reservationId = req.params.reservation_id; // Corrected line

    // Delete the reservation from the database
    const deletedRows = await knex("reservations")
      .where({ reservation_id: reservationId })
      .del();

    if (!deletedRows) {
      return res.status(404).json({ error: "Reservation not found" });
    }

    res.status(204).end(); // 204 No Content
  } catch (error) {
    next(error);
  }
}

module.exports = {
  list,
  getById,
  getByFullNameAndPhoneNumber,
  create: [
    body("full_name").notEmpty().trim(),
    body("email").isEmail(),
    body("phone_number").isMobilePhone(),
    body("checkIn_date").isISO8601(),
    body("checkOut_date").isISO8601(),
    body("type_of_room").notEmpty().trim(),
    body("number_of_guest").isInt({ min: 1 }),
    body("number_of_rooms").isInt({ min: 1 }),
    create, // Call the create function after validation
  ],
  update: [
    body("full_name").notEmpty().trim(),
    body("email").isEmail(),
    body("phone_number").isMobilePhone(),
    body("checkIn_date").isISO8601(),
    body("checkOut_date").isISO8601(),
    body("type_of_room").notEmpty().trim(),
    body("number_of_guest").isInt({ min: 1 }),
    body("number_of_rooms").isInt({ min: 1 }),
    update,
  ],
  getById,
  remove,
};
