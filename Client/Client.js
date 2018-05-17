$(document).ready(init());

function init() {
    $(".log-in-user").click(() => {
        loadPDFs();
        $(`.pdf-list`).css(`visibility`, `visible`)
    });
    document.querySelector(".log-in-admin").addEventListener('click', () => {

    });
};

function loadPDFs() {

    let pdfList;
    let template = "";
    let listRequest = new XMLHttpRequest();
    let URL = `http://localhost:3000/`;
    listRequest.open('GET', URL, true);
    listRequest.onreadystatechange = function() {
        if (listRequest.readyState === 4) {
            pdfList = JSON.parse(listRequest.response);
            pdfList.forEach(element => {
                let punct = element.indexOf(".");
                let sir = element.substring(0, punct);
                template += `<p class="pdf-link">${sir}</p>`;
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