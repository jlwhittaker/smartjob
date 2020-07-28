let customerFunctions = {
  
  delete() {
    if (confirm("Are you sure you want to delete this Customer? (This cannot be undone)")) {
      fetch("/deleteCustomer/{{customer.id}}",
      {
        credentials: "include",
      }).then((response) => {
          window.location.href = response.url;
      });
    }
  },

}

let handlers = {

  logOutButton(e) {
    document.querySelector("header p").classList.toggle("selected");
    document.querySelector(".cover").classList.toggle("active");
    document.querySelector(".log_out").classList.toggle("active");
  },

  deleteCustomerPrompt(e) {
    let deleteCustomerPrompt = document.querySelector(".delete-customer-prompt");
    deleteCustomerPrompt.classList.toggle("active");
  },

  deleteCustomer() {
    customerFunctions.delete();
  }
}

window.onload = () => {

  // Toggle log_out button visibility
  document.querySelector("header p").addEventListener("click", handlers.logOutButton);
  document.querySelector(".cover").addEventListener("click", handlers.logOutButton);
  document.querySelector("header p:first-child").addEventListener("click", handlers.logOutButton);
  document.querySelector(".cover").addEventListener("click", handlers.logOutButton);
  
  // Toggle delete customer prompt visibility
  document.querySelector(".delete-customer-btn").addEventListener("click", handlers.deleteCustomerPrompt)

  // Delete customer or close prompt
  let deleteCustomerPromptButtons = document.querySelectorAll(".delete-customer-prompt button");
  deleteCustomerPromptButtons[1].addEventListener("click", handlers.deleteCustomerPrompt)
  deleteCustomerPromptButtons[0].addEventListener("click", handlers.deleteCustomer);

  // Google places autocomplete for location field
  let input = document.getElementById("pac-input");
  let autocomplete = new google.maps.places.Autocomplete(input, {});
}