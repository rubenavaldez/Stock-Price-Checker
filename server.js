"use strict";
const express = require("express")
const app = express()
const dotenv = require("dotenv").config()





app.set("view engine", "pug")






  app.listen(process.env.PORT || 3000, () => {
    console.log("Listening on port " + process.env.PORT);
  });






