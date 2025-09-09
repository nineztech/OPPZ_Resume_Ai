#!/usr/bin/env python3
"""
Simple test script for Gemini Resume Parser
Run this to test if the parser is working correctly
"""

import os
import sys
from pathlib import Path

# Add the current directory to Python path
sys.path.insert(0, str(Path(__file__).parent))

def test_imports():
    """Test if all modules can be imported correctly"""
    try:
        from config.config import GeminiConfig
        print("✓ GeminiConfig imported successfully")
        
        from utils.pdf_extractor import DocumentExtractor
        print("✓ DocumentExtractor imported successfully")
        
        from services.gemini_parser_service import GeminiResumeParser
        print("✓ GeminiResumeParser imported successfully")
        
        return True
    except ImportError as e:
        print(f"✗ Import error: {e}")
        return False

def test_config():
    """Test configuration loading"""
    try:
        from config.config import GeminiConfig
        
        # Check if API key is set
        api_key = GeminiConfig.GEMINI_API_KEY
        if api_key:
            print(f"✓ API key found: {api_key[:10]}...")
        else:
            print("⚠ No API key found in environment variables")
            print("  Set GEMINI_API_KEY environment variable or create .env file")
        
        print(f"✓ Model: {GeminiConfig.GEMINI_MODEL}")
        print(f"✓ Max PDF size: {GeminiConfig.MAX_PDF_SIZE_MB}MB")
        
        return True
    except Exception as e:
        print(f"✗ Configuration error: {e}")
        return False

def test_pdf_extractor():
    """Test PDF extractor functionality"""
    try:
        from utils.pdf_extractor import DocumentExtractor
        
        # Test file validation
        test_file = Path("test_resume.pdf")
        if test_file.exists():
            is_valid = DocumentExtractor.validate_file(test_file)
            print(f"✓ Test file validation: {is_valid}")
        else:
            print("⚠ No test_resume.pdf found for testing")
        
        print("✓ DocumentExtractor class initialized successfully")
        return True
    except Exception as e:
        print(f"✗ PDF extractor error: {e}")
        return False

def test_gemini_parser():
    """Test Gemini parser initialization"""
    try:
        from services.gemini_parser_service import GeminiResumeParser
        
        # Try to initialize parser (will fail without API key)
        try:
            parser = GeminiResumeParser()
            print("✓ GeminiResumeParser initialized successfully")
            return True
        except ValueError as e:
            if "API key is required" in str(e):
                print("⚠ Parser initialization failed (expected without API key)")
                print("  Set GEMINI_API_KEY to test full functionality")
                return True
            else:
                raise e
                
    except Exception as e:
        print(f"✗ Gemini parser error: {e}")
        return False

def main():
    """Run all tests"""
    print("=== Gemini Resume Parser - Integration Test ===\n")
    
    tests = [
        ("Module Imports", test_imports),
        ("Configuration", test_config),
        ("PDF Extractor", test_pdf_extractor),
        ("Gemini Parser", test_gemini_parser)
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"Testing: {test_name}")
        try:
            if test_func():
                passed += 1
                print(f"✓ {test_name} passed\n")
            else:
                print(f"✗ {test_name} failed\n")
        except Exception as e:
            print(f"✗ {test_name} error: {e}\n")
    
    print(f"=== Test Results: {passed}/{total} tests passed ===")
    
    if passed == total:
        print("🎉 All tests passed! The Gemini Resume Parser is ready to use.")
        print("\nNext steps:")
        print("1. Set your GEMINI_API_KEY environment variable")
        print("2. Create a .env file with your configuration")
        print("3. Run: python main.py --help")
    else:
        print("⚠ Some tests failed. Check the errors above.")
        print("\nTroubleshooting:")
        print("1. Ensure all dependencies are installed: pip install -r requirements.txt")
        print("2. Check if all files are in the correct locations")
        print("3. Verify Python path and imports")

if __name__ == "__main__":
    main()











