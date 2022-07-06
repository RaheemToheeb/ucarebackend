const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const fs = require("fs");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
require("dotenv").config();
const jwt = require("jsonwebtoken");

const CLIENT_ID =
  "971811956963-k34vrcup19hbi09ulvss4td5e31qle54.apps.googleusercontent.com";
const CLIENT_SECRET = "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";
const REFRESH_TOKEN =
  "1//04QonMGgbETo6CgYIARAAGAQSNwF-L9IrqAvCwjnnnvTeP86huJxmS0lB_1VZR7B9-z5aGMi0G3_QMjf4vTxgUiEM6HxX-dFtfK8";
const CLIENT_REDIRECT = "https://developers.google.com/oauthplayground";
const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  CLIENT_REDIRECT
);

oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const verifyEmailPatient = async (email, hospital, patient) => {
  try {
    // const accessToken = await oAuth2Client.getAccessToken();
    // console.log(createToken);

    //gen token and OTP for verification
    const genToken = crypto.randomBytes(64).toString("hex");
    const token = await jwt.sign({ genToken }, process.env.SECRET, {
      expiresIn: process.env.EXPIRES,
    });

    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: "ucare.service123@gmail.com",
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refresh_token: REFRESH_TOKEN,
        accessToken:
          "ya29.A0ARrdaM-7jFolabrWVZFZHY-0-R2rlOsABGpV2iBA89MPweviu2gQ2yqWiaMAxxnjelqm3q-qaKyOPlhHf3MZDNG1SFXAG1JvrNa8fuYFTfYZHNv1MloAZSVEQ5_6lOi0hNBUdTExBHm7BqGGW_vTYNwb_Hh9YUNnWUtBVEFTQVRBU0ZRRl91NjFWVjhycThWY0lLbkdPNFBHQnpRUHJPdw0163",
      },
    });
    localURL = "http://localhost:1201";
    mainURL = "http://localhost:3000";

    const mailOptions = {
      from: "ucare.service123@gmail.com",
      to: email,
      subject: "Email Confrimation",
      html: `
    <p>Hello, confirm your account</p>
    <p>Complete your registration by click this <a href="${mainURL}/api/hospital/${hospital}/patient/${patient}/${token}">link</a>.</p>

    <p>If you did not create this account,please ignore this message.</p>
    `,
    };

    const result = await transport.sendMail(mailOptions, (info, err) => {
      if (err) {
        console.log(err);
      } else {
        console.log(info.response);
      }
    });
    return result;
  } catch (error) {
    return error;
  }
};

const resendEmailPatient = async (email, hospital, patient) => {
  try {
    // const accessToken = await oAuth2Client.getAccessToken();
    // console.log(createToken);

    //gen token and OTP for verification
    const genToken = crypto.randomBytes(64).toString("hex");
    const token = await jwt.sign({ genToken }, process.env.SECRET, {
      expiresIn: process.env.EXPIRES,
    });

    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: "ucare.service123@gmail.com",
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refresh_token: REFRESH_TOKEN,
        accessToken:
          "ya29.a0ARrdaM9-3xtzv8jFvVZs0ojNJum2IKeR7Ehgkj0Iq7tMB7u5vAxLiZGNtjeECUN-J3nD8uCJOSgOYq-dJfZ9Hbbe0g4ulSp3uREP1XsYhezevApHCpiDqSbxIC2VepZDE-gDqjcFwa8CkFwbR4Ur39B1oi02uA",
      },
    });

    localURL = "http://localhost:1201";
    mainURL = "http://localhost:3000";

    const mailOptions = {
      from: "U-care Service",
      to: email,
      subject: "Email Verification",
      html: `
    <p>Hello, confirm your account</p>
    <p>Complete your registration by click this <a href="${mainURL}/api/hospital/${hospital}/patient/${patient}/${token}">link</a>.</p>

    <p>If you did not create this account,please ignore this message.</p>
    `,
    };

    const result = await transport.sendMail(mailOptions, (info, err) => {
      if (err) {
        console.log(err);
      } else {
        console.log(info.response);
      }
    });
    return result;
  } catch (error) {
    return error;
  }
};

const sendAppointmentMail = async (appointment, email) => {
  try {
    // console.log(appointment);

    const accessToken = await oAuth2Client.getAccessToken();
    // console.log(createToken);

    //gen token and OTP for verification
    const genToken = crypto.randomBytes(64).toString("hex");
    const token = await jwt.sign({ genToken }, process.env.SECRET, {
      expiresIn: process.env.EXPIRES,
    });

    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: "ucare.service123@gmail.com",
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refresh_token: REFRESH_TOKEN,
        accessToken: accessToken.token,
      },
    });

    //send mail
    localURL = "http://localhost:1201";
    mainURL = "http://localhost:3000";

    const mailOptions = {
      from: "ucare.service123@gmail.com",
      to: email,
      subject: "Appointment Notification",
      html: `
  <p>Patient name: ${appointment.patientName}</p>
  <p>Case: ${appointment.patientCase}</p>
  <p>Case: ${appointment.allergies}</p>
  <p>Case: ${appointment.symptoms}</p>
  <p>Case: ${appointment.brief}</p>
  <p>Date: ${appointment.dateAndTime}</p>
  <p>Doctor: ${appointment.doctorName}</p>
  <p>Doctor specialization: ${appointment.doctorRole}</p>

  <h2>See you there.</h2>`,
    };

    const result = await transport.sendMail(mailOptions, (info, err) => {
      if (err) {
        console.log(err);
      } else {
        console.log(info.response);
      }
    });
    return result;
  } catch (error) {
    return error;
  }
};

const verifyEmailHospital = async (email, hospital, otp) => {
  try {
    // const accessToken = await oAuth2Client.getAccessToken();
    // console.log(createToken);

    //gen token and OTP for verification
    const genToken = crypto.randomBytes(32).toString("hex");
    // const OTP = crypto.randomBytes(3).toString("hex");
    const token = await jwt.sign({ genToken }, process.env.SECRET, {
      expiresIn: process.env.EXPIRES,
    });

    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: "ucare.service123@gmail.com",
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        access_token:
          "ya29.A0AVA9y1su0dBrvmArcNJJN20h3hUydgVWXdv7FIZ2fWRjJIKCpNUSIFFLPfzlOASrgrXE1uDZiXQ4zqbBjiK2s8G5OYQzMCGe8qGqaQ5CZz6Z1BXyZq_Um5r0lenUek32SVHJQRA9yzOIAbQAZvQzEaQISBTRYUNnWUtBVEFTQVRBU0ZRRl91NjFWZWVJTmFVcWdrV2RhdUhKRGxZWUdkZw0163",
      },
    });
    localURL = "http://localhost:1201";
    mainURL = "http://localhost:3000";

    const mailOptions = {
      from: "ucare.service123@gmail.com",
      to: email,
      subject: "Thanks for registering",
      text: "Please verify your email",
      html: ` <p>Hello, confirm your registration by clicking this <a href="${mainURL}/api/hospital/${hospital}/${token}">link</a>.</p>
      <p>Use this code as your OTP: <b>${otp}</b></p>
      <p>If you did not create this account,please ignore this message.</p>
      `,
    };

    const result = await transport.sendMail(mailOptions, (info, err) => {
      if (err) {
        console.log(err);
      } else {
        console.log(info);
      }
    });
    return result;
  } catch (error) {
    return error.message;
  }
};

module.exports = {
  verifyEmailHospital,
  verifyEmailPatient,
  sendAppointmentMail,
  resendEmailPatient,
};
