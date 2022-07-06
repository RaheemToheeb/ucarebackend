const express = require("express");
const { logo } = require("../Utils/multer");
const authUser = require("../Utils/authorize");
const router = express.Router();

const {
  getAllHospitals,
  getOneHospital,
  createHospital,
  verifyHospital,
  signInHospital,
  updateHospital,
  populateDoctors,
  populatePatients,
  populateAppointments,
  deleteHospital,
  deleteDoctor,
  deletePatient,
} = require("../Controller/hospital");

router.route("/").get(getAllHospitals).post(logo, createHospital);
router.get("/:hospitalId/doctor/all", populateDoctors);
router.get("/:hospitalId/patient/all", populatePatients);
router.get("/:hospitalId/appointment/all", populateAppointments);
router.post("/login", signInHospital);
router.route("/:hospitalId/:token/verify").post(verifyHospital);
router
  .route("/:hospitalId")
  .get(getOneHospital)
  .patch(authUser, updateHospital)
  .delete(authUser, deleteHospital);

router.delete("/:hospitalId/doctor/:doctorId", authUser, deleteDoctor);
router.delete("/:hospitalId/patient/:patientId", authUser, deletePatient);
module.exports = router;
