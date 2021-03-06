let globals = {
    //String to hold HTML of original table body, for restoring after clearing search
    original_results: '',
}

let searchFunctions = {
    retrieve(query) {
        let search_results = [];
        if (query) {
            fetch(`/search/customer/${query}`,
            {
                credentials: 'include',
            }).then((res) => {
                return res.json()
            }).then((data) => {
                search_results = data['results'];
                this.update(search_results);
            });
        }
        else {
            this.restoreDefault(search_results);
        }
    },

    update(search_results) {
        let table_body = document.querySelector("tbody");
        table_body.innerHTML = '';
        for (let customer of search_results) {
            table_body.appendChild(tableFunctions.createNewRow(customer));
        }
        tableFunctions.attachClickHandlers();
    },

    restoreDefault() {
        document.querySelector("tbody").innerHTML = globals.original_results;
    },
}

let tableFunctions = {

    // Every search result gets a new row
    createNewRow(customer) {
        let new_row = document.createElement("tr");
        new_row.innerHTML = 
                `
                <td>${customer.id}</td>
                <td>${customer.first_name}</td>
                <td>${customer.last_name}</td>
                <td>${customer.add_date}</td>
                <td>${customer.last_modified}</td>
                `;
        return new_row;
    },

    // Called from this.sort()
    sortHelper(rows, col_num, asc) {
        // sort function pulls values from tr node
        function mySort(rowA, rowB) {
            let valA = rowA.querySelectorAll("td")[col_num].innerText;
            let valB = rowB.querySelectorAll("td")[col_num].innerText;
            if (valB > valA) {
                return (asc ? -1 : 1)
            }
            else {
                return (asc ? 1 : -1)
            }
        }
        return rows.sort(mySort);
    },

    sort(column_header) {
        // Change classes of headers to reflect selected column (bg-color, etc.)
        let all_headers = document.querySelectorAll("th");
        all_headers.forEach((elem) => {
            elem.classList.remove("selected");
        })
        column_header.classList.add("selected");

        // Determine if column is now ascending or descending, adjust classes accordingly
        let asc;
        if (column_header.classList.contains("ascending")) {
            column_header.classList.remove("ascending");
            column_header.classList.add("descending");
            asc = false;
        }
        else if (column_header.classList.contains("descending")) {
            column_header.classList.remove("descending");
            column_header.classList.add("ascending");
            asc = true;
        }
        else {
            column_header.classList.add("ascending");
            asc = true;
        }

        // Pull out column number and all rows to pass to sortHelper
        let col_num = Array.from(column_header.closest("tr").children).indexOf(column_header);
        let rows = document.querySelectorAll("tbody tr")

        // Do the sorting and generate new table body
        let new_rows = this.sortHelper(Array.from(rows), col_num, asc);
        let new_tbody = document.createElement("tbody");
        for (let row of new_rows) {
            new_tbody.appendChild(row);
        }
        let table = document.querySelector("table");
        
        // insert new table body into DOM
        table.replaceChild(new_tbody, table.querySelector("tbody"));
        this.attachClickHandlers();
    },

    // Attach click handlers, needed after 
    attachClickHandlers() {
        document.querySelectorAll("tbody").forEach((elem) => {
            elem.addEventListener("click", handlers.viewCustomer);
        });
    }

}

let handlers = {

    //click table row, link to corresponding customer
    viewCustomer(e) {
        console.log("foo")
        let id = e.target.closest("tr").firstElementChild.innerText;
        window.location.href = `/customers/${id}`;
    },

    // click table header, sort column
    sort(e) {
        //find closest th in case e.target is text node
        let column_header = e.target.closest("th");
        tableFunctions.sort(column_header);
    },

    // keyup listener in search bar
    search(e) {
        let query = e.target.closest("input").value;
        searchFunctions.retrieve(query);
    },

    logOutButton(e) {
        document.querySelector("header p").classList.toggle("selected");
        document.querySelector(".cover").classList.toggle("active");
        document.querySelector(".log_out").classList.toggle("active");
    },
}

window.onload = () => {
    // Keep copy of original table
    globals.original_results = document.querySelector("tbody").innerHTML;

    // Search bar keyup (live search)
    document.querySelector("#search").addEventListener("keyup", handlers.search);

    // Clicking table column header, sort column
    document.querySelectorAll("thead tr th").forEach((elem) => {
        elem.addEventListener("click", handlers.sort);
    })

    // Clicking table row, link to customer page
    document.querySelectorAll("tbody").forEach((elem) => {
        elem.addEventListener("click", handlers.viewCustomer);
    })

    // Toggle log out button visibility
    document.querySelector("header p").addEventListener("click", handlers.logOutButton);
    document.querySelector(".cover").addEventListener("click", handlers.logOutButton);
}