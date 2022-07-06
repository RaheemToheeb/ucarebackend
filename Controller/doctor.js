const doctorModel = require("../Model/doctor");
const hospitalModel = require("../Model/hospital");
const bcrypt = require("bcrypt");
const cloudinary = require("../Utils/cloudinary");
const mongoose = require("mongoose");
const transport = require("../Utils/email");
const crypto = require("crypto");
require("dotenv").config();
const jwt = require("jsonwebtoken");

const createDoctor = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      inputKey,
      telephone,
      specialization,
      DOB,
      bio,
      address,
      city,
      gender,
    } = req.body;
    const hospital = await hospitalModel.findById(req.params.hospitalId);
    if (hospital) {
      //check if hospital unique key matches input key
      const hospitalKey = hospital.key;
      if (hospitalKey === inputKey) {
        //create the doctor

        //gen token and OTP for verification
        const genToken = crypto.randomBytes(64).toString("hex");

        const token = await jwt.sign({ genToken }, process.env.SECRET, {
          expiresIn: process.env.EXPIRES,
        });

        const salt = await bcrypt.genSalt(15);
        const hashed = await bcrypt.hash(password, salt);

        // const result = await cloudinary.uploader.upload(req.file.path);

        const doctor = new doctorModel({
          firstName,
          lastName,
          email,
          // telephone,
          // specialization,
          // DOB,
          // bio,
          // gender,
          // address,
          // city,
          verifiedToken: "",
          isVerify: true,
          password: hashed,
          inputKey,

          // avatar: result.secure_url,
          // avatarId: result.public_id,
        });

        doctor.hospital = hospital;
        doctor.save();

        hospital.doctors.push(mongoose.Types.ObjectId(doctor._id));
        hospital.save();

        //send verification mail

        localURL = "http://localhost:1201";
        mainURL = "http://localhost:3000";
        const mailOptions = {
          from: "nelsonelaye@hotmail.com",
          to: email,
          subject: "Account Verification",
          html: `
      <h3>${firstName}, confirm your account</h3>
      <p>Complete your registration by click this <a href="${mainURL}/api/hospital/${hospital._id}/doctor/${doctor._id}/${token}">link</a>.</p>
  
      <p>If you did not create this account,please ignore this message.</p>
      `,
        };

        // await transport.sendMail(mailOptions, (err, info) => {
        //   if (err) {
        //     console.log(err.message);
        //   } else {
        //     console.log("Email sent to inbox", info);
        //   }
        // });
        res.status(201).json({
          status: "Success",
          // message:
          //   "An email has been sent to your inbox to verify your account.",
          data: doctor,
        });
      } else {
        res.status(400).json({
          message: "Hospital key is incorrect",
        });
      }
    } else {
      res.status(404).json({
        message: "Hospital does not exist",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "Failed",
      message: error.message,
    });
  }
};

const verifyDoctor = async (req, res) => {
  try {
    const doctor = await doctorModel.findById(req.params.doctorId);

    if (doctor) {
      if (doctor.verifiedToken !== "") {
        await doctorModel.findByIdAndUpdate(
          doctor._id,
          {
            isVerify: true,
            verifiedToken: "",
          },
          { new: true }
        );

        // await verifiedModel.findByIdAndUpdate(
        //   doctor._id,
        //   { userId: doctor._id, token: "" },
        //   { new: true }
        // );

        res.status(201).json({
          message: "Thank you! Now proceed to login.",
        });
      } else {
        res.status(500).json({
          message: "You are not verified to take this action",
        });
      }
    } else {
      res.status(404).json({
        message: "Sorry, you cannot access this page.",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const signInDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;

    const doctor = await doctorModel.findOne({ email: email });
    const hospital = await hospitalModel.findById(req.params.hospitalId);
    if (hospital) {
      if (doctor) {
        if (doctor.inputKey == hospital.key) {
          //Check for password
          const check = await bcrypt.compare(password, doctor.password);
          if (check) {
            //Check if verified
            if (doctor.isVerify && doctor.verifiedToken == "") {
              //create token for doctor data
              const token = jwt.sign(
                {
                  _id: doctor._id,
                  isVerify: doctor.isVerify,
                },
                process.env.SECRET,
                { expiresIn: process.env.EXPIRES }
              );

              const { password, ...rest } = doctor._doc;

              //send welcome mail
              const mailOptions = {
                from: "nelsonelaye@hotmail.com",
                to: email,
                subject: "Welcome to U-Care",
                html: `<h1>Hello, ${doctor.fullname},</h1><p>We are glad to have you here. we look forward to offering you the best services in this market.</p>`,
              };

              // await transport.sendMail(mailOptions, (err, info) => {
              //   if (err) {
              //     console.log(err.message);
              //   }
              // });

              res.status(200).json({
                status: "Success",
                data: { token, ...rest },
              });
            } else {
              // gen token and OTP for verification
              const genToken = crypto.randomBytes(64).toString("hex");
              const token = await jwt.sign({ genToken }, process.env.SECRET, {
                expiresIn: process.env.EXPIRES,
              });

              //send verification mail

              const localURL = "http://localhost:1101";
              const mainURL = "";
              const mailOptions = {
                from: "nelsonelaye@hotmail.com",
                to: email,
                subject: "Re-verification",
                html: `<h3>${doctor.fullname}, confirm your account</h3><p>Complete your registration by click this <a href="${localURL}/api/doctor/${doctor._id}/${token}">link</a>.</p>
          <p>Ignore this message if you did not make this request.</p>`,
              };

              await transport.sendMail(mailOptions, (err, info) => {
                if (err) {
                  console.log(err.message);
                } else {
                  console.log("Email re-sent to inbox", info);
                }
              });

              res.status(201).json({
                message:
                  "You're not verified yet. Please check your mail for verification link.",
              });
            }
            // }
          } else {
            res.status(400).json({
              message: "Password is incorrect",
            });
          }
        } else {
          res.status(404).json({
            message: "You are not registered under this hospital",
          });
        }
      } else {
        res.status(404).json({
          message: "User not found",
        });
      }
    } else {
      res.status(404).json({
        message: "hospital not found",
      });
    }
    //find user in database/registerd
  } catch (error) {
    res.status(500).json({
      status: "Failed",
      message: error.message,
    });
  }
};

const getAllDoctors = async (req, res) => {
  try {
    const doctors = await doctorModel.find();
    res.status(200).json({
      status: "Success",
      data: doctors,
    });
  } catch (error) {
    res.status(404).json({
      status: "Failed",
      message: error.message,
    });
  }
};

const getOneDoctor = async (req, res) => {
  try {
    const hospital = await hospitalModel.findById(req.params.hospitalId);
    if (hospital) {
      const doctor = await (
        await doctorModel.findById(req.params.doctorId)
      ).populate("appointments");

      res.status(200).json({
        status: "Success",
        data: doctor,
      });
    } else {
      res.status(404).json({
        message: "Hospital does not exist",
      });
    }
  } catch (error) {
    res.status(404).json({
      status: "Failed",
      message: error.message,
    });
  }
};

const updateDoctor = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      telephone,
      specialization,
      DOB,
      bio,
      address,
      city,
      gender,
    } = req.body;
    const hospital = await hospitalModel.findById(req.params.hospitalId);
    if (hospital) {
      const doctor = await doctorModel.findById(req.params.doctorId);
      if (doctor) {
        // await cloudinary.uploader.destroy(doctor.avatarId);
        const result = await cloudinary.uploader.upload(req.file.path);

        const newDoctor = await doctorModel.findByIdAndUpdate(
          doctor._id,
          {
            firstName,
            lastName,
            telephone,
            specialization,
            DOB,
            bio,
            address,
            city,
            gender,
            avatar: result.secure_url,
            avatarId: result.public_id,
          },
          { new: true }
        );

        hospital.doctors.pull(mongoose.Types.ObjectId(doctor._id));
        hospital.doctors.push(mongoose.Types.ObjectId(newDoctor._id));

        res.status(201).json({
          status: "Success",
          data: newDoctor,
        });
      } else {
        res.status(404).json({
          message: "Doctor not found",
        });
      }
    } else {
      res.status(404).json({
        message: "Hospital does not exist",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "Failed",
      message: error.message,
    });
  }
};

const updateDoctorAvatar = async (req, res) => {
  try {
    const hospital = await hospitalModel.findById(req.params.hospitalId);
    if (hospital) {
      const doctor = await doctorModel.findById(req.params.doctorId);
      if (doctor) {
        // await cloudinary.uploader.destroy(doctor.avatarId);
        const result = await cloudinary.uploader.upload(req.file.path);

        const newDoctor = await doctorModel.findByIdAndUpdate(
          doctor._id,
          { avatar: result.secure_url, avatarId: result.public_id },
          { new: true }
        );

        res.status(201).json({
          status: "Success",
          data: newDoctor,
        });
      } else {
        res.status(404).json({
          message: "Doctor not found",
        });
      }
    } else {
      res.status(404).json({
        message: "Hospital does not exist",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "Failed",
      message: error.message,
    });
  }
};

const deleteDoctor = async (req, res) => {
  try {
    const hospital = await hospitalModel.findById(req.params.hospitalId);
    if (hospital) {
      const doctor = await doctorModel.findById(req.params.doctorId);
      if (doctor) {
        if (req.user.isAdmin) {
          await doctorModel.findByIdAndDelete(req.params.doctorId);

          res.status(204).json({
            status: "Success",
            message: "Doctor deleted",
          });
        } else {
          res.status(400).json({
            message: "You cannot perform this action. Not an admin",
          });
        }
      } else {
        res.status(404).json({
          message: "Doctor not found",
        });
      }
    } else {
      res.status(404).json({
        message: "Hospital does not exist",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "Failed",
      message: error.message,
    });
  }
};
module.exports = {
  createDoctor,
  getAllDoctors,
  signInDoctor,
  verifyDoctor,
  getOneDoctor,
  updateDoctor,
  updateDoctorAvatar,
  deleteDoctor,
};
