"""Start the private recording backend; credentials stay in backend/.env."""
import os
import sys
from pathlib import Path
from dotenv import load_dotenv
import uvicorn

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
load_dotenv(ROOT / 'backend' / '.env')
os.environ['SATQUERY_LOCAL_DEMO'] = 'true'
if __name__ == '__main__':
    uvicorn.run('backend.main:app', host='127.0.0.1', port=8000)
