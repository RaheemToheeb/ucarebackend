const nodemailer = require("nodemailer");
require("dotenv").config();

const transport = nodemailer.createTransport({
  service: process.env.NEW_SERVICE,
  auth: {
    user: process.env.NEW_USER,
    pass: process.env.NEW_PASS,
  },
});

module.exports = transport;
