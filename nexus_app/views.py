from django.shortcuts import render
from .models import Feedback,Post,Challenge,Comment,Farmer
from django.core.mail import send_mail
from django.shortcuts import render
from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.contrib.auth import login, authenticate
from django.contrib.auth.forms import UserCreationForm
from django.contrib import messages
from django.contrib.auth import authenticate, login as auth_login
from django.contrib import messages
from django.shortcuts import render, redirect
from django.contrib.auth.forms import UserCreationForm
from django.http import JsonResponse
from .forms import FarmerRegistrationForm
from nexus_app.utils.districts import DISTRICTS
from django.shortcuts import render, redirect
from .forms import FarmerRegistrationForm
from django.contrib.auth.models import User
from django.contrib import messages
from django.contrib.auth import logout
from django.db.models import Count
from django.shortcuts import render, redirect
from django.contrib import messages
from .models import Post, Comment,Order
from django.contrib.auth.decorators import login_required

from django.db.models import Q
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.db.models import Q
from .models import Challenge
from django.utils import timezone

@login_required
def view_orders(request):
    if request.user.is_staff:
        base_template = 'staff_base.html'
    else:
        base_template = 'base.html'
    # Assuming the orders are filtered by the current logged-in user
    pending_orders = Order.objects.filter(status='pending')
    orders=Order.objects.filter(status='completed')
    return render(request, 'view_orders.html', {'orders': orders,'pending_orders': pending_orders,'base_template':base_template})
@login_required
def staff_challenges(request):
    pending_orders_count = Order.objects.filter(status='Not solved').count()
    # Count pending challenges
    pending_challenges_count = Challenge.objects.filter(status='pending').count()
    notification=pending_orders_count+pending_challenges_count
    if request.user.is_staff:
        base_template = 'staff_base.html'
    else:
        base_template = 'base.html'
    query = request.GET.get('q', '').strip()
    challenges = Challenge.objects.all().order_by('-date_created')

    if query:
        challenges = challenges.filter(
            Q(farmer__username__icontains=query) |
            Q(title__icontains=query) |
            Q(status__icontains=query)
        )

    return render(request, 'staff_challenges.html', {
        'challenges': challenges,
        'query': query,
        'base_template': base_template,
        'notification':notification,
    })

@login_required
def challenge_detail(request, challenge_id):
    pending_orders_count = Order.objects.filter(status='Not solved').count()
    # Count pending challenges
    pending_challenges_count = Challenge.objects.filter(status='pending').count()
    notification=pending_orders_count+pending_challenges_count
    if request.user.is_staff:
        base_template = 'staff_base.html'
    else:
        base_template = 'base.html'
    challenge = get_object_or_404(Challenge, id=challenge_id)
    return render(request, 'challenge_detail.html', {'challenge': challenge,'notification':notification,'base_template': base_template})

@login_required
def resolve_challenge(request, challenge_id):
    pending_orders_count = Order.objects.filter(status='Not solved').count()
    # Count pending challenges
    pending_challenges_count = Challenge.objects.filter(status='pending').count()
    notification=pending_orders_count+pending_challenges_count
    if request.user.is_staff:
        base_template = 'staff_base.html'
    else:
        base_template = 'base.html'
        # Optionally, restrict non-staff users from resolving challenges
        if request.method == 'POST':
            return HttpResponseForbidden("You do not have permission to resolve challenges.")

    challenge = get_object_or_404(Challenge, id=challenge_id)
    if request.method == 'POST':
        challenge.status = 'resolved'
        challenge.expert_response = request.POST.get('expert_response', '')
        print(challenge.expert_response)
        challenge.date_resolved = timezone.now()
        challenge.save()
        return redirect('staff_challenges')
    return render(request, 'resolve_challenge.html', {'challenge': challenge,'notification':notification, 'base_template': base_template})

@login_required
def admin_view_posts(request):
    pending_orders_count = Order.objects.filter(status='Not solved').count()
    # Count pending challenges
    pending_challenges_count = Challenge.objects.filter(status='pending').count()
    notification=pending_orders_count+pending_challenges_count
    if request.user.is_staff:
        base_template = 'staff_base.html'
    else:
        base_template = 'base.html'
    query = request.GET.get('q')  # Get the search query from the URL
    posts = Post.objects.all().order_by('-date_created')

    if query:
        # Filter posts by farmer username, caption, or ID
        posts = posts.filter(
            Q(farmer__username__icontains=query) |
            Q(caption__icontains=query) |
            Q(id__icontains=query)
        )

    return render(request, 'admin_posts.html', {'posts': posts, 'query': query,'notification':notification,'base_template': base_template})

@login_required
def admin_delete_post(request, post_id):
    post = get_object_or_404(Post, id=post_id)
    post.delete()
    return redirect('admin_view_posts')

from django.shortcuts import render, redirect
from django.http import HttpResponse
from .models import Feedback
from django.contrib import messages

def home(request):
    if request.method == 'POST':
        # Get the form data from the POST request
        name = request.POST.get('name')
        email = request.POST.get('email')
        message = request.POST.get('message')

        # Check if the form data is not empty (basic validation)
        if name and email and message:
            # Create and save the feedback to the database
            Feedback.objects.create(name=name, email=email, message=message)

            # Optionally, use Django messages framework for a success message
            messages.success(request, 'Thank you for your feedback!')
        else:
            # Optionally, use Django messages framework for an error message
            messages.error(request, 'Please fill in all fields.')

        # Redirect to the home page or render again with a message
        return redirect('home')  # Make sure to set 'home' URL in your urls.py

    # If it's a GET request, simply render the page
    return render(request, "nexus.html")


from django.shortcuts import redirect, render
from django.contrib.auth import authenticate, login as auth_login
from django.contrib import messages

def login(request):
    if request.user.is_authenticated:
        messages.success(request, 'You are already logged in!')

        # Redirect based on user role
        if request.user.is_staff:
            return redirect('staff_dashboard')  # Replace with your staff dashboard URL name
        else:
            return redirect('post')  # Replace with your farmer dashboard URL name

    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(request, username=username, password=password)

        if user is not None:
            auth_login(request, user)
            messages.success(request, 'Login successful!')

            # Redirect based on user role
            if user.is_staff:
                return redirect('staff_dashboard')  # Replace with your staff dashboard URL name
            else:
                return redirect('post')  # Replace with your farmer dashboard URL name
        else:
            messages.error(request, 'Invalid username or password.')

    return render(request, 'login.html')

def signin_view(request):
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            auth_login(request, user)  # Fixed: Use 'auth_login' (import alias) instead of 'login'
            messages.success(request, 'Registration successful!')
            return redirect('register')  # Replace 'home' with your home page URL name
    else:
        form = UserCreationForm()  # If GET request, show empty form

    return render(request, 'signin.html', {'form': form})  # Ensure your signup page is correctly named


def farmer_register(request):
    if request.method == 'POST':
        district= request.POST.get('district')

##i have done this inorder to debug the issue raised in the form about assigning district value
        if 'district' in request.POST:
            request.POST._mutable = True  # Make the POST data mutable
            request.POST['district'] = 'Ilala'

        form = FarmerRegistrationForm(request.POST)
        if form.is_valid():
            # Extract farmer data from the form
            farmer = form.save(commit=False)  # Save the form but don't commit to the database yet
            user=request.user
            print(request.user)
            # Link the user to the farmer
            farmer.user = user
            farmer.save()  # Save the farmer to the database
            if district:
                farmer.district = district
                farmer.save()
            messages.success(request, 'Farmer registered successfully!')
            return redirect('welcome')  # Redirect to the desired page after registration
        else:
            print("the form is not valid")
    else:
        print("the form was not submited")
        form = FarmerRegistrationForm()

    return render(request, 'register.html', {'form': form})
@login_required
def welcome_page(request):
    return render(request, 'welcome.html')
@login_required
def get_districts(request):
    region = request.GET.get('region')
    districts = DISTRICTS.get(region, [])
    return JsonResponse({'districts': districts})

@login_required
def post(request):
    pending_orders_count = Order.objects.filter(status='Not solved').count()
    # Count pending challenges
    pending_challenges_count = Challenge.objects.filter(status='pending').count()
    notification=pending_orders_count+pending_challenges_count
    if request.user.is_staff:
        base_template = 'staff_base.html'
    else:
        base_template = 'base.html'
    # Retrieve posts with a comment count (no need to manually assign comments)
    posts = Post.objects.annotate(comment_count=Count('comments')).order_by('-date_created')
    if request.method == 'POST' and 'comment' in request.POST:  # Handle comment submission
        comment_text = request.POST.get('comment')  # Retrieve comment text
        post_id = request.POST.get('post_id')  # Retrieve the post ID
        if comment_text and post_id:
            try:
                post = Post.objects.get(id=post_id)  # Get the post object
                Comment.objects.create(
                    post=post,
                    author=request.user,
                    comment=comment_text
                )
                # messages.success(request, "Comment added successfully!")
            except Post.DoesNotExist:
                messages.error(request, "Post does not exist.")
        else:
            messages.error(request, "Invalid comment submission.")
        return redirect('post')  # Redirect to refresh the page

    # Pass the posts to the template
    context = {'posts': posts, 'base_template': base_template,'notification':notification}
    return render(request, "post.html", context)

from django.shortcuts import render, get_object_or_404
from .models import Post

@login_required
def post_detail(request, id):
    pending_orders_count = Order.objects.filter(status='Not solved').count()
    # Count pending challenges
    pending_challenges_count = Challenge.objects.filter(status='pending').count()
    notification=pending_orders_count+pending_challenges_count
    if request.user.is_staff:
        base_template = 'staff_base.html'
    else:
        base_template = 'base.html'
    post = get_object_or_404(Post, id=id)  # Fetch the specific post
    return render(request, 'post_detail.html', {'post': post,'notification':notification, 'base_template': base_template})

# views.py
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.shortcuts import get_object_or_404
from .models import Post

@require_POST
def toggle_like(request, post_id):
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication required'}, status=401)

    post = get_object_or_404(Post, id=post_id)

    # Check if user already liked the post
    if post.likes.filter(id=request.user.id).exists():
        post.likes.remove(request.user)
        is_liked = False
    else:
        post.likes.add(request.user)
        is_liked = True

    return JsonResponse({
        'likes_count': post.likes.count(),
        'is_liked': is_liked
    })


from django.shortcuts import render, redirect
from django.contrib import messages
from .models import Challenge

@login_required
def report_challenge(request):
     # Count pending orders
    pending_orders_count = Order.objects.filter(status='Not solved').count()
    # Count pending challenges
    pending_challenges_count = Challenge.objects.filter(status='pending').count()
    notification=pending_orders_count+pending_challenges_count
    if request.user.is_staff:
        base_template = 'staff_base.html'
    else:
        base_template = 'base.html'
    if request.method == 'POST':
        title=request.POST.get('title')
        challenge_type = request.POST.get('challenge_type')
        description = request.POST.get('description')
        image = request.FILES.get('image')

        # Ensure the user is authenticated
        if not request.user.is_authenticated:
            messages.error(request, "You must be logged in to report a challenge.")
            return redirect('login')

        # Validate inputs
        if not challenge_type or not description:
            messages.error(request, "Please fill in all required fields.")
            return redirect('challenge')

        if len(description) < 20:
            messages.error(request, "Description must be at least 20 characters long.")
            return redirect('challenge')

        # Save the challenge to the database
        challenge = Challenge.objects.create(
            farmer=request.user,  # Assign the currently logged-in user
            title=title.replace('_', ' ').title(),  # Use challenge type as title
            challenge_type=challenge_type,
            description=description,
            image=image
        )
        challenge.save()

        messages.success(request, "Your challenge has been submitted successfully!")
        return redirect('challenge')

    return render(request, 'challenge.html',{'base_template': base_template,'notification':notification})

@login_required
def settings(request):
    pending_orders_count = Order.objects.filter(status='Not solved').count()
    # Count pending challenges
    pending_challenges_count = Challenge.objects.filter(status='pending').count()
    notification=pending_orders_count+pending_challenges_count
    if request.user.is_staff:
        base_template = 'staff_base.html'
    else:
        base_template = 'base.html'
    # Get the farmer profile for the logged-in user
    farmer = Farmer.objects.get(user=request.user)

    if request.method == 'POST':
        # Update only specific fields while keeping others unchanged
        farmer.name = request.POST.get('name', farmer.name)
        farmer.email = request.POST.get('email', farmer.email)
        farmer.phone_number = request.POST.get('phone_number', farmer.phone_number)
        farmer.street = request.POST.get('street', farmer.street)
        farmer.farm_size = request.POST.get('farm_size', farmer.farm_size)
        farmer.crop_type = request.POST.get('crop_type', farmer.crop_type)

        # Save updated fields
        farmer.save()
        messages.success(request, "Profile updated successfully!")

        return redirect('setting')  # Redirect back to settings page after update

    return render(request, "settings.html", {'farmer': farmer,'notification':notification, 'base_template': base_template})


def logout_view(request):
    logout(request)
    return redirect('login')

@login_required
def report(request):
    if request.user.is_staff:
        base_template = 'staff_base.html'
    else:
        base_template = 'base.html'
    return render(request,"report.html",{ 'base_template': base_template})

from django.contrib.auth.decorators import user_passes_test
from django.contrib import messages
from django.shortcuts import render, redirect
from .models import Report, ReportAssignment
from django.contrib.auth.models import User
import traceback


@login_required
def create_report(request):
    pending_orders_count = Order.objects.filter(status='Not solved').count()
    # Count pending challenges
    pending_challenges_count = Challenge.objects.filter(status='pending').count()
    notification=pending_orders_count+pending_challenges_count
    if request.user.is_staff:
        base_template = 'staff_base.html'
    else:
        base_template = 'base.html'
    print('create_report')
    if request.method == 'POST':
        print(request.POST)
        try:
            # Create report
            report = Report.objects.create(
                title=request.POST['title'],
                description=request.POST['description'],
                report_type=request.POST['report_type'],
                pages=request.POST['pages'],
                file=request.FILES['file'],
                author=request.user
            )

            # Handle assignments
            assignment_type = request.POST['assignment_type']
            if assignment_type == 'all':
                print('Assigning to all farmers')
                # Assign to all farmers
                farmers = Farmer.objects.all()  # Fetch all Farmer instances
                for farmer in farmers:
                    ReportAssignment.objects.create(
                        report=report,
                        farmer=farmer  # Use the Farmer instance
                    )

            else:
                # Assign to selected farmers
                farmer_ids = request.POST.getlist('farmers[]')
                print("hello ",farmer_ids)
                for farmer_id in farmer_ids:
                    farmer_instance = Farmer.objects.get(id=farmer_id)  # Fetch the Farmer instance
                    ReportAssignment.objects.create(
                        report=report,
                        farmer=farmer_instance  # Use the Farmer instance
                    )
            messages.success(request, 'Report created and assigned successfully!')

            return redirect('create_report')

        except Exception as e:
            print(traceback.format_exc())
            messages.error(request, f'Error creating report: {str(e)}')
            return redirect('create_report')


    return render(request, 'create_report.html',{'base_template': base_template,'notification':notification})

@login_required
def view_report(request, report_id):
    pending_orders_count = Order.objects.filter(status='Not solved').count()
    # Count pending challenges
    pending_challenges_count = Challenge.objects.filter(status='pending').count()
    notification=pending_orders_count+pending_challenges_count
    if request.user.is_staff:
        base_template = 'staff_base.html'
    else:
        base_template = 'base.html'
    report = get_object_or_404(Report, id=report_id)

    # Check if the user is a farmer and if they are assigned to this report
    if not request.user.is_staff:
        assignment = ReportAssignment.objects.filter(
            report=report,
            farmer=request.user.farmer  # Assuming the user is related to a Farmer instance
        ).first()

        if assignment and not assignment.read:
            # Mark as read if the assignment exists and is not already read
            assignment.read = True
            assignment.save()

    return render(request, 'view_report.html', {'report': report,'base_template': base_template,'notification':notification})

@login_required
def assigned_reports(request):
    pending_orders_count = Order.objects.filter(status='Not solved').count()
    # Count pending challenges
    pending_challenges_count = Challenge.objects.filter(status='pending').count()
    notification=pending_orders_count+pending_challenges_count
    if request.user.is_staff:
        base_template = 'staff_base.html'
    else:
        base_template = 'base.html'
    # Get all report assignments for the logged-in farmer
    assignments = ReportAssignment.objects.filter(farmer=request.user.farmer)

    # Get the reports associated with those assignments
    reports = [assignment.report for assignment in assignments]
    return render(request, 'report.html', {'reports': reports, 'base_template': base_template,'notification':notification})



from django.shortcuts import render
from django.contrib.auth.models import User
from .models import Farmer, Challenge, Post, Report
from django.utils.timezone import now
from django.db.models import Count, Avg, F
from django.contrib.auth.models import User
from .models import Challenge, Farmer
import datetime

@login_required
def staff_dashboard(request):
    pending_orders_count = Order.objects.filter(status='Not solved').count()
    # Count pending challenges
    pending_challenges_count = Challenge.objects.filter(status='Not solved').count()
    notification=pending_orders_count+pending_challenges_count
    total_users = User.objects.count()
    total_services = Report.objects.count()
    total_revenue = 42500  # You can make this dynamic if revenue is stored in your DB
    service_completion_rate = 92  # Calculate based on your logic
    challenges_reported = Challenge.objects.count()
    user_engagement = Post.objects.count()
    system_updates = 45  # This should come from your data if available
    unresolved_challenges = Challenge.objects.filter(status='Not solved').count()
    # Calculate the average resolution time for resolved challenges
    resolved_challenges = Challenge.objects.filter(status='solved', date_resolved__isnull=False)
    avg_resolution_time = resolved_challenges.aggregate(
        avg_time=Avg(F('date_resolved') - F('date_created'))
    )['avg_time']
    # Format average time to days
    avg_resolution_time = round(avg_resolution_time.total_seconds() / (60 * 60 * 24), 1) if avg_resolution_time else 0
    # Count new users registered this month
    today = now()
    start_of_month = today.replace(day=1)
    new_users_this_month = Farmer.objects.filter(user__date_joined__gte=start_of_month).count()
    # Calculate percentage growth compared to last month
    last_month_start = (start_of_month - datetime.timedelta(days=1)).replace(day=1)
    last_month_end = start_of_month - datetime.timedelta(days=1)
    last_month_users = Farmer.objects.filter(user__date_joined__range=[last_month_start, last_month_end]).count()
    growth_percentage = 0
    if last_month_users > 0:
        growth_percentage = round(((new_users_this_month - last_month_users) / last_month_users) * 100, 2)

    context = {
        'unresolved_challenges': unresolved_challenges,
        'avg_resolution_time': avg_resolution_time,
        'new_users_this_month': new_users_this_month,
        'growth_percentage': growth_percentage,
        'total_users': total_users,
        'total_services': total_services,
        'total_revenue': total_revenue,
        'service_completion_rate': service_completion_rate,
        'challenges_reported': challenges_reported,
        'user_engagement': user_engagement,
        'system_updates': system_updates,
        'notification':notification,
    }
    return render(request, 'staff_dashboard.html', context)

from django.http import JsonResponse
from django.http import JsonResponse
from .models import Farmer

@login_required
def get_farmers(request):
    search_term = request.GET.get('search', '')
    farmers = Farmer.objects.filter(
        name__icontains=search_term
    ).values('id', 'name', 'email')
    return JsonResponse(list(farmers), safe=False)

@login_required
def order_service(request):
    pending_orders_count = Order.objects.filter(status='Not solved').count()
    # Count pending challenges
    pending_challenges_count = Challenge.objects.filter(status='pending').count()
    notification=pending_orders_count+pending_challenges_count
    if request.method == "POST":
        service = request.POST.get('service')
        start_date = request.POST.get('start_date')
        location = request.POST.get('location')
        farmsize = request.POST.get('farm_size')
        additional_requirements = request.POST.get('additional_requirements')
        print(request.POST)

        order = Order.objects.create(
            user=request.user,
            service=service,
            start_date=start_date,
            location=location,
            farmsize=farmsize,
            additional_requirements=additional_requirements
        )
        if order:
            order.save()
            messages.success(request, "Your order has been placed successfully!")
            return redirect('order_service')
        else:
            messages.error(request, "kuna shida mzee kwenye saving of orders.")

    else:
        messages.error(request, "Please fill all required fields.")
    return render(request, "order_service.html",{'notification':notification})


from django.shortcuts import render, redirect
from .forms import PostForm
from .models import Post

@login_required
def add_post(request):
    pending_orders_count = Order.objects.filter(status='Not solved').count()
    # Count pending challenges
    pending_challenges_count = Challenge.objects.filter(status='pending').count()
    notification=pending_orders_count+pending_challenges_count
    if request.user.is_staff:
        base_template = 'staff_base.html'
    else:
        base_template = 'base.html'
    if request.method == 'POST':
        form = PostForm(request.POST, request.FILES)
        if form.is_valid():
            post = form.save(commit=False)  # Don't save yet
            post.farmer = request.user  # Set the current user as the farmer
            post.save()  # Now save the post
            return redirect('post')  # Redirect to a page that lists posts
    else:
        form = PostForm()

    return render(request, 'add_post.html', {'form': form, 'base_template': base_template,'notification':notification})

from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from .models import Post

@login_required
def my_profile(request):
    pending_orders_count = Order.objects.filter(status='Not solved').count()
    # Count pending challenges
    pending_challenges_count = Challenge.objects.filter(status='pending').count()
    notification=pending_orders_count+pending_challenges_count
    if request.user.is_staff:
        base_template = 'staff_base.html'
    else:
        base_template = 'base.html'
    # Get the current logged-in user
    user = request.user

    # Fetch user's posts
    user_posts = Post.objects.filter(farmer=user).order_by('-date_created')
    # Context to pass to the template
    context = {
        'user': user,
        'user_posts': user_posts,
        'base_template': base_template,
        'notification':notification,
    }

    return render(request, 'my_profile.html', context)

from django.shortcuts import get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .models import Post

@login_required
def delete_post(request, post_id):
    post = get_object_or_404(Post, id=post_id, farmer=request.user)
    post.delete()
    messages.success(request, "Post deleted successfully.")
    return redirect('my_profile')

from django.contrib.auth.forms import PasswordChangeForm
from django.contrib.auth import update_session_auth_hash
from django.shortcuts import render, redirect
from django.contrib import messages

@login_required
def change_password(request):
    if request.user.is_staff:
        base_template = 'staff_base.html'
    else:
        base_template = 'base.html'
    if request.method == 'POST':
        form = PasswordChangeForm(request.user, request.POST)
        if form.is_valid():
            user = form.save()
            update_session_auth_hash(request, user)  # Keeps the user logged in after password change
            messages.success(request, 'Your password was successfully updated!')
            return redirect('change_password')
    else:
        form = PasswordChangeForm(request.user)

    return render(request, 'change_password.html', {'form': form, 'base_template': base_template})


from django.contrib.auth import update_session_auth_hash
from django.contrib import messages
from django.shortcuts import redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import PasswordChangeForm

@login_required
def update_password(request):
    if request.method == 'POST':
        # Extract the data from the form
        current_password = request.POST.get('password')
        new_password = request.POST.get('new_password')
        confirm_password = request.POST.get('confirm_password')

        # Check if the current password is correct
        if not request.user.check_password(current_password):
            messages.error(request, "Current password is incorrect.")
            return redirect('setting')  # Redirect to the settings page if the current password is incorrect

        # Check if new password and confirm password match
        if new_password != confirm_password:
            messages.error(request, "New passwords do not match.")
            return redirect('setting')  # Redirect to the settings page if passwords don't match

        # Update the user's password
        request.user.set_password(new_password)
        request.user.save()  # Save the user object with the new password

        # Update the session to keep the user logged in after changing the password
        update_session_auth_hash(request, request.user)

        # Display success message
        messages.success(request, "Your password was successfully updated!")

        # Redirect back to the settings page after updating the password
        return redirect('setting')  # Adjust 'settings' to the actual name of your settings page URL

    # If not a POST request, this view does not render any content, it only performs the job and redirects
    return redirect('setting')  # In case of a GET request, just redirect to the settings page

