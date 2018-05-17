const express = require("express");
const cors = require("cors");
const fs = require("fs");
const pdf2png = require("pdf2png");
const pdf2Text = require("pdf2text");
const scissors = require('scissors');
const app = express();
let totalPages;
app.use(cors());

app.listen(3000, function() {
    console.log("App listening on port 3000!");
});

app.get("/user", (req, res) => {
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
        // res.json(files);
        res.json(userList);
    })
})


app.get("/admin", (req, res) => {
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
        console.log(adminList);
        res.json(adminList);
    })
})

app.get("/selection", (req, res) => {
    let name = req.query.name;
    let num = req.query.num;
    let isSsplit = false;
    fs.readdir("./", (err, files) => {
        for (let x = 0; x < files.length; x++) {
            if (files[x] == name)
                isSsplit = true;
        }
        if (isSsplit)
            returnPage(res, name, num);
        else {

            var pdf = scissors(`./pdf/${name}.pdf`);
            pdf.getNumPages().then(e => {
                split(res, e, name, pdf);
            });
        }

    });

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
    for (let i = 1; i < e; i++) {

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
        console.log("Yayy the pdf got converted, now I'm gonna save it!");
        fs.writeFile(__dirname + `/${folderName}/Page${pageNum}.png`, resp.data, err => {
            if (err) {
                console.log(err);
            } else {
                console.log("The file was saved!");
                if (pageNum === 1)
                    returnPage(res, folderName, pageNum);
                callback(e, folderName, pageNum, deleteIndividualPDF);
            }
        });
    });

}

function convertToText(e, folderName, pageNum, callback) {
    let path = __dirname + `/${folderName}/out${pageNum}.pdf`;
    let path2 = __dirname + `/${folderName}/done.progress`;
    pdf2Text(path).then(function(pages) {
        fs.writeFile(__dirname + `/${folderName}/page${pageNum}.txt`, pages[0], (err) => {
            if (err) throw err;
            console.log('The file has been saved!');
            callback(e, path, path2);
        });
    })

}

function deleteIndividualPDF(e, path, path2) {
    totalPages++;
    if (totalPages == (e - 1)) {
        console.log("IT REACHED THIS POINT");
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