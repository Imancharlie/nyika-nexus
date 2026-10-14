import json
import re
from datetime import timedelta
from pathlib import Path

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from accounts.models import User
from community.models import Comment, Group, GroupMembership, Post
from farm.models import Article, Expert, LearningCategory, Loan, ServicePackage
from market.models import Product

SEED_FILE = Path(__file__).resolve().parents[2] / "fixtures" / "seed.json"

UNSPLASH = "https://images.unsplash.com/{}?q=80&w=800&auto=format&fit=crop"

PRODUCTS = [
    ("DAP", "mbolea", 85000, "50kg", 40, "photo-1592982537447-7440770cbfc9", True,
     "Mbolea ya kupandia yenye fosforasi kwa mizizi imara."),
    ("UREA", "mbolea", 72000, "50kg", 35, "photo-1416879595882-3373a0480b5b", False,
     "Mbolea ya kukuzia yenye naitrojeni kwa majani mabichi."),
    ("CAN", "mbolea", 68000, "50kg", 20, "photo-1464226184884-fa280b87c399", False,
     "Mbolea ya kukuzia isiyoongeza tindikali kwenye udongo."),
    ("Mbegu za mahindi (hybrid)", "mbegu", 42000, "25kg", 60, "photo-1574943320219-553eb213f72d", True,
     "Mbegu bora za mahindi zinazostahimili ukame."),
    ("Mbegu za nyanya", "mbegu", 15000, "50g", 80, "photo-1530836369250-ef72a3f5cda8", False,
     "Aina ya nyanya inayostahimili magonjwa ya majani."),
    ("Mbegu za maharage", "mbegu", 18000, "5kg", 45, "photo-1523348837708-15d4a09cfac2", False,
     "Maharage ya muda mfupi, mavuno ndani ya siku 75."),
    ("Bomba la kunyunyizia (knapsack)", "vifaa", 65000, "lita 16", 15, "photo-1595855759920-86582396756a", True,
     "Bomba imara la mgongoni kwa dawa na mbolea ya maji."),
    ("Mpira wa umwagiliaji wa matone", "vifaa", 120000, "mita 100", 10, "photo-1601655157823-9b0a16ed09e2",
     False, "Seti ya umwagiliaji wa matone kwa robo ekari."),
    ("Jembe la mkono", "vifaa", 12000, "kipande", 50, "photo-1471193945509-9ad0617afabf", False,
     "Jembe la chuma kigumu lenye mpini wa mbao."),
    ("Dawa ya wadudu (viuadudu)", "dawa", 25000, "lita 1", 30, "photo-1625246333195-78d9c38ad449", False,
     "Huua viwavi jeshi na wadudu wanaokula majani."),
    ("Dawa ya kuvu (fungicide)", "dawa", 22000, "kg 1", 30, "photo-1500937386664-56d1dfef3854", False,
     "Kinga dhidi ya ukungu na baka jani kwenye nyanya na viazi."),
    ("Chakula cha kuku (layers mash)", "mifugo", 58000, "50kg", 25, "photo-1560493676-04071c5f467b", False,
     "Chakula kamili cha kuku wa mayai."),
    ("Chanjo ya kuku (Newcastle)", "mifugo", 8000, "dozi 100", 40, "photo-1605000797499-95a51c5269ae", False,
     "Chanjo ya kideri kwa kuku, tumia kila miezi 3."),
]

GROUPS = [
    ("Wakulima wa Nyanya Morogoro", "Tunashirikiana mbinu, bei za soko na pembejeo za nyanya.", "Morogoro", "Nyanya",
     "photo-1530836369250-ef72a3f5cda8"),
    ("Mahindi Bora Iringa", "Kikundi cha wakulima wa mahindi wa Iringa na Njombe.", "Iringa", "Mahindi",
     "photo-1574943320219-553eb213f72d"),
    ("Umwagiliaji Dodoma", "Mbinu za umwagiliaji kwa maeneo kame.", "Dodoma", "Mazao mengine",
     "photo-1601655157823-9b0a16ed09e2"),
    ("Wafugaji wa Kuku Mbeya", "Afya ya kuku, chanjo na masoko ya mayai.", "Mbeya", "Mifugo",
     "photo-1560493676-04071c5f467b"),
]

POST_AGES = [timedelta(minutes=25), timedelta(hours=2), timedelta(hours=5), timedelta(days=1),
             timedelta(days=2), timedelta(days=3)]


def slug_username(name: str) -> str:
    clean = re.sub(r"^(Dkt\.|Bw\.|Bi\.)\s*", "", name)
    return re.sub(r"[^a-z0-9]+", ".", clean.lower()).strip(".")


class Command(BaseCommand):
    help = "Load demo content (services, learning, experts, loans, products, groups, posts)."

    def add_arguments(self, parser):
        parser.add_argument("--fresh", action="store_true", help="Delete existing demo content first")

    @transaction.atomic
    def handle(self, *args, fresh=False, **options):
        data = json.loads(SEED_FILE.read_text(encoding="utf-8"))
        if fresh:
            for model in [Post, Group, Product, Article, LearningCategory, Expert, Loan]:
                model.objects.all().delete()
            ServicePackage.objects.filter(servicerequest__isnull=True).delete()

        for i, p in enumerate(data["servicePackages"]):
            ServicePackage.objects.update_or_create(id=p["id"], defaults={
                "name": p["name"], "description": p["description"], "service_type": p["serviceType"],
                "coverage": p["coverage"], "price": p["price"], "duration": p["duration"],
                "includes": p["includes"], "benefits": p["benefits"], "requirements": p["requirements"],
                "service_area": p["serviceArea"], "featured": p.get("featured", False),
                "image_url": p.get("image") or "", "sort_order": i,
            })

        for i, c in enumerate(data["learningCategories"]):
            LearningCategory.objects.update_or_create(id=c["id"], defaults={
                "name": c["name"], "emoji": c["emoji"], "sort_order": i})

        now = timezone.now()
        for i, a in enumerate(data["learningArticles"]):
            article, _ = Article.objects.update_or_create(id=a["id"], defaults={
                "title": a["title"], "category_id": a["categoryId"], "description": a["description"],
                "read_time": a["readTime"], "image_url": a.get("image") or "", "author": a["author"],
                "sections": a["sections"], "actions": a["actions"], "expert_tip": a.get("expertTip") or "",
            })
            Article.objects.filter(pk=article.pk).update(created_at=now - timedelta(days=i))
        for a in data["learningArticles"]:
            Article.objects.get(pk=a["id"]).related.set(Article.objects.filter(pk__in=a["relatedIds"]))

        for e in data["experts"]:
            Expert.objects.update_or_create(id=e["id"], defaults={
                "name": e["name"], "title": e["title"], "specialties": e["specialties"],
                "experience": e["experience"], "location": e["location"], "availability": e["availability"],
                "phone": e["phone"], "bio": e["bio"], "avatar_url": e["avatar"],
            })

        for loan in data["loans"]:
            Loan.objects.update_or_create(id=loan["id"], defaults={
                "institution": loan["institution"], "loan_type": loan["loanType"], "amount": loan["amount"],
                "requirements": loan["requirements"], "repayment": loan["repayment"],
                "how_to_apply": loan["howToApply"], "cta": loan["cta"],
            })

        for name, category, price, unit, stock, photo, featured, desc in PRODUCTS:
            Product.objects.update_or_create(name=name, unit=unit, defaults={
                "category": category, "price": price, "stock": stock, "image_url": UNSPLASH.format(photo),
                "featured": featured, "description": desc,
            })

        people: dict[str, User] = {}

        def person(name: str, region: str = "") -> User:
            if name in people:
                return people[name]
            username = slug_username(name)
            user = User.objects.filter(username=username).first()
            if not user:
                parts = re.sub(r"^(Dkt\.|Bw\.|Bi\.)\s*", "", name).split()
                user = User(username=username, first_name=parts[0], last_name=" ".join(parts[1:]),
                            phone=f"+2557000{len(people) + 1:05d}", region=region, phone_verified=True)
                user.set_unusable_password()
                while User.objects.filter(phone=user.phone).exists():
                    user.phone = f"+2557000{int(user.phone[-5:]) + 100:05d}"
                user.save()
            people[name] = user
            return user

        if not Post.objects.exists():
            for i, p in enumerate(data["posts"]):
                author = person(p["author"], p.get("location", ""))
                post = Post.objects.create(author=author, text=p["text"], image_url=p.get("image") or "",
                                           seed_likes=p["likes"])
                Post.objects.filter(pk=post.pk).update(created_at=now - POST_AGES[min(i, len(POST_AGES) - 1)])
                for c in p["comments"]:
                    Comment.objects.create(post=post, author=person(c["author"]), text=c["text"])

        if not Group.objects.exists():
            members = list(people.values())
            for i, (name, desc, region, crop, photo) in enumerate(GROUPS):
                group = Group.objects.create(name=name, description=desc, region=region, crop=crop,
                                             image_url=UNSPLASH.format(photo))
                for user in members[i:] + members[:i]:
                    GroupMembership.objects.get_or_create(group=group, user=user)

        self.stdout.write(self.style.SUCCESS(
            f"Seeded: {ServicePackage.objects.count()} packages, {Article.objects.count()} articles, "
            f"{Expert.objects.count()} experts, {Loan.objects.count()} loans, {Product.objects.count()} products, "
            f"{Group.objects.count()} groups, {Post.objects.count()} posts."))
