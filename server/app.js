const express = require("express");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const dbConnect = require("./config/dbConnect");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const morgan = require("morgan");
const { notFound, errorHandler } = require("./middlewares/errorHandler");
const authRouter = require("./Route/authRoute");
const userRouter = require ("./Route/userRoute");

const imageRouter = require ("./Route/imageRoute");

// Add this line to require the passport configuration
require("./config/password"); // Assuming you renamed passport.js to password.js

dotenv.config();
dbConnect();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(
  cors({
    origin: "http://localhost:5173", 
    credentials: true,
  })
);

app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Set up session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // Set to true when using https
  })
);

// Initialize Passport and session handling
app.use(passport.initialize());
app.use(passport.session());

// Define API routes
app.use("/api/auth", authRouter); // Add auth routes
app.use("/api/image",imageRouter)
app.use("/api/user", userRouter); // Add auth routes

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});