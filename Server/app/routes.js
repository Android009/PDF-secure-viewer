const express = require("express");
const cors = require("cors");
const fs = require("fs");
const pdf2png = require("pdf2png");
const pdf2Text = require("pdf2text");
const scissors = require('scissors');
const rimraf = require("rimraf");
const bodyParser = require("body-parser");
const formidable = require("formidable");
const path = require("path");
const findInFiles = require('find-in-files');
const atob = require("atob");
const sjcl = require("sjcl");
class Routes {
    constructor(expressApp, passport) {
        this.app = expressApp;
        this.passport = passport;
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.app.use(cors());
    }

    initialize() {

        this.app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, "../../Client/index.html"));
        });


        this.app.get('/User', (req, res) => {
            res.sendFile(path.join(__dirname, "../../Client/user.html"));
        });

        this.app.get('/Admin', isLoggedIn, (req, res) => {
            res.sendFile(path.join(__dirname, "../../Client/admin.html"));
        });

        this.app.post('/search', (req, res) => {
            let searchWord = req.query.text;
            let params = decode(req.body.v);
            let filePath = params.name;
            let r = [];
            findInFiles.find(`${searchWord}`, path.join(__dirname, `../${filePath}`), '.txt$')
                .then((results) => {
                    for (let result in results) {
                        let res = results[result];
                        let punct = result.indexOf(".");
                        let start = (path.join(__dirname, `../${filePath}/`)).length;
                        r.push({ pageNum: result.substring(start, punct), found: res.count });

                    }
                    r.sort(compareNumbers);
                    res.json(r);
                });
        });

        function compareNumbers(a, b) {
            return parseInt(a.pageNum) - parseInt(b.pageNum);
        }

        // =====================================
        // LOGIN ===============================
        // =====================================
        // show the login form
        this.app.get('/login', (req, res) => {

            // render the page and pass in any flash data if it exists
            res.render('login.ejs', { message: req.flash('loginMessage') });
        });

        // process the login form
        // app.post('/login', do all our passport stuff here);

        // =====================================
        // SIGNUP ==============================
        // =====================================
        // show the signup form
        this.app.get('/signup', (req, res) => {

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
        this.app.get('/profile', isLoggedIn, (req, res) => {
            res.render('profile.ejs', {
                user: req.user // get the user out of session and pass to template
            });
        });

        // =====================================
        // LOGOUT ==============================
        // =====================================
        this.app.get('/logout', (req, res) => {
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
            successRedirect: '/Admin', // redirect to the secure profile section
            failureRedirect: '/login', // redirect back to the signup page if there is an error
            failureFlash: true // allow flash messages
        }));

        this.app.post("/max", (req, res) => {
            let params = decode(req.body.v);
            let name = params.pdfName;
            var pdf = scissors(path.join(__dirname, `../pdf/${name}.pdf`));
            pdf.getNumPages().then(e => {
                res.json(e);
            });
        });

        function decode(string) {
            let password = "UTCN2018_Cluj_2154142389751152";
            let decryptedMessage = sjcl.decrypt(password.toString(), atob(descramble(string)));
            return JSON.parse(decryptedMessage);
        }

        function descramble(string) {
            let sum = 0;
            let sir = "";
            for (let i = 0; i < string.length; i++) {
                if (string[i] >= 0 && string[i] <= 9)
                    sum += Number(string[i]);

            }
            let zi = new Date();
            let seg = sum % 13 + zi.getHours();
            let contor1 = 0;
            let contor2 = seg;
            let subsir;
            for (let x = 0; x < Math.ceil(string.length / seg); x++) {
                subsir = string.substring(contor1, contor2 + 1);
                sir += subsir.split("").reverse().join("");
                contor1 = contor2 + 1;
                contor2 += seg;
                if (contor2 > string.length)
                    contor2 = string.length;
            }
            return sir;
        }

        function isLoggedIn(req, res, next) {
            // if user is authenticated in the session, carry on 
            if (req.isAuthenticated())
                return next();
            // if they aren't redirect them to the home page
            res.redirect('/login');
        }
    }

}
module.exports = Routes;