const patientModel = require("../Model/patient");
const hospitalModel = require("../Model/hospital");
const maleModel = require("../Model/male");
const femaleModel = require("../Model/female");
const bcrypt = require("bcrypt");
const cloudinary = require("../Utils/cloudinary");
const mongoose = require("mongoose");
const transport = require("../Utils/email");
const crypto = require("crypto");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const { verifyEmailPatient, resendEmailPatient } = require("../Utils/sendMail");

const createPatient = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      telephone,
      password,
      DOB,
      bloodGroup,
      gender,
      city,
      address,
    } = req.body;
    const hospital = await hospitalModel.findById(req.params.hospitalId);
    if (hospital) {
      //gen token and OTP for verification
      const genToken = crypto.randomBytes(64).toString("hex");
      const token = await jwt.sign({ genToken }, process.env.SECRET, {
        expiresIn: process.env.EXPIRES,
      });

      //create the patient
      const salt = await bcrypt.genSalt(15);
      const hashed = await bcrypt.hash(password, salt);

      // const result = await cloudinary.uploader.upload(req.file.path);

      const patient = new patientModel({
        firstName,
        lastName,
        email,
        password: hashed,
        verifiedToken: "",
        isVerify: true,
      });

      patient.hospital = hospital;
      patient.save();

      hospital.patients.push(mongoose.Types.ObjectId(patient._id));
      hospital.save();

      localURL = "http://localhost:1201";
      mainURL = "http://localhost:3000";
      const mailOptions = {
        from: "nelsonelaye@hotmail.com",
        to: email,
        subject: "Account Verification",
        html: `
      <p>${firstName}, confirm your account</p>
      <p>Complete your registration by click this <a href="${mainURL}/api/hospital/${hospital._id}/patient/${patient._id}/${token}">link</a>.</p>
  
      <p>If you did not create this account,please ignore this message.</p>
      `,
      };

      // await transport.sendMail(mailOptions, (err, info) => {
      //   if (err) {
      //     console.log(err.message);
      //   } else {
      //     console.log("Email sent to inbox", info.response);
      //   }
      // });

      // await verifyEmailPatient(email, hospital._id, patient._id).then((res) => {
      //   console.log(res);
      // });

      res.status(201).json({
        status: "Success",
        // message: "An email has been sent to your inbox to verify your account.",
        data: patient,
      });
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

const verifyPatient = async (req, res) => {
  try {
    const patient = await patientModel.findById(req.params.patientId);

    if (patient) {
      if (patient.verifiedToken !== "") {
        await patientModel.findByIdAndUpdate(
          patient._id,
          {
            isVerify: true,
            verifiedToken: "",
          },
          { new: true }
        );

        res.status(200).json({
          status: "success",
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

const signInPatient = async (req, res) => {
  try {
    const { email, password } = req.body;

    const patient = await patientModel.findOne({ email });
    const hospital = await hospitalModel.findById(req.params.hospitalId);

    //find user in database/registerd
    if (patient) {
      if (hospital) {
        // if (patient.hospital === hospital._id) {
        //Check for password
        const check = await bcrypt.compare(password, patient.password);
        if (check) {
          //Check if verified
          if (patient.isVerify && patient.verifiedToken == "") {
            //create token for patient data
            const token = jwt.sign(
              {
                _id: patient._id,
                isVerify: patient.isVerify,
              },
              process.env.SECRET,
              { expiresIn: process.env.EXPIRES }
            );

            const { password, ...rest } = patient._doc;

            //send welcome mail
            const mailOptions = {
              from: "nelsonelaye@hotmail.com",
              to: email,
              subject: "Welcome to U-Care",
              html: `<h1>Hello, ${patient.fullname},</h1><p>We are glad to have you here. we look forward to offering you the best services in this market.</p>`,
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

            const localURL = "http://localhost:1201";
            const mainURL = "http://localhost:3000";
            const mailOptions = {
              from: "nelsonelaye@hotmail.com",
              to: email,
              subject: "Re-verification",
              html: `<h3>${patient.fullname}, confirm your account</h3><p>Complete your registration by click this <a href="${mainURL}/api/hospital/${patient.hospital}/patient/${patient._id}/${token}">link</a>.</p>
            <p>Ignore this message if you did not make this request.</p>`,
            };

            // await transport.sendMail(mailOptions, (err, info) => {
            //   if (err) {
            //     console.log(err.message);
            //   } else {
            //     console.log("Email re-sent to inbox", info);
            //   }
            // });

            // await resendEmailPatient(email, patient.hospital, patient._id).then(
            //   (res) => {
            //     console.log(res);
            //   }
            // );

            res.status(401).json({
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
        // } else {
        //   res.status(404).json({
        //     message: "You are not registered under this hospital",
        //   });
        // }
      } else {
        res.status(404).json({
          message: "Hospital not found",
        });
      }
    } else {
      res.status(404).json({
        message: "User not found",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "Failed",
      message: error.message,
    });
  }
};

const getAllPatients = async (req, res) => {
  try {
    const patients = await patientModel.find();
    res.status(200).json({
      status: "Success",
      data: patients,
    });
  } catch (error) {
    res.status(404).json({
      status: "Failed",
      message: error.message,
    });
  }
};

const getOnePatient = async (req, res) => {
  try {
    const hospital = await hospitalModel.findById(req.params.hospitalId);
    if (hospital) {
      const patient = await patientModel
        .findById(req.params.patientId)
        .populate("appointments");

      res.status(200).json({
        status: "Success",
        data: patient,
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

const updatePatient = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      telephone,
      DOB,
      bloodGroup,
      gender,
      city,
      weight,
      height,
      address,
    } = req.body;
    const hospital = await hospitalModel.findById(req.params.hospitalId);
    if (hospital) {
      const patient = await patientModel.findById(req.params.patientId);
      if (patient) {
        const result = await cloudinary.uploader.upload(req.file.path);

        //classify gender
        let maleRegex = /male/i;
        let maleCheck = maleRegex.test(gender);
        let femaleRegex = /female/i;
        let femaleCheck = femaleRegex.test(gender);

        if (maleCheck) {
          const male = await maleModel.create({ userId: patient._id });
          hospital.males.push(mongoose.Types.ObjectId(patient._id));
          const isMale = true;
        } else if (femaleCheck) {
          const female = await maleModel.create({ userId: patient._id });
          hospital.females.push(mongoose.Types.ObjectId(patient._id));
          const isFemale = true;
        }
        const newPatient = await patientModel.findByIdAndUpdate(
          patient._id,
          {
            firstName,
            lastName,
            telephone,
            DOB,
            bloodGroup,
            gender,
            city,
            weight,
            height,
            address,
            avatar: result.secure_url,
            avatarId: result.public_id,
          },
          { new: true }
        );

        res.status(201).json({
          status: "Success",
          data: newPatient,
        });
      } else {
        res.status(404).json({
          message: "Patient does not exist",
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

const updatePatientAvatar = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      telephone,
      DOB,
      bloodGroup,
      gender,
      city,
      address,
    } = req.body;
    const hospital = await hospitalModel.findById(req.params.hospitalId);
    if (hospital) {
      const patient = await patientModel.findById(req.params.patientId);
      if (patient) {
        // await cloudinary.uploader.destroy(patient.avatarId);
        const result = await cloudinary.uploader.upload(req.file.path);
        const newPatient = await patientModel.findByIdAndUpdate(
          patient._id,
          {
            avatar: result.secure_url,
            avatarId: result.public_id,
          },
          { new: true }
        );

        res.status(201).json({
          status: "Success",
          data: newPatient,
        });
      } else {
        res.status(404).json({
          message: "Patient does not exist",
        });
      }
    } else {
      res.status(404).json({
        message: "Hospital does not exist",
      });
    }
  } catch (error) {
    // console.log(error);
    res.status(500).json({
      status: "Failed",
      message: error.message,
    });
  }
};

const deletePatient = async (req, res) => {
  try {
    const hospital = await hospitalModel.findById(req.params.hospitalId);
    if (hospital) {
      const patient = await patientModel.findById(req.params.patientId);
      if (patient) {
        if (req.user.isAdmin) {
          await patientModel.findByIdAndDelete(patient._id);

          res.status(204).json({
            status: "Success",
            message: "Patient deleted",
          });
        } else {
          res.status(500).json({
            message: "Your cannot perform this action. Not an admin",
          });
        }
      } else {
        res.status(404).json({
          message: "Patient does not exist",
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
  createPatient,
  getAllPatients,
  getOnePatient,
  updatePatient,
  updatePatientAvatar,
  deletePatient,
  signInPatient,
  verifyPatient,
};
