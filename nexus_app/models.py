
from django.db import models

class Feedback(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField()
    message = models.TextField()

    def __str__(self):
        return self.name

from django.contrib.auth.models import User
from django.db import models

class Farmer(models.Model):
    # user = models.OneToOneField(User, on_delete=models.CASCADE)  # Link to User
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)
    name = models.CharField(max_length=100)  # This will match the username
    email = models.EmailField()
    phone_number = models.FloatField()
    region = models.CharField(max_length=50)
    district = models.CharField(max_length=50)
    street = models.CharField(max_length=100)
    farm_size = models.FloatField()  # Size in hectares
    crop_type = models.CharField(max_length=100)
    address = models.TextField()
    def __str__(self):
        return f"{self.user.username} - {self.name}"  # Use the username as an identifier



class Challenge(models.Model):
    farmer = models.ForeignKey(User, on_delete=models.CASCADE)
    challenge_type= models.CharField(max_length=100,blank=True, null=True)
    title = models.CharField(max_length=100)
    description = models.TextField()
    image = models.ImageField(upload_to='challenges/', blank=True, null=True)
    status = models.CharField(max_length=20, choices=[('Not Solved', 'Not solved'), ('Solved', 'Solved')], default='Not Solved')
    expert_response = models.TextField(blank=True, null=True)
    date_created = models.DateTimeField(auto_now_add=True)
    date_resolved = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"Challenge: {self.title} (Farmer: {self.farmer.username})"

class Post(models.Model):
    farmer = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=100, blank=True, null=True)  # Optional title for a post
    caption = models.TextField()  # Text content of the post
    media = models.FileField(upload_to='post_media/', blank=True, null=True)  # For images, videos, etc.
    date_created = models.DateTimeField(auto_now_add=True)
    likes = models.ManyToManyField(User, related_name='liked_posts', blank=True)  # Reactions (like)
    shares = models.ManyToManyField(User, related_name='shared_posts', blank=True)  # Sharing functionality
    def __str__(self):
        return f"Post: {self.title or 'Untitled'} (Farmer: {self.farmer.username})"

    def like_count(self):
        return self.likes.count()

    def share_count(self):
        return self.shares.count()


class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    comment = models.TextField()
    date_created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Comment by {self.author.username} on {self.post.title}"

from django.db import models
from django.contrib.auth.models import User

class Report(models.Model):
    REPORT_TYPES = [
        ('soil', 'Soil Analysis'),
        ('market', 'Market Trends'),
        ('tech', 'Agriculture Tech'),
        ('crops', 'Crop Management'),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField()
    report_type = models.CharField(max_length=20, choices=REPORT_TYPES)
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    farmer = models.ForeignKey(User, related_name='farmer_reports', on_delete=models.CASCADE ,blank=True, null=True)
    file = models.FileField(upload_to='reports/')
    created_date = models.DateTimeField(auto_now_add=True)
    pages = models.IntegerField(default=1)

class ReportAssignment(models.Model):
    report = models.ForeignKey(Report, on_delete=models.CASCADE)
    farmer = models.ForeignKey(Farmer, on_delete=models.CASCADE)
    read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

from django.db import models
from django.contrib.auth.models import User
from django.db import models

class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('canceled', 'Canceled'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="orders",blank=True, null=True)  # Link to User model
    service = models.CharField(max_length=255)
    start_date = models.DateField()
    farmsize = models.FloatField(blank=True, null=True)
    location = models.CharField(max_length=255)
    additional_requirements = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.service} by {self.user.username} - {self.status}"
