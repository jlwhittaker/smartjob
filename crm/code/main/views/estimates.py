from django.shortcuts import render, redirect
from django.core.serializers.json import DjangoJSONEncoder
from django.http import HttpResponse, JsonResponse
from main.models import *
from django.utils import timezone
import json

def show(request, estimate_id):
	estimate = Estimate.objects.get(pk=estimate_id)
	context = {
		"estimate": estimate,
		"job": estimate.job,
		"tasks": Task.objects.filter(estimate=estimate),
		"notes": Note.objects.filter(estimate=estimate)
	}
	return render(request, 'main/showEstimate.html', context)

def showAll(request):
	estimates = [e for e in Estimate.objects.filter(user=request.user)]
	context = {"estimates": estimates}
	return render(request, 'main/allEstimates.html', context)

def getTasks(request, estimate_id):
	estimate = Estimate.objects.get(pk=estimate_id)
	tasks = Task.objects.filter(estimate=estimate)
	response = {
		"description": estimate.description,
		"location": estimate.address,
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

def delete(request, estimate_id):
	estimate = Estimate.objects.get(pk=estimate_id)
	customer_id = estimate.customer.id
	estimate.delete()
	return redirect("/customers/{}".format(customer_id))

def new(request, customer_id=None):
	c = Customer.objects.get(pk=customer_id)
	context = {
		"customer": c
	}
	return render(request, 'main/newEstimate.html', context)

def edit(request, estimate_id):
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

def save(request, estimate_id=None):
	data = json.loads(request.body)
	if estimate_id:
		estimate = Estimate.objects.get(pk=estimate_id)
	else:
		estimate = Estimate()
	
	estimate.customer = Customer.objects.get(pk=data["customer_id"])
	estimate.name = data["estimate"]["details"]["name"]
	estimate.description = data["estimate"]["details"]["description"]
	estimate.address = data["estimate"]["details"]["location"]
	estimate.contact_name = data["estimate"]["contact"]["name"]
	estimate.contact_email = data["estimate"]["contact"]["email"]
	estimate.contact_phone = data["estimate"]["contact"]["phone"]
	estimate.user = request.user 
	estimate.save()

	#Delete old tasks, to be replaced by new ones
	tasks = Task.objects.filter(estimate=estimate)
	for task in tasks:
		task.delete()

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