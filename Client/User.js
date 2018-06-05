$(document).change(init());
console.log("test");

function init() {
    loadPDFsUser();
}

function loadPDFsUser() {

    let pdfList;
    let template = "";
    let listRequest = new XMLHttpRequest();
    let URL = `http://localhost:3000/user-info`;
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
    let name = sessionStorage.getItem('pdfName');
    let num = sessionStorage.getItem('pageNum');
    let max = sessionStorage.getItem('totalPages');

    document.querySelector(".prev-button").addEventListener("click", e => {
        if (parseInt(num) - 1 > 0)
            drawGUI(name, parseInt(num) - 1);
    });
    document.querySelector(".jump-button").addEventListener("click", e => {
        let number = parseInt(document.querySelector(".numSelector").value);
        if (number > 0 && number <= max)
            drawGUI(name, parseInt(number));
    });
    document.querySelector(".next-button").addEventListener("click", e => {
        if (parseInt(num) + 1 <= max)
            drawGUI(name, parseInt(num) + 1);
    });
};

function drawGUI(name, num) {

    console.log(name);
    let maxPage = new XMLHttpRequest();
    let URL = `http://localhost:3000/max`;
    let body = { pdfName: name };
    maxPage.open('POST', URL, true);
    maxPage.setRequestHeader("Content-Type", "application/json");
    maxPage.onreadystatechange = function() {
        if (maxPage.readyState === 4) {
            number = JSON.parse(maxPage.response);
            let html = `<div>
            <img class="left-page" src="" />
            <button class="prev-button">Prev</button>
            <input type="number" class="numSelector" name="pageNumber" style="width:40px">
            <p style="display:inline">/${number}</p>
            <button class="jump-button">Go</button>
            <button class="next-button">Next</button>
        </div> `;
            document.querySelector(".pdf-view").innerHTML = html;
            let imageURL = `http://localhost:3000/selection?name=${name}&num=${num}`;
            document.querySelector(".left-page").src = imageURL;
            sessionStorage.setItem('pageNum', num);
            sessionStorage.setItem('pdfName', name);

            sessionStorage.setItem('totalPages', parseInt(number) - 1);
            addEventsToPageButtons();
            document.querySelector(".numSelector").value = sessionStorage.getItem('pageNum');
        }
    }
    maxPage.send(JSON.stringify(body));

};