var serverAddr = `http://localhost`;
// var serverAddr = "http://86.121.101.225";
$(document).change(init());



function init() {
    loadPDFsUser();
}

function loadPDFsUser() {

    sessionStorage.setItem('Searching', "False");
    let pdfList;
    let template = '<div class="fileList"><div class="searchContainer"><input type="text" class="searchText"></div><div class="pdf-list">';
    let listRequest = new XMLHttpRequest();
    let URL = `${serverAddr}:3000/user-info`;
    listRequest.open('GET', URL, true);
    listRequest.onreadystatechange = function() {
        if (listRequest.readyState === 4) {
            pdfList = JSON.parse(listRequest.response);
            pdfList.forEach(element => {
                template += `<p class="pdf-link">${element}</p>`;
            });
            template += '</div></div>';
            $(".pdf-list-container").html(template);
            addEventsToTitles();
            $(".searchText").on("change paste keyup input", () => {
                document.querySelectorAll(".pdf-link").forEach((e) => {
                    if ($(".searchText").val() == "") {
                        e.style.display = "inline-block";
                    } else if ($(".searchText").val() != undefined && $(".searchText").val() != null) {
                        if (e.innerHTML.indexOf($(".searchText").val()) == -1) {
                            e.style.display = "none";
                        }
                    }
                });
            });
        }
    }
    listRequest.send();

};

function addEventsToTitles() {
    document.querySelectorAll(".pdf-link").forEach(e => {
        e.addEventListener("click", x => {
            drawGUI(e.innerHTML, 1, false);
        })
    })
};

function addEventsToPageButtons() {
    let name = sessionStorage.getItem('pdfName');
    let num = sessionStorage.getItem('pageNum');
    let max = sessionStorage.getItem('totalPages');

    document.querySelector(".prev-button").addEventListener("click", e => {
        if (parseInt(num) - 1 > 0)
            if (sessionStorage.getItem("Searching") == "True")
                drawGUI(name, parseInt(num) - 1, true);
            else
                drawGUI(name, parseInt(num) - 1, false);
    });
    document.querySelector(".jump-button").addEventListener("click", e => {
        let number = parseInt(document.querySelector(".numSelector").value);
        if (number > 0 && number <= max)
            if (sessionStorage.getItem("Searching") == "True")
                drawGUI(name, parseInt(number), true);
            else
                drawGUI(name, parseInt(number), false);
    });
    document.querySelector(".next-button").addEventListener("click", e => {
        if (parseInt(num) + 1 <= max)
            if (sessionStorage.getItem("Searching") == "True")
                drawGUI(name, parseInt(num) + 1, true);
            else
                drawGUI(name, parseInt(num) + 1, false);
    });
};

function addEventsToSearch() {
    let fileName = sessionStorage.getItem('pdfName');
    let body = { v: encode({ name: fileName }) };
    let number = "";
    $(".fileSearchBtn").click(() => {
        if ($(".fileSearch").val() != undefined && $(".fileSearch").val() != null && $(".fileSearch").val() != "") {
            let searchRequest = new XMLHttpRequest();
            let URL = `${serverAddr}:3000/search?text=${$(".fileSearch").val()}`;
            searchRequest.open('POST', URL, true);
            searchRequest.setRequestHeader("Content-Type", "application/json");
            searchRequest.onreadystatechange = function() {
                if (searchRequest.readyState === 4) {
                    pdfList = JSON.parse(searchRequest.response);
                    sessionStorage.setItem("Found", JSON.stringify(pdfList));
                    sessionStorage.setItem('FoundIndex', 0);
                    sessionStorage.setItem('Searching', 'True');
                    sessionStorage.setItem('SearchResultNo', pdfList.length);
                    let a = JSON.parse(sessionStorage.getItem('Found'))[0];
                    if (a != undefined)
                        drawGUI(fileName, a.pageNum, true);
                    else
                        alert("No match found.");
                }
            }
            searchRequest.send(JSON.stringify(body));
        }
    });
}

function drawSearchButtons() {
    let template = `<p class="foundNo">${parseInt(sessionStorage.getItem('FoundIndex'))+1}/${parseInt(sessionStorage.getItem('SearchResultNo'))}</p><button class="searchLeft"><span class="fas fa-angle-double-left"></span></button><button class="searchRight"><span class="fas fa-angle-double-right"></span></button><button class="closeSearch"><span class="fas fa-times"></span></button>`;
    $('.searchButtonsContainer').html(template);
    addEventsToSearchButtons();
}

function addEventsToSearchButtons() {
    let max = parseInt(sessionStorage.getItem('SearchResultNo'));
    let index = parseInt(sessionStorage.getItem('FoundIndex'));
    let fileName = sessionStorage.getItem('pdfName');
    let a = JSON.parse(sessionStorage.getItem('Found'));
    $(".searchLeft").click(() => {
        if (index > 0 && index <= max - 1) {
            drawGUI(fileName, a[index - 1].pageNum, true);
            sessionStorage.setItem('FoundIndex', index - 1);
        }

    });
    $(".searchRight").click(() => {
        if (index >= 0 && index < max - 1) {
            drawGUI(fileName, a[index + 1].pageNum, true);
            sessionStorage.setItem('FoundIndex', index + 1);
        }
    });
    $(".closeSearch").click(() => {
        drawGUI(fileName, a[index].pageNum, false);
        sessionStorage.setItem('Searching', "False");
    });
}

function drawGUI(name, num, drawButtons) {

    let maxPage = new XMLHttpRequest();
    let URL = `${serverAddr}:3000/max`;
    let body = { v: encode({ pdfName: name }) };
    maxPage.open('POST', URL, true);
    maxPage.setRequestHeader("Content-Type", "application/json");
    maxPage.onreadystatechange = function() {
        if (maxPage.readyState === 4) {
            number = JSON.parse(maxPage.response);
            let html = `<div class='fileSearchContainer'><div class="searchButtonsContainer"></div><div class="searchBar"><input type="text" class="fileSearch"><button class="fileSearchBtn">Search</button></div></div>
            <img class="left-page" src="" />
            <div class="fileNavContainer"><button class="prev-button">Prev</button>
            <input type="number" class="numSelector" name="pageNumber" style="width:40px">
            <p style="display:inline">/${number}</p>
            <button class="jump-button">Go</button>
            <button class="next-button">Next</button></div>
         `;
            document.querySelector(".pdf-view").innerHTML = html;
            let params = { name: name, num: num };
            let imageURL = `${serverAddr}:3000/selection?v=${encode(params)}`;
            document.querySelector(".left-page").src = imageURL;
            sessionStorage.setItem('pageNum', num);
            sessionStorage.setItem('pdfName', name);

            sessionStorage.setItem('totalPages', parseInt(number) - 1);
            addEventsToPageButtons();
            addEventsToSearch();
            document.querySelector(".numSelector").value = sessionStorage.getItem('pageNum');
            if (drawButtons) { drawSearchButtons(); }
        }
    }
    maxPage.send(JSON.stringify(body));

};

function encode(obj) {
    let password = 9;
    let data = JSON.stringify(obj);
    var encryptedMessage = sjcl.encrypt(password.toString(), data);
    console.log(scramble(btoa(encryptedMessage)));
    return scramble(btoa(encryptedMessage));
}


function scramble(string) {
    let sum = 0;
    let sir = "";
    for (let i = 0; i < string.length; i++) {
        if (string[i] >= 0 && string[i] <= 9)
            sum += Number(string[i]);

    }
    let zi = new Date();
    let seg = sum % 13 + 1;
    console.log(seg);
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