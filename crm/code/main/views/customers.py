from django.shortcuts import render, redirect
from django.core.serializers.json import DjangoJSONEncoder
from django.http import HttpResponse, JsonResponse
from main.models import *
from django.utils import timezone
import json

def new(request):
    return render(request, 'main/newCustomer.html')

def show(request, id):
	c = Customer.objects.get(pk=id)
	jobs = Job.objects.filter(customer = c)
	invoices = Invoice.objects.filter(customer = c)
	estimates = Estimate.objects.filter(customer = c)
	notes = Note.objects.filter(customer = c)
	context = 	{
					"customer": c,
					"jobs": jobs,
					"invoices": invoices,
					"estimates": estimates,
					"notes": notes
				}
	return render(request, 'main/showCustomer.html', context)

def showAll(request):
	customers = Customer.objects.filter(user=request.user)
	context = {"customers": []}
	if customers:
		for c in customers:
			customer = {
				"first_name": c.name.split()[0],
				"last_name": c.name.split()[-1],
				"id": c.id,
				"add_date": c.add_date,
				"last_modified": c.last_modified,
			}
			context["customers"].append(customer)
	return render(request, 'main/allCustomers.html', context)

def save(request, id=None): 
	#Called after hitting 'submit' button on the new customer form
	if id:
		c = Customer.objects.get(pk=id)
	else:
		c = Customer()
	c.user = request.user
	post_dict = request.POST.copy()
	success = True
	for key in post_dict:
		if key in c.__dict__: #make sure you're not trying to assign to csrf token 
			setattr(c,key,request.POST[key])
	try:
		c.save()
	except: 
		success = False
	message = "Success" if success else "Something went wrong..."
	context = {
		"message": message,
	}
	return redirect('/customers/{}'.format(c.id))

def edit(request, customer_id):
	customer = Customer.objects.get(pk=customer_id)
	context = {"customer": customer}
	return render(request, "main/editCustomer.html", context)

def delete(request, id):
	customer = Customer.objects.get(pk=id)
	customer.delete()
	return redirect("/")

