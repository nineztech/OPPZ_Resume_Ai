#!/usr/bin/env python3
"""
Main entry point for Gemini Resume Parser
Provides command-line interface and example usage
"""

import argparse
import json
import logging
import sys
from pathlib import Path
from typing import Dict, Any

from services.gemini_parser_service import GeminiResumeParser
from services.resume_improvement_service import ResumeImprovementService
from config.config import GeminiConfig

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def parse_resume_file(file_path: str, output_file: str = None, api_key: str = None) -> Dict[str, Any]:
    """
    Parse a resume file using Gemini API
    
    Args:
        file_path: Path to the resume file
        output_file: Optional output file path for JSON results
        api_key: Optional Gemini API key
        
    Returns:
        Parsed resume data
    """
    try:
        # Initialize parser
        parser = GeminiResumeParser(api_key=api_key)
        
        # Parse resume
        logger.info(f"Parsing resume: {file_path}")
        parsed_data = parser.parse_resume_from_file(file_path)
        
        # Save output if specified
        if output_file:
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(parsed_data, f, indent=2, ensure_ascii=False)
            logger.info(f"Results saved to: {output_file}")
        
        return parsed_data
        
    except Exception as e:
        logger.error(f"Failed to parse resume: {str(e)}")
        raise

def apply_ats_suggestions(parsed_resume_data: Dict[str, Any], ats_analysis: Dict[str, Any], api_key: str = None) -> Dict[str, Any]:
    """
    Apply ATS suggestions to improve the resume
    
    Args:
        parsed_resume_data: The structured resume data from parsing
        ats_analysis: The ATS analysis results with suggestions
        api_key: Optional Gemini API key
        
    Returns:
        Improved resume data with ATS suggestions applied
    """
    try:
        # Initialize improvement service
        improvement_service = ResumeImprovementService(api_key=api_key)
        
        # Apply ATS suggestions
        logger.info("Applying ATS suggestions to improve resume")
        improved_resume = improvement_service.apply_ats_suggestions(parsed_resume_data, ats_analysis)
        
        # Generate improvement summary
        improvement_summary = improvement_service.get_improvement_summary(parsed_resume_data, improved_resume)
        
        # Add summary to the result
        improved_resume["_improvement_summary"] = improvement_summary
        
        logger.info("Successfully applied ATS suggestions to resume")
        return improved_resume
        
    except Exception as e:
        logger.error(f"Failed to apply ATS suggestions: {str(e)}")
        raise

def main():
    """Main function for command-line interface"""
    parser = argparse.ArgumentParser(
        description="Parse resumes using Google Gemini API",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python main.py resume.pdf
  python main.py resume.pdf -o results.json
  python main.py resume.pdf --api-key YOUR_API_KEY
        """
    )
    
    parser.add_argument(
        'file_path',
        help='Path to the resume file (PDF, DOCX, or TXT)'
    )
    
    parser.add_argument(
        '-o', '--output',
        dest='output_file',
        help='Output file path for JSON results'
    )
    
    parser.add_argument(
        '--api-key',
        help='Gemini API key (if not set in environment)'
    )
    
    parser.add_argument(
        '--verbose', '-v',
        action='store_true',
        help='Enable verbose logging'
    )
    
    args = parser.parse_args()
    
    # Set logging level
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)
    
    try:
        # Validate file path
        file_path = Path(args.file_path)
        if not file_path.exists():
            logger.error(f"File not found: {file_path}")
            sys.exit(1)
        
        # Parse resume
        parsed_data = parse_resume_file(
            file_path=str(file_path),
            output_file=args.output_file,
            api_key=args.api_key
        )
        
        # Print results to console if no output file specified
        if not args.output_file:
            print(json.dumps(parsed_data, indent=2, ensure_ascii=False))
        
        logger.info("Resume parsing completed successfully")
        
    except KeyboardInterrupt:
        logger.info("Operation cancelled by user")
        sys.exit(1)
    except Exception as e:
        logger.error(f"Fatal error: {str(e)}")
        sys.exit(1)

def example_usage():
    """Example usage of the Gemini Resume Parser"""
    print("=== Gemini Resume Parser - Example Usage ===\n")
    
    try:
        # Initialize parser
        parser = GeminiResumeParser()
        
        # Get model info
        model_info = parser.get_model_info()
        print(f"Model: {model_info['model_name']}")
        print(f"API Key Configured: {model_info['api_key_configured']}")
        print(f"Model Initialized: {model_info['model_initialized']}\n")
        
        # Example with sample text
        sample_resume_text = """
        John Doe
        Software Engineer
        john.doe@email.com
        +1-555-0123
        
        SUMMARY
        Experienced software engineer with 5+ years in web development.
        
        SKILLS
        Python, JavaScript, React, Node.js
        
        EDUCATION
        Bachelor of Science in Computer Science
        University of Technology, 2018-2022
        
        EXPERIENCE
        Senior Developer at TechCorp
        2020-Present
        Developed web applications using modern technologies.
        """
        
        print("Parsing sample resume text...")
        parsed_data = parser.parse_resume_text(sample_resume_text)
        
        print("\nParsed Results:")
        print(json.dumps(parsed_data, indent=2, ensure_ascii=False))
        
    except Exception as e:
        print(f"Error in example: {str(e)}")
        print("\nMake sure you have set the GEMINI_API_KEY environment variable")

if __name__ == "__main__":
    if len(sys.argv) == 1:
        # No arguments provided, show example usage
        example_usage()
    else:
        # Run command-line interface
        main()

