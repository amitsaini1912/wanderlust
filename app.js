if(process.env.NODE_ENV != "production"){ //to upload files cloudinary
  require("dotenv").config();
}

const express = require("express");
const app = express();
let port = 8000;
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require('ejs-mate');
// const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema ,reviewSchema } = require("./schema.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const Listing = require("./models/listing.js");

// const MONGO_URL = 'mongodb://127.0.0.1:27017/wanderlust';
const DB_URL = process.env.DB_URL;

main()
  .then( () => {
    console.log(`Connected to DB`);
  })
  .catch((err) => {
    console.log(err)
  });

async function main() {
  await mongoose.connect(DB_URL);
};

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname , "/public")));


//Home Route
// app.get("/", (req, res) => {
//   res.send("Hi, I am root" );
// });

const store = MongoStore.create({
  mongoUrl: "mongodb://localhost:27017/wanderlust",
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});

store.on("error", () => {
    console.log("ERROR IN MONGO SESSION STORE", err)
})

// Session & Cookies
const sessionOptions = {
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() * 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.use(session(sessionOptions));
app.use(flash());

//Authentication
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});


//Routes
app.use("/listings", listingRouter );
app.use("/listings/:id/reviews", reviewRouter );
app.use("/", userRouter );
app.get("/search", async(req, res) => {
   const key = req.query.key;
   let resultListings = await Listing.find(
    {
      "$or": [
        {title: {$regex: key, $options: "i"}},
        {description: {$regex: key, $options: "i"}},
        {location: {$regex: key, $options: "i"}},
        {country: {$regex: key, $options: "i"}},
      ]
    }
  )
  res.render("listings/search.ejs", {resultListings});
})


// app.get("/testListing", async (req, res) => {
//      let sampleListing = new Listing({
//       tital: "My new Villa",
//       description: "By the beach",
//       price: 1200,
//       location: "Calangute, Goa",
//       country: "India",
//      });

//      await sampleListing.save();
//      console.log(`sample saved`);
//      res.send(`successful testing`);
// });


app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page not found!"));
});

app.use((err, req, res, next) => {
  let { statusCode=500, message="Somthing went wrong" } = err;
  res.status(statusCode).render("error.ejs", {message})
  // res.status(statusCode).send(message);
  // res.send("something went wrong!")
});

app.listen(port, () => {
  console.log(`connection successful`);
});