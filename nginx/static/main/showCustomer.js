let jobButton = document.getElementById("add-job-button");
let modal = document.querySelector(".modal-container");

let estimateChosen = {
    estimateId: null,
    estimateName: null,
}

function activateEstimate() {
    let estimates = document.querySelectorAll(".estimate-list-modal li");
    estimates.forEach((elem) => {
        if (elem.id == estimateChosen.estimateId) {
            if (!elem.classList.contains("active-estimate")) {
                elem.classList.add("active-estimate");
            }
        }
        else if (elem.classList.contains("active-estimate")) {
            elem.classList.remove("active-estimate");
        }
    });
}

function autoFillJobName() {
    document.querySelector("[name='job_name']").value = estimateChosen.estimateName;
}

function createJob() {
    // Date field must be filled out
    if (document.querySelector("[name='start_date']").value == "") {
        dateNotSelected(); // Shows error to user
        return;
    }
    var url;
    // Different API endpoints if estimate is used or not
    if (estimateChosen.estimateName) {
        url = `/addJob/${customerId}/${estimateChosen.estimateId}`;
    }
    else { url = `/addJob/${customerId}`; }

    let xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.onreadystatechange = () => {
        if (xhr.readyState == 4 & xhr.status == 200) {
            let response = JSON.parse(xhr.responseText);
            let jobId = response.id;
            window.location = `/jobs/${jobId}`; // redirect
        }
    }
}

jobButton.addEventListener("click", (e) => {
    modal.style.display = "block";
})

modal.addEventListener("click", (e) => {
    if (e.target == modal) {
        e.target.style.display = "none";
    }
})

document.querySelectorAll(".estimate-list-modal ul li").forEach((elem) => {
    elem.addEventListener("click", (e) => {
        estimateChosen.estimateId = e.target.id;
        estimateChosen.estimateName = e.target.innerText;
        activateEstimate();
        autoFillJobName();
    })
});

document.getElementById("create-job").addEventListener("click", (e) => {
    createJob();
})

