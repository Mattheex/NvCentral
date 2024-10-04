import express from "express";
import { request, verifiyAccount } from "../global.js";
import multer from "multer";
import path from "path";

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let dir = "uploads/";
    //console.log('dest',file)
    if (file.originalname.split("&")[0] === "lines") {
      dir += "lines";
    } else {
      dir += "pp";
    }
    //console.log('dir',dir)
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    //console.log('filename', file)
    const filename = file.originalname.split("&").pop();
    //console.log('filename', filename)
    cb(null, filename);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    //console.log('filefilter', file);
    if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error("Only .png, .jpg and .jpeg format allowed!"));
    }
  },
});

const uploadImages = upload.array("image");

router.post("/img", (req, res) => {
  uploadImages(req, res, function (err) {
    if (err) {
      return res.status(400).send({ message: err.message });
    }
    // Everything went fine.
    console.log(req.files);
    const files = req.files;
    res.json(files[0]);
  });
});

export default router;
