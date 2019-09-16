window.addEventListener("load", (e) => {

	function getRecent(url) { // returns XHR promise, resolves to JSON response from server
		return new Promise(function (resolve, reject) {
			let request = new XMLHttpRequest();

			let response = "";
			request.onreadystatechange = () => {
				if (request.readyState == 4 && request.status == 200) {
					response = JSON.parse(request.responseText);
					resolve(response);
					
				}
			};

			request.open("GET",url,true);
			request.send();
		})


	};

	function generateTabHTML(array, type) { // Takes an array of objects from JSON response, makes
											// <li> elements and returns one big html string
		let html = "";
		let str = "";
		let i = 0;
		switch (type){
			case "customers":
				for (let customer of array) {
					str += 
						`<li><a href="customers/${customer.id}"><div class="tab-element" id="customer-${customer.id}">
							<h1>${customer.name}</h1>
							<h2>Phone: ${customer.phone}</h2>
							<h3>Address: ${customer.address}</h3>
						</div></a></li>`
					i++;
				}
				html = "<ul class='tab-content' id='customers'>" + str + "</ul>";
				break;

			case "jobs":
				for (let job of array) {
					str +=
						`<li><a href="/main/jobs/${job.id}"><div class="tab-element" id="job-${job.id}">
							<h1>${job.customer}</h1>
							<h2>Date: ${job.date}</h2>
							<h3>Address: ${job.address}</h3>
						</div></a></li>`
				}
				html = "<ul class='tab-content' id='jobs'>" + str + "</ul>";
				break;

			case "invoices":
				for (let invoice of array) {
					str +=
						`<li><a href="#"><div class="tab-element" id="invoice-${invoice.id}">
							<h1>${invoice.customer}</h1>
							<h2>Date: ${invoice.date}</h2>
							<h3>Total: ${invoice.total}</h3>
						</div></a></li>`
				}
				html = "<ul class='tab-content' id='invoices'>" + str + "</ul>";
				break;

			case "estimates":
				for (let estimate of array) {
					str +=
						`<li><a href="/main/estimates/${estimate.id}"><div class="tab-element" id="estimates-${estimate.id}">
							<h1>${estimate.name}</h1>
							<h2>Customer: ${estimate.customer}</h2>
							<h3>Date: ${estimate.date}</h3>
						</div></a></li>`
				}
				html = "<ul class='tab-content' id='estimates'>" + str + "</ul>";
				console.log(html)
				break;
		}
		return html; // This should be one big list that can be plugged right into tabContent (or whatever)
	}

	function populateRecent(jsonResponse) { 
		let parent = document.getElementById("tab-content-container");
		for (let i of Object.keys(jsonResponse)) {
			console.log(i);
			parent.innerHTML += generateTabHTML(jsonResponse[i],i);
		}

		switchContent('Customers');
		
	}

	function switchContent(id) {
		document.querySelectorAll(".tab-content").forEach((elem) => {
			if (elem.id == id.toLowerCase()) {
				elem.style.display = "block";
			}
			else { elem.style.display = "none"; }
		})
		
	}

	getRecent('/main/getRecent').then((response) => { populateRecent(response); });

	document.querySelectorAll(".tab-element").onclick = (e) => {
	}

	document.querySelectorAll("#tabs-list > div").forEach((elem) => {
		elem.addEventListener("click", (e) => {
			switchContent(e.target.innerHTML);
		})
	})

	let navBar = document.getElementById("side-bar-nav-list");
	navBar.querySelectorAll(".nav-parent").forEach((elem) => {
		elem.onclick = (e) => {
			if (e.target.classList.contains("nav-parent")) {
				let list = e.target.firstElementChild
				if (list) {
					if (list.style.display == "none" || !list.style.display) {
					list.style.display = "flex";
					} else { list.style.display = "none";}
				}
			}
		}
	});

});