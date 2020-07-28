let globals = {

	// each search result has the same id attribute as the corresponding customer object
	// that id is stored here, to be used to autofill creation form on next page
	search_id:  "",
	// which object type is selected, customer is default
	type_selected: "customer",
}


let searchFunctions = {
	
	// live search from keyup listener, get back array of results
	search(query) {
		// clear out id from globals, must be reselected if search query changes
		globals.search_id = '';
		// Remove red border from potential previous invalid search
		document.querySelector(".live_search").classList.remove("invalid");
		// Send search query, pass results to update()
		let search_results = [];
		if (query) {
			let url = `/search/customer/${query}`;
			fetch(url,
				{
					credentials: "include",
				}).then((res) => {
				return res.json();
			}).then((data) => {
				search_results = data['results'];
				this.update(search_results);
			})
		}
		else {
			this.update(search_results);
		}
	},

	// Update view to show search results
	update(search_results) {
		console.log(search_results)
		// Clear out ul that holds search_results
		let results_list = document.querySelector(".live_search_results ul");
		results_list.innerHTML = '';
		// append search results to results_list
		for (let result of search_results) {
			let li = document.createElement("li")
			li.id = result.id;
			li.innerHTML = result.first_name+" "+result.last_name;
			console.log(li.innerHTML);
			li.addEventListener("click", handlers.fillSelection);
			results_list.appendChild(li);
		}
	},

	// search result is selected, fill input with value and update globals
	fillSelection(result) {
		// pull customer name and id from result (li element)
		document.querySelector(".live_search").value = result.innerText;
		//update global 
		globals.search_id = result.id;
		// Hide search results div and clear it 
		document.querySelector(".live_search_results").classList.remove("active");
		console.log(this)
		this.update([]);
	},

	// invalid search, add class
	invalid() {
		let input = document.querySelector(".live_search");
		input.classList.add("invalid");
	},

	// Selection has been made, submit button clicked, navigate to respective creation page
	submit() {
		// if customer is selected, search results are irrelevant
		if (globals.type_selected == "customer") {
			window.location.href = "/customers/new";
		}
		// Make sure a search result was selected
		// keyup listener on search input clears id from global
		// if no id, then new selection must be made
		else if (!globals.search_id) {
			this.invalid();
		}
		else {
			// navigate to creation page using customer id from global
			let url = `/${globals.type_selected}/new/${globals.search_id}`;
			console.log(url);
			window.location.href = url;
		}
	},

	openModal() {
		// Skip modal if customers is selected, go straight to creation page
		if (globals.type_selected == "customers") {
			window.location.href="/customers/new";
		}
		// Open modal and make search visible
		else {

			document.querySelector(".add_new_modal").classList.add("active");
			this.showSearch();
		}
	},

	closeModal() {
		document.querySelector(".add_new_modal").classList.remove("active");
	},

	// Show 'Choose a customer...' and search input
	showSearch() {
		document.querySelectorAll(".search").forEach((elem) => {
			if (!elem.classList.contains("active")) {
				elem.classList.add("active");
			}
		});
	},

	hideSearch() {
		document.querySelectorAll(".search").forEach((elem) => {
			if (elem.classList.contains("active")) {
				elem.classList.remove("active");
			}
		})
		this.update([]);
	}
};

let handlers = {
	// toggle visibility of log_out prompt
	logOutButton(e) {
		document.querySelector("header p").classList.toggle("selected");
		document.querySelector(".cover").classList.toggle("active");
		document.querySelector(".log_out").classList.toggle("active");
	},
	
	
	search(e) {
		let query = e.target.value;
		searchFunctions.search(query);
	},

	submit(e) {
		searchFunctions.submit();
	},

	// Navigate to seeAll page of selected type
	seeAll(e) {
		let type = globals.type_selected;
		window.location.href=`${type}s/all`;
	},

	// type selection input on modal is changed, modify global
	changeSelectedType(e) {
		globals.selected = e.target.value.toLowerCase();
		if (globals.selected == "customers") {
			searchFunctions.hideSearch();
		}
		else {
			searchFunctions.showSearch();
		}
	},

	openModal(e){
		searchFunctions.openModal();
	},

	closeModal(e) {
		if (!e.target.classList.contains("add_new_modal")) {
			return;
		}
		searchFunctions.closeModal();
	},

	fillSelection(e) {
		searchFunctions.fillSelection(e.target.closest("li"));
	}

};

window.addEventListener("load", (e) => {
	// Clear search input field, browser might keep old query there
	document.querySelector(".live_search").value = '';

	// Accordion nav buttons, toggling 'active' class
	// This is kind of gross but it works and I don't feel like refactoring it
	let nav_buttons = document.querySelectorAll(".nav__button");
	nav_buttons.forEach((btn) => {
		btn.addEventListener("click", (e) => {
			nav_buttons.forEach((elem) => {
				elem.classList.remove("active");
			});
			e.target.classList.add("active");
			document.querySelectorAll(".cards").forEach((elem) => {
				elem.classList.remove("active");
			});
			let selected = e.target.innerText.toLowerCase();
			globals.type_selected = selected;
			console.log(selected);
			document.querySelector(".new_type").value = selected.slice(0,-1);
			document.querySelector(`.cards.${selected}`).classList.add("active");
		});
	});

	// open search modal
	document.querySelectorAll(".add_new").forEach((elem) => {
		elem.addEventListener("click", handlers.openModal);

	})

	// Live search
	document.querySelector(".live_search").addEventListener("keyup", handlers.search);
	document.querySelector(".modal_content button").addEventListener("click", handlers.submit);

	// modal cover, close modal if clicked outside of modal content
	document.querySelector(".add_new_modal").addEventListener("click", handlers.closeModal);
	document.querySelector("header p").addEventListener("click", handlers.logOutButton);
	document.querySelector(".cover").addEventListener("click", handlers.logOutButton);
	document.querySelector(".see_all").addEventListener("click", handlers.seeAll);
});