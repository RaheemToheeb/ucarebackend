const express = require("express");
const { avatar } = require("../Utils/multer");
const authUser = require("../Utils/authorize");
const router = express.Router();

const {
  createPatient,
  getAllPatients,
  getOnePatient,
  updatePatient,
  updatePatientAvatar,
  deletePatient,
  signInPatient,
  verifyPatient,
} = require("../Controller/patient");

router.route("/:hospitalId/patient").post(createPatient).get(getAllPatients);

router
  .route("/:hospitalId/patient/:patientId")
  .get(getOnePatient)
  .patch(authUser, avatar, updatePatient)
  .delete(authUser, deletePatient);
router.patch(
  "/:hospitalId/patient/:patientId/avatar",
  authUser,
  avatar,
  updatePatientAvatar
);

router.post("/:hospitalId/patient/login", signInPatient);
router.get("/:hospitalId/patient/:patientId/:token", verifyPatient);

module.exports = router;
