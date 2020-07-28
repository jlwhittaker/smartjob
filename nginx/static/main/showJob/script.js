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
let globals = {
    csrftoken: getCookie("csrftoken"),
}


let noteFunctions = {
    save() {
        // Get note content from dom and clear form
        let note_form = document.querySelector(".note-content");
        let content = note_form.value;
        if (!content) {
            note_form.classList.add("invalid");
            return
        }
        note_form.value = "";

        // Generate POST request
        let json = {
            type: "estimate",
            id: ID,
            content: content
        }
        fetch("/addNote", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': globals.csrftoken
            },
            body: JSON.stringify(json),
            credentials: "include",
        }).then((response) => response.json())
        .then((data) => {
            if (data.success) {
                //Format date for visual consistency
                let date = new Date();
                let months = {
                    0: "January",
                    1: "February",
                    2: "March",
                    3: "April",
                    4: "May",
                    5: "June",
                    6: "July",
                    7: "August",
                    8: "September",
                    9: "October",
                    10: "November",
                    11: "December"
                }
                let date_string = `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
                // Append new note to DOM
                let new_note = document.createElement("li");
                new_note.classList.add("content__note");
                new_note.innerHTML = `<div class="content__note-date">${date_string}</div>
                                      <div class="content__note-content">${content}</div>`
                document.querySelector(".content__notes ul").appendChild(new_note);
                document.querySelector(".add_note_modal").classList.toggle("active");
            }
        })
    }
}

let handlers = {

    // Toggle visibility of selected section (details/tasks/notes)
    navSelect(target) {
        // Do nothing if Details is selected on large screen
        if (window.matchMedia('(min-width: 1000px)').matches && 
        target.innerText.toLowerCase() == "details") {
            return;
        } 
        else {
            // Adjust classes for nav buttons
            document.querySelectorAll(".nav__button").forEach((btn) => {
                btn.classList.remove("active");
            })
            target.classList.add("active");
            
            // Make .content div active
            document.querySelectorAll(".content div:not(last-child)").forEach((elem) => {
                elem.classList.remove("active");
            })
            document.querySelector(`#${target.innerText.toLowerCase()}`).classList.add("active");
        }        
    },

    //Toggle visibility of new note form
    addNoteModal(e) {
        e.stopPropagation();
        if (e.target.classList.contains("add_note_modal") ||
                e.target.innerText == "Cancel" ||
                e.target.classList.contains("add_note_btn")) {
            document.querySelector(".note-content").classList.remove("invalid");
            document.querySelector(".add_note_modal").classList.toggle("active");
            }
    },

    // Don't even try to figure out what this function does; it's too complex
    taskSelect(e) {
        e.target.closest("li").classList.toggle("selected");
    },

    // Same here. Seriously, it's not worth the headache
    saveNote(e) {
        noteFunctions.save();
    },

    //toggle logout button visibility
    logOutButton(e) {
        document.querySelector("header p").classList.toggle("selected");
        document.querySelector(".cover").classList.toggle("active");
        document.querySelector(".log_out").classList.toggle("active");
    }
}


window.onload = (e) => {

    // Nav buttons used to select what content is visible
    document.querySelectorAll(".nav__button").forEach((btn) => {
        btn.addEventListener("click", (e) => handlers.navSelect(e.target))
    });

    // Selecting a task toggles the task description
    document.querySelectorAll(".content__task").forEach((elem) => {
        elem.addEventListener("click", handlers.taskSelect);
    })

    // Modal pop-up for writing new note
    document.querySelector(".add_note_btn").addEventListener("click", handlers.addNoteModal);
    document.querySelector(".add_note_modal").addEventListener("click", handlers.addNoteModal);
    document.querySelector(".save-note").addEventListener("click", handlers.saveNote);

    // Make sure content isn't blank with wider screen, manually set correct div to active
    let task_btn = Array.from(document.querySelectorAll(".nav__button")).filter((elem) => {
        return elem.innerText.toLowerCase() == "tasks";
    })[0];
    console.log(task_btn)
    let details_btn = Array.from(document.querySelectorAll(".nav__button")).filter((elem) => {
        return elem.innerText.toLowerCase() == "details";
    })[0];
    if (window.matchMedia("(min-width: 1000px)").matches) {
        handlers.navSelect(task_btn);
    }

    // In case tablet screen gets flipped, default to tasks active if only details is active
    window.addEventListener("resize", (e) => {
        if (window.matchMedia("(min-width: 1000px)").matches) {
            if (details_btn.classList.contains("active")) {
                nav_select(task_btn);
            }
        }
    })
    document.querySelector(".header-wrapper p").addEventListener("click", handlers.logOutButton);
	document.querySelector(".cover").addEventListener("click", handlers.logOutButton);

}