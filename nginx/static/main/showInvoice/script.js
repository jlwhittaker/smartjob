let handlers = {
    // toggle visiblity of logout button
    logOutButton(e) {
        document.querySelector("header p").classList.toggle("selected");
        document.querySelector(".cover").classList.toggle("active");
        document.querySelector(".log_out").classList.toggle("active");
    },

    // toggle visibility of update invoice button
    updateButton(e) {
        document.querySelectorAll("[class*=update_invoice]").forEach((elem) => {
            elem.classList.toggle("active");
        });
        document.querySelector(".update_cover").classList.toggle("active");
    },

    // update invoice status
    updateInvoice(e) {

        // status name (as recognized by server) is stored as class name of selection buttons
        let status = e.target.classList[0];
        fetch(`/invoices/update/${ID}/${status}`,
        {
            credentials: "include",
        });

        // Adjust classes to reflect change
        document.querySelectorAll("[class*=update_invoice] button").forEach((btn) => {
            btn.classList.remove("selected");
        })
        document.querySelectorAll(`.${status}`).forEach((btn) => {
            btn.classList.add("selected");
        })

        // Update status text in details on page
        document.querySelector(".content__invoice-details p:last-child").innerText = e.target.innerText;

        //remove update button prompt
        handlers.updateButton()
    }
}

window.onload = () => {
    document.querySelector("header p").addEventListener("click", handlers.logOutButton);
	document.querySelector(".cover").addEventListener("click", handlers.logOutButton);
    document.querySelectorAll("[class*=update_invoice] button").forEach((btn) => {
        btn.addEventListener("click", handlers.updateInvoice);
    });
    document.querySelectorAll(".update_toggle,.update_cover").forEach((elem) => {
        elem.addEventListener("click", handlers.updateButton);
    })
}