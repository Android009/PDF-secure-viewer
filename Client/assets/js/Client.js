$(document).ready(init());

// document.onkeydown = function(e) {
//     if (event.keyCode == 123) {
//         return false;
//     }
//     if (e.ctrlKey && e.shiftKey && e.keyCode == 'I'.charCodeAt(0)) {
//         return false;
//     }
//     if (e.ctrlKey && e.shiftKey && e.keyCode == 'C'.charCodeAt(0)) {
//         return false;
//     }
//     if (e.ctrlKey && e.shiftKey && e.keyCode == 'J'.charCodeAt(0)) {
//         return false;
//     }
//     if (e.ctrlKey && e.keyCode == 'U'.charCodeAt(0)) {
//         return false;
//     }
// }

function init() {

    $(".gen").click(() => {

        let password = 8154265897526598562645181565329183482618286526416428326655;
        let data = "GhidStudent_2016:)";
        var encryptedMessage = sjcl.encrypt(password.toString(), data, { mode: "ccm", iter: 1000, ks: 128, ts: 64, v: 1, cipher: "aes", adata: "", salt: "myGeneratedSalt" });
        var parsedMessage = JSON.parse(encryptedMessage);
        delete parsedMessage.mode;
        delete parsedMessage.iter;
        delete parsedMessage.ks;
        delete parsedMessage.ts;
        delete parsedMessage.v;
        delete parsedMessage.cipher;
        delete parsedMessage.salt;
        delete parsedMessage.adata;
        encryptedMessageWithoutParameters = JSON.stringify(parsedMessage);
        console.log(encryptedMessageWithoutParameters);


        var parsedMessage2 = JSON.parse(encryptedMessageWithoutParameters);
        // jQuery.extend(parsedMessage2);
        messageWithParameters = JSON.stringify(parsedMessage2);
        var decryptedMessage = sjcl.decrypt(password.toString(), messageWithParameters);
        console.log(decryptedMessage);

    });
    // $(".log-in-user").click(() => {
    //     loadPDFsUser();
    //     $(`.pdf-list`).addClass("user-list");
    // });
    // $(".log-in-admin").click(() => {
    //     loadPDFsAdmin();
    //     $(`.pdf-list`).addClass("admin-list");
    // });
};

// function loadPDFsAdmin() {
//     let pdfList;
//     let template = `<table class="admin-pdf-list-table">
//                     <tr>
//                         <th>File Name</th>
//                         <th>Actions</th> 
//                     </tr>
//                     <tr><th colspan="2">Splitted</th></tr>`;
//     let listRequest = new XMLHttpRequest();
//     let URL = `http://localhost:3000/admin-info`;
//     listRequest.open('GET', URL, true);
//     listRequest.onreadystatechange = function() {
//         if (listRequest.readyState === 4) {
//             pdfList = JSON.parse(listRequest.response);
//             pdfList.splitted.forEach(element => {
//                 template += `<tr><td>${element}</td><td><button class="delete-pdf">Delete</button></td></tr>`;
//             });
//             template += `<tr><th colspan="2">Not Splitted</th></tr>`;
//             pdfList.notSplitted.forEach(element => {
//                 template += `<tr><td>${element}</td><td><button class="split-pdf">Split</button><button class="delete_unsplit_pdf">Delete</button></td></tr>`;
//             });
//             template += `</table> <input type="file" accept=".pdf" class="new_file"><button class="add_file_btn">Submit</button>`;
//             $(".pdf-list").html(template);
//             addEventsToAdminButtons();
//         }
//     }
//     listRequest.send();
// }

// function addEventsToAdminButtons() {
//     let loadingDiv = $('.loader');
//     document.querySelectorAll(".delete-pdf").forEach((e) => {
//         e.addEventListener("click", () => {
//             loadingDiv.addClass("is-active");
//             let URL = `http://localhost:3000/delete`;
//             let body = { file: e.parentElement.parentElement.firstChild.innerHTML, type: "split" };
//             let deleteRequest = new XMLHttpRequest();
//             deleteRequest.open('DELETE', URL, true);
//             deleteRequest.setRequestHeader("Content-Type", "application/json");
//             deleteRequest.onreadystatechange = function() {
//                 if (deleteRequest.readyState === 4) {
//                     if (JSON.parse(deleteRequest.response) == "Done!") {
//                         loadingDiv.removeClass('is-active');
//                         loadPDFsAdmin();
//                     } else {
//                         alert(JSON.parse(deleteRequest.response));
//                         loadingDiv.removeClass('is-active');
//                         loadPDFsAdmin();
//                     }
//                 }
//             }
//             deleteRequest.send(JSON.stringify(body));
//         });
//     });

//     document.querySelectorAll(".delete_unsplit_pdf").forEach((e) => {
//         e.addEventListener("click", () => {
//             loadingDiv.addClass("is-active");
//             let URL = `http://localhost:3000/delete`;
//             let body = { file: e.parentElement.parentElement.firstChild.innerHTML, type: "unsplit" };
//             let deleteRequest = new XMLHttpRequest();
//             deleteRequest.open('DELETE', URL, true);
//             deleteRequest.setRequestHeader("Content-Type", "application/json");
//             deleteRequest.onreadystatechange = function() {
//                 if (deleteRequest.readyState === 4) {
//                     if (JSON.parse(deleteRequest.response) == "Done!") {
//                         loadingDiv.removeClass('is-active');
//                         loadPDFsAdmin();
//                     } else {
//                         alert(JSON.parse(deleteRequest.response));
//                         loadingDiv.removeClass('is-active');
//                         loadPDFsAdmin();
//                     }
//                 }
//             }
//             deleteRequest.send(JSON.stringify(body));
//         });
//     });

//     document.querySelectorAll(".split-pdf").forEach((e) => {
//         e.addEventListener("click", () => {
//             loadingDiv.addClass("is-active");
//             let URL = `http://localhost:3000/split`;
//             let body = { file: e.parentElement.parentElement.firstChild.innerHTML };
//             let splitRequest = new XMLHttpRequest();
//             splitRequest.open('POST', URL, true);
//             splitRequest.setRequestHeader("Content-Type", "application/json");
//             splitRequest.onreadystatechange = function() {
//                 if (splitRequest.readyState === 4) {
//                     if (JSON.parse(splitRequest.response) == "Done!") {
//                         loadingDiv.removeClass('is-active');
//                         loadPDFsAdmin();
//                     } else {
//                         loadingDiv.removeClass('is-active');
//                         alert(JSON.parse(splitRequest.response));
//                         loadPDFsAdmin();
//                     }
//                 }
//             }
//             splitRequest.send(JSON.stringify(body));

//         });
//     });

//     $(".add_file_btn").click(() => {
//         let file = $('.new_file').prop('files')[0];
//         loadingDiv.addClass("is-active");
//         let data = new FormData();
//         data.append("File", file);
//         let fileRequest = new XMLHttpRequest();
//         let URL = "http://localhost:3000/load";
//         // let body = { files: file };
//         fileRequest.open('POST', URL, true);
//         fileRequest.onreadystatechange = function() {
//             if (fileRequest.readyState === 4) {
//                 if (JSON.parse(fileRequest.response) == "Done!") {
//                     loadingDiv.removeClass("is-active");
//                     loadPDFsAdmin();
//                 } else {
//                     alert(JSON.parse(fileRequest.response));
//                     loadingDiv.removeClass("is-active");
//                     loadPDFsAdmin();
//                 }
//             }
//         }
//         fileRequest.send(data);
//     });
// }

// function loadPDFsUser() {

//     let pdfList;
//     let template = "";
//     let listRequest = new XMLHttpRequest();
//     let URL = `http://localhost:3000/user-info`;
//     listRequest.open('GET', URL, true);
//     listRequest.onreadystatechange = function() {
//         if (listRequest.readyState === 4) {
//             pdfList = JSON.parse(listRequest.response);
//             pdfList.forEach(element => {
//                 template += `<p class="pdf-link">${element}</p>`;
//             });
//             $(".pdf-list").html(template);
//             addEventsToTitles();
//         }
//     }
//     listRequest.send();

// };

// function addEventsToTitles() {
//     document.querySelectorAll(".pdf-link").forEach(e => {
//         e.addEventListener("click", x => {
//             drawGUI(e.innerHTML, 1);
//         })
//     })
// };

// function addEventsToPageButtons() {
//     document.querySelector(".prev-button").addEventListener("click", e => {
//         let name = document.querySelector(".pdf-view").getAttribute("pdfName");
//         let num = parseInt(document.querySelector(".pdf-view").getAttribute("pageNum"));
//         drawGUI(name, num - 1);
//     });
//     document.querySelector(".jump-button").addEventListener("click", e => {
//         let name = document.querySelector(".pdf-view").getAttribute("pdfName");
//         let num = parseInt(document.querySelector(".numSelector").value);
//         drawGUI(name, num);
//     });
//     document.querySelector(".next-button").addEventListener("click", e => {
//         let name = document.querySelector(".pdf-view").getAttribute("pdfName");
//         let num = parseInt(document.querySelector(".pdf-view").getAttribute("pageNum"));
//         drawGUI(name, num + 1);
//     });
// };

// function drawGUI(name, num) {
//     //request page number
//     let html = `<div>
//                     <img class="left-page" src="" pageNum="" />
//                     <button class="prev-button">Prev</button>
//                     <input type="text" class="numSelector" name="pageNumber" style="width:40px">
//                     <p style="display:inline">/max</p>
//                     <button class="jump-button">Go</button>
//                     <button class="next-button">Next</button>
//                 </div> `;
//     document.querySelector(".pdf-view").innerHTML = html;
//     let URL = `http://localhost:3000/selection?name=${name}&num=${num}`;
//     document.querySelector(".left-page").src = URL;
//     document.querySelector(".pdf-view").setAttribute("pageNum", num);
//     document.querySelector(".pdf-view").setAttribute("pdfName", name);
//     addEventsToPageButtons();
// };