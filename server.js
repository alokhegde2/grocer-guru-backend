const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const mongoose = require("mongoose");
const https = require("https");

//importing dot env
require("dotenv/config");

//initializing api
//which is the initial route of api
const api = process.env.API_URL;

//Initializing app
const app = express();

//CORS
app.use(cors());
app.options("*", cors());

//Middlewares
//Middleware to serve static files
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(morgan("tiny"));
//Always use helmet for safety
app.use(helmet());

//Importing all routes middlewares
const adminRoute = require("./routes/admin/admin");

//Salesman
const salesmanRoute = require("./routes/salesman/salesman");

// DISTRIBUTOR
const distributorRoute = require("./routes/distributor/distributor");

//All route middlewares goes here
//admin routes
app.use(`${api}/admin`, adminRoute);

//Salesman route
app.use(`${api}/salesman`, salesmanRoute);

//DISTRIBUTOR SERVICE
app.use(`${api}/distributor`, distributorRoute);

//Connecting to mongodb database
mongoose
  .connect(
    process.env.DATABASE +
      //TODO:FIX THIS WHILE RELEASE
      "/grocer_guru",

    {
      useNewUrlParser: true,
      //TODO:Add it while deployment
      // useUnifiedTopology: true,
      // useCreateIndex: true,
      // dbName: "future_way",
      // useFindAndModify: false
    }
  )
  .then(() => {
    console.log("Database connection is ready");
  })
  .catch((err) => {
    console.error(err);
  });

//Initializing port
const port = process.env.PORT || 3000;

// var server = https.createServer(app);

//Running server
app.listen(port, () => {
  console.log(`Server is running at port ${port} ...`);
});
