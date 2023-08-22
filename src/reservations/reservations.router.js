const router = require("express").Router();
const controller = require("./reservations.controller");

router.route("/").get(controller.list);
router.route("/").post(controller.create);
router
  .route("/:full_name/:phone_number/")
  .get(controller.getByFullNameAndPhoneNumber);
router.route("/:reservation_id").put(controller.update);
router.route("/:reservation_id").delete(controller.remove); // Add the delete route
router.route("/:id").get(controller.getById);
module.exports = router;
