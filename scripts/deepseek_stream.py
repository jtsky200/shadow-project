#!/usr/bin/env python3
import sys
import time
import re

def stream_response(question):
    """
    Simulates streaming responses for PDF-related questions
    """
    # Dictionary with common PDF-related information and responses
    pdf_info = {
        'range': "The LYRIQ has an estimated range of 530 km (WLTP) on a full charge.",
        'battery': "The LYRIQ features a 102 kWh lithium-ion battery with Ultium technology and active liquid cooling.",
        'power': "The LYRIQ produces 528 horsepower (388 kW) and 610 Nm of torque.",
        'charging': "The LYRIQ supports DC fast charging up to 190 kW, which can add approximately 200 km of range in 10 minutes.",
        'awards': "The Cadillac LYRIQ received the German Car of the Year 2025 award in the Luxury Category, the first American brand to receive this accolade.",
        'dimensions': "The LYRIQ's dimensions are:\nLength: 4,996 mm\nWidth: 1,977 mm\nHeight: 1,623 mm\nWheelbase: 3,094 mm\nGround Clearance: 151 mm",
        'features': "The LYRIQ includes a 33-inch diagonal LED display, Super Cruise hands-free driving technology, AKG Studio 19-speaker audio system, and Vehicle-to-Home capability.",
        'warranty': "The LYRIQ comes with a comprehensive warranty package including an 8-year/160,000 km battery warranty.",
        'safety': "The LYRIQ includes advanced safety features such as Forward Collision Alert, Automatic Emergency Braking, Lane Keep Assist, and HD Surround Vision.",
        'specifications': "The LYRIQ is powered by electric motors producing 388 kW, has a 102 kWh battery, 530 km range, and can accelerate from 0-100 km/h in 4.9 seconds.",
        'maintenance': "The LYRIQ requires less maintenance than traditional vehicles, with no oil changes needed. Regular service includes tire rotations, cabin air filter replacement, and battery health checks.",
        'pdf': "I can help you understand PDFs by analyzing their content, extracting key information, and answering specific questions about what's in the document.",
        'document': "I can analyze documents to extract key information, summarize content, and answer specific questions about what's contained in them.",
        'extract': "I can extract information from PDFs including text, tables, and structured data to help you understand the content."
    }
    
    # Default response if no keywords match
    response = "I can help answer questions about the PDF content. Please upload a PDF, and feel free to ask about specific details within the document."
    
    # Check for keywords in the question
    question_lower = question.lower()
    
    # Find matching keywords
    for keyword, info in pdf_info.items():
        if keyword.lower() in question_lower:
            response = info
            break
    
    # Add contextual prefix for PDF-specific questions
    if any(term in question_lower for term in ['pdf', 'document', 'file', 'upload']):
        response = "As a PDF assistant, " + response
        
    # Simulate streaming by splitting response into words and adding a delay
    words = response.split()
    for i, word in enumerate(words):
        # Print word with appropriate spacing
        if i > 0:
            print(" ", end="", flush=True)
        print(word, end="", flush=True)
        
        # Add a small delay between words to simulate typing
        time.sleep(0.05)
    
    print()  # End with a newline

if __name__ == "__main__":
    if len(sys.argv) > 1:
        query = sys.argv[1]
        stream_response(query)
    else:
        # If no arguments, read from stdin
        query = input("Enter your question: ")
        stream_response(query) 