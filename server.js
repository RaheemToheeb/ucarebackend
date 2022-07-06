const express = require("express");
const cors = require("cors");
require("dotenv").config();
require("./Utils/db");
const verifyEmail = require("./Utils/sendMail");

const app = express();
const port = process.env.PORT || 1210;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to U-Care",
  });
});

app.post("/api/view", (req, res) => {
  const { email } = req.body;
  verifyEmail(email)
    .then((res) => {
      console.log(res);
    })
    .catch((err) => {
      console.log(err.message);
    });
});
// app.use("/api/admin", require("./Router/admin"));
app.use("/api/hospital", require("./Router/hospital"));
app.use("/api/hospital", require("./Router/doctor"));
app.use("/api/hospital", require("./Router/patient"));
app.use("/api/hospital", require("./Router/appointment"));

app.listen(port, () => {
  console.log("Running...", port);
});
