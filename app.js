const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose')
const path = require('path')
const cors = require('cors')
require("dotenv").config();

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);


const PORT = process.env.PORT || 3000;
const { MONGOD_URI } = process.env;
  
const userRoutes = require("./routes/user");

app.use(bodyParser.json());

app.use(userRoutes);


app.use(express.static(path.join(__dirname, 'build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});


app.use("/", (req, res) => {
  console.log("Working ");
  res.send("WORKING");
});

mongoose.connect(MONGOD_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        app.listen(PORT, () => {
          console.log(`Server is running on port ${PORT}`)
        })
    })
    .catch(err => console.log(err))
