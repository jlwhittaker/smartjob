from django.shortcuts import render, redirect
from django.core.serializers.json import DjangoJSONEncoder
from django.http import HttpResponse, JsonResponse
from main.models import *
from django.utils import timezone
import json

def add(request):
	data = json.loads(request.body)
	note = Note()
	note.content = data["content"]
	
	if data["type"] == "estimate":
		note.estimate = Estimate.objects.get(pk=data["id"])
	elif data["type"] == "job":
		note.job = Job.objects.get(pk=data["id"])
	elif data["type"] == "customer":
		note.customer = Customer.objects.get(pk=data["id"])
	
	note.save()

	response = {
		"success": True,
		"id": note.id,
	}

	return JsonResponse(response)