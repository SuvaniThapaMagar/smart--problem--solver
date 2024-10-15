const { generateToken } = require("../config/jwtToken");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const { generateRefreshToken } = require("../config/refreshToken");
const jwt = require("jsonwebtoken");


//create a user
const createUser = asyncHandler(async (req, res) => {
  const email = req.body.email;
  const findUser = await User.findOne({ email: email });
  if (!findUser) {
    //create new user
    const newUser = await User.create(req.body);
    res.json(newUser);
  } else {
    throw new Error("User Already Exists");
  }
});

const loginUserCtrl = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  console.log(email, password);

  //check user exist
  const findUser = await User.findOne({ email });
  if (findUser && (await findUser.isPasswordMatched(password))) {
    const refreshToken = await generateRefreshToken(findUser?._id);
    const updateuser = await User.findByIdAndUpdate(
      findUser.id,
      {
        refreshToken: refreshToken,
      },
      { new: true }
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000,
    });

    res.json({
      _id: findUser?._id,
      email: findUser?.email,
      token: generateToken(findUser?._id),
    });
  } else {
    throw new Error("Invalid Credentials");
  }
});
//handle refreshtoken
const handleRefreshToken = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  console.log("Cookies:", cookie); // Log cookies for debugging
  if (!cookie?.refreshToken) {
    res.status(401);
    throw new Error("No Refresh Token in Cookies");
  }

  const refreshToken = cookie.refreshToken;
  console.log("Refresh Token:", refreshToken); // Log refresh token for debugging

  const user = await User.findOne({ refreshToken });
  if (!user) {
    res.status(401);
    throw new Error("No Refresh Token present in db or not matched");
  }

  jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
    if (err || user.id !== decoded.id) {
      console.error("Token Verification Error:", err); // Log error details
      res.status(401);
      throw new Error("There is something wrong with refresh token");
    }

    const accessToken = generateToken(user._id);
    res.json({ accessToken });
  });
});

//logout

const logout = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) {
    res.status(401);
    throw new Error("No Refresh Token in Cookies");
  }
  const refreshToken = cookie.refreshToken;
  const user = await User.findOne({ refreshToken });
  if (!user) {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
    });
    return res.sendStatus(204); //forbidden
  }
  // Update the user document to remove the refresh token
  await User.findOneAndUpdate(
    { _id: user._id }, // Correct filter
    { refreshToken: "" },
    { new: true }
  );
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
  });
  res.sendStatus(204);
});




module.exports = {
  createUser,
  loginUserCtrl,
  handleRefreshToken,
  logout,
};

