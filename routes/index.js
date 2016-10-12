var express = require("express");
var router = express.Router({mergeParams: true});
var Comment = require("../models/comment");
var Scores = require("../models/scores");
var methodOverride = require("method-override");
var Pool = require("../models/pool");
var User = require("../models/user");
var passport = require("passport");
var indexUsers = require('../indexUsers');


// landing page
router.get("/", function(req, res)
{
    // Get the latest scores from DB
    Scores.findOne({},{}, { sort: { 'createdAt' : -1 } }, function(error, scores)
    {
        if(error)
        {
            req.flash("error", "Error retrieving scores from the database");
            console.log("ERROR " + error);
        }
        else
        {   
            res.render("landing", {scores: scores});
        }
    });
});

//===========================================
// AUTH ROUTES
//===========================================

//show register form
router.get("/register", function(req, res)
{
    res.render("register");
});

//handle sign up logic
router.post("/register", function(req, res)
{
    if (req.body.username === req.body.confirmEmail && req.body.password === req.body.confirmPassword && req.body.name.length < 21)
    {
        var newUser = new User({username: req.body.username, name: req.body.name, image: req.body.image});
        User.register(newUser, req.body.password, function(err, user)
        {
            if(err)
            {
                req.flash("error", "Error adding new user to the database. Please chech that your e-mail and confirm e-mail fields match. Or, check that your password and confirm password fields match. E-mail addresses can only be used to create an account once.");
                console.log(err);
                return res.render("register");
            }
            passport.authenticate("local")(req, res, function()
            {
                res.redirect("/pools");
                indexUsers();
            });
        });
    }
    else
    {
        return res.render("register");
    }
});

// show login form
router.get("/login", function(req, res)
{
   res.render("login");
});

//handle login logic
router.post("/login", passport.authenticate("local", 
{
    successRedirect:"/pools",
    failureRedirect:"/login"
}), function(req, res)
{
    
});

// logout route
router.get("/logout", function(req, res)
{
    req.logout();
    req.flash("success", "Logged out");
    res.redirect("/");
});

// Middleware for checking if a user is logged in
function isLoggedIn(req, res, next)
{
    if(req.isAuthenticated())
    {
        return next();
    }
    else
    {
        req.flash("error", "Please log in first");
        res.redirect("/login");
    }
}

module.exports = router;