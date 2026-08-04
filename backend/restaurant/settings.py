from pathlib import Path
import os
from dotenv import load_dotenv

# Load .env with explicit path
_env_path = Path(__file__).resolve().parent.parent / '.env'
load_dotenv(dotenv_path=_env_path, override=True)

BASE_DIR = Path(__file__).resolve().parent.parent
SECRET_KEY = 'django-insecure-change-this-in-production'
DEBUG = True
ALLOWED_HOSTS = ['*']

INSTALLED_APPS = [
    'django.contrib.contenttypes',
    'django.contrib.auth',
    'django.contrib.staticfiles',
    'django.contrib.admin',
    'django.contrib.sessions',
    'django.contrib.messages',
    'rest_framework',
    'corsheaders',
    'menu',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
]

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

CORS_ALLOW_ALL_ORIGINS = True

ROOT_URLCONF = 'restaurant.urls'

# PyMySQL as MySQL driver — must be before DATABASES
import pymysql
pymysql.install_as_MySQLdb()

DATABASES = {
    'default': {
        'ENGINE':   'django.db.backends.mysql',
        'NAME':     os.environ.get('DB_NAME',     'team13'),
        'USER':     os.environ.get('DB_USER',     'team13'),
        'PASSWORD': os.environ.get('DB_PASSWORD', ''),
        'HOST':     os.environ.get('DB_HOST',     'hackathondb.cvuouqwaej9d.ap-south-1.rds.amazonaws.com'),
        'PORT':     os.environ.get('DB_PORT',     '3306'),
        'OPTIONS':  {
            'connect_timeout': 10,
        },
    }
}

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
STATIC_URL = '/static/'
GROQ_API_KEY = os.environ.get('GROQ_API_KEY', '')

REST_FRAMEWORK = {
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
}
