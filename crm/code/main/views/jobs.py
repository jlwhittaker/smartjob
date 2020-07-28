from django.shortcuts import render, redirect
from django.core.serializers.json import DjangoJSONEncoder
from django.http import HttpResponse, JsonResponse
from main.models import *
from django.utils import timezone
import json

def show(request, id):
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

def showAll(request):
	jobs = Job.objects.filter(user=request.user)
	context = {"jobs": [job for job in jobs]}
	return render(request, 'main/allJobs.html', context)

def new(request, customer_id):
	customer = Customer.objects.get(pk=customer_id)
	estimates = Estimate.objects.filter(customer=customer)
	context = 	{
					"estimates": estimates if estimates else [],
					"customer": customer,
				}
	return render(request, 'main/newJob.html', context)

def edit(request, job_id):
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

def getTasks(request, job_id):
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

def save(request, job_id=None):
	data = json.loads(request.body)
	estimate_id = data.get("estimate_id")
	if estimate_id:
		estimate = Estimate.objects.get(pk=data["estimate_id"])
	else:
		estimate = None
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
	job.save()
	if estimate:
		estimate.job = job
		estimate.save()

	for task in data["tasks"]:
		print(task)
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

def delete(request, job_id):
	job = Job.objects.get(pk=job_id)
	customer_id = job.customer.id
	job.delete()
	return redirect("/customers/{}".format(customer_id))
