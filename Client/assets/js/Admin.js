var serverAddr = `http://localhost`;
// var serverAddr = "http://86.121.101.225";
$(document).ready(init());

function init() {
    loadPDFsAdmin();
}

function loadPDFsAdmin() {
    let pdfList;
    let template = `<table class="admin-pdf-list-table">
                    <tr>
                        <th>File Name</th>
                        <th class="action_col">Actions</th> 
                    </tr>
                    <tr><th colspan="2">Split</th></tr>`;
    let listRequest = new XMLHttpRequest();
    let URL = `${serverAddr}:3000/admin-info`;
    listRequest.open('GET', URL, true);
    listRequest.onreadystatechange = function() {
        if (listRequest.readyState === 4) {
            pdfList = JSON.parse(listRequest.response);
            pdfList.splitted.forEach(element => {
                template += `<tr><td>${element}</td><td class="action_col"><button class="delete-pdf btn btn-danger">Delete</button></td></tr>`;
            });
            template += `<tr><th colspan="2">Not Split</th></tr>`;
            pdfList.notSplitted.forEach(element => {
                template += `<tr><td>${element}</td><td class="action_col"><button class="split-pdf btn btn-success">Split</button><button class="delete_unsplit_pdf btn btn-danger">Delete</button></td></tr>`;
            });
            template += `</table> <table class="admin-pdf-list-table"><tr><th>Other actions</th><th class="action_col">Action</th></tr><tr><td><p>Add new files </p><input type="file" accept=".pdf" class="new_file"></td><td class="action_col"><button class="add_file_btn btn btn-info">Submit</button></td></tr><tr><td>Manage admin accounts</td><td class="action_col"><form><button class="btn btn-info" formaction="/signup">New Account</button></form></td></tr><tr><td>View profile</td><td class="action_col"><form><button class="btn btn-info" formaction="/profile">View</button></form></td></tr></tr><tr><td>Log out of admin account</td><td class="action_col"><form><button class="btn btn-info" formaction="/logout">Log out</button></form></td></tr></table>`;
            $(".pdf-list").html(template);
            addEventsToAdminButtons();
        }
    }
    listRequest.send();
}

function addEventsToAdminButtons() {
    let loadingDiv = $('.loader');
    document.querySelectorAll(".delete-pdf").forEach((e) => {
        e.addEventListener("click", () => {
            loadingDiv.addClass("is-active");
            let URL = `${serverAddr}:3000/delete`;
            let body = { v: encode({ file: e.parentElement.parentElement.firstChild.innerHTML, type: "split" }) };
            let deleteRequest = new XMLHttpRequest();
            deleteRequest.open('DELETE', URL, true);
            deleteRequest.setRequestHeader("Content-Type", "application/json");
            deleteRequest.onreadystatechange = function() {
                if (deleteRequest.readyState === 4) {
                    if (JSON.parse(deleteRequest.response) == "Done!") {
                        loadingDiv.removeClass('is-active');
                        loadPDFsAdmin();
                    } else {
                        alert(JSON.parse(deleteRequest.response));
                        loadingDiv.removeClass('is-active');
                        loadPDFsAdmin();
                    }
                }
            }
            deleteRequest.send(JSON.stringify(body));
        });
    });

    document.querySelectorAll(".delete_unsplit_pdf").forEach((e) => {
        e.addEventListener("click", () => {
            loadingDiv.addClass("is-active");
            let URL = `${serverAddr}:3000/delete`;
            let body = { v: encode({ file: e.parentElement.parentElement.firstChild.innerHTML, type: "unsplit" }) };
            let deleteRequest = new XMLHttpRequest();
            deleteRequest.open('DELETE', URL, true);
            deleteRequest.setRequestHeader("Content-Type", "application/json");
            deleteRequest.onreadystatechange = function() {
                if (deleteRequest.readyState === 4) {
                    if (JSON.parse(deleteRequest.response) == "Done!") {
                        loadingDiv.removeClass('is-active');
                        loadPDFsAdmin();
                    } else {
                        alert(JSON.parse(deleteRequest.response));
                        loadingDiv.removeClass('is-active');
                        loadPDFsAdmin();
                    }
                }
            }
            deleteRequest.send(JSON.stringify(body));
        });
    });

    document.querySelectorAll(".split-pdf").forEach((e) => {
        e.addEventListener("click", () => {
            loadingDiv.addClass("is-active");
            let URL = `${serverAddr}:3000/split`;
            let body = { v: encode({ file: e.parentElement.parentElement.firstChild.innerHTML }) };
            let splitRequest = new XMLHttpRequest();
            splitRequest.open('POST', URL, true);
            splitRequest.setRequestHeader("Content-Type", "application/json");
            splitRequest.onreadystatechange = function() {
                if (splitRequest.readyState === 4) {
                    if (JSON.parse(splitRequest.response) == "Done!") {
                        loadingDiv.removeClass('is-active');
                        loadPDFsAdmin();
                    } else {
                        loadingDiv.removeClass('is-active');
                        alert(JSON.parse(splitRequest.response));
                        loadPDFsAdmin();
                    }
                }
            }
            splitRequest.send(JSON.stringify(body));

        });
    });

    $(".add_file_btn").click(() => {
        let file = $('.new_file').prop('files')[0];
        loadingDiv.addClass("is-active");
        let data = new FormData();
        data.append("File", file);
        let fileRequest = new XMLHttpRequest();
        let URL = `${serverAddr}:3000/load`;
        fileRequest.open('POST', URL, true);
        fileRequest.onreadystatechange = function() {
            if (fileRequest.readyState === 4) {
                if (JSON.parse(fileRequest.response) == "Done!") {
                    loadingDiv.removeClass("is-active");
                    loadPDFsAdmin();
                } else {
                    alert(JSON.parse(fileRequest.response));
                    loadingDiv.removeClass("is-active");
                    loadPDFsAdmin();
                }
            }
        }
        fileRequest.send(data);
    });
}

function encode(obj) {
    let password = "UTCN2018_Cluj_2154142389751152";
    let data = JSON.stringify(obj);
    var encryptedMessage = sjcl.encrypt(password.toString(), data);
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