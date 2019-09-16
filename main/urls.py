from django.urls import path 

from . import views

urlpatterns = [
	path('', views.index, name='index'),
	path('testing', views.testing, name='testing'),
	path('addCustomer', views.addCustomer, name="addCustomer"),
	path('findCustomer/<str:query>', views.searchCustomers, name="searchCustomers"),
	path('customers/new', views.newCustomer, name="newCustomer"),
	path('customers/<str:id>', views.showCustomer, name="showCustomer"),
	path('estimates/new/<str:customer_id>', views.newEstimate, name="newEstimate"),
	path('estimates/<str:estimate_id>/edit', views.editEstimate, name="editEstimate"),
	path('estimates/save', views.saveEstimate, name="saveEstimate"),
	path('estimates/<str:estimate_id>', views.showEstimate, name="showEstimate"),
	path('jobs/<str:id>', views.showJob, name="showJob"),
	path('jobs/new/<str:customer>', views.newJob, name="newJob"),
	path('validateJob', views.validateJob, name="validateJob"),
	path('addJob/<str:customer_id>', views.addJobFromCustomer, name="addJobFromCustomer"),
	path('addJob/<str:customer_id>/<str:estimate_id>', views.addJobFromEstimate, name="addJobFromEstimate"),
	path('invoices/new/<str:customer_id>', views.newInvoice, name="newInvoice"),
	path('invoices/<str:invoice_id>/edit', views.editInvoice, name="editInvoice"),
	#path('invoices/save', views.saveInvoice, name="saveInvoice"),
	path('invoices/<str:invoice_id>', views.showInvoice, name="showInvoice"),
	path('getRecent', views.getRecent, name="getRecent"),
	path('practice', views.practice, name="practice"),
]