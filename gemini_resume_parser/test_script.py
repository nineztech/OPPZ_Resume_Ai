#!/usr/bin/env python3
import sys
import json

def main():
    print("Script started")
    if len(sys.argv) < 2:
        error_result = {"success": False, "error": "Missing arguments"}
        print(json.dumps(error_result))
        sys.exit(1)
    
    print("Arguments provided")
    print(json.dumps({"success": True, "message": "Test successful"}))

if __name__ == "__main__":
    main()
