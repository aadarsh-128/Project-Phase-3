const express = require("express");
const route = express.Router();
const User = require("../model/user_account");
const UserDetails = require("../model/user_details");
const xRayUploadModel = require("../model/xrayUploadModel");
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwtHandlerRedis = require("../jwt_handler");
const authChecker = require("../middlware/auth");
const dateTime = require('node-datetime');
const multer = require('multer');
const pdfService = require('../Services/generatePDF');
const { response } = require("express");

route.post(
  "/signup",
  [
    check("name", "Name is required").not().isEmpty(),
    check("email", "Please enter your valid email").isEmail(),
    check(
      "password",
      "Use a strong password with 6 or more chanracter"
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    //validate data
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(400).json({ errors: error.array() });
    }
    console.log(req.body);
    let { name, email, password } = req.body;
    try {
      let alreadyExistUser = await User.findOne({ email: email });
      if (alreadyExistUser) {
        return res
          .status(400)
          .json({ errors: [{ msg: "User already exits !" }] });
      } else {
        //exncrypt the password
        const salt = await bcrypt.genSalt(10);
        password = await bcrypt.hash(password, salt);
        alreadyExistUser = User({
          name,
          email,
          password,
        });
        await alreadyExistUser.save();

        // generate the token and set the token in Redis
        const token = await jwtHandlerRedis.generateToken(alreadyExistUser.id);
        return res.json({ token });
      }
    } catch (err) {
      console.error(err);
      return res.status(500).json("Server error");
    }
  }
);

route.post(
  "/login",
  [
    check("email", "Please enter your valid email").isEmail(),
    check(
      "password",
      "Use a strong password with 6 or more chanracter"
    ).exists(),
  ],
  async (req, res) => {
    let { email, password } = req.body;
    // to validate data
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(400).json({ errors: error.array() });
    }
    try {
      let userHaveLogin = await User.findOne({ email: email });
      if (!userHaveLogin) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid Credentials!" }] });
      }
      const isMatch = await bcrypt.compare(password, userHaveLogin.password);
      if (!isMatch)
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid Credentials!" }] });

      // if valid user is present
      // generate the token and set in Redis
      const token = await jwtHandlerRedis.generateToken(userHaveLogin.id);
      return res.json({ token });
    } catch (err) {
      console.error(err);
      return res.status(500).json("Server error");
    }
  }
);

// authChecker is one private where check the token; If token is in it is logout.
route.get("/logout", authChecker,async (req, res) => {
  await jwtHandlerRedis.deleteToken(req.user.jti);
  res.json({ msg: "Logout Successful!" });
});

// authChecker is one private where check the token; If token is in it is goes to profile or show the detail.
route.get("/", authChecker, async (req, res) => {
  try {
    const userData = await User.findById(req.user.id).select("-password");
    res.status(200).json(userData);
  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: "Invalid Token!" });
  }
});

route.post(
  "/addDetails",
  [
    check("name", "Name is required").not().isEmpty(),
    check("email", "Please enter your valid email").isEmail(),
    check("gender", "Please enter your valid gender").not().isEmpty(),
    check("yearOfBirth", "Please enter your year of birth").not().isEmpty(),
    check("height", "Please enter your height").not().isEmpty(),
    check("weight", "Please enter your weight").not().isEmpty(),
  ],
  async (req, res) => {
    //validate data
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(400).json({ errors: error.array() });
    }
    let { name, email, gender, yearOfBirth, height, weight } = req.body;
    try {
        let alreadyExistUser = UserDetails({
          name,
          email,
          gender,
          yearOfBirth,
          height,
          weight,
        });
        await alreadyExistUser.save();

        // generate the token and set the token in Redis
        const token = await jwtHandlerRedis.generateToken(alreadyExistUser.id);
        return res.json({ token });
      //}
    } catch (err) {
      console.error(err);
      return res.status(500).json("Server error");
    }
  }
);

route.get(
  "/getDetails",
  [
    check("email", "Please enter your valid email").isEmail(),
  ],
  async (req, res) => {
    //validate data
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(400).json({ errors: error.array() });
    }
    let {email } = req.body;
    try {
        let userDetails = await UserDetails.findOne({ email: email });
        return res.json({ userDetails});
    } catch (err) {
      console.error(err);
      return res.status(500).json("Server error");
    }
  }
);

const file = multer({
  limits:{
      fileSize:10000000,
  },
  fileFilter(req,file,cb){
      if(!file.originalname.match(/\.(jpg|png|JPG|PNG|JPEG|jpeg)$/))
      return cb(new Error('This is not a correct format of the file'))
      cb(undefined,true)
  }
})

route.post(
  "/uploadXRay",
  // [
  //   check("email", "Please enter your valid email").isEmail(),
  // ],
  file.single('file'),
  async (req, res) => {
    //validate data
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(400).json({ errors: error.array() });
    }
    let email=req.body.email
    let file = req.file.buffer
    let date = dateTime.create().format('Y-m-d H:M:S')
    let result = getReport.get(req.file.originalname)|| "Default Report"
    try {
        let xrayUpload = xRayUploadModel({
          email,
          file,
          result,
          date
        });
        
        var response = await xrayUpload.save();


        //generate the token and set the token in Redis
        //const token = await jwtHandlerRedis.generateToken(alreadyExistUser.id);
        return res.json({ "id":response._id, "message": "success"});
      //}
    } catch (err) {
      console.error(err);
      return res.status(500).json("Server error");
    }
  }
);

route.get(
  "/getReport",
  [
    check("email", "Please enter your valid email").isEmail(),
  ],
  async (req, res) => {
    //validate data
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(400).json({ errors: error.array() });
    }
    let {email } = req.body;
    try {
      let userReports = await xRayUploadModel.find({ email: email });
      let userDetails = await UserDetails.find({email: email});
      console.log("Hello");
      let data ={};
      data.userDetails = userDetails;
      data.userReports = userReports;
      return res.json({data});
      // let userDetails = await UserDetails.findOne({ email: email });
      //   return res.json({ userDetails});
    } catch (err) {
      console.error(err);
      return res.status(500).json("Server error");
    }
  }
);

const getReport = new Map([
  ["xray.jpg", "Report0"],
  ["xray1.jpg", "Report1"],
  ["xray2.jpg", "Report2"],
  ["xray3.jpg", "Report3"],
  ["xray4.jpg", "Report4"]
])

module.exports = route;
