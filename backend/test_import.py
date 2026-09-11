import sys
import traceback

try:
    from main import app
    print("SUCCESS: main module loaded")
except Exception as e:
    print("ERROR loading main:")
    traceback.print_exc()
    sys.exit(1)
