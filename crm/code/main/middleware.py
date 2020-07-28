from django.contrib.sessions.backends.db import SessionStore
from django.contrib.auth.models import User
from django.shortcuts import render, redirect
from django.template import loader
from django.http import HttpResponse, JsonResponse
from . import views

#If user is not logged in, redirect to '/login'
class LogInRedirect:

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        print(request.user) 
        if request.user.is_authenticated or \
            request.path.startswith('/auth') or \
            request.path.startswith('/login') or \
            request.path.startswith('/admin'):
            return self.get_response(request)
        else:
            return redirect('/login')

