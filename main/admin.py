from django.contrib import admin

from main.models import *

# Register your models here.
admin.site.register(Customer)
admin.site.register(Job)
admin.site.register(Invoice)
admin.site.register(Task)
admin.site.register(Estimate)