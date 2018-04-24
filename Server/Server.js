const express = require("express");
const cors = require("cors");
const fs = require("fs");
const pdf2png = require("pdf2png");
const pdf2Text = require("pdf2text");
const scissors = require('scissors');
const app = express();
let pages;
app.use(cors());

app.listen(3000, function() {
    console.log("App listening on port 3000!");
});

app.get("/", (req, res) => {
    fs.readdir("./pdf/", (err, files) => {
        res.json(files);
    })
})

app.get("/selection", (req, res) => {
    let name = req.query.name;
    let num = req.query.num;
    let isSplit = false;
    fs.readdir("./", (err, files) => {
        for (let x = 0; x < files.length; x++) {
            if (files[x] == name)
                isSplit = true;
        }
        if (isSplit)
            returnPage(res, name, num);
        else {

            var pdf = scissors(`./pdf/${name}.pdf`);
            pdf.getNumPages().then(e => {
                split(res, e, name, pdf);
            });
        }

    });

})

function split(res, e, name, pdf) {
    pages = 0;
    fs.mkdirSync(`${name}`);
    for (let i = 1; i < e; i++) {

        let pdfPage = pdf.pages(i);
        pdfPage.pdfStream().pipe(fs.createWriteStream(`${name}/out${i}.pdf`)).on('finish', function() {
            convertToPNG(res, name, i, convertToText);
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

function convertToPNG(res, folderName, pageNum, callback) {
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
                callback(folderName, pageNum, deleteIndividualPDF);
            }
        });
    });

}

function convertToText(folderName, pageNum, callback) {
    let path = __dirname + `/${folderName}/out${pageNum}.pdf`;
    pdf2Text(path).then(function(pages) {
        fs.writeFile(__dirname + `/${folderName}/page${pageNum}.txt`, pages[0], (err) => {
            if (err) throw err;
            console.log('The file has been saved!');
            callback(path, folderName, pageNum);
        });
    })

}

function deleteIndividualPDF(path, name, pages) {
    fs.unlink(path, (err) => {
        if (err) throw err;
        console.log('File was deleted');
    });
}