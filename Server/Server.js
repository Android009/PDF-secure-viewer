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
const atob = require("atob");
const sjcl = require("sjcl");
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const configDB = require('./config/database.js');
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "../Client")));
//-------------AUTH---------------------------------------------------------------------------------------------------------------------------------------------



// configuration ===============================================================
mongoose.connect(configDB.url); // connect to our database

require('./config/passport')(passport); // pass passport for configuration

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session({ resave: true, saveUninitialized: true, secret: 'UTCN-Sir de caractere secret' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

//---------------/AUTH-------------------------------------------------------------------------------------------------------------------------------------------------



const Routes = require("./app/routes");
const routes = new Routes(app, passport);
routes.initialize();

let totalPages;



app.get("/user-info", (req, res) => {
    let userList = [];
    fs.readdir("./pdf/", (err, files) => {
        files.forEach(e => {
            let punct = e.indexOf(".");
            let sir = e.substring(0, punct);
            if (isSplit(sir)) {
                userList.push(sir);
            }
        })
        console.log(userList);
        res.json(userList);
    })
})


app.get("/admin-info", isLoggedIn, (req, res) => {
    let adminList = { splitted: [], notSplitted: [] };
    fs.readdir("./pdf/", (err, files) => {
        files.forEach(e => {
            let punct = e.indexOf(".");
            let sir = e.substring(0, punct);
            if (isSplit(sir)) {
                adminList.splitted.push(sir);
            } else {
                adminList.notSplitted.push(sir);
            }
        })
        res.json(adminList);
    })
})

app.get("/selection", (req, res) => {
    let params = decode(req.query.v);
    let name = params.name;
    let num = params.num;
    returnPage(res, name, num);
})

app.post("/split", (req, res) => {
    let i = 1;
    let params = decode(req.body.v);
    let name = params.file;
    var pdf = scissors(`./pdf/${name}.pdf`);
    pdf.getNumPages().then(e => {
        split(res, e, name, pdf);
    });
    let timer = setInterval((e) => {
        console.log(fs.existsSync(`./${name}/done.progress`) + ": " + i++);
        if (fs.existsSync(`./${name}/done.progress`)) {
            clearInterval(timer);
            res.json("Done!");
            return;
        };
    }, 5000);
});

app.post("/load", (req, res) => {
    let file = req.body.files;
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
        if (files.File != null && files.File != undefined) {
            var oldpath = files.File.path;
            var newpath = './pdf/' + files.File.name;
            fs.rename(oldpath, newpath, function(err) {
                if (err) {
                    throw err;
                    res.json(err);
                } else
                    res.json('Done!');
            });
        } else {
            res.json('File could not be saved!');
        }
    });
});


app.delete("/delete", (req, res) => {
    let params = decode(req.body.v);
    let fileName = params.file;
    let type = params.type;
    if (type == "split") {
        if (fs.existsSync(`./${fileName}`, (err) => {
                if (err) {
                    throw err;
                    res.json("File not found!");
                }
            })) {
            rimraf.sync(`./${fileName}`, {}, (err) => {
                if (err) {
                    throw err;
                    res.json("Could not delete file!");
                }
            });
        }
    } else {
        if (type == "unsplit") {

            if (fs.existsSync(`./pdf/${fileName}.pdf`, (err) => {
                    if (err) {
                        throw err;
                        res.json("File not found!");
                    }
                })) {
                rimraf.sync(`./pdf/${fileName}.pdf`, {}, (err) => {
                    if (err) {
                        throw err;
                        res.json("Could not delete file!");
                    }
                });
            }
        }
    }
    res.json("Done!");
})


function isSplit(name) {
    if (fs.existsSync(`./${name}/done.progress`)) {
        return true;
    } else {
        return false;
    }
}

function split(res, e, name, pdf) {
    totalPages = 1;
    fs.mkdirSync(`${name}`);
    for (let i = 1; i <= e; i++) {

        let pdfPage = pdf.pages(i);
        pdfPage.pdfStream().pipe(fs.createWriteStream(`${name}/out${i}.pdf`)).on('finish', function() {
            convertToPNG(e, res, name, i, convertToText);
            console.log("Done!");
        }).on('error', function(err) {
            throw err;
        });
    }
}

function returnPage(res, name, pageNum) {
    console.log("Returned page " + pageNum);
    res.sendFile(__dirname + `/${name}/Page${pageNum}.png`, function(err) {
        if (err) {
            throw err;
        } else {
            console.log('Sent:', name);
        }
    });
}

function convertToPNG(e, res, folderName, pageNum, callback) {
    let path = `${folderName}/out${pageNum}.pdf`;
    pdf2png.convert(path, resp => {
        if (!resp.success) {
            console.log("Something went wrong: " + resp.error);
            return;
        }
        fs.writeFile(__dirname + `/${folderName}/Page${pageNum}.png`, resp.data, err => {
            if (err) {
                console.log(err);
            } else {
                console.log("The image file was saved!");
                callback(e, folderName, pageNum, deleteIndividualPDF);
            }
        });
    });

}

function convertToText(e, folderName, pageNum, callback) {
    let path = __dirname + `/${folderName}/out${pageNum}.pdf`;
    let path2 = __dirname + `/${folderName}/done.progress`;
    pdf2Text(path).then((pages) => {
        let string = "";
        pages[0].forEach(e => {
            string += e.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "") + " ";
        });
        fs.writeFile(__dirname + `/${folderName}/${pageNum}.txt`, string, (err) => {
            if (err) { throw err; }
            console.log('The text file has been saved!');
            callback(e, path, path2);
        });
    })

}

function deleteIndividualPDF(e, path, path2) {
    totalPages++;
    console.log(totalPages + " when " + (totalPages == (e - 1)) + " of: " + e);
    if (totalPages > (e - 1)) {
        fs.writeFileSync(path2, "Done!", err => {
            if (err) {
                console.log(err);
            }
        });
    }
    fs.unlink(path, (err) => {
        if (err) throw err;
        console.log('File was deleted');
    });
}

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
    res.redirect('/');
}

app.listen(3000, function() {
    console.log("App listening on port 3000!");
});