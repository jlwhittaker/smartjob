from django.shortcuts import render, redirect
from django.http import HttpResponse, JsonResponse
from main.models import *

def get(request):
	customers = Customer.objects.filter(user=request.user).order_by("last_modified")[:10][::-1]
	jobs = Job.objects.filter(user=request.user).order_by("last_modified")[:10][::-1]
	estimates = Estimate.objects.filter(user=request.user).order_by("last_modified")[:10][::-1]
	invoices = Invoice.objects.filter(user=request.user).order_by("last_modified")[:10][::-1]
	user = request.user

	context = {
		'customers': customers,
		'jobs': jobs,
		'estimates': estimates,
		'invoices': invoices,
	}
	return render(request, 'main/index.html', context)
