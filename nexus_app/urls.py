from django.contrib import admin
from django.urls import path
from django.contrib.auth.views import LogoutView as Logout
from .import views
from django.conf.urls.static import static
from .views import change_password
from .views import admin_view_posts, admin_delete_post,staff_challenges,challenge_detail,resolve_challenge

from django.conf import settings

urlpatterns = [
    path("admin/", admin.site.urls),
    path("",views.home,name="home"),
    path('login/',views.login, name="login"),
    path('signin/', views.signin_view, name='signin'),
    path("register/",views.farmer_register,name="register"),
    path('get_districts/', views.get_districts, name='get_districts'),
    # path('homepage/',views.homepage,name='homepage'),
    path('post/',views.post,name='post'),
    path('challenge/',views.report_challenge,name='challenge'),
    path('settings/',views.settings,name='setting'),
    path('logout/', views.logout_view, name='logout'),
    path('report/',views.report,name='report'),
    path('order_service/',views.order_service,name='order_service'),
    path('add_post/', views.add_post, name='add_post'),
    path('my_profile/', views.my_profile, name='my_profile'),
    path('post/<int:id>/', views.post_detail, name='post_detail'),
    # urls.py
    path('api/posts/<int:post_id>/like/', views.toggle_like, name='toggle_like'),
    path('delete-post/<int:post_id>/', views.delete_post, name='delete_post'),
    path('change-password/', change_password, name='change_password'),
    path('reports/create/', views.create_report, name='create_report'),
    path('reports/', views.assigned_reports, name='view_report'),
    path('api/farmers/', views.get_farmers, name='get_farmers'), # API endpoint for farmer search
    path('welcome/', views.welcome_page, name='welcome'),
    path('update-profile/', views.update_password, name='update_password'),
    path('staff/',views.staff_dashboard,name='staff_dashboard'),
    path('admin_posts/', admin_view_posts, name='admin_view_posts'),
    path('admin_posts/delete/<int:post_id>/', admin_delete_post, name='admin_delete_post'),
    path('view_orders/', views.view_orders, name='view_orders'),
    path('staff/challenges/', staff_challenges, name='staff_challenges'),
    path('challenge/<int:challenge_id>/', challenge_detail, name='challenge_detail'),
    path('challenge/<int:challenge_id>/resolve/', resolve_challenge, name='resolve_challenge'),
    path('view_orders/',views.view_orders,name='view_orders'),

]+ static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
