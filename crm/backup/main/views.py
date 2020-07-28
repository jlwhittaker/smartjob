from django.contrib.sessions.backends.db import SessionStore
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.shortcuts import render, redirect
from django.core.serializers.json import DjangoJSONEncoder
from django.core import serializers
from django.template import loader
from django.http import HttpResponse, JsonResponse
from .models import *
from django.utils import timezone
import json
import sys

def loginPage(request):
	return render(request, 'main/log_in.html')

def auth(request):
	data = request.POST
	if data['action_choice'] == 'signup':
		try:
			user = User.objects.create_user(data['username'], password=data['password'])
		except IntegrityError:
			return JsonResponse({"error": "username taken"})
	else:
		user = authenticate(username=data['username'], password=data['password'])
		if user is None:
			return JsonResponse({"error": "invalid credentials"})
	login(request, user)
	return redirect('/')

def log_out(request):
	logout(request)
	return redirect('/log_in.html')		

def index(request):
	customers = Customer.objects.filter(user=request.user)
	jobs = Job.objects.filter(user=request.user)
	estimates = Estimate.objects.filter(user=request.user)
	invoices = Invoice.objects.filter(user=request.user)
	user = request.user

	context = {
		'customers': customers,
		'jobs': jobs,
		'estimates': estimates,
		'invoices': invoices,
		'user': request.user
	}
	return render(request, 'main/index.html', context)

def search(request, obj_type, query):
	if obj_type == "customer":
		customers = Customer.objects.filter(
			user=request.user,
			name__contains=query)
	response = []
	for customer in customers:
		response.append({
			"first_name": customer.name.split()[0],
			"last_name": customer.name.split()[-1],
			"id": customer.id,
			"add_date": customer.add_date.strftime("%B %d, %Y"),
			"last_modified": customer.last_modified.strftime("%B %d, %Y"),
		})
	return JsonResponse({"results": response})

def addCustomer(request): 
	#Called after hitting 'submit' button on the new customer form
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
	return redirect('/')

def allCustomers(request):
	customers = Customer.objects.filter(user=request.user)
	context = {"customers": []}
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

def validateJob(request):
	response = {}
	req = json.loads(request.body)
	if len(Job.objects.filter(name = req['name'], 
							customer__name = req['customer'], 
							start_date=req['start_date'])) == 0:
		response['success'] = True #job doesn't exists
	else: response['success'] = False #job already exists
	return JsonResponse(response)

def newJob(request, customer_id):
	customer = Customer.objects.get(pk=customer_id)
	estimates = Estimate.objects.filter(customer=customer)
	context = 	{
					"estimates": estimates if estimates else [],
					"customer": customer,
				}
	return render(request, 'main/newJob.html', context)

def editJob(request, job_id):
	job = Job.objects.get(pk=job_id)
	tasks = Task.objects.filter(job=job)
	customer = job.customer
	d = job.start_date
	year = str(d.year)
	if len(str(d.month)) == 1:
		month = "0"+str(d.month)
	else:
		month = str(d.month)
	if len(str(d.day)) == 1:
		day = "0"+str(d.day)
	else:
		day = str(d.day)
	try:
		estimate = Estimate.objects.get(job=job)
	except Estimate.DoesNotExist:
		estimate = None
	estimates = Estimate.objects.filter(customer=customer)
	context = {
		"job": job,
		"tasks": tasks,
		"customer": customer,
		"estimates": estimates, #All estimates for customer
		"start_date": year+"-"+month+"-"+day
	}
	if estimate is not None:
		context["estimate"] = estimate #Estimate associated with job

	return render(request, 'main/editJob.html', context)

def estimateTasks(request, estimate_id):
	estimate = Estimate.objects.get(pk=estimate_id)
	tasks = Task.objects.filter(estimate=estimate)
	response = {
		"description": estimate.description,
		"tasks": []
	}
	for task in tasks:
		response["tasks"].append(
			{
				"name": task.name,
				"quantity": task.quantity,
				"price": task.price,
				"description": task.description
			}
		)
	return JsonResponse(response, safe=False)

def jobTasks(request, job_id):
	job = Job.objects.get(pk=job_id)
	tasks = Task.objects.filter(job=job)
	response = {
		"description": job.description,
		"tasks": []
	}
	for task in tasks:
		response["tasks"].append(
			{
				"name": task.name,
				"quantity": task.quantity,
				"price": task.price,
				"description": task.description
			}
		)
	return JsonResponse(response, safe=False)

def saveJob(request, job_id=None):
	data = json.loads(request.body)
	estimate = Estimate.objects.get(pk=data["estimate_id"])
	if job_id:
		job = Job.objects.get(pk=job_id)
	else:
		job = Job()
	tasks = Task.objects.filter(job=job)
	for task in tasks:
		if task.estimate:
			task.job = None
		else:
			task.delete()
	job.customer = Customer.objects.get(pk=data["customer_id"])
	job.name = data["job"]["details"]["name"]
	job.description = data["job"]["details"]["description"]
	job.start_date = data["job"]["details"]["date"]
	job.address = data["job"]["details"]["location"]
	job.contact_name = data["job"]["contact"]["name"]
	job.contact_email = data["job"]["contact"]["email"]
	job.contact_phone = data["job"]["contact"]["phone"]
	job.user = request.user
	estimate.job = job
	job.save()
	estimate.save()

	for task in data["tasks"]:
		newTask = Task()
		newTask.name = task["name"]
		newTask.job = job
		newTask.description = task["description"]
		newTask.quantity = task["qty"] 
		newTask.price = task["price"]
		newTask.total = float(task["qty"]) * float(task["price"])
		newTask.save()

	response = {
		"success": True,
		"job_id": job.id
	}

	return JsonResponse(response)

def deleteJob(request, job_id):
	job = Job.objects.get(pk=job_id)
	customer_id = job.customer.id
	job.delete()
	return redirect("/main/customers/{}".format(customer_id))

def deleteEstimate(request, estimate_id):
	estimate = Estimate.objects.get(pk=estimate_id)
	customer_id = estimate.customer.id
	estimate.delete()
	return redirect("/main/customers/{}".format(customer_id))


def newCustomer(request):
	#Handles form for creating customer
	context = {}
	return render(request, 'main/newCustomer.html', context)

def newEstimate(request, customer_id=None):
	c = Customer.objects.get(pk=customer_id)
	context = {
		"customer": c
	}
	return render(request, 'main/newEstimate.html', context)

def editEstimate(request, estimate_id):
	estimate = Estimate.objects.get(pk=estimate_id)
	tasks = estimate.tasks()
	job = estimate.job
	context = {
				"estimate": estimate,
				"tasks": tasks,
				"job": estimate.job,
				"customer": estimate.customer
	}
	return render(request, 'main/editEstimate.html', context)	
	
def saveEstimate(request, estimate_id=None):
	data = json.loads(request.body)
	if estimate_id:
		estimate = Estimate.objects.get(pk=estimate_id)
	else:
		estimate = Estimate()
	tasks = Task.objects.filter(estimate=estimate)
	for task in tasks:
		task.delete()
	estimate.customer = Customer.objects.get(pk=data["customer_id"])
	estimate.name = data["estimate"]["details"]["name"]
	estimate.description = data["estimate"]["details"]["description"]
	estimate.address = data["estimate"]["details"]["location"]
	estimate.contact_name = data["estimate"]["contact"]["name"]
	estimate.contact_email = data["estimate"]["contact"]["email"]
	estimate.contact_phone = data["estimate"]["contact"]["phone"]
	estimate.user = request.user 
	estimate.save()

	for task in data["tasks"]:
		newTask = Task()
		newTask.name = task["name"]
		newTask.estimate = estimate
		newTask.description = task["description"]
		newTask.quantity = task["qty"] 
		newTask.price = task["price"]
		newTask.save()

	response = {
		"success": True,
		"estimate_id": estimate.id
	}

	return JsonResponse(response)

def showEstimate(request, estimate_id):
	estimate = Estimate.objects.get(pk=estimate_id)
	context = {
		"estimate": estimate,
		"job": estimate.job,
		"tasks": Task.objects.filter(estimate=estimate),
		"notes": Note.objects.filter(estimate=estimate)
	}
	return render(request, 'main/showEstimate.html', context)

def newInvoice(request, customer_id):
	c = Customer.objects.get(pk=customer_id)
	jobs = Job.objects.filter(customer=c)
	context = {
		"customer": c,
		"jobs": jobs,
	}
	return render(request, 'main/newInvoice.html', context)	
	

def editInvoice(request, invoice_id):
	invoice = Invoice.objects.get(pk=invoice_id)
	tasks = []
	for task in Task.objects.filter(invoice = invoice):
		tasks.append(task)
	context = {
				"invoice": invoice,
				"tasks": tasks,
	}
	return render(request, 'main/editInvoice.html', context)

def showInvoice(request, invoice_id=None):
	invoice = Invoice.objects.get(pk=invoice_id)
	context = {
		"invoice": invoice,
		"tasks": Task.objects.filter(invoice = invoice)
	}
	return render(request, 'main/showInvoice.html', context)

def showCustomer(request, id):
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

def showJob(request, id):
	job = Job.objects.get(pk=id)
	context = {
		"job": job,
		"id": id,
		"tasks": Task.objects.filter(job=job),
		"customer": job.customer,
		"invoices": Invoice.objects.filter(job=job) or None,
		"notes": Note.objects.filter(job=job),
		"estimates": Estimate.objects.filter(job=job),
	}
	return render(request, 'main/showJob.html', context)



def searchCustomers(request, query): #This can be used anywhere a customer name is searched
	response = 	{
					"customers": [],
				}

	customers = Customer.objects.filter(name__startswith=query)

	for i in customers:
		response["customers"].append({"name": i.name, "address": i.address})

	return JsonResponse(response)

def addNote(request):
	data = json.loads(request.body)
	note = Note()
	note.content = data["content"]
	
	if data["type"] == "estimate":
		note.estimate = Estimate.objects.get(pk=data["id"])
	elif data["type"] == "job":
		note.job = Job.objects.get(pk=data["id"])
	elif data["type"] == "invoice":
		note.invoice = Invoice.objects.get(pk=data["id"])
	
	note.save()

	response = {
		"success": True
	}

	return JsonResponse(response)

def saveInvoice(request, invoice_id=None):
	data = json.loads(request.body)
	if invoice_id:
		invoice = Invoice.objects.get(pk=invoice_id)
	else:
		invoice = Invoice()
	tasks = Task.objects.filter(invoice=invoice)
	for task in tasks:
		task.invoice = None
	invoice.customer = Customer.objects.get(pk=data["customer_id"])
	invoice.contact_name = data["invoice"]["contact"]["name"]
	invoice.contact_email = data["invoice"]["contact"]["email"]
	invoice.contact_phone = data["invoice"]["contact"]["phone"]
	invoice.due_date = data['invoice']['due_date']
	invoice.user = request.user
	if data['invoice']['job_id']:
		invoice.job = Job.objects.get(pk=data['invoice']['job_id'])
	else: 
		invoice.job = None 
	invoice.save()

	for task in data["tasks"]:
		newTask = Task()
		newTask.name = task["name"]
		newTask.invoice = invoice
		newTask.description = task["description"]
		newTask.quantity = task["qty"] 
		newTask.price = task["price"]
		newTask.total = task["total"]
		newTask.save()

	response = {
		"success": True,
		"invoice_id": invoice.id
	}

	return JsonResponse(response)