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


});