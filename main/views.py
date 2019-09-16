from django.shortcuts import render, redirect
from django.core.serializers.json import DjangoJSONEncoder
from django.template import loader
from django.http import HttpResponse, JsonResponse
from .models import *
from django.utils import timezone
import json
import sys

def testing(request):
	context = {}
	return render(request, 'main/testing.html', context)

def index(request):
	customers = Customer.objects.order_by('add_date')[:9] #10 most recent customers
	jobs = Customer.objects.all()
	context = {
		'customers': customers,
		'jobs': jobs,
	}
	return render(request, 'main/index.html', context)

def addCustomer(request): 
	#Called after hitting 'submit' button on the new customer form
	c = Customer()
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
	return redirect('/main')

def validateJob(request):
	response = {}
	req = json.loads(request.body)
	if len(Job.objects.filter(name = req['name'], 
							customer__name = req['customer'], 
							start_date=req['start_date'])) == 0:
		response['success'] = True #job doesn't exists
	else: response['success'] = False #job already exists
	return JsonResponse(response)

def addJobFromCustomer(request, customer_id): #called when form is submitted from newJob.html
	success = True
	exception = None #debugging
	customer = Customer.objects.get(pk=customer_id) 
	req = request.POST
	dup_job = Job.objects.filter(name=req['name'], 
								customer__name = req['customer'], 
								start_date = req['start_date'])	
	if dup_job: #avoid adding duplicate job, could maybe happen from back button and refresh
		return redirect('showJob', id=dup_job[0].id)
	else:
		job = Job()
		job.customer = customer
		for key in request.POST:
			if key in job.__dict__:
				setattr(job,key,request.POST[key])
		try:
			job.save()
			customer.save()
			message = None
		except Exception as error: 
			exception = error
			success = False
			message = "Something went wrong..."	
		return redirect('showJob', id=job.id)

def addJobFromEstimate(request, customer_id, estimate_id):
	req = request.POST
	print(req['start_date'], file=sys.stderr)
	job = Job()
	job.customer = Customer.objects.get(pk=customer_id)
	job.start_date = req['start_date']
	job.name = req['job_name']
	job.save()
	estimate = Estimate.objects.get(pk=estimate_id)
	estimate.job = job
	estimate.save()
	for task in Task.objects.filter(estimate=estimate_id):
		task.job = job
		task.save()
	return redirect('showJob', id=job.id)

def newJob(request, customer):
	customer = Customer.objects.get(pk=customer)
	# Message is in context in case of reload from error (duplicate job)
	context = 	{
					"customer": customer,
				}
	return render(request, 'main/newJob.html', context)

def newCustomer(request):
	#Handles form for creating customer
	context = {}
	return render(request, 'main/newCustomer.html', context)

def newEstimate(request, customer_id=None):
	estimate = Estimate()
	estimate.customer = Customer.objects.get(pk=customer_id)
	estimate.save()
	url = '/main/estimates/{}/edit'.format(estimate.id)
	return redirect(url)

def editEstimate(request, estimate_id):
	estimate = Estimate.objects.get(pk=estimate_id)
	tasks = estimate.tasks()
	job = estimate.job
	context = {
				"estimate": estimate,
				"tasks": tasks,
				"job": estimate.job
	}
	return render(request, 'main/editEstimate.html', context)	
	
def saveEstimate(request):
	# read estimate id and tasks from request.body, save tasks, redirect to estimate page
	req = json.loads(request.body)
	estimate = Estimate.objects.get(pk=req['estimate_id'])
	for task in Task.objects.filter(estimate=estimate):
		task.delete() #start clean, avoid adding duplicate items (much easier than keeping track)
	Customer.objects.get(pk=estimate.customer.id).save()#update last-modified date
	estimate.total = req['estimate_total']
	estimate.name = req['estimate_name']
	estimate.save()
	tasks = req['tasks']
	saved_tasks = 0
	for i in range(len(tasks)):
		newTask = Task()
		for key, value in tasks[i].items():
			setattr(newTask,key,value)
		newTask.estimate = estimate
		try:
			newTask.save()
			saved_tasks += 1
		except:
			print("failed", file=sys.stderr)
	response = {
		"saved_tasks": saved_tasks,
	}
	return JsonResponse(response)

def showEstimate(request, estimate_id):
	estimate = Estimate.objects.get(pk=estimate_id)
	context = {
		"estimate": estimate,
		"job": estimate.job,
		"tasks": Task.objects.filter(estimate=estimate)
	}
	return render(request, 'main/showEstimate.html', context)

def newInvoice(request, job_id):
	#Creates Invoice from a given job
	invoice = Invoice
	job = Job.objects.get(pk=job_id)
	invoice.customer = job.customer
	invoice.isPaid = False
	invoice.save()
	url = '/main/estinates/{}/edit'.format(invoice.id)
	return redirect(url)	
	

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

def showInvoice(request, invoice_id):
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
	context = 	{
					"customer": c,
					"jobs": jobs,
					"invoices": invoices,
					"estimates": estimates,
				}
	return render(request, 'main/showCustomer.html', context)

def showJob(request, id):
	job = Job.objects.get(pk=id)
	context = {
		"job": job,
		"id": id,
		"tasks": Task.objects.filter(job=job),
	}
	return render(request, 'main/showJob.html', context)

def getRecent(request):
	#gathers 10 most recent of customers/jobs/invoices/estimates to populate index.html, returns JSON
	response = {
		"customers": [],
		"jobs": [],
		"invoices": [],
		"estimates": [],
	}
	customers = Customer.objects.order_by("-last_modified")[:10]
	jobs = Job.objects.order_by("-last_modified")[:10]
	invoices = Invoice.objects.order_by("-last_modified")[:10]
	estimates = Estimate.objects.order_by("-last_modified")[:10]
	
	for customer in customers:
		response['customers'].append({								
								"id": customer.id,
								"name": customer.name,
								"address": customer.address,
								"phone": customer.phone_number
							})
	for job in jobs:
		response["jobs"].append({
								"id": job.id,
								"name": job.name,
								"customer_id": job.customer.id,
								"customer": job.customer.name,
								"date": job.last_modified,
							})
	for invoice in invoices:
		response["invoices"].append({
								"id": invoice.id,
								"customer": invoice.customer.name,
								"job": invoice.job,
								"date": invoice.last_modified,
								"total": invoice.total,
							})
	for estimate in estimates:
		response["estimates"].append({
								"id": estimate.id,
								"customer": estimate.customer.name,
								"name": estimate.name,
								"date": estimate.creation_date,
								"total": estimate.total,
							})
	return JsonResponse(response)

def searchCustomers(request, query): #This can be used anywhere a customer name is searched
	response = 	{
					"customers": [],
				}

	customers = Customer.objects.filter(name__startswith=query)

	for i in customers:
		response["customers"].append({"name": i.name, "address": i.address})

	return JsonResponse(response)

def practice(request):
	context = {}
	return render(request, 'main/practice.html', context)

