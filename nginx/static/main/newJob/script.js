// Need to get CSRF token for AJAX
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


// global variable JOB_ID assigned in markup during django rendering: 
// <script> const JOB_ID = {{ job.id }}</script>

let globals = {
    taskList: [],
    CSRFtoken: getCookie('csrftoken'),
    customer_id: window.CUSTOMER_ID, // Assigned in template by server
    estimate_id: '',
}

let taskFunctions = {

    // List of all tasks, used for sending tasks to server
    masterList: [],

    // Take snapshot of current tasks and save to masterList
    takeSnapshot() {
        let tasks = document.querySelectorAll(".content__task");
        let snapshot = [];
        tasks.forEach((task) => {
            snapshot.push(
                {
                    num: task.querySelector(".content__task-num").innerHTML,
                    name: task.querySelector(".content__task-name").innerHTML,
                    qty: task.querySelector(".content__task-qty").innerHTML,
                    price: task.querySelector(".content__task-price").innerHTML,
                    description: task.querySelector(".content__task-desc p").innerText,
                    total: task.qty * task.price,
                }
            )
        });
        globals.taskList = snapshot;   
    },

    // User masterList to populate tasks on DOM
    populate() {
        let oldTaskList = document.querySelector(".content__tasks-list");

        // recount tasks to ensure numbering makes sense
        this.recount();

        // big ol' html string for all tasks
        let newTaskListHTML = "";
        globals.taskList.forEach((task) => {
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
        });
        oldTaskList.innerHTML = newTaskListHTML;

        // Re-attach click handlers for task list functionality
        document.querySelectorAll(".content__task .flex-wrap").forEach((btn) => {
            btn.addEventListener("click", (e) => {
                e.target.closest("li").classList.toggle("active");
            })
        })

        document.querySelectorAll(".content__task-btns-edit").forEach((btn) => {
            btn.addEventListener("click", handlers.editTask);
        });

        document.querySelectorAll(".content__task-btns-del").forEach((elem) => {
            elem.addEventListener("click", handlers.deleteTask);
        });
    },

    // Called from handler, edit button was clicked
    edit(task) {

        // Pull relevant values from task element
        let num = task.querySelector(".content__task-num").innerText;
        let name = task.querySelector(".content__task-name").innerHTML;
        let qty = task.querySelector(".content__task-qty").innerHTML;
        let price = task.querySelector(".content__task-price").innerHTML;
        let desc = task.querySelector(".content__task-desc p").innerText;
    
        // Insert those values into new HTML to render editing component
        let taskForm = document.createElement("li");
        let taskFormHTML = `
                <div class="content__task-form-num">${num}</div>
                <input type="text" name="name" class="content__task-form-name" value="${name}">
                <input type="text" name="qty" class="content__task-form-qty" value="${qty}">
                <input type="text" name="price" class="content__task-form-price" value="${price}">
                <textarea name="description" class="content__task-form-desc">${desc}</textarea>
                <div class="content__task-form-btns">
                <button class="save">Add Task</button>
                <button class="cancel">Cancel</button>
                </div>
            `;
        taskForm.classList.add("content__task-form");
        taskForm.innerHTML = taskFormHTML;
        document.querySelector(".content__tasks-list").replaceChild(taskForm, task);

        // Attach click handlers to editing component
        document.querySelector("button.cancel").addEventListener("click", (e) => {
            this.populate();
        });
        document.querySelector("button.save").addEventListener("click", handlers.saveTask);
    },

    // Called from handler, delete task button clicked
    delete(task) {
        if (confirm("Delete this task?")) {
            // remove task from masterList if it has matching number
            globals.taskList = globals.taskList.filter((elem) => {
                return elem.num != task.querySelector(".content__task-num").innerHTML;
            })
            this.populate();
        }
    },

    // Called from handler, save task was clicked
    save(newTask) {
        //let newTask = e.target.closest("li");

        // Get values from DOM
        let taskNum = parseInt(newTask.querySelector(".content__task-form-num").innerText);
        let qty = newTask.querySelector(".content__task-form-qty").value
        let price = newTask.querySelector(".content__task-form-price").value

        // Save new task to masterList
        globals.taskList[taskNum-1] = {
            num: newTask.querySelector(".content__task-form-num").innerHTML,
            name: newTask.querySelector(".content__task-form-name").value,
            qty: qty,
            price: price,
            description: newTask.querySelector(".content__task-form-desc").value,
            total: qty*price
        };

        // rerender tasks on page
        this.populate();
    },

    // Called from handler, add task button was clicked, editing form added to DOM
    add() {
        // HTML string for task editing form
        let taskForm = document.createElement("li");
        let taskFormHTML = `
            <div class="content__task-form-num">${globals.taskList.length + 1}</div>
                <input type="text" name="name" class="content__task-form-name" placeholder="Task name">
                <input type="text" name="qty" class="content__task-form-qty" placeholder="Qty">
                <input type="text" name="price" class="content__task-form-price" placeholder="Price">
                <textarea name="description" class="content__task-form-desc" placeholder="Description"></textarea>
                <div class="content__task-form-btns">
                <button class="save">Add Task</button>
                <button class="cancel">Cancel</button>
                </div>
        `;
        taskForm.classList.add("content__task-form");
        taskForm.innerHTML = taskFormHTML;
        document.querySelector(".content__tasks-list").appendChild(taskForm);

        // Attach click handlers 
        document.querySelector("button.cancel").addEventListener("click", handlers.populateTasks);
        document.querySelector("button.save").addEventListener("click", handlers.saveTask);
    },

    // Recount masterList to make sure numbers are correct
    recount() {
        for (let i = 1; i <= globals.taskList.length; i++) {
            globals.taskList[i-1].num = i.toString();
        }      
    },

    // Get tasks of selected job from server, called from handler when job is 
    // job arg is li element that was clicked, contains job id and name
    retrieve(estimate) {
        //remove previously linked job
        let oldLink = document.querySelector(".estimate-name-link");
        if (oldLink) {
            oldLink.remove();
        }

        // get job id and name, and update global JOB_ID var (used when saving job)
        let estimate_name = estimate.querySelector(".estimate-name").innerText;
        let estimate_id = estimate.querySelector(".estimate-id").innerText;
        globals.estimate_id = estimate_id;

        // make AJAX request for tasks
        let url = `/estimates/tasks/${estimate_id}`
        fetch(url,
            {
                credentials: "include",
            })
        .then((response) => {
            return response.json();
        })
        .then((data) => {
            //rewrite masterList
            globals.taskList = [];
            for (task of data.tasks) {
                let i = 1;
                globals.taskList.push({ 
                    num: i,
                    name: task.name,
                    qty: task.quantity,
                    price: task.price,
                    description: task.description,
                    total: task.price * task.quantity
                });
                i = i+1;
            }
            this.populate();

            //Create link to navigate to chosen estimate
            let estimateNameLink = document.createElement("a");
            estimateNameLink.href = `/estimates/${globals.estimate_id}`;
            estimateNameLink.innerText = estimate_name;
            estimateNameLink.classList.add("estimate-name-link");

            //Button to allow choosing different estimate
            let estimateButton = document.querySelector(".choose-estimate");
            estimateButton.innerText = "Choose a different estimate...";
            estimateButton.classList.add("chosen");
            document.querySelector(".content__header").insertBefore(estimateNameLink, estimateButton);

            // Remove estimate selection modal and update DOM to show new estimate name
            document.querySelector(".estimates_modal").classList.toggle("active");
            document.querySelector("#content__details-name").value=estimate_name;
            document.querySelector("#content__details-desc").value=data.description;
        })
    },
}

let jobFunctions = {

    // Save job button was clicked
    save() {
        // populate AJAX request body
        let json = {
            customer_id: CUSTOMER_ID, //received from template
            estimate_id: globals.estimate_id,
            job: {
                details: {
                    "name": document.querySelector("#content__details-name").value,
                    "description": document.querySelector("#content__details-desc").value,
                    "date": document.querySelector("#content__details-start-date").value,
                    "location": document.querySelector("#content__details-location").value,
                },
                contact: {
                    "name": document.querySelector("#content__contact-name").value,
                    "phone": document.querySelector("#content__contact-phone").value,
                    "email": document.querySelector("#content__contact-email").value,
                },
                due_date: document.querySelector(".due_date"),
            },
            tasks: globals.taskList
        };

        // Send AJAX 
        fetch(`/jobs/save`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': globals.CSRFtoken,
            },
            body: JSON.stringify(json),
            credentials: "include",
        })
        .then((response) => {
            return response.json();
        }).then((data) => {
            window.location.href = `/jobs/${data['job_id']}`;
        });
    },

}

let handlers = {
    editTask(e) {
        let task = e.target.closest("li");
        taskFunctions.edit(task);
    },

    deleteTask(e) {
        let task = e.target.closest("li");
        taskFunctions.delete(task);
    },

    addTask(e) {
        taskFunctions.add();
    },

    saveTask(e) {
        let task = e.target.closest("li");
        taskFunctions.save(task);
    },

    saveJob(e) {
        jobFunctions.save();
    },

    taskDetail(e) {
        e.target.closest("li").classList.toggle("active");
    },

    openEstimatesModal(e) {
        document.querySelector(".estimates_modal").classList.toggle("active");
    },

    closeEstimatesModal(e) {
        if (e.target.classList.contains("estimates_modal") | e.target.classList.contains("close-button")) {
            document.querySelector(".estimates_modal").classList.toggle("active");
        }
    },

    getEstimateTasks(e) {
        let estimate = e.target.closest("li");
        taskFunctions.retrieve(estimate);
    },

    logOutButton(e) {
        document.querySelector("header p").classList.toggle("selected");
        document.querySelector(".cover").classList.toggle("active");
        document.querySelector(".log_out").classList.toggle("active");
    },

    deleteJobPrompt(e) {
        document.querySelector(".delete-job-prompt").classList.toggle("active");
    },

    deleteJob(e) {
        jobFunctions.delete();
    }

}

// onLoad() =============================================================================== //

window.addEventListener("load", (loadEvent) => {
    // Pull tasks from DOM and save to master list
    taskFunctions.takeSnapshot();

    // Edit task, task is replaced with auto-populated task-form
    document.querySelectorAll(".content__task-btns-edit").forEach((btn) => {
        btn.addEventListener("click", handlers.editTask);
    });

    // Toggle expanded detail view when task is clicked
    document.querySelectorAll(".content__task .flex-wrap").forEach((btn) => {
        btn.addEventListener("click", handlers.taskDetail);
    })

    // Delete task 
    document.querySelectorAll(".content__task-btns-del").forEach((elem) => {
        elem.addEventListener("click", handlers.deleteTask);
    });

    // Add new task
    document.querySelector("button.add_task").addEventListener("click", handlers.addTask);

    // Save job
    document.querySelectorAll(".footer__button-save").forEach((btn) => {
        btn.addEventListener("click", handlers.saveJob);
    })

    // open/close estimate selection modal
    document.querySelector("button.choose-estimate").addEventListener("click", handlers.openEstimatesModal);
    document.querySelector(".estimates_modal").addEventListener("click", handlers.closeEstimatesModal);

    // Job was selected, retrieve tasks
    document.querySelectorAll(".estimate-list-item").forEach((elem) => {
        elem.addEventListener("click", handlers.getEstimateTasks);
    });

    // Toggle log out button visibility
    document.querySelector("header p").addEventListener("click", handlers.logOutButton);
    document.querySelector(".cover").addEventListener("click", handlers.logOutButton);
    

    let input = document.getElementById("content__details-location");
    let autocomplete = new google.maps.places.Autocomplete(input, {});
});
