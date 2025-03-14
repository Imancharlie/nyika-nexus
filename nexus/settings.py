

from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.1/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = "django-insecure-+t3iu8o$6x2$k*%aspvpz_+ltwz=kgcjgku)h8#mi!zb9nlzi6"

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False  # Set to False in production

ALLOWED_HOSTS = ['nyikanexus.pythonanywhere.com']

# Security settings
CSRF_COOKIE_SECURE = True
SESSION_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'



# Application definition

INSTALLED_APPS = [
    "nexus_app",
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "nexus_app.urls"



WSGI_APPLICATION = "nexus.wsgi.application"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / 'templates'],  # Fixing the BASE_DIR usage
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]


# Database
# https://docs.djangoproject.com/en/5.1/ref/settings/#databases
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'Nyikanexus$farmer',  # Ensure this is your correct database name
        'USER': 'Nyikanexus',  # Your PythonAnywhere username
        'PASSWORD': 'kitunda2002',  # Your actual password
        'HOST': 'Nyikanexus.mysql.pythonanywhere-services.com',  # Host for MySQL on PythonAnywhere
        'PORT': '3306',
        'OPTIONS': {
            'init_command': "SET sql_mode='STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION'",
        }
    }
}




# Password validation
# https://docs.djangoproject.com/en/5.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.1/topics/i18n/

LANGUAGE_CODE = "en-us"

TIME_ZONE = "UTC"

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.1/howto/static-files/

# Default primary key field type
# https://docs.djangoproject.com/en/5.1/ref/settings/#default-auto-field

LOGIN_URL = 'login'
LOGIN_REDIRECT_URL = 'home'  # Replace with your home page
LOGOUT_REDIRECT_URL = 'logout'
# settings.py
import os

# Include paths for your static files (e.g., CSS, JS, image assets)
# settings.py
# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'

# Collect all static files in this directory when running collectstatic
STATIC_ROOT = BASE_DIR / 'staticfiles'  # This is required for collectstatic to work

# Additional static file directories (if any)
STATICFILES_DIRS = [
    BASE_DIR / 'static',  # Add this if you store static files here manually
]

# Media files settings
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'


DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"