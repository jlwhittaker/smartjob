window.addEventListener("load", (e) => {

	//global object to hold customer id for live search (server needs id, not name)
	var SEARCH = {};

	//holds which (customers/jobs/etc) view is selected, used for add_new modal
	var SELECTED = "customers";
	
	// Accordion nav buttons, toggling 'active' class
	const nav_buttons = document.querySelectorAll(".nav__button");

	nav_buttons.forEach((btn) => {
		btn.addEventListener("click", (e) => {
			nav_buttons.forEach((elem) => {
				elem.classList.remove("active");
			});
			e.target.classList.add("active");
			document.querySelectorAll(".cards").forEach((elem) => {
				elem.classList.remove("active");
			});
			let selected = e.target.innerHTML.toLowerCase();
			SELECTED = selected;
			document.querySelector(`.cards.${selected}`).classList.add("active");
		});
	});

	//live search for finding customer when adding new invoice/job/etc.
	const live_search = function(e) {
		//Remove red border around input
		document.querySelector(".live_search").classList.remove("invalid");
		//remove id from global SEARCH obj, can only submit if valid name (w/ id) was selected
		SEARCH["id"] = '';
		var results = [];
		let query = e.target.value;
		if (query) {
			const url = `/search/customer/${e.target.value}`;
			fetch(url).then((res) => {
				return res.json()
			}).then((data) => {
				results = data['results'];
				update_live_search(results);
			});
		}
		else {
			update_live_search(results);
		}
	}

	const update_live_search = function(arr) {
		let list = document.querySelector(".live_search_results ul");
		list.innerHTML = '';
		for (let result of arr) {
			let elem = document.createElement("li")
			elem.id = result[1];
			elem.innerHTML = result[0];
			elem.addEventListener("click", fill_live_search);
			list.appendChild(elem);
		}
	}
	const fill_live_search = function(e) {
		document.querySelector(".live_search").value = e.target.innerText;
		SEARCH["id"] = e.target.id;
		document.querySelector(".live_search_results").classList.remove("active");
		update_live_search([]);
	}

	const submit = function(e) {
		if (document.querySelector(".new_type").value == "customer") {
			window.location.href = "/customers/new";
		}
		else if (!SEARCH["id"]) {
			invalid_search();
		}
		else {
			const type = document.querySelector(".new_type").value;
			const url = `/${type.toLowerCase()}s/new/${SEARCH["id"]}`;
			window.location.href = url;
		}
	}

	const invalid_search = function() {
		let input = document.querySelector(".live_search");
		input.classList.add("invalid");
	}

	const modal_hide_search = function() {
		document.querySelectorAll(".search").forEach((elem) => {
			if (elem.classList.contains("active")) {
				elem.classList.remove("active");
			}
		})
	}

	const modal_show_search = function() {
		document.querySelectorAll(".search").forEach((elem) => {
			if (!elem.classList.contains("active")) {
				elem.classList.add("active");
			}
		})
	}

	const open_modal = function(e) {
		document.querySelector(".add_new_modal").classList.add("active");
		console.log(SELECTED);
		if (SELECTED == "customers") {
			modal_hide_search();
			console.log("foo");
		}
		else {
			modal_show_search();
		}
		document.querySelector(".new_type").value = SELECTED.slice(0, -1);
		
	}

	const close_modal = function(e) {
		if (e.target.classList.contains("add_new_modal")) {
			e.target.classList.remove("active");
		}
	}

	function log_out_button(e) {
		document.querySelector("header p").classList.toggle("selected");
		document.querySelector(".cover").classList.toggle("active");
		document.querySelector(".log_out").classList.toggle("active");

	}

	document.querySelector(".live_search").addEventListener("keyup", live_search);
	document.querySelector(".modal_content button").addEventListener("click", submit);
	document.querySelectorAll(".add_new").forEach((elem) => {
		elem.addEventListener("click", open_modal);
	})
	document.querySelector(".new_type").addEventListener("change", (e) => {
		console.log("bar");
		if (e.target.value == "customer") {
			modal_hide_search();
		}
		else {
			modal_show_search();
		}
	})
	document.querySelector(".add_new_modal").addEventListener("click", close_modal);
	document.querySelector("header p").addEventListener("click", log_out_button);
	document.querySelector(".cover").addEventListener("click", log_out_button);
});