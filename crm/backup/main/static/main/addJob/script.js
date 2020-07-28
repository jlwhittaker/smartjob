var ESTIMATE_ID;

// copy/pasted directly from django docs, sue me
function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
let csrftoken = getCookie('csrftoken');

let taskList = [];

// Take snapshot of tasks and update taskList
let tasks_snapshot = function() {
    let tasks = document.querySelectorAll(".content__task");
    let snapshot = [];
    tasks.forEach((task) => {
        snapshot.push(
            {
                num: task.querySelector(".content__task-num").innerHTML,
                name: task.querySelector(".content__task-name").innerHTML,
                qty: task.querySelector(".content__task-qty").innerHTML,
                price: task.querySelector(".content__task-price").innerHTML,
                description: task.querySelector(".content__task-desc p").innerText
            }
        )
    });
    taskList = snapshot;
}

let populateTasks = function() {
    recountTasks();
    let newTaskListHTML = "";
    taskList.forEach((task) => {
        newTaskListHTML += `
            <li class="content__task ">
                <div class="flex-wrap">
                    <div class="content__task-num">${task.num}</div>
                    <div class="content__task-name">${task.name}</div>
                    <div class="content__task-qty">${task.qty}</div>
                    <div class="content__task-price">${task.price}</div>
                </div>
                <div class="content__task-desc">
                    <p>${task.description}</p>
                </div>
                <div class="content__task-btns">
                    <button class="content__task-btns-edit">Edit</button>
                    <button class="content__task-btns-del">X</button>
                </div>
            </li>
        `;
    })
    let newTaskList = document.createElement("ul");
    let oldTaskList = document.querySelector(".content__tasks-list");
    oldTaskList.innerHTML = newTaskListHTML;

    document.querySelectorAll(".content__task .flex-wrap").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            e.target.closest("li").classList.toggle("active");
        })
    })

    document.querySelectorAll(".content__task-btns-edit").forEach((btn) => {
        btn.addEventListener("click", editTask);
    });

    document.querySelectorAll(".content__task-btns-del").forEach((elem) => {
        elem.addEventListener("click", deleteTask);
    });

}

// Edit button is clicked, task is converted to task-form, auto-populated with task details
let editTask = function(e) {
    let task = e.target.closest("li");

    let num = task.querySelector(".content__task-num").innerText;
    let name = task.querySelector(".content__task-name").innerHTML;
    let qty = task.querySelector(".content__task-qty").innerHTML;
    let price = task.querySelector(".content__task-price").innerHTML;
    let desc = task.querySelector(".content__task-desc p").innerText;

    let taskFormHTML = `
            <div class="content__task-form-num">${num}</div>
            <input type="text" name="name" class="content__task-form-name" value="${name}">
            <input type="text" name="qty" class="content__task-form-qty" value="${qty}">
            <input type="text" name="price" class="content__task-form-price" value="${price}">
            <textarea name="description" class="content__task-form-desc">${desc}</textarea>
            <div class="content__task-form-btns">
            <button class="save">Save</button>
            <button class="cancel">Cancel</button>
            </div>
        `;
    let taskForm = document.createElement("li");
    taskForm.classList.add("content__task-form");
    taskForm.innerHTML = taskFormHTML;
    document.querySelector(".content__tasks-list").replaceChild(taskForm, task);
    document.querySelector("button.cancel").addEventListener("click", (e) => {
        populateTasks();
    });
    document.querySelector("button.save").addEventListener("click", saveTask);


    console.log("foo");
}

// Del button is clicked, task is deleted
let deleteTask = function(e) {
    if (confirm("Delete this task?")) {
        taskList = taskList.filter((elem) => {
            console.log(elem.num);
            return elem.num != e.target.closest("li").querySelector(".content__task-num").innerHTML;
        })
        populateTasks();
    }
}

// Save button is clicked, task-form content added to end of taskList
let saveTask = function(e) {
    let newTask = e.target.closest("li");
    let taskNum = parseInt(newTask.querySelector(".content__task-form-num").innerText);
    taskList[taskNum-1] = {
        num: newTask.querySelector(".content__task-form-num").innerHTML,
        name: newTask.querySelector(".content__task-form-name").value,
        qty: newTask.querySelector(".content__task-form-qty").value,
        price: newTask.querySelector(".content__task-form-price").value,
        description: newTask.querySelector(".content__task-form-desc").value
    };
    populateTasks();
}

// Click on 'add task' button, task-form is added to DOM
let addTask = function(e) {
    let taskFormHTML = `
            <div class="content__task-form-num">${taskList.length + 1}</div>
                <input type="text" name="name" class="content__task-form-name" placeholder="Task name">
                <input type="text" name="qty" class="content__task-form-qty" placeholder="Qty">
                <input type="text" name="price" class="content__task-form-price" placeholder="Price">
                <textarea name="description" class="content__task-form-desc" placeholder="Description"></textarea>
                <div class="content__task-form-btns">
                <button class="save">Save</button>
                <button class="cancel">Cancel</button>
                </div>
        `;
    let taskForm = document.createElement("li");
    taskForm.classList.add("content__task-form");
    taskForm.innerHTML = taskFormHTML;
    document.querySelector(".content__tasks-list").appendChild(taskForm);
    document.querySelector("button.cancel").addEventListener("click", (e) => {
        populateTasks();
    });
    document.querySelector("button.save").addEventListener("click", saveTask);
}

// Ensure that task.num values are always in order, no duplicates, and none missing
let recountTasks = function() {
    for (let i = 1; i <= taskList.length; i++) {
        taskList[i-1].num = i.toString();
    }
}

// Save button on bottom of page, gather all details as JSON and send async, confirmation and redirect
let saveJob = function(e) {
    let json = {
        customer_id: customer_id,
        estimate_id: ESTIMATE_ID,
        job: {
            contact: {},
            details: {}
        },
        tasks: taskList
    };

    json.job.contact.name = document.querySelector("#content__contact-name").value;
    json.job.contact.phone = document.querySelector("#content__contact-phone").value;
    json.job.contact.email = document.querySelector("#content__contact-email").value;

    json.job.details.name = document.querySelector("#content__details-name").value;
    json.job.details.description = document.querySelector("#content__details-desc").value;
    json.job.details.location = document.querySelector("#content__details-location").value;
    json.job.details.date = document.querySelector("#content__details-start-date").value;

    fetch('/saveJob', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken,
        },
        body: JSON.stringify(json),
    })
    .then((response) => response.json())
    .then((data) => {
        if (data.success == true) {
            alert("Job saved!");
            window.location.href = `/jobs/${ data.job_id }`;
        }
        else {
            alert("Something went wrong...")
        }
    });
}

// Choose estimate button is clicked, tasks are retrieved and populated via global taskList
let getEstimateTasks = function(e) {
    let oldLink = document.querySelector(".estimate-name-link");
    if (oldLink) {
        oldLink.remove();
    }
    let estimate_id = e.target.closest("li").querySelector(".estimate-id").innerText;
    // update global var to ensure estimate and new job are linked on back end
    ESTIMATE_ID = estimate_id;
    let estimate_name = e.target.closest("li").querySelector(".estimate-name").innerText;
    console.log(estimate_id);
    let url = `/estimatetasks/${estimate_id}`
    fetch(url)
    .then((response) => {
        return response.json();
    })
    .then((data) => {
        taskList = [];
        console.log(data.tasks);
        for (task of data.tasks) {
            let i = 1;
            console.log(task.name);
            taskList.push({ 
                num: i,
                name: task.name,
                qty: task.quantity,
                price: task.price,
                description: task.description
            });
            i = i+1;
        }
        populateTasks();
        let estimateNameLink = document.createElement("a");
        estimateNameLink.href = `/estimates/${estimate_id}`;
        estimateNameLink.innerText = estimate_name;
        estimateNameLink.classList.add("estimate-name-link");
        let estimateButton = document.querySelector(".choose-estimate");
        estimateButton.innerText = "Choose a different estimate...";
        estimateButton.classList.add("chosen");
        document.querySelector(".content__header").insertBefore(estimateNameLink, estimateButton);
        document.querySelector(".estimates_modal").classList.toggle("active");

        document.querySelector("#content__details-name").value=estimate_name;
        document.querySelector("#content__details-desc").value=data.description;
    })
}



// onLoad() =============================================================================== //

window.addEventListener("load", (loadEvent) => {
    tasks_snapshot();

    // Edit task, task is replaced with auto-populated task-form
    document.querySelectorAll(".content__task-btns-edit").forEach((btn) => {
        btn.addEventListener("click", editTask);
    });

    document.querySelectorAll(".content__task .flex-wrap").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            e.target.closest("li").classList.toggle("active");
        })
    })

    document.querySelectorAll(".content__task-btns-del").forEach((elem) => {
        elem.addEventListener("click", deleteTask);
    });

    document.querySelector("button.add_task").addEventListener("click", addTask);

    document.querySelectorAll(".footer__button-save").forEach((btn) => {
        btn.addEventListener("click", saveJob);
    })

    document.querySelector("button.choose-estimate").addEventListener("click", (e) => {
        document.querySelector(".estimates_modal").classList.toggle("active");
    })

    document.querySelector(".estimates_modal").addEventListener("click", (e) => {
        if (e.target.classList.contains("estimates_modal") | e.target.classList.contains("close-button")) {
            document.querySelector(".estimates_modal").classList.toggle("active");
        }
    })

    document.querySelectorAll(".estimate-list-item").forEach((elem) => {
        elem.addEventListener("click", getEstimateTasks);
    });

});