from django.contrib import admin
from .models import Feedback,Farmer,Post,Challenge,Comment,Report,ReportAssignment,Order
# Register your models here.
admin.site.register(Feedback)
admin.site.register(Farmer)
admin.site.register(Post)
admin.site.register(Challenge)
admin.site.register(Comment)
admin.site.register(Report)
admin.site.register(ReportAssignment)
admin.site.register(Order)