#!/usr/bin/env python3
"""
Start the web UI with the optimized AI suggestion service
"""
import os
import sys
from pathlib import Path

# Add current directory to path for imports
sys.path.append('.')

def check_requirements():
    """Check if all requirements are met"""
    print("🔍 Checking requirements...")
    
    # Check if API key is set
    if not os.getenv('GEMINI_API_KEY'):
        print("⚠️  GEMINI_API_KEY not found in environment variables")
        print("   The web UI will work but AI features may not function without an API key")
        print("   Set your API key: set GEMINI_API_KEY=your_api_key_here")
    else:
        print("✅ GEMINI_API_KEY found")
    
    # Check if required packages are installed
    try:
        import flask
        print("✅ Flask installed")
    except ImportError:
        print("❌ Flask not installed. Run: pip install flask flask-cors")
        return False
    
    try:
        import pydantic
        print("✅ Pydantic installed")
    except ImportError:
        print("❌ Pydantic not installed. Run: pip install pydantic")
        return False
    
    try:
        from google.generativeai import GenerativeModel
        print("✅ Google Generative AI installed")
    except ImportError:
        print("❌ Google Generative AI not installed. Run: pip install google-generativeai")
        return False
    
    return True

def start_web_ui():
    """Start the web UI"""
    print("\n🚀 Starting Web UI with Optimized AI Suggestion Service")
    print("=" * 60)
    
    if not check_requirements():
        print("\n❌ Requirements not met. Please install missing packages.")
        return
    
    try:
        from web_ui import app
        
        print("\n✅ All requirements met!")
        print("\n📱 Web UI will be available at: http://localhost:5000")
        print("🔑 Make sure your GEMINI_API_KEY is set for full functionality")
        print("\nFeatures available:")
        print("  • Resume Parsing with Gemini AI")
        print("  • Standard ATS Analysis")
        print("  • JD-Specific ATS Analysis")
        print("  • AI-Powered Resume Suggestions (Optimized)")
        print("\nPress Ctrl+C to stop the server")
        print("=" * 60)
        
        # Start the Flask app
        app.run(debug=True, host='0.0.0.0', port=5000)
        
    except Exception as e:
        print(f"\n❌ Error starting web UI: {e}")
        print("\nTroubleshooting:")
        print("1. Make sure all dependencies are installed")
        print("2. Check that no other service is using port 5000")
        print("3. Verify your Python environment is set up correctly")

if __name__ == "__main__":
    start_web_ui()
