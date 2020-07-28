from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
import datetime


class Customer(models.Model):
	name = models.CharField(max_length=250, null=True, blank=True)
	address = models.CharField(max_length=250, null=True, blank=True)
	email = models.EmailField(max_length=250, null=True, blank=True)
	phone_number = models.CharField(max_length=50, null=True, blank=True)
	add_date = models.DateField('Date added', auto_now_add=True, null=True, blank=True)
	referral = models.CharField(max_length=50, null=True, blank=True)
	last_modified = models.DateField(auto_now=True)
	user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)



class Invoice(models.Model):
	name = models.CharField(max_length=250, default='Untitled')
	customer = models.ForeignKey(Customer, on_delete=models.CASCADE, null=True, blank=True)
	job = models.ForeignKey('Job', on_delete=models.CASCADE, null=True, blank=True)
	creation_date = models.DateField(auto_now_add=True, null=True, blank=True)
	due_date = models.DateField(default=(datetime.date.today() + datetime.timedelta(days=30)), null=True, blank=True)
	total = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
	last_modified = models.DateField(auto_now=True)
	contact_name = models.CharField(max_length=50, null=True, blank=True)
	contact_email = models.EmailField(max_length=250, null=True, blank=True)
	contact_phone = models.CharField(max_length=50, null=True, blank=True)
	user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
	status = models.CharField(max_length=50, null=True, blank=True)


	def tasks(self):
		return Task.objects.filter(invoice=self)

class Estimate(models.Model):
	name = models.CharField(max_length=250, default='Untitled')
	creation_date = models.DateField(auto_now_add=True, null=True, blank=True)
	address = models.CharField(max_length=250, null=True, blank=True)
	description = models.CharField(max_length=250, null=True, blank=True)
	customer = models.ForeignKey(Customer, on_delete=models.CASCADE)
	job = models.ForeignKey('Job', on_delete=models.SET_NULL, null=True, blank=True)
	total = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
	isJob = models.BooleanField(default=False)
	last_modified = models.DateField(auto_now=True)
	contact_name = models.CharField(max_length=50, null=True, blank=True)
	contact_email = models.EmailField(max_length=250, null=True, blank=True)
	contact_phone = models.CharField(max_length=50, null=True, blank=True)
	user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)

	def tasks(self):
		return Task.objects.filter(estimate=self)

class Task(models.Model):
	name = models.CharField(max_length=250, null=True, blank=True)
	description = models.CharField(max_length=250, null=True, blank=True)
	price = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
	invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, null=True, blank=True)
	job = models.ForeignKey('Job', on_delete=models.CASCADE, null=True, blank=True)
	quantity = models.PositiveIntegerField(null=True, blank=True)
	estimate = models.ForeignKey(Estimate, on_delete=models.CASCADE, null=True, blank=True)
	total = models.IntegerField(null=True, blank=True)
	last_modified = models.DateField(auto_now=True)
	user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)

class Job(models.Model):
	name = models.CharField(max_length=50, null=True, blank=True)
	description = models.TextField(null=True, blank=True)
	start_date = models.DateField('Job start date', null=True, blank=True)
	finish_date = models.DateField('Job finish date', null=True, blank=True)
	creation_date = models.DateField(auto_now_add=True, null=True, blank=True)
	active = models.BooleanField(null=True, blank=True)
	address = models.CharField(max_length=250, null=True, blank=True)
	customer = models.ForeignKey(Customer, on_delete=models.CASCADE, null=True, blank=True)
	last_modified = models.DateField(auto_now=True)
	contact_name = models.CharField(max_length=50, null=True, blank=True)
	contact_email = models.EmailField(max_length=250, null=True, blank=True)
	contact_phone = models.CharField(max_length=50, null=True, blank=True)
	user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
	
	def tasks(self):
		return Task.objects.filter(job=self)

class Note(models.Model):
	content = models.CharField(max_length=1000, null=True, blank=True)
	customer = models.ForeignKey(Customer, on_delete=models.CASCADE, null=True, blank=True)
	job = models.ForeignKey(Job, on_delete=models.CASCADE, null=True, blank=True)
	estimate = models.ForeignKey(Estimate, on_delete=models.CASCADE, null=True, blank=True)
	date = models.DateField(auto_now=True)
	user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
	
	




