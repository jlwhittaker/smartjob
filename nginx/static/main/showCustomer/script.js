function getCookie(name) {
	//copy/pasted from django docs, sue me
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
	items: {}, // Hold master copy of all jobs/invoices/etc.,
	csrftoken: getCookie('csrftoken'),
	customer_id: '', 
}

// 'items' here refers to the main list elements that are visible, representing jobs/estimates/etc.
let itemFunctions = {

	//Pull items from DOM and save to global object, to be used later
	snapshot() {
		let jobs = document.querySelectorAll(".content__jobs li");
		globals.items["jobs"] = []
		for (let j of jobs) {
			console.log(j);
			globals.items["jobs"].push(
				{
					"id": j.querySelector(".content__list-item-id").innerText,
					"date": j.querySelector(".content__list-item-date").innerText,
					"name": j.querySelector(".content__list-item-name").innerText
				}
			)
		}
		let estimates = document.querySelectorAll(".content__estimates li");
		globals.items["estimates"] = []
		for (let e of estimates) {
			globals.items["estimates"].push(
				{
					"id": e.querySelector(".content__list-item-id").innerText,
					"date": e.querySelector(".content__list-item-date").innerText,
					"name": e.querySelector(".content__list-item-name").innerText
				}
			)
		}
		let invoices = document.querySelectorAll(".content__invoices li");
		globals.items["invoices"] = []
		for (let i of invoices) {
			globals.items["invoices"].push(
				{
					"id": i.querySelector(".content__list-item-id").innerText,
					"date": i.querySelector(".content__list-item-date").innerText,
					"name": i.querySelector(".content__list-item-name").innerText
				}
			)
		}
		let notes = document.querySelectorAll(".content__notes li");
		globals.items["notes"] = []
		for (let n of notes) {
			globals.items["notes"].push(
				{
					"id": n.querySelector(".content__list-item-id").innerText,
					"date": n.querySelector(".content__list-item-date").innerText,
					"name": n.querySelector(".content__list-item-name").innerText
				}
			)
		}		
	},

	//populate items based on selected type
	//overloaded to also act as search functionality, if there's no query just show all
	populate(selected, query) {
		let item_list = document.querySelector(`.content__${selected} ul`);
		item_list.innerHTML = '';
	
		for (let item of globals.items[selected]) {
			if (!query || item.name.toLowerCase().includes(query)) {
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
	},

	// sort column corresponding with sortIndex
	sort(sortIndex, ascending) {
		function sortHelper(a,b) {
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
		};
		// Pull items from DOM and do the sorting
		let items = Array.from(document.querySelectorAll(".active .content__list-item"));
		items = items.sort(sortHelper);
		if (!ascending) {
			items = items.reverse();
		}
	
		//remove existing list items and repopulate in sorted order
		let mainList = document.querySelector(".active ul");
		mainList.innerHTML = '';
		for (let item of items) {
			mainList.appendChild(item);
		}
	}
}

let noteFunctions = {

	// Save note
	save() {
		// get note content from textarea elem, and then clear the textarea
		let note_form = document.querySelector(".note-content");
		let content = note_form.value;
		note_form.value = "";

		// generate POST request
		let json = {
			type: "customer",
			id: globals.customer_id,
			content: content
		};
		console.log(json)
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
				// format date to ensure visual consistency
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
				//Append new note to DOM, better done by client vs redirect
				let new_note = document.createElement("li");
				new_note.classList.add("content__list-item");
				new_note.innerHTML = 
				`
					<div class="content__list-item-id">${data.id}</div>
					<div class="content__list-item-date">${date_string}</div>
					<div class="content__list-item-name">${content}</div>
				`
				document.querySelector(".content__notes ul").appendChild(new_note);

				// clear the note form
				document.querySelector(".add_note_modal").classList.toggle("active");
			}
		});
		
		itemFunctions.snapshot();
	}
}

let handlers = {

	//toggle visibility of log_out button
	logOutButton(e) {
		document.querySelector("header p").classList.toggle("selected");
		document.querySelector(".cover").classList.toggle("active");
		document.querySelector(".log_out").classList.toggle("active");
	},

	// Live search selected items
	search(e) {
		let selected = document.querySelector(".nav__button.active").innerText.toLowerCase();
		let query = e.target.value.toLowerCase();
		itemFunctions.populate(selected, query);		
	},

	//Sort a column, this modifies classes, determines sort params, and calls itemFunctions.sort()
	sort(e) {
		let ascending;
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
			ascending = false;
		}
		else {
			target.classList.remove("descending");
			target.classList.add("ascending");
			ascending = true;
		};

		// use event target to determine which column to sort
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

		//Do the sorting
		itemFunctions.sort(sortIndex, ascending);
	},

	saveNote(e) {
		noteFunctions.save();
	},

	//toggle visiblity of note form
	addNoteModal(e) {
		e.stopPropagation();
		if (e.target.classList.contains("add_note_modal") ||
				e.target.innerText == "Cancel" ||
				e.target.classList.contains("add_note_btn")) {
			document.querySelector(".add_note_modal").classList.toggle("active");
			}
	}
}


window.addEventListener("load", (e) => {
	globals.customer_id = window.CUSTOMER_ID; // assigned in template by server
	//Take snapshot of all items
	itemFunctions.snapshot();
	// Accordion nav buttons, toggling 'active' class
	let nav_buttons = document.querySelectorAll(".nav__button");
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
    let details_button = document.querySelector(".customer-details-btn");
    let details = document.querySelector(".customer-details");
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

	document.querySelector("header p").addEventListener("click", handlers.logOutButton);
	document.querySelector(".cover").addEventListener("click", handlers.logOutButton);

	document.querySelector(".content__search input").addEventListener("keyup", handlers.search);
	document.querySelectorAll(".content__list-header div").forEach((elem) => {
		elem.addEventListener("click", handlers.sort);
	});

	document.querySelectorAll(".add_note_btn").forEach((elem) => {
		elem.addEventListener("click", handlers.addNoteModal);
	});
    document.querySelector(".add_note_modal").addEventListener("click", handlers.addNoteModal);

	document.querySelector(".save-note").addEventListener("click", handlers.saveNote);
});