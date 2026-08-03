import os, sys
sys.path.insert(0, '.')

# Load env manually
from pathlib import Path
from dotenv import load_dotenv
load_dotenv(Path('.env'), override=True)

print("DB_USER =", os.environ.get('DB_USER'))
print("DB_HOST =", os.environ.get('DB_HOST'))
print("DB_NAME =", os.environ.get('DB_NAME'))
print("DB_PASSWORD =", '***' if os.environ.get('DB_PASSWORD') else 'NOT SET')
