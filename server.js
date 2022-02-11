"use strict";

const express = require("express");
const dotenv = require("dotenv").config()
const fccTesting = require("./freeCodeCamp/fcctesting.js");
const passport = require('passport')
const session = require('express-session')
const app = express();
const ObjectID = require('mongodb').ObjectID;
const mongo = require('mongodb').MongoClient;
const mongoose = require('mongoose')
const LocalStrategy = require('passport-local')
//console.log(ObjectID)
const bcrypt = require('bcrypt')

fccTesting(app); //For FCC testing purposes
app.use("/public", express.static(process.cwd() + "/public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));




app.set("view engine", 'pug')

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
}));

app.use(passport.initialize())
app.use(passport.session())
mongo.connect(process.env.DATABASE, (err, db) => {

  passport.serializeUser((user, done) => {
    done(null, user._id);
  });
  passport.deserializeUser((id, done) => {
    db.collection('users').findOne(
      { _id: new ObjectID(id) },
      (err, doc) => {
        done(null, doc);
      }
    );



  });
  passport.use(new LocalStrategy((username, password, done) => {
    db.collection('users').findOne({ username: username }, (err, user) => {
      console.log('User ' + username + ' attempted to log in.')
      if (err) { return done(err); }
      if (!user) { return done(null, false); }
      if (!bcrypt.compareSync(password, user.password)) { return done(null, false); }
      return done(null, user);

    })


  }))

  passport.authenticate('local')


  function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      next()
    }
    res.redirect("/")

  }

  app.route("/").get((req, res) => {
    //Change the response to render the Pug template
    res.render(process.cwd() + "/views/pug/index.pug", { title: "Mr. Valdez", message: "Please login", showLogin: true })
  });

  app.route('/login').post(passport.authenticate('local', { failureRedirect: "/" }), (req, res) => {


    res.redirect("/profile")
  })

  app.route('/profile').get(ensureAuthenticated, (req, res) => {

    res.render(process.cwd() + "/views/pug/profile.pug")
  })

  app.route('/register').post((req, res, next) => {


    db.collection('users').findOne({ username: req.body.username }, (err, user) => {
      if (err) {
        next(err)
      } else if (user) {
        req.Failmessage = "user name is taken"
        res.redirect(307,'/')
      } else {

          let hash = bcrypt.hashSync(req.body.username, 12)

        db.collection('users').insertOne({
          username: req.body.username,
          password: hash
        }, (err, data) => {
          if (err) {
            res.redirect('/')
          } else {
            next(null, user)
          }
        })
      }
    })


  }, passport.authenticate('local', { failureRedirect: "/" }), (req, res, next) => {

    res.redirect('/profile')
  }


  )
  // app.use((req,res,next)=>{
  //     res.status(404)
  //     .type('text')
  //     .send('Not Found')


  // })
  app.get("*", (req, res) => {

    res.render(process.cwd() + "/views/pug/404.pug")
  })
  app.listen(process.env.PORT || 3000, () => {
    console.log("Listening on port " + process.env.PORT);
  });





})
