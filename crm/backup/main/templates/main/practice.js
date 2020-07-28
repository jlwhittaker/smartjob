/*receive json on first page load
use function to create array of tab elements and append to page based on which button is clicked

clicking new button, calls function, and since function uses the clicked button, it will recreate new list

but really, all should be created only once, and clicking button should just change which is on the page

object called tab elements?
customers key, jobs key, etc.
key value is html representing list

pull that html straight from tabElements.customers*/

**TODO** function to generate HTML with switch statement seems like it would work, need to work on
		 generating appropriate JSON string from back end, and putting script in index.html to get it.
		 need to think about what scope to save some of these objects in.

jsonresponse:

	{
		customers: 	[
						{
							id: 420,
							name: "Jon",
							address: "Jon's address",
							phone: "Jon's phone number",						
						},
						{
							name: "Bob",
							address: "Bob's address",
							phone: "Bob's phone number",
						},
					],
		jobs: 		[
						{
							customer: "Jon",
							name: "Jon's job",
							address: "Address of Jon's job",
						},
						{
							customer: "Bob",
							name: "Bob's job",
							address: "Address of Bob's job",
						},
					],
		invoices: 	[
						{
							customer: "Jon",
							job: "Jon's job",
							total: "Invoice total",
						}
					]


	}

	for (let i in jsonResponse) {
		generateTabHTML(jsonResponse[i], i);
	}
		

function generateTabHTML(array, type) {
	let html = "<ul>";
	let str = "";
	switch (type){
		case "customers":
			for (let customer in array) {
				str += 
					`<div class="tab-element" id="${customer.id}">
						<h1>${customer.name}</h1>
						<h2>Phone: ${customer.phone}</h2>
						<h3>Address: ${customer.address}</h3>
					</div>`
				}

			html += "<li" + str + "</li></ul>";
			break;
		case "jobs":

		case "invoices":
	}
	return html;


}

<li>
	<div class="tab-element">
		<input id="tab-elem-element-check" type="checkbox">
		<h1>Customer name</h1>
		<h2>Phone: {{ customer.phone_number}}</h2>
		<h3>Address: {{ customer.address }}</h3>
	</div>
</li>
<li>
	<div class="tab-element">
		<input id="tab-elem-element-check" type="checkbox">
		<h1>{{ customer.name }}</h1>
		<h2>Phone: {{ customer.phone_number}}</h2>
		<h3>Address: {{ customer.address }}</h3>
	</div>
</li>
<li>
	<div class="tab-element">
		<input id="tab-elem-element-check" type="checkbox">
		<h1>{{ customer.name }}</h1>
		<h2>Phone: {{ customer.phone_number}}</h2>
		<h3>Address: {{ customer.address }}</h3>
	</div>
</li>
<li>
	<div class="tab-element">
		<input id="tab-elem-element-check" type="checkbox">
		<h1>{{ customer.name }}</h1>
		<h2>Phone: {{ customer.phone_number}}</h2>
		<h3>Address: {{ customer.address }}</h3>
	</div>
</li>
