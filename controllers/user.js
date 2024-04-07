const userSchema = require("../model/user")
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Resend } = require("resend");
const fetch = require("node-fetch");
const cloudinary = require("cloudinary").v2;


if (!global.fetch) {
  global.fetch = fetch;

  if (!global.Headers) {
    const { Headers } = fetch;
    global.Headers = Headers;
  }
}

const resend = new Resend(process.env.API_KEY);

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});


const userSignup = async (req, res) => {
  try {
    const { name,username, email, password } = req.body;

    if (!name || !username || !email || !password) {
      return res
        .status(400)
        .json({ message: "Please fill all the required fields!" });
    }

    const existingUser = await userSchema.findOne({email})

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }

    const hashedPwd = await bcrypt.hash(password, 12);

    const newUser = new userSchema ({
      name,
      username,
      email,
      password: hashedPwd,
    });

    const result = await newUser.save()

    const mail = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "kuldeepchahar426@gmail.com",
      subject: "Hello World",
      html: "<p>hello kuldeep, you have successfully signed up! </p>",
    });

    console.log(mail, result);

    res
      .status(201)
      .json({ message: "User created successfully!", result, mail });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const findUser = await userSchema.findOne({email})

    if (!findUser) {
      return res
        .status(404)
        .json({ message: "User not found. Please sign up!" });
    }

    const isMatchPassword = await bcrypt.compare(password, findUser.password);
    if (!isMatchPassword) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    const token = jwt.sign({ email }, "kuldeep_secret_key", {
      expiresIn: "1h",
    });

    res.cookie("token", token, { httpOnly: true, secure: "production" });

    res
      .status(200)
      .json({ message: "User logged in successfully", email, token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

const userProfile = async (req, res, next) => {
  const { id } = req.params;
  try {
    console.log("Request body:", req.body);
    console.log("Uploaded file:", req.file);

    const { phone_no, gender } = req.body;
    const { originalname: image_name, path: image_url } = req.file;

    const updateUserQuery = `
      UPDATE users
      SET phone_no = $1, gender = $2, image_name = $3, image_url = $4
      WHERE id = $5
      RETURNING *;
    `;

    const updatedUser = await db.oneOrNone(updateUserQuery, [
      phone_no,
      gender,
      image_name,
      image_url,
      id,
    ]);

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    cloudinary.uploader.upload(
      image_url,
      { public_id: `user_${id}` },
      function (error, result) {
        if (error) {
          console.error(error);
        } else {
          console.log("167 line", result);
        }
      }
    );

    res
      .status(200)
      .json({ message: "User profile updated", user: updatedUser });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};




exports.userSignup = userSignup;
exports.userLogin = userLogin;
exports.userProfile = userProfile;
