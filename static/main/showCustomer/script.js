var ITEMS = {}; //Holds snapshot of all jobs/estimates/etc.

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

function log_out_button(e) {
	document.querySelector("header p").classList.toggle("selected");
	document.querySelector(".cover").classList.toggle("active");
	document.querySelector(".log_out").classList.toggle("active");

}

//Take snapshot of all items
function snapshot() {
	let jobs = document.querySelectorAll(".content__jobs li");
	ITEMS["jobs"] = []
	for (let j of jobs) {
		ITEMS["jobs"].push(
			{
				"id": j.querySelector(":nth-child(1)").innerText,
				"date": j.querySelector(":nth-child(2)").innerText,
				"name": j.querySelector(":nth-child(3)").innerText
			}
		)
	}
	let estimates = document.querySelectorAll(".content__estimates li");
	ITEMS["estimates"] = []
	for (let e of estimates) {
		ITEMS["estimates"].push(
			{
				"id": e.querySelector(":nth-child(1)").innerText,
				"date": e.querySelector(":nth-child(2)").innerText,
				"name": e.querySelector(":nth-child(3)").innerText
			}
		)
	}
	let invoices = document.querySelectorAll(".content__invoices li");
	ITEMS["invoices"] = []
	for (let i of invoices) {
		ITEMS["invoices"].push(
			{
				"id": i.querySelector(":nth-child(1)").innerText,
				"date": i.querySelector(":nth-child(2)").innerText,
				"name": i.querySelector(":nth-child(3)").innerText
			}
		)
	}
	let notes = document.querySelectorAll(".content__notes li");
	ITEMS["notes"] = []
	for (let n of notes) {
		ITEMS["notes"].push(
			{
				"id": n.querySelector(":nth-child(1)").innerText,
				"date": n.querySelector(":nth-child(2)").innerText,
				"name": n.querySelector(":nth-child(3)").innerText
			}
		)
	}
	console.log(ITEMS);
}

//Populate list items using either snapshot or result from search filter
function populateItems(selected, query) {
	let item_list = document.querySelector(`.content__${selected} ul`);
	item_list.innerHTML = '';

	for (let item of ITEMS[selected]) {
		if (item.name.toLowerCase().includes(query) || !query) {
			let new_item = document.createElement("a");
			new_item.href = `/${selected}/${item.id}`;
			new_item.innerHTML = 
			`
				<li class="content__list-item">
					<div class="content__list-item-id">${item.id}</div>
					<div class="content__list-item-date">${item.date}</div>
					<div class="content__list-item-name">${item.name}</div>
				</li>
			`;
			item_list.appendChild(new_item);
		}
	}
}

//Handler on search bar, wrapper around populateItems()
function search(e) {
	let selected = document.querySelector(".nav__button.active").innerText.toLowerCase();
	console.log(selected);
	populateItems(selected, e.target.value.toLowerCase());
}

function columnSort(e) {
	// add/remove appropriate classes
	let divs = document.querySelectorAll(".content__list-header div");
	divs.forEach((div) => {
		div.classList.remove("selected");
	});
	let target = e.target.closest("div");
	target.classList.add("selected");
	if (target.classList.contains("ascending")) {
		target.classList.remove("ascending");
		target.classList.add("descending");
	}
	else {
		target.classList.remove("descending");
		target.classList.add("ascending");
	};

	// Sort the list items by column
	let sortIndex;
	let sortName = e.target.innerText.toLowerCase();
	if (sortName.includes("id")) {
		sortIndex = 1;
	}
	else if (sortName.includes("date")) {
		sortIndex = 2;
	}
	else {
		sortIndex = 3;
	}
	let items = Array.from(document.querySelectorAll(".active .content__list-item"));
	items = items.sort((a, b) => {
		let val1;
		let val2;
		if (sortIndex == 1) {
			val1 = parseInt(a.querySelector(`:nth-child(${sortIndex}`).innerText)
			val2 = parseInt(b.querySelector(`:nth-child(${sortIndex}`).innerText);
		}
		else {
			val1 = a.querySelector(`:nth-child(${sortIndex}`).innerText.toLowerCase();
			val2 = b.querySelector(`:nth-child(${sortIndex}`).innerText.toLowerCase();
		}
		if (val1 > val2) {
			return -1;
		}
		else {
			return 1;
		}
	});
	if (e.target.classList.contains("descending")) {
		items = items.reverse();
	}

	//remove existing list items and repopulate in sorted order

	let mainList = document.querySelector(".active ul");
	mainList.innerHTML = '';
	for (let item of items) {
		mainList.appendChild(item);
	}
}

function add_note_modal(e) {
    e.stopPropagation();
    if (e.target.classList.contains("add_note_modal") ||
            e.target.innerText == "Cancel" ||
            e.target.classList.contains("add_note_btn")) {
        document.querySelector(".add_note_modal").classList.toggle("active");
        }
}

function save_note(e) {
    let note_form = document.querySelector(".note-content");
    let content = note_form.value;
    note_form.value = "";
    let json = {
        type: "customer",
        id: CUSTOMER_ID,
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
            new_note.classList.add("content__list-item");
			new_note.innerHTML = 
			`
				<div class="content__list-item-id">${data.id}</div>
				<div class="content__list-item-date">${date_string}</div>
				<div class="content__list-item-name">${content}</div>
			`
            document.querySelector(".content__notes ul").appendChild(new_note);
            document.querySelector(".add_note_modal").classList.toggle("active");
        }
    })
}

window.addEventListener("load", (e) => {
	
	// Accordion nav buttons, toggling 'active' class
	const nav_buttons = document.querySelectorAll(".nav__button");

	nav_buttons.forEach((btn) => {
		btn.addEventListener("click", (e) => {
			nav_buttons.forEach((elem) => {
				elem.classList.remove("active");
			});
			e.target.classList.add("active");
			document.querySelectorAll("[class^=content__]").forEach((elem) => {
				elem.classList.remove("active");
			});
			document.querySelector(`.content__${e.target.innerHTML.toLowerCase()}`).classList.add("active");
		});
    });
    
    // Show modal pop-up with customer details
    const details_button = document.querySelector(".customer-details-btn");
    const details = document.querySelector(".customer-details");
    details_button.addEventListener("click", (e) => {
        details.classList.add("active");
    })
    details.addEventListener("click", (e) => {
        if (e.target.classList.contains("customer-details") || 
            e.target.classList.contains("close")) {
            details.classList.toggle("active");
        }
	})
	
	// "Add new..." pop-up

	document.querySelectorAll(".footer-btn")[1].addEventListener("click", (e) => {
		document.querySelector(".footer__new").classList.toggle("active");
	})

	document.querySelector("header p").addEventListener("click", log_out_button);
	document.querySelector(".cover").addEventListener("click", log_out_button);
	snapshot();

	document.querySelector(".content__search input").addEventListener("keyup", search);
	document.querySelectorAll(".content__list-header div").forEach((elem) => {
		elem.addEventListener("click", columnSort);
	});

	document.querySelector(".add_note_btn").addEventListener("click", add_note_modal);
    document.querySelector(".add_note_modal").addEventListener("click", add_note_modal);

	document.querySelector(".save-note").addEventListener("click", save_note);
});