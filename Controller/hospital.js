const hospitalModel = require("../Model/hospital");
const verifiedModel = require("../Model/verified");
const cloudinary = require("../Utils/cloudinary");
const transport = require("../Utils/email");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const { verifyEmailHospital } = require("../Utils/sendMail");

const getAllHospitals = async (req, res) => {
  try {
    const hospital = await hospitalModel.find();
    res.status(200).json({
      message: "success",
      data: hospital,
    });
  } catch (error) {
    res.status(404).json({
      message: error.message,
    });
  }
};

const getOneHospital = async (req, res) => {
  try {
    const hospital = await hospitalModel.findById(req.params.hospitalId);
    res.status(200).json({
      message: "success",
      data: hospital,
    });
  } catch (error) {
    res.status(404).json({
      message: error.message,
    });
  }
};

const populateDoctors = async (req, res) => {
  try {
    const hospital = await hospitalModel
      .findById(req.params.hospitalId)
      .populate("doctors");
    res.status(200).json({
      message: "success",
      data: hospital,
    });
  } catch (error) {
    res.status(404).json({
      message: error.message,
    });
  }
};

const populatePatients = async (req, res) => {
  try {
    const hospital = await hospitalModel
      .findById(req.params.hospitalId)
      .populate("patients");
    res.status(200).json({
      message: "success",
      data: hospital,
    });
  } catch (error) {
    res.status(404).json({
      message: error.message,
    });
  }
};

const populateAppointments = async (req, res) => {
  try {
    const appointments = await hospitalModel
      .findById(req.params.hospitalId)
      .populate("appointments");
    res.status(200).json({
      status: "success",
      data: appointments,
    });
  } catch (error) {
    res.status(404).json({
      message: error.message,
    });
  }
};

const createHospital = async (req, res) => {
  try {
    const {
      UHID,
      hospitalName,
      email,
      password,
      description,
      telephone,
      specializations,
      address,
      city,
    } = req.body;

    const salt = await bcrypt.genSalt(15);
    const hashed = await bcrypt.hash(password, salt);
    const key = await crypto.randomBytes(3).toString("hex");

    const result = await cloudinary.uploader.upload(req.file.path);

    //gen token and OTP for verification
    const genToken = crypto.randomBytes(64).toString("hex");
    const OTP = crypto.randomBytes(3).toString("hex");
    const token = await jwt.sign({ genToken }, process.env.SECRET, {
      expiresIn: process.env.EXPIRES,
    });

    const hospital = await hospitalModel.create({
      UHID,
      hospitalName,
      email,
      password: hashed,
      key: key,
      description,
      telephone,
      specializations,
      address,
      city,
      OTP: OTP,
      verifiedToken: token,
      // verifiedToken: "",
      // isVerify: true,
      logo: result.secure_url,
      logoId: result.public_id,
    });

    //save the token for reference and verification
    // await verifiedModel.create({
    //   token: token,
    //   hospitalId: hospital._id,
    // });

    // await verifyEmailHospital(email, hospital._id, OTP)
    //   .then((data) => {
    //     console.log(data);
    //     res.status(201).json({
    //       status: "Success",
    //       message:
    //         "An OTP has been sent to Your inbox. Check to verify your account.",
    //     });
    //   })
    //   .catch((err) => {
    //     console.log(err.message);
    //   });

    //send verification mail

    localURL = "http://localhost:1201";
    mainURL = "http://localhost:3000";

    const mailOptions = {
      from: "gideonekeke64@gmail.com",
      to: email,
      subject: "Account Verification",
      html: `
      <p>${hospitalName}, confirm your account</p>
      <p >Complete your registration by clicking this <a href="${mainURL}/api/hospital/${hospital._id}/${token}/otp">link</a>.</p>
      <p>Use this code as your OTP: <b>${OTP}</b></p>
      <p>If you did not create this account,please ignore this message.</p>
      `,
    };

    await transport.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.log(err.message);
      } else {
        console.log("Email sent to inbox", info.response);
      }
    });

    // await verifyEmailHospital(email, hospital._id).then((res) => {
    //   console.log(res);
    // });

    res.status(201).json({
      status: "Success",
      message:
        "An OTP has been sent to Your inbox. Please check and verify your account.",
      data: hospital,
    });
  } catch (error) {
    res.status(500).json({
      status: "Failed",
      message: error.message,
    });
  }
};

const verifyHospital = async (req, res) => {
  try {
    const { inputOTP } = req.body;

    const hospital = await hospitalModel.findById(req.params.hospitalId);

    if (hospital) {
      if (hospital.verifiedToken !== "") {
        if (hospital.OTP === inputOTP) {
          await hospitalModel.findByIdAndUpdate(
            hospital._id,
            {
              isVerify: true,
              verifiedToken: "",
              OTP: "",
            },
            { new: true }
          );

          await verifiedModel.findByIdAndUpdate(
            hospital._id,
            { userId: hospital._id, token: "" },
            { new: true }
          );

          res.status(200).json({
            message: "Thank you! Now proceed to login.",
          });
        } else {
          res.status(500).json({
            message: "Incorrect OTP",
          });
        }
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

const signInHospital = async (req, res) => {
  try {
    const { email, password } = req.body;

    const hospital = await hospitalModel.findOne({ email });

    //find user in database/registerd
    if (hospital) {
      //Check for password
      const check = await bcrypt.compare(password, hospital.password);
      if (check) {
        //Check if verified
        if (hospital.isVerify) {
          //create token for hospital data
          const token = jwt.sign(
            {
              _id: hospital._id,
              isVerify: hospital.isVerify,
            },
            process.env.SECRET,
            { expiresIn: process.env.EXPIRES }
          );

          const { password, ...rest } = hospital._doc;

          //send welcome mail
          const mailOptions = {
            from: "no-reply@gmail.com",
            to: email,
            subject: "Welcome to Medic",
            html: `<h1>Hello, ${hospital.fullname},</h1><p>We are glad to have you here. we look forward to offering you the best services in this market.</p>`,
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
          // if (hospital.OTP !== "") {
          //   //gen token and OTP for verification
          //   const genToken = crypto.randomBytes(64).toString("hex");
          //   const OTP = crypto.randomBytes(5).toString("hex");

          //   const token = await jwt.sign({ genToken }, process.env.SECRET, {
          //     expiresIn: process.env.EXPIRES,
          //   });

          //   //send verification mail
          //   const mailOptions = {
          //     from: "no-reply@gmail.com",
          //     to: email,
          //     subject: "Account Verification",
          //     html: `<h1>${hospital.fullname.toUppercase()}, confirm your account</h1><p>Complete your registration by click this <a href="http://localhost:1101/api/hospital/${
          //       hospital._id
          //     }/${token}">link</a>.</p><p>Use the code below as your OTP: <h3>${OTP}</h3></p>`,
          //   };

          //   await transport.sendMail(mailOptions, (err, info) => {
          //     if (err) {
          //       console.log(err.message);
          //     } else {
          //       console.log("Email sent to inbox", info);
          //     }
          //   });

          //   res.status(201).json({
          //     message: "OTP resent to inbox.",
          //   });
          // } else {
          //gen token and OTP for verification
          // const genToken = crypto.randomBytes(64).toString("hex");
          // const token = await jwt.sign({ gentoken }, process.env.SECRET, {
          //   expiresIn: process.env.EXPIRES,
          // });

          // //send verification mail
          // const mailOptions = {
          //   from: "no-reply@gmail.com",
          //   to: email,
          //   subject: "Re-verification",
          //   html: `<h3>${hospital.fullname}, confirm your account</h3><p>Complete your registration by click this <a href="http://localhost:1101/api/hospital/${hospital._id}/${token}">link</a>.</p>`,
          // };

          // await transport.sendMail(mailOptions, (err, info) => {
          //   if (err) {
          //     console.log(err.message);
          //   } else {
          //     console.log("Email re-sent to inbox", info);
          //   }
          // });

          res.status(401).json({
            message: "Not verified",
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

const updateHospital = async (req, res) => {
  try {
    const hospital = await hospitalModel.findById(req.params.hospitalId);

    if (hospital) {
      const newHospital = await hospitalModel.findByIdAndUpdate(
        req.params.hospitalId,
        req.body,
        { new: true }
      );

      res.status(200).json({
        status: "Success",
        data: newHospital,
      });
    } else {
      res.status(404).json({
        message: "Hospital not found",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "Failed",
      message: error.message,
    });
  }
};

const deleteHospital = async (req, res) => {
  try {
    const { password } = req.body;

    const hospital = await hospitalModel.findById(req.params.hospitalId);
    if (hospital) {
      const pass = await bcrypt.compare(password, hospital.password);
      if (pass) {
        await hospitalModel.findByIdAndDelete(req.params.hospitalId);
        res.status(204).json({
          message: "Hospital is Deleted",
        });
      } else {
        res.status(400).json({
          message: "Password is incorrect",
        });
      }
    } else {
      res.status(404).json({
        message: "Hospital not found",
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
        await doctorModel.findByIdAndDelete(doctor._id);
        await hospital.doctors.pull(doctor._id);

        res.status(204).json({
          status: "Success",
          message: "Doctor Deleted",
        });
      } else {
        res.status(404).json({
          message: "Doctor not found",
        });
      }
    } else {
      res.status(404).json({
        message: "Hospital not found",
      });
    }
  } catch (error) {
    res.status(400).json({
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
        await patientModel.findByIdAndDelete(patient._id);
        await hospital.patients.pull(patient._id);
        res.status(204).json({
          status: "Success",
          message: "patient Deleted",
        });
      } else {
        res.status(404).json({
          message: "Patient not found",
        });
      }
    } else {
      res.status(404).json({
        message: "Hospital not found",
      });
    }
  } catch (error) {
    res.status(400).json({
      status: "Failed",
      message: error.message,
    });
  }
};

module.exports = {
  getAllHospitals,
  getOneHospital,
  populateDoctors,
  populatePatients,
  populateAppointments,
  createHospital,
  verifyHospital,
  signInHospital,
  updateHospital,
  deleteHospital,
  deleteDoctor,
  deletePatient,
};
