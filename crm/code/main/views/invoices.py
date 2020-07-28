from django.shortcuts import render, redirect
from django.core.serializers.json import DjangoJSONEncoder
from django.http import HttpResponse, JsonResponse
from main.models import *
from django.utils import timezone
import json
import datetime

def show(request, invoice_id=None):
	invoice = Invoice.objects.get(pk=invoice_id)
	context = {
		"invoice": invoice,
		"tasks": Task.objects.filter(invoice = invoice)
	}
	return render(request, 'main/showInvoice.html', context)

def showAll(request):
	invoices = [i for i in Invoice.objects.filter(user=request.user)]
	context = {"invoices": invoices}
	return render(request, 'main/allInvoices.html', context)

def delete(request, invoice_id):
	invoice = Invoice.objects.get(pk=invoice_id)
	customer_id = invoice.customer.id
	invoice.delete()
	return redirect("/customers/{}".format(customer_id))

def new(request, customer_id):
	c = Customer.objects.get(pk=customer_id)
	jobs = Job.objects.filter(customer=c)
	now = datetime.datetime.now()
	d = now+datetime.timedelta(days=30)
	due_date = "{}-{}-{}".format(
			d.year, 
			d.month if len(str(d.month)) == 2 else "0{}".format(d.month), 
			d.day
			)
	context = {
		"customer": c,
		"jobs": jobs,
		"due_date": due_date,
	}
	return render(request, 'main/newInvoice.html', context)	

def edit(request, invoice_id):
	invoice = Invoice.objects.get(pk=invoice_id, user=request.user)
	if not invoice:
		return redirect("/")
	customer = invoice.customer
	tasks = []
	all_jobs = Job.objects.filter(customer=customer)
	d = invoice.due_date
	year = str(d.year)
	if len(str(d.month)) == 1:
		month = "0"+str(d.month)
	else:
		month = str(d.month)
	if len(str(d.day)) == 1:
		day = "0"+str(d.day)
	else:
		day = str(d.day)
	for task in Task.objects.filter(invoice = invoice):
		tasks.append(task)
	context = {
				"due_date": year+"-"+month+"-"+day,
				"customer": customer,
				"invoice": invoice,
				"tasks": tasks,
				"job": invoice.job,
				"all_jobs": all_jobs
	}
	return render(request, 'main/editInvoice.html', context)

def save(request, invoice_id=None):
	data = json.loads(request.body)
	total = 0
	if invoice_id:
		invoice = Invoice.objects.get(pk=invoice_id)
	else:
		print("foo")

		invoice = Invoice()
		invoice.status = "Created (Not Sent)"
	tasks = Task.objects.filter(invoice=invoice)
	for task in tasks:
		task.invoice = None
		task.save()
	invoice.customer = Customer.objects.get(pk=data["customer_id"])
	invoice.contact_name = data["invoice"]["contact"]["name"]
	invoice.contact_email = data["invoice"]["contact"]["email"]
	invoice.contact_phone = data["invoice"]["contact"]["phone"]
	invoice.due_date = data['invoice']['due_date']
	invoice.name = data['invoice']['name']
	invoice.user = request.user
	# Have to save invoice in order to associate tasks, total calculated later
	invoice.save()
	if data['invoice']['job_id']:
		invoice.job = Job.objects.get(pk=data['invoice']['job_id'])
	else: 
		invoice.job = None 

	for task in data["tasks"]:
		newTask = Task()
		newTask.name = task["name"]
		newTask.invoice = invoice
		newTask.description = task["description"]
		newTask.quantity = task["qty"] 
		newTask.price = task["price"]
		newTask.total = task["total"]
		total = total+newTask.total
		newTask.save()
	invoice.total = total
	invoice.save()
	
	print("BAR")
	response = {
		"success": True,
		"invoice_id": invoice.id
	}

	return JsonResponse(response)

def update(request, id, status):
	invoice = Invoice.objects.get(pk=id)
	if status[-1] == "0":
		invoice.status = "Created (Not Sent)"
	elif status[-1] == "1":
		invoice.status = "Sent (Unpaid)"
	else:
		invoice.status = "Paid"
	invoice.save()
	
	return HttpResponse('')