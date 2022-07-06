const express = require("express");
const { avatar } = require("../Utils/multer");
const authUser = require("../Utils/authorize");
const router = express.Router();

const {
  createDoctor,
  getAllDoctors,
  getOneDoctor,
  updateDoctor,
  updateDoctorAvatar,
  deleteDoctor,
  signInDoctor,
  verifyDoctor,
} = require("../Controller/doctor");

router
  .route("/:hospitalId/doctor")
  .post(avatar, createDoctor)
  .get(getAllDoctors);

// router.route("/doctor").get(getAllDoctors);

router.get("/:hospitalId/doctor/:doctorId/:token", verifyDoctor);
router.post("/:hospitalId/doctor/login", signInDoctor);

router
  .route("/:hospitalId/doctor/:doctorId")
  .get(getOneDoctor)
  .patch(authUser, avatar, updateDoctor)
  .delete(authUser, deleteDoctor);
router.patch(
  "/:hospitalId/doctor/:doctorId/avatar",
  authUser,
  avatar,
  updateDoctorAvatar
);

module.exports = router;
