const appointmentModel = require("../Model/appointment");
const hospitalModel = require("../Model/hospital");
const patientModel = require("../Model/patient");
const doctorModel = require("../Model/doctor");
const mongoose = require("mongoose");
const transport = require("../Utils/email");
const { sendAppointmentMail } = require("../Utils/sendMail");

const createAppointment = async (req, res) => {
  try {
    const {
      patientName,
      patientCase,
      symptoms,
      allergies,
      specialist,
      department,
      brief,
      dateAndTime,
      doctorId,
    } = req.body;

    const hospital = await hospitalModel.findById(req.params.hospitalId);
    if (hospital) {
      const patient = await patientModel.findById(req.params.patientId);
      if (patient) {
        const doctor = await doctorModel.findById(doctorId);
        if (doctor) {
          const appointment = new appointmentModel({
            patientName,
            patientCase,
            symptoms,
            allergies,
            specialist,
            department,
            brief,
            dateAndTime,
            doctor: doctor,
            doctorName: `${doctor.firstName} ${doctor.lastName}`,
            doctorRole: doctor.specialization,
          });

          appointment.patient = patient;
          appointment.hospital = hospital;
          appointment.doctor = doctor;
          appointment.save();

          doctor.appointments.push(mongoose.Types.ObjectId(appointment._id));
          doctor.save();

          hospital.appointments.push(mongoose.Types.ObjectId(appointment._id));
          hospital.save();

          patient.appointments.push(mongoose.Types.ObjectId(appointment._id));
          patient.save();

          res.status(201).json({
            status: "Success",
            data: appointment,
          });
        } else {
          res.status(404).json({
            message: "Doctor not found",
          });
        }
      } else {
        res.status(404).json({
          message: "Patient not found",
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

const viewAllAppointments = async (req, res) => {
  try {
    const appointments = await appointmentModel.find();
    res.status(200).json({
      status: "Success",
      data: appointments,
    });
  } catch (error) {
    res.status(404).json({
      status: "Failed",
      message: error.message,
    });
  }
};

const viewAppointment = async (req, res) => {
  try {
    const appointment = await appointmentModel.findById(
      req.params.appointmentId
    );
    res.status(200).json({
      status: "Success",
      data: appointment,
    });
  } catch (error) {
    res.status(404).json({
      status: "Failed",
      message: error.message,
    });
  }
};

const updateAppointment = async (req, res) => {
  try {
    const hospital = await hospitalModel.findById(req.params.hospitalId);
    const appointment = await appointmentModel.findById(
      req.params.appointmentId
    );
    const patient = await patientModel.findById(appointment.patient);
    const doctor = await doctorModel.findById(appointment.doctor);
    if (hospital) {
      if (patient) {
        if (doctor) {
          if (appointment) {
            const newAppointment = await appointmentModel.findByIdAndUpdate(
              appointment._id,
              req.body,
              { new: true }
            );

            hospital.appointments.pull(
              mongoose.Types.ObjectId(appointment._id)
            );
            hospital.appointments.push(
              mongoose.Types.ObjectId(newAppointment._id)
            );
            hospital.save();

            patient.appointments.pull(mongoose.Types.ObjectId(appointment._id));
            patient.appointments.push(
              mongoose.Types.ObjectId(newAppointment._id)
            );
            patient.save();

            doctor.appointments.pull(mongoose.Types.ObjectId(appointment._id));
            doctor.appointments.push(
              mongoose.Types.ObjectId(newAppointment._id)
            );
            doctor.save();
            res.status(200).json({
              status: "Success",
              data: newAppointment,
            });
          } else {
            res.status(404).json({
              message: "Appointment not found",
            });
          }
        } else {
          res.status(404).json({
            message: "Doctor not found",
          });
        }
      } else {
        res.status(404).json({
          message: "Patient not found",
        });
      }
    } else {
      res.status(404).json({
        status: "Failed",
        message: "Hospital not found",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "Failed",
      message: error,
    });
  }
};

const updateAppointmentWithDoctor = async (req, res) => {
  try {
    const {
      patientName,
      patientCase,
      symptoms,
      allergies,
      specialist,
      department,
      brief,
      date,
      time,
      doctorId,
    } = req.body;
    const hospital = await hospitalModel.findById(req.params.hospitalId);

    if (hospital) {
      const appointment = await appointmentModel.findById(
        req.params.appointmentId
      );
      const doctor = await doctorModel.findById(req.body.doctorId);
      if (doctor) {
        if (appointment) {
          appointment.doctor = doctor;
          appointment.save();

          const newAppointment = await appointmentModel.findByIdAndUpdate(
            appointment._id,
            {
              patientName,
              patientCase,
              symptoms,
              allergies,
              specialist,
              department,
              brief,
              date,
              time,
              doctor: doctor,
              doctorName: `${doctor.firstName} ${doctor.lastName}`,
              doctorRole: doctor.specialization,
            },
            { new: true }
          );

          doctor.appointments.push(mongoose.Types.ObjectId(newAppointment._id));
          doctor.save();

          res.status(200).json({
            status: "Updated",
            data: newAppointment,
          });
        } else {
          res.status(404).json({
            message: "Appointment not found",
          });
        }
      } else {
        res.status(404).json({
          message: "Doctor not found",
        });
      }
    } else {
      res.status(404).json({
        status: "Failed",
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

const mailAppointment = async (req, res) => {
  try {
    const hospital = await hospitalModel.findById(req.params.hospitalId);

    if (hospital) {
      const appointment = await appointmentModel
        .findById(req.params.appointmentId)
        .populate("patient");

      // console.log(appointment.patient.email);
      if (appointment) {
        const patientEmail = appointment.patient.email;
        //send mail
        localURL = "http://localhost:1201";
        mainURL = "http://localhost:3000";
        const mailOptions = {
          from: "gideonekeke64@gmail.com",
          to: patientEmail,
          subject: "Appointment Notification",
          html: `
              <p>Here are the datails of your appointment:</p>
              <p><b>Case:</b> ${appointment.patientCase}</p>
              <p><b>Date:</b> ${appointment.dateAndTime}</p>
              <p><b>Doctor Name:</b> ${appointment.doctorName}</p>
              <p><b>Doctor Specialization:</b> ${appointment.doctorRole}</p>
              <p><b>Department:</b> ${appointment.department}</p>
              <h2>See you there.</h2>
              `,
        };

        // await sendAppointmentMail(appointment, appointment.patient.email)
        //   .then((res) => {
        //     console.log(res);
        //   })
        //   .catch((err) => {
        //     console.log(err);
        //   });
        await transport.sendMail(mailOptions, (err, info) => {
          if (err) {
            console.log(err.message);
          } else {
            console.log("Email sent to inbox", info);
          }
        });
        res.status(200).json({
          status: "Sent",
          message: "Appointment sent to mail. Please check your inbox.",
        });
      } else {
        res.status(404).json({
          message: "Appointment not found",
        });
      }
    } else {
      res.status(404).json({
        status: "Failed",
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

module.exports = {
  createAppointment,
  viewAllAppointments,
  viewAppointment,
  updateAppointmentWithDoctor,
  updateAppointment,
  mailAppointment,
};
