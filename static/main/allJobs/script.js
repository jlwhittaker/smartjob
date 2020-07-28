var search_results = [];
var original_results;

function search(e) {
    let query = e.target.value;
    if (query) {
        fetch(`/search/job/${query}`).then((res) => {
            return res.json()
        }).then((data) => {
            search_results = data['results'];
            update_results();
        });
    }
    else {
        search_results = [];
        restore_default();
    }
    
}

function table_row(job) {
    let new_row = document.createElement("tr");
    new_row.innerHTML = 
            `
            <td>${job.id}</td>
            <td>${job.name}</td>
            <td>${job.customer_name}</td>
            <td>${job.creation_date}</td>
            <td>${job.last_modified}</td>
            `;
    return new_row;
}

function restore_default() {
    document.querySelector("tbody").innerHTML = original_results;
}

function update_results() {
    let table_body = document.querySelector("tbody");
    table_body.innerHTML = '';
    for (let job of search_results) {
        table_body.appendChild(table_row(job));
    }
}

function sort_column(rows, col_num, asc) {
    function mySort(rowA, rowB) {
        let valA = rowA.querySelectorAll("td")[col_num].innerText;
        let valB = rowB.querySelectorAll("td")[col_num].innerText;
        if (valB > valA) {
            if (asc) {
                return -1;
            }
            else {
                return 1;
            }
        }
        else if (asc) {
            return 1;   
        }
        else {
            return -1;
        }
    }
    return rows.sort(mySort);
}

function handle_sort(e) {
    let th = document.querySelectorAll("th");
    th.forEach((elem) => {
        elem.classList.remove("selected");
    })
    e.target.closest("th").classList.add("selected");
    let asc;
    if (e.target.classList.contains("ascending")) {
        e.target.classList.remove("ascending");
        e.target.classList.add("descending");
        asc = false;
    }
    else if (e.target.classList.contains("descending")) {
        e.target.classList.remove("descending");
        e.target.classList.add("ascending");
        asc = true;
    }
    else {
        e.target.classList.add("ascending");
        asc = true;
    }
    let col_num = Array.from(e.target.closest("tr").children).indexOf(e.target);
    let rows = document.querySelectorAll("tbody tr")
    let new_rows = sort_column(Array.from(rows), col_num, asc);
    let new_tbody = document.createElement("tbody");
    for (let row of new_rows) {
        new_tbody.appendChild(row);
    }
    let table = document.querySelector("table");
    table.replaceChild(new_tbody, table.querySelector("tbody"));

}

function handle_click(e) {
    let id = e.target.closest("tr").firstElementChild.innerText;
    window.location.href = `/jobs/${id}`;
}

function log_out_button(e) {
    document.querySelector("header p").classList.toggle("selected");
    document.querySelector(".cover").classList.toggle("active");
    document.querySelector(".log_out").classList.toggle("active");

}


window.onload = () => {
    document.querySelector("#search").addEventListener("keyup", search);
    original_results = document.querySelector("tbody").innerHTML;
    document.querySelectorAll("thead tr th").forEach((elem) => {
        elem.addEventListener("click", handle_sort);
    })
    document.querySelectorAll("tbody").forEach((elem) => {
        elem.addEventListener("click", handle_click);
    })

    document.querySelector("header p").addEventListener("click", log_out_button);
	document.querySelector(".cover").addEventListener("click", log_out_button);
}