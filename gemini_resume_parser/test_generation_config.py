#!/usr/bin/env python3
"""
Test script to demonstrate the generation config parameters for consistent AI results.
This script shows how the temperature and top_p parameters affect the consistency of responses.
"""

import os
import sys
from services.ai_suggestion_service import AISuggestionService

def test_generation_consistency():
    """Test the consistency of AI responses with different generation parameters"""
    
    # Get API key from environment
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        print("❌ GEMINI_API_KEY environment variable not set")
        return
    
    print("🧪 Testing AI Generation Consistency")
    print("=" * 50)
    
    # Test 1: Default settings (low temperature, moderate top_p)
    print("\n1️⃣ Testing with DEFAULT settings (temperature=0.1, top_p=0.8)")
    print("   Expected: High consistency, focused responses")
    
    service_default = AISuggestionService(api_key=api_key)
    settings = service_default.get_generation_settings()
    print(f"   Current settings: {settings}")
    
    # Test 2: Even more deterministic settings
    print("\n2️⃣ Testing with ULTRA-CONSISTENT settings (temperature=0.05, top_p=0.6)")
    print("   Expected: Maximum consistency, very focused responses")
    
    service_ultra = AISuggestionService(api_key=api_key, temperature=0.05, top_p=0.6)
    settings = service_ultra.get_generation_settings()
    print(f"   Current settings: {settings}")
    
    # Test 3: Dynamic parameter update
    print("\n3️⃣ Testing dynamic parameter update")
    service_dynamic = AISuggestionService(api_key=api_key)
    print(f"   Initial settings: {service_dynamic.get_generation_settings()}")
    
    service_dynamic.update_generation_parameters(temperature=0.2, top_p=0.9)
    print(f"   Updated settings: {service_dynamic.get_generation_settings()}")
    
    print("\n✅ Generation config testing completed!")
    print("\n📋 Parameter Recommendations:")
    print("   • For maximum consistency: temperature=0.05, top_p=0.6")
    print("   • For balanced consistency: temperature=0.1, top_p=0.8 (default)")
    print("   • For slight creativity: temperature=0.2, top_p=0.9")
    print("   • Avoid: temperature > 0.3 for critical applications")

if __name__ == "__main__":
    test_generation_consistency()
