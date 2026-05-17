if(process.env.NODE_ENV !== "production"){
  require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const port = process.env.PORT || 8080;
const Path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const flash = require("connect-flash");
const userRouter = require("./routes/user.js");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const dbUrl = process.env.ATLASDB_URL;

if (!dbUrl) {
  console.error("ATLASDB_URL is not set in environment. Please set it in .env");
  process.exit(1);
}

// Warn if the connection string doesn't include a database name
try {
  const urlObj = new URL(dbUrl.replace("mongodb+srv://", "http://"));
  if (!urlObj.pathname || urlObj.pathname === "/") {
    console.warn("Warning: your ATLASDB_URL does not include a database name.\nRecommended format: mongodb+srv://user:pass@cluster0.example.mongodb.net/myDatabase?retryWrites=true&w=majority");
  }
} catch (e) {
  // ignore URL parse errors for non-standard strings
}

main()
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
    console.error(`\nQuick checks:\n- Ensure your current IP is allowed in MongoDB Atlas Network Access (or add 0.0.0.0/0 for testing).\n- Verify credentials and database name in ATLASDB_URL.\n- If you're on a corporate/VPN network, try from a different network (home/mobile) to rule out TLS interception.`);
  });

async function main() {
  // use explicit options for clearer behavior and timeout
  await mongoose.connect(dbUrl, {
    serverSelectionTimeoutMS: 10000
  });
}

app.set("view engine", "ejs");
app.set("views", Path.join(__dirname, "views"));
app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));
app.engine("ejs", ejsMate);
app.use(express.static(Path.join(__dirname, "public")));

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET
  },
  touchAfter: 24 * 60 * 60
})

store.on("error", function(e){
  console.log("Session store error", e)
})

const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave:false,
  saveUninitialized: true,
  cookie:{
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge:  + 7 * 24 * 60 * 60 * 1000,
    httpOnly:true
  }
}

// app.get("/", (req, res) => {
//   res.send("this is the root location");
// });



app.use(session(sessionOptions))
app.use(flash())

app.use(passport.initialize())
app.use(passport.session())

passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

// app.get("/demouser" , async (req,res) => {
//   let fakeUser = new User({
//     email:"student@gmail.com",
//     username:"delta-student"
//   })

// let registeredUser = await User.register(fakeUser,"helloworld")
// res.send(registeredUser)

// }
// )



app.use((req,res,next) => {
  res.locals.success = req.flash("success")
  res.locals.error = req.flash("error")
  res.locals.currUser = req.user
  next()
})

app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/", userRouter);





app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page not found!!!"));
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "something went wrong!" } = err;
  res.status(statusCode).render("error.ejs", { message });
  // res.status(statusCode).send(message)
});

const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${port} is already in use. Stop any running server or set PORT to a different value.`);
  } else {
    console.error(err);
  }
});
