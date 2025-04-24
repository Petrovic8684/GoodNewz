const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/userModel");
const { fetchUserById } = require("../utilities/fetchUtility");
const { cloudinary } = require("../config/cloudinary");

const fetchUser = async (req, res) => {
  const { id } = req.params;

  const user = await fetchUserById(id);
  if (!user) res.status(404).json({ message: "User not found!" });

  res.status(200).json({ user: user });
  try {
  } catch (error) {
    res.status(500).json({
      message: "Error fetching user data!",
      error: error.message,
    });
  }
};

const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await UserModel.findOne({ email });

    if (existingUser)
      return res.status(400).json({ message: "User already exists!" });

    if (username)
      if (
        typeof username !== "string" ||
        username.trim().length < 3 ||
        username.trim().length > 30
      )
        return res.status(400).json({
          message: "Username must be between 3 and 30 characters long!",
        });

    if (typeof password !== "string" || password.length < 6)
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long!" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new UserModel({
      username,
      email,
      password: hashedPassword,
      friends: [],
      sentRequests: [],
      pendingRequests: [],
    });

    await newUser.save();

    const userToSend = newUser.toObject();
    delete userToSend.password;

    res.status(201).json({ user: userToSend });
  } catch (error) {
    res.status(500).json({
      message: "Error during registration!",
      error: error.message,
    });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await UserModel.findOne({ email });

    if (!user) return res.status(404).json({ message: "User does not exist!" });

    if (!(await bcrypt.compare(password, user.password)))
      return res.status(400).json({ message: "Invalid credentials!" });

    const token = jwt.sign({ id: user._id }, process.env.TOKEN_SECRET, {
      expiresIn: "1h",
    });

    const userToSend = user.toObject();
    delete userToSend.password;

    res.status(200).json({ token: token, user: userToSend });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error during login!", error: error.message });
  }
};

const updateUsername = async (req, res) => {
  try {
    const { id } = req.params;
    const { username } = req.body;

    if (req.user._id.toString() !== id)
      return res.status(403).json({ message: "Unauthorized!" });

    if (!username)
      return res.status(404).json({ message: "Nothing to update!" });

    const user = await UserModel.findById(id);
    if (!user) return res.status(404).json({ message: "User not found!" });

    if (
      typeof username !== "string" ||
      username.trim().length < 3 ||
      username.trim().length > 30
    )
      return res.status(400).json({
        message: "Username must be between 3 and 30 characters long!",
      });

    user.username = username.trim();

    await user.save();

    res.status(200).json({ username: user.username });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating user!", error: error.message });
  }
};

const uploadImage = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user._id.toString() !== id)
      return res.status(403).json({ message: "Unauthorized!" });

    if (!req.body.image)
      return res.status(400).json({ message: "No image provided!" });

    if (!process.env.CLOUDINARY_UPLOAD_PRESET)
      return res
        .status(500)
        .json({ message: "Missing cloudinary upload preset in .env!" });

    if (!process.env.CLOUDINARY_FOLDER)
      return res
        .status(500)
        .json({ message: "Missing cloudinary folder name in .env!" });

    const base64Image = req.body.image;

    const user = await fetchUserById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found!" });

    // Checks daily upload limit
    const lastUpload = user.lastImageUpload;
    if (lastUpload && new Date() - new Date(lastUpload) < 24 * 60 * 60 * 1000)
      return res.status(429).json({
        message: "You can only change your profile picture once per day!",
      });

    // Deletes the existing image if it exists
    if (user.cloudinaryImageId)
      await cloudinary.uploader.destroy(user.cloudinaryImageId);

    const result = await cloudinary.uploader.upload(base64Image, {
      upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET.trim(),
      folder: process.env.CLOUDINARY_FOLDER.trim(),
      transformation: [{ width: 130, height: 130, crop: "fill" }],
    });

    // Updates user profile
    user.image = result.secure_url;
    user.cloudinaryImageId = result.public_id;
    user.lastImageUpload = new Date();
    await user.save();

    return res.status(200).json({
      message: "Image uploaded and saved successfully!",
      imageUrl: result.secure_url,
    });
  } catch (error) {
    if (error.http_code)
      return res.status(error.http_code).json({
        message: "Cloudinary error!",
        error: error.message,
      });

    return res.status(500).json({
      message: "Error uploading image!",
      error: error.message,
    });
  }
};

module.exports = {
  fetchUser,
  registerUser,
  loginUser,
  updateUsername,
  uploadImage,
};
