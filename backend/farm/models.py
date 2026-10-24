from django.conf import settings
from django.db import models


class ServicePackage(models.Model):
    id = models.SlugField(primary_key=True, max_length=60)
    name = models.CharField(max_length=120)
    description = models.TextField()
    service_type = models.CharField(max_length=80)
    coverage = models.CharField(max_length=80)
    price = models.PositiveIntegerField()
    duration = models.CharField(max_length=80)
    includes = models.JSONField(default=list, blank=True)
    benefits = models.JSONField(default=list, blank=True)
    requirements = models.JSONField(default=list, blank=True)
    service_area = models.CharField(max_length=160)
    featured = models.BooleanField(default=False)
    image_url = models.URLField(max_length=500, blank=True)
    image_file = models.ImageField(upload_to="packages/", blank=True, null=True)
    active = models.BooleanField(default=True)
    sort_order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["sort_order", "price"]

    def __str__(self):
        return self.name


class ServiceRequest(models.Model):
    STATUSES = [
        ("inasubiri", "Inasubiri"),
        ("imethibitishwa", "Imethibitishwa"),
        ("inachakatwa", "Inachakatwa"),
        ("imepangwa", "Imepangwa"),
        ("imekamilika", "Imekamilika"),
        ("imeghairiwa", "Imeghairiwa"),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="service_requests")
    package = models.ForeignKey(ServicePackage, on_delete=models.PROTECT)
    price = models.PositiveIntegerField()
    status = models.CharField(max_length=20, choices=STATUSES, default="inasubiri")
    preferred_date = models.DateField()
    location = models.CharField(max_length=160)
    farm_location = models.CharField(max_length=200)
    farm_size = models.CharField(max_length=60)
    crop_type = models.CharField(max_length=60)
    notes = models.TextField(blank=True)
    admin_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    @property
    def code(self) -> str:
        return f"AGR-{self.pk:06d}"


class Expert(models.Model):
    id = models.SlugField(primary_key=True, max_length=60)
    user = models.OneToOneField(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    name = models.CharField(max_length=120)
    title = models.CharField(max_length=120)
    specialties = models.JSONField(default=list, blank=True)
    experience = models.CharField(max_length=60)
    location = models.CharField(max_length=80)
    availability = models.CharField(max_length=120)
    phone = models.CharField(max_length=20)
    bio = models.TextField()
    avatar_url = models.URLField(max_length=500, blank=True)
    avatar_file = models.ImageField(upload_to="experts/", blank=True, null=True)
    active = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class Consultation(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="consultations")
    problem = models.TextField()
    crop_type = models.CharField(max_length=60)
    image_file = models.ImageField(upload_to="consultations/", blank=True, null=True)
    expert = models.ForeignKey(Expert, null=True, blank=True, on_delete=models.SET_NULL)
    reply = models.TextField(blank=True)
    replied_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    @property
    def status(self) -> str:
        return "inajibiwa" if self.reply else "inasubiri"


class LearningCategory(models.Model):
    id = models.SlugField(primary_key=True, max_length=60)
    name = models.CharField(max_length=80)
    emoji = models.CharField(max_length=8)
    sort_order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["sort_order", "name"]
        verbose_name_plural = "learning categories"

    def __str__(self):
        return self.name


class Article(models.Model):
    id = models.SlugField(primary_key=True, max_length=80)
    title = models.CharField(max_length=160)
    category = models.ForeignKey(LearningCategory, on_delete=models.PROTECT, related_name="articles")
    description = models.TextField()
    read_time = models.PositiveSmallIntegerField(default=5)
    image_url = models.URLField(max_length=500, blank=True)
    image_file = models.ImageField(upload_to="articles/", blank=True, null=True)
    author = models.CharField(max_length=120)
    sections = models.JSONField(default=list, blank=True)
    actions = models.JSONField(default=list, blank=True)
    expert_tip = models.TextField(blank=True)
    related = models.ManyToManyField("self", blank=True, symmetrical=False)
    published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title


class SavedArticle(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="saved_articles")
    article = models.ForeignKey(Article, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = [("user", "article")]


class Loan(models.Model):
    id = models.SlugField(primary_key=True, max_length=60)
    institution = models.CharField(max_length=120)
    loan_type = models.CharField(max_length=120)
    amount = models.CharField(max_length=120)
    requirements = models.JSONField(default=list, blank=True)
    repayment = models.CharField(max_length=200)
    how_to_apply = models.TextField()
    cta = models.CharField(max_length=10, choices=[("omba", "Omba"), ("jifunze", "Jifunze")], default="omba")
    active = models.BooleanField(default=True)

    def __str__(self):
        return self.institution


class Notification(models.Model):
    TYPES = [(t, t) for t in ["huduma", "ushauri", "maoni", "penda", "mafunzo", "mikopo", "tangazo", "oda", "malipo", "msaada"]]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notifications")
    type = models.CharField(max_length=12, choices=TYPES)
    title = models.CharField(max_length=160)
    body = models.TextField()
    link = models.CharField(max_length=200, blank=True)
    read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]


def notify(user, type_: str, title: str, body: str, link: str = "") -> Notification:
    return Notification.objects.create(user=user, type=type_, title=title, body=body, link=link)


class ChatSession(models.Model):
    """One ongoing conversation with the farming advisor."""

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="chat_sessions")
    language = models.CharField(max_length=2, default="sw")
    # Set when the farmer explicitly asks to switch language, so the app
    # language does not override that choice on the next message.
    language_locked = models.BooleanField(default=False)
    article = models.ForeignKey(Article, null=True, blank=True, on_delete=models.SET_NULL, related_name="chat_sessions")
    title = models.CharField(max_length=80, blank=True)
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self):
        return f"Chat {self.pk} · {self.user_id}"


class ChatMessage(models.Model):
    ROLES = [("user", "user"), ("assistant", "assistant")]

    session = models.ForeignKey(ChatSession, on_delete=models.CASCADE, related_name="messages")
    role = models.CharField(max_length=10, choices=ROLES)
    content = models.TextField()
    suggestions = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]
        indexes = [models.Index(fields=["session", "created_at"])]

    def __str__(self):
        return f"{self.role}: {self.content[:40]}"
