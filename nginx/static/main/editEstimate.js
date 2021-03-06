/*
    On page load:
        Any tasks associated with this estimate populate table rows
    Editing rows:
        All rows are editable, current row has 'current-row' class
        Focus event on any text area in the table will turn on this class (and turn off for the rest)
        keyup listener (calcRowTotal) on Price and Quantity columns automatically update total
        calcRowTotal calls calcTotal, calcTotal is never called any other way
        If new row is added, focus and keyup listeners are added via helper functions
        (addKeyUpListener and addCurrentRowListener)
        If deleting row, setCurrentRow is manually called on the last row by delRow
    Saving estimate
        tasks[] array is created, array of task objects,
        saveestimate collects appropriate data for each row and pushes to tasks array

*/
function getCookie(name) {
    // I copy/pasted this directly from Django's website, sue me
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
    var csrf_token = getCookie('csrftoken');
    
    let newRow = `
                <td><textarea style="resize: none;"></textarea></td>
                <td><textarea></textarea></td>
                <td><textarea></textarea></td>
                <td><textarea></textarea></td>
                <td><textarea readonly=false></textarea></td>
                <td><button name="del-row">-</button></td>
                `;
    
    let addRow = function(event) {
        //create new row
        let row = document.createElement("tr");
        row.innerHTML = newRow;
        //add row to end of "estimate-tasks" table
        document.querySelector("#estimate-tasks tbody").appendChild(row);
        addCurrentRowListener(row);
        setCurrentRow(row);
        //make sure new del-row button has click handler
        row.querySelector("button[name=del-row]").addEventListener("click", delRow);
        addKeyUpListener();
    };
    
    
    var addKeyUpListener = function() {
    // Add keyup listener on the price and quantity fields of each row in tbody
        document.querySelectorAll("#estimate-tasks tbody tr").forEach((row) => { 
                Array.from(row.children).slice(2,4).forEach( (n) => { 
                    n.addEventListener("keyup", (e) => {
                        calcRowTotal(e.target.closest("tr"));
                    });
                });
            });
    };
    
    var addCurrentRowListener = function(row) {
    //This is needed so that new rows that are added receive the setCurrentRow listener,
    //It's called manually on page load for any pre-existing rows
        row.querySelectorAll("textarea").forEach((ta) => {
            ta.addEventListener("focus", (e) => {
                setCurrentRow(e.target.closest("tr"));
            })
        })
    }
    
    let delRow = function(event) {
    // attached to button at the end of each row
    // removes that row, and sets new lowest row to current row, and recalculates total
        console.log(event.target)
        if (event.target.closest("td").previousElementSibling.firstElementChild.value) {
            if (!confirm("Delete non-empty row?")) {
                return;
            }
        }
        
        event.target.parentElement.parentElement.remove();
        //make sure last row always has editable-row class
        document.querySelector("#estimate-tasks tbody").lastElementChild.classList.add("editable-row");
        calcTotal();
        let currentRow = document.querySelector("#estimate-tasks tbody").lastElementChild;
        setCurrentRow(currentRow);
    };
    
    let calcRowTotal = function(row) {
    //if price and/or quantity fields change, total field (for row) will update
        let price = row.children[2].firstChild.value;
        let quantity = row.children[3].firstChild.value;
        row.children[4].firstChild.value = price*quantity;
        calcTotal();
    };
    
    let calcTotal = function() {
    // called any time calcRowTotal is called, gathers sum of last textarea of each row
        let totals = [];
        document.querySelectorAll("#estimate-tasks tbody tr").forEach( (row) => {
            if (row.children[4].firstChild.value) {
                totals.push(row.children[4].firstChild.value);
            }
        });
        let sum = 0;
        for (let i of totals) {
            sum += parseFloat(i);
        };
        document.getElementById("total").innerText = sum;
    };
    
    let setCurrentRow = function(row) {
    // accepts tr element as arg, removes current row class from *all* rows, and then adds to arg row
        let rows = document.getElementById("estimate-tasks").querySelectorAll("tbody tr");
        rows.forEach( (r) => {
            if (r.classList.contains("current-row")) {
                r.classList.remove("current-row");
            }
        });
        row.classList.add("current-row");
    };
    
    let saveEstimate = function(event) {
    //creates array of task objects for each row
    //sends JSON of said array to server 
        var tasks = [];
        var estimate_name = document.getElementById("estimate-name").value
        var rows = document.querySelectorAll("#estimate-tasks tr");
        var fields = document.querySelector("#estimate-tasks thead tr").children;
        for (let i = 1; i < rows.length; i++) { // i is 1 here, because first elem of rows is header
            let task = {};
            for (let j = 0; j < fields.length; j++) {
                task[fields[j].firstElementChild.innerText.toLowerCase()] = rows[i].children[j].firstChild.value;
            }
            tasks.push(task);
        }
        let json = JSON.stringify({
                            estimate_total: parseFloat(document.getElementById("total").innerText),
                            estimate_id: estimate_id,
                            estimate_name: estimate_name,
                            tasks: tasks,   
        }); 
        let xhr = new XMLHttpRequest();
        console.log("foo")
        console.log(csrf_token);
        xhr.open("POST", '/estimates/save')
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("X-CSRFToken", csrf_token);
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4 & xhr.status == 200) {
                // server sends back json, "saved_tasks": <num>, can be used for debugging
                // just comment out next line to see how many tasks were saved
                window.location = '/estimates/'+estimate_id;
            }
    
        };
        xhr.send(json);
    };

    var tasks = tasks;

    window.addEventListener("load", (e) => {
        console.log("foo");
        addRow();
        document.getElementById("save-estimate").addEventListener("click", saveEstimate);
        document.getElementById("add-row").addEventListener("click", addRow);
    
        // keyup and currentrow listeners are wrapped for brevity, 
        // they need to be called any time a row is created
        addKeyUpListener();
        addCurrentRowListener(document.querySelector("#estimate-tasks tbody tr"))
        console.log("foo");
        document.querySelectorAll("button[name=del-row]").forEach((elem) => {
            elem.addEventListener("click", delRow);
        });
        document.querySelector("tbody").querySelectorAll("tr").forEach((elem) => {
            calcRowTotal(elem);
        })
    });