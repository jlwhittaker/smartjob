function log_out_button(e) {
    document.querySelector("header p").classList.toggle("selected");
    document.querySelector(".cover").classList.toggle("active");
    document.querySelector(".log_out").classList.toggle("active");

}

window.onload = () => {
    document.querySelector("header p").addEventListener("click", log_out_button);
	document.querySelector(".cover").addEventListener("click", log_out_button);

}