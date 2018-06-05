const mime = require("mime");
const path = require("path");
class Routes {
    constructor(expressApp, passport) {
        this.app = expressApp;
        this.passport = passport;
    }

    initialize() {

        // =====================================
        // HOME PAGE (with login links) ========
        // =====================================

        this.app.get('/', function(req, res) {
            res.sendFile(path.join(__dirname, "../../Client/index.html"));
        });

        // =====================================
        // LOGIN ===============================
        // =====================================
        // show the login form
        this.app.get('/login', function(req, res) {

            // render the page and pass in any flash data if it exists
            res.render('login.ejs', { message: req.flash('loginMessage') });
        });

        // process the login form
        // app.post('/login', do all our passport stuff here);

        // =====================================
        // SIGNUP ==============================
        // =====================================
        // show the signup form
        this.app.get('/signup', function(req, res) {

            // render the page and pass in any flash data if it exists
            res.render('signup.ejs', { message: req.flash('signupMessage') });
        });

        // process the signup form
        // app.post('/signup', do all our passport stuff here);

        // =====================================
        // PROFILE SECTION =====================
        // =====================================
        // we will want this protected so you have to be logged in to visit
        // we will use route middleware to verify this (the isLoggedIn function)
        this.app.get('/profile', isLoggedIn, function(req, res) {
            res.render('profile.ejs', {
                user: req.user // get the user out of session and pass to template
            });
        });

        // =====================================
        // LOGOUT ==============================
        // =====================================
        this.app.get('/logout', function(req, res) {
            req.logout();
            res.redirect('/');
        });

        // process the signup form
        this.app.post('/signup', this.passport.authenticate('local-signup', {
            successRedirect: '/profile', // redirect to the secure profile section
            failureRedirect: '/signup', // redirect back to the signup page if there is an error
            failureFlash: true // allow flash messages
        }));

        // process the login form
        this.app.post('/login', this.passport.authenticate('local-login', {
            successRedirect: '/profile', // redirect to the secure profile section
            failureRedirect: '/login', // redirect back to the signup page if there is an error
            failureFlash: true // allow flash messages
        }));


        // route middleware to make sure a user is logged in
        function isLoggedIn(req, res, next) {

            // if user is authenticated in the session, carry on 
            if (req.isAuthenticated())
                return next();

            // if they aren't redirect them to the home page
            res.redirect('/');
        }
    }

}
module.exports = Routes;