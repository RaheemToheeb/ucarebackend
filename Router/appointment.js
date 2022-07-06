const express = require("express");
const authUser = require("../Utils/authorize");
const router = express.Router();
const {
  createAppointment,
  viewAllAppointments,
  viewAppointment,
  updateAppointmentWithDoctor,
  updateAppointment,
  mailAppointment,
} = require("../Controller/appointment");

router.route("/appointment").get(viewAllAppointments);
router.route("/appointment/:appointmentId").get(viewAppointment);
router
  .route("/:hospitalId/appointment/:appointmentId")
  .patch(updateAppointment);

router
  .route("/:hospitalId/patient/:patientId/appointment")
  .post(createAppointment);
router
  .route("/:hospitalId/appointment/:appointmentId/mail")
  .get(mailAppointment);

module.exports = router;
