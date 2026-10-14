from django.contrib import admin

from . import models

for model in [models.ServicePackage, models.ServiceRequest, models.Expert, models.Consultation,
              models.LearningCategory, models.Article, models.SavedArticle, models.Loan, models.Notification]:
    admin.site.register(model)
