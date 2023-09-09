const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const generateToken = require('../config/generateToken');

const registerUser = async (req, res) => {
  try {
    const { name, email, password, pic } = req.body;

    // Validate input data
    if (!name || !email || !password) {
      res.status(400).json({ message: "Please enter all the required fields" });
      return; // Return early to avoid further processing
    }
    // Check if the user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({ message: "User already exists" });
      return; // Return early to avoid further processing
    }

    // Create a new user
    const user = await User.create({
      name,
      email,
      password,
      pic,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        pic: user.pic,
        token: generateToken(user._id),
      });
    } else {
      res.status(500).json({ message: "Failed to create user" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ message: 'Email or password doesn\'t match' }); // Unauthorized status (401) with the error message
  }
});

const allUsers = asyncHandler(async (req, res) => {
const keyword = req.query.search
?{
  $or:[
    {name:{$regex: req.query.search, $options:"i"}},
    {email:{$regex: req.query.search, $options:"i"}}
  ],
  

}
:{};
const users = await User.find(keyword).find({_id:{$ne: req.user._id}});
res.send(users);
})


module.exports = { registerUser,authUser,allUsers };
