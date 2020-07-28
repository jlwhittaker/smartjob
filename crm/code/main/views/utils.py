from django.contrib.sessions.backends.db import SessionStore
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.shortcuts import render, redirect
from django.core.serializers.json import DjangoJSONEncoder
from django.http import HttpResponse, JsonResponse
from main.models import *
from django.utils import timezone
from django.db import IntegrityError
from django.views.decorators.csrf import csrf_exempt
import json

def loginPage(request):
	return render(request, 'main/log_in.html')

@csrf_exempt
def auth(request):
	data = json.loads(request.body)
	if data['action_choice'] == 'signup':
		if User.objects.filter(username=data['username']).exists():
            #User already exists
			return JsonResponse({"error": "username taken"})
		else:
			user = User.objects.create_user(data['username'], password=data['password'])
	else:
		print("foo")
		user = authenticate(username=data['username'], password=data['password'])
		if user is None:
			return JsonResponse({"error": "invalid credentials"})
	login(request, user)
	request.user = user;
	print(request.user.is_authenticated)
	return JsonResponse({"success": "true"})

def log_out(request):
	logout(request)
	return redirect('/log_in.html')

def search(request, obj_type, query):
	response = []
	if obj_type == "customer":
		customers = Customer.objects.filter(
			user=request.user,
			name__contains=query
		)
		for customer in customers:
			response.append({
				"first_name": customer.name.split()[0],
				"last_name": customer.name.split()[-1],
				"id": customer.id,
				"add_date": customer.add_date.strftime("%B %d, %Y"),
				"last_modified": customer.last_modified.strftime("%B %d, %Y"),
			})

	elif obj_type == "job":
		jobs = Job.objects.filter(
			user=request.user,
			name__contains=query
		)
		for job in jobs:
			response.append({
				"name": job.name,
				"customer_name": job.customer.name,
				"id": job.id,
				"creation_date": job.creation_date.strftime("%B %d, %Y"),
				"last_modified": job.last_modified.strftime("%B %d, %Y"),
			})
		
	elif obj_type == "estimate":
		estimates = Estimate.objects.filter(
			user = request.user,
			name__contains=query,
		)
		for estimate in estimates:
			response.append({
				"name": estimate.name,
				"customer_name": estimate.customer.name,
				"id": estimate.id,
				"creation_date": estimate.creation_date.strftime("%B %d, %Y"),
				"last_modified": estimate.last_modified.strftime("%B %d, %Y"),
			})
	
	elif obj_type == "invoice":
		invoices = Invoice.objects.filter(
			user = request.user,
			name__contains=query,
		)
		for invoice in invoices:
			response.append({
				"name": invoice.name,
				"customer_name": invoice.customer.name,
				"id": invoice.id,
				"creation_date": invoice.creation_date.strftime("%B %d, %Y"),
				"total": invoice.total,
			})
	return JsonResponse({"results": response})
