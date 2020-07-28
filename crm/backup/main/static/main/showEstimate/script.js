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

//Nav button selection, toggles ".active"
let nav_select = function(target) {

    if (window.matchMedia('(min-width: 1000px)').matches && 
        target.innerText.toLowerCase() == "details") {
        console.log("foo");
        return;
    } else {

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
};

let add_note_modal = function(e) {
    e.stopPropagation();
    if (e.target.classList.contains("add_note_modal") ||
            e.target.innerText == "Cancel" ||
            e.target.classList.contains("add_note_btn")) {
        document.querySelector(".add_note_modal").classList.toggle("active");
        }
}

// Toggle visibility of task description
let task_select = function(e) {
    console.log("foo");
    e.target.closest("li").classList.toggle("selected");
}

//Submit new note
let save_note = function(e) {
    let note_form = document.querySelector(".note-content");
    let content = note_form.value;
    note_form.value = "";
    let json = {
        type: "estimate",
        id: ID,
        content: content
    }
    fetch("/addNote", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken
        },
        body: JSON.stringify(json)
    }).then((response) => response.json())
    .then((data) => {
        if (data.success) {
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
            let new_note = document.createElement("li");
            new_note.classList.add("content__note");
            new_note.innerHTML = `<div class="content__note-date">${date_string}</div>
                                  <div class="content__note-content">${content}</div>`
            document.querySelector(".content__notes ul").appendChild(new_note);
            document.querySelector(".add_note_modal").classList.toggle("active");
        }
    })


}

window.onload = (e) => {
    document.querySelectorAll(".nav__button").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            nav_select(e.target);
        })
    });

    document.querySelectorAll(".content__task").forEach((elem) => {
        elem.addEventListener("click", task_select);
    })

    document.querySelector(".add_note_btn").addEventListener("click", add_note_modal);
    document.querySelector(".add_note_modal").addEventListener("click", add_note_modal);

    document.querySelector(".save-note").addEventListener("click", save_note);

    // Make sure content isn't blank with wider screen, manually set correct div to active
    let task_btn = Array.from(document.querySelectorAll(".nav__button")).filter((elem) => {
        return elem.innerText.toLowerCase() == "tasks";
    })[0];

    let details_btn = Array.from(document.querySelectorAll(".nav__button")).filter((elem) => {
        return elem.innerText.toLowerCase() == "details";
    })[0];

    if (window.matchMedia("(min-width: 1000px)").matches) {
        nav_select(task_btn);
    }

    // In case tablet screen gets flipped, default to tasks active if only details is active
    window.addEventListener("resize", (e) => {
        if (window.matchMedia("(min-width: 1000px)").matches) {
            if (details_btn.classList.contains("active")) {
                nav_select(task_btn);
            }
        }
    })

}