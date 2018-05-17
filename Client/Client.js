$(document).ready(init());

function init() {
    $(".log-in-user").click(() => {
        loadPDFsUser();
        $(`.pdf-list`).addClass("user-list");
    });
    $(".log-in-admin").click(() => {
        loadPDFsAdmin();
        $(`.pdf-list`).addClass("admin-list");
    });
};

function loadPDFsAdmin() {
    let pdfList;
    let template = `<table class="admin-pdf-list-table">
                    <tr>
                        <th>File Name</th>
                        <th>Action</th> 
                    </tr>
                    <tr><th colspan="2">Splitted</th></tr>`;
    let listRequest = new XMLHttpRequest();
    let URL = `http://localhost:3000/admin`;
    listRequest.open('GET', URL, true);
    listRequest.onreadystatechange = function() {
        if (listRequest.readyState === 4) {
            pdfList = JSON.parse(listRequest.response);
            console.log(pdfList.splitted);
            pdfList.splitted.forEach(element => {
                template += `<tr><td>${element}</td><td><button class="delete-pdf">Delete</button></td></tr>`;
            });
            template += `<tr><th colspan="2">Not Splitted</th></tr>`;
            pdfList.notSplitted.forEach(element => {
                template += `<tr><td>${element}</td><td><button class="split-pdf">Split</button></td></tr>`;
            });
            template += "</table>";
            $(".pdf-list").html(template);
            // addEventsToTitles();
        }
    }
    listRequest.send();
}

function loadPDFsUser() {

    let pdfList;
    let template = "";
    let listRequest = new XMLHttpRequest();
    let URL = `http://localhost:3000/user`;
    listRequest.open('GET', URL, true);
    listRequest.onreadystatechange = function() {
        if (listRequest.readyState === 4) {
            pdfList = JSON.parse(listRequest.response);
            pdfList.forEach(element => {
                template += `<p class="pdf-link">${element}</p>`;
            });
            $(".pdf-list").html(template);
            addEventsToTitles();
        }
    }
    listRequest.send();

};

function addEventsToTitles() {
    document.querySelectorAll(".pdf-link").forEach(e => {
        e.addEventListener("click", x => {
            drawGUI(e.innerHTML, 1);
        })
    })
};

function addEventsToPageButtons() {
    document.querySelector(".prev-button").addEventListener("click", e => {
        let name = document.querySelector(".pdf-view").getAttribute("pdfName");
        let num = parseInt(document.querySelector(".pdf-view").getAttribute("pageNum"));
        drawGUI(name, num - 1);
    });
    document.querySelector(".jump-button").addEventListener("click", e => {
        let name = document.querySelector(".pdf-view").getAttribute("pdfName");
        let num = parseInt(document.querySelector(".numSelector").value);
        drawGUI(name, num);
    });
    document.querySelector(".next-button").addEventListener("click", e => {
        let name = document.querySelector(".pdf-view").getAttribute("pdfName");
        let num = parseInt(document.querySelector(".pdf-view").getAttribute("pageNum"));
        drawGUI(name, num + 1);
    });
};

function drawGUI(name, num) {
    //request page number
    let html = `<div>
                    <img class="left-page" src="" pageNum="" />
                    <button class="prev-button">Prev</button>
                    <input type="text" class="numSelector" name="pageNumber" style="width:40px">
                    <p style="display:inline">/max</p>
                    <button class="jump-button">Go</button>
                    <button class="next-button">Next</button>
                </div> `;
    document.querySelector(".pdf-view").innerHTML = html;
    let URL = `http://localhost:3000/selection?name=${name}&num=${num}`;
    document.querySelector(".left-page").src = URL;
    document.querySelector(".pdf-view").setAttribute("pageNum", num);
    document.querySelector(".pdf-view").setAttribute("pdfName", name);
    addEventsToPageButtons();
};