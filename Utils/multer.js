const multer = require("multer");
const path = require("path");

const avatarStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "avatars");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const logoStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "logos");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});
const avatar = multer({ storage: avatarStorage }).single("avatar");
const logo = multer({ storage: logoStorage }).single("logo");

module.exports = { avatar, logo };
