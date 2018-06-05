$(document).ready(init());

function init() {
    loadPDFsAdmin();
}

function loadPDFsAdmin() {
    let pdfList;
    let template = `<table class="admin-pdf-list-table">
                    <tr>
                        <th>File Name</th>
                        <th>Actions</th> 
                    </tr>
                    <tr><th colspan="2">Splitted</th></tr>`;
    let listRequest = new XMLHttpRequest();
    let URL = `http://localhost:3000/admin-info`;
    listRequest.open('GET', URL, true);
    listRequest.onreadystatechange = function() {
        if (listRequest.readyState === 4) {
            pdfList = JSON.parse(listRequest.response);
            pdfList.splitted.forEach(element => {
                template += `<tr><td>${element}</td><td><button class="delete-pdf">Delete</button></td></tr>`;
            });
            template += `<tr><th colspan="2">Not Splitted</th></tr>`;
            pdfList.notSplitted.forEach(element => {
                template += `<tr><td>${element}</td><td><button class="split-pdf">Split</button><button class="delete_unsplit_pdf">Delete</button></td></tr>`;
            });
            template += `</table> <input type="file" accept=".pdf" class="new_file"><button class="add_file_btn">Submit</button>`;
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
            let URL = `http://localhost:3000/delete`;
            let body = { file: e.parentElement.parentElement.firstChild.innerHTML, type: "split" };
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
            let URL = `http://localhost:3000/delete`;
            let body = { file: e.parentElement.parentElement.firstChild.innerHTML, type: "unsplit" };
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
            let URL = `http://localhost:3000/split`;
            let body = { file: e.parentElement.parentElement.firstChild.innerHTML };
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
        let URL = "http://localhost:3000/load";
        // let body = { files: file };
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