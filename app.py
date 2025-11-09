from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import google.generativeai as genai
import os
import base64
from io import BytesIO
from PIL import Image
import json
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app)

# Initialize Gemini
# Set your API key as environment variable or in .env file: GEMINI_API_KEY='your-key-here'
api_key = os.getenv('GEMINI_API_KEY', '')
if not api_key:
    print("Warning: GEMINI_API_KEY not set. Please set it as an environment variable or in a .env file.")
genai.configure(api_key=api_key)

# Performative male characteristics
PERFORMATIVE_CHARACTERISTICS = {
    "feminist_literature": {
        "items": [
            "bell hooks", "All About Love", "feminist", "Roxane Gay", "Rebecca Solnit", 
            "Men Explain Things to Me", "feminism", "feminist author", "feminist writer",
            "The Argonauts", "Bad Feminist", "We Should All Be Feminists", "The Second Sex",
            "The Handmaid's Tale", "The Color Purple", "Sister Outsider", "This Bridge Called My Back",
            "woman writer", "female author", "women's studies", "gender studies"
        ],
        "weight": 15
    },
    "matcha_latte": {
        "items": ["matcha", "matcha latte", "green tea latte"],
        "weight": 10
    },
    "tote_bag": {
        "items": ["tote bag", "canvas bag", "reusable bag"],
        "weight": 12
    },
    "labubu_keychain": {
        "items": ["Labubu", "keychain", "Pop Mart"],
        "weight": 8
    },
    "baggy_jeans": {
        "items": ["baggy jeans", "wide leg jeans", "oversized jeans"],
        "weight": 10
    },
    "vintage_clothing": {
        "items": ["vintage", "thrifted", "retro clothing"],
        "weight": 8
    },
    "female_indie_artists": {
        "items": ["Phoebe Bridgers", "Taylor Swift", "Lana Del Rey", "indie music", "vinyl record"],
        "weight": 12
    },
    "aesthetic_items": {
        "items": ["film camera", "polaroid", "journal", "stationery", "minimalist aesthetic"],
        "weight": 7
    },
    "coffee_shop_aesthetic": {
        "items": ["coffee shop", "cafe", "indie cafe", "artisanal coffee"],
        "weight": 6
    },
    "bookstore_library": {
        "items": ["bookstore", "library", "reading", "books"],
        "weight": 5
    },
    "plant_parent": {
        "items": ["plants", "houseplants", "succulents", "potted plants"],
        "weight": 5
    },
    "thrifting": {
        "items": ["thrift store", "vintage shop", "secondhand"],
        "weight": 6
    }
}

def calculate_performativeness_score(detected_items):
    """Calculate performativeness percentage based on detected items
    Each category can only be scored once total, preventing double-counting.
    An item can contribute to multiple different categories (e.g., "baggy vintage jeans" 
    can match both baggy_jeans and vintage_clothing), but each category is only scored once.
    """
    total_score = 0
    max_possible_score = sum(char["weight"] for char in PERFORMATIVE_CHARACTERISTICS.values())
    
    detected_categories = set()
    
    # First, find all category matches for all items
    # This allows items to match multiple categories
    item_category_matches = {}
    for item_desc in detected_items:
        item_lower = item_desc.lower()
        matching_categories = []
        
        # Check which categories this item matches
        for category, data in PERFORMATIVE_CHARACTERISTICS.items():
            for keyword in data["items"]:
                if keyword.lower() in item_lower:
                    matching_categories.append(category)
                    break  # Found a match for this category, move to next
        
        if matching_categories:
            item_category_matches[item_desc] = matching_categories
    
    # Now score categories, ensuring each category is only scored once
    # Process categories in priority order (highest weight first)
    category_priority = sorted(
        PERFORMATIVE_CHARACTERISTICS.items(),
        key=lambda x: x[1]["weight"],
        reverse=True
    )
    
    for category, data in category_priority:
        if category in detected_categories:
            continue  # Category already scored
        
        # Find the first item that matches this category
        for item_desc, matching_categories in item_category_matches.items():
            if category in matching_categories:
                # Score this category (only once)
                total_score += data["weight"]
                detected_categories.add(category)
                break  # This category is now scored, move to next category
    
    # Calculate percentage (cap at 100%)
    percentage = min((total_score / max_possible_score) * 100, 100)
    return round(percentage, 1), detected_categories, total_score, max_possible_score

def generate_improvement_suggestions(detected_categories):
    """Generate improvement suggestions based on missing categories"""
    suggestions = []
    all_categories = set(PERFORMATIVE_CHARACTERISTICS.keys())
    missing_categories = all_categories - detected_categories
    
    # Create suggestions for missing high-value categories - relaxed and casual tone
    category_suggestions = {
        "feminist_literature": "Maybe throw in some feminist lit? Books by bell hooks, Roxane Gay, or Rebecca Solnit would work (+15 points)",
        "matcha_latte": "A matcha latte could add some points here (+10 points)",
        "tote_bag": "A cute tote bag would fit the vibe (+12 points)",
        "labubu_keychain": "A Labubu keychain or Pop Mart collectible could help boost your score (+8 points)",
        "baggy_jeans": "Some baggy or wide-leg jeans might score better than slim-fit (+10 points)",
        "vintage_clothing": "Vintage or thrifted pieces always add to the aesthetic (+8 points)",
        "female_indie_artists": "Some vinyl from Phoebe Bridgers, Taylor Swift, or Lana Del Rey would be a nice touch (+12 points)",
        "aesthetic_items": "A film camera, polaroid, or journal could add to the aesthetic (+7 points)",
        "coffee_shop_aesthetic": "An indie coffee shop background never hurts (+6 points)",
        "bookstore_library": "A bookstore or library setting would fit perfectly (+5 points)",
        "plant_parent": "Some houseplants or succulents in the background could help (+5 points)",
        "thrifting": "Thrift store vibes or vintage shop setting would add points (+6 points)"
    }
    
    # If score is already 100%, return empty suggestions
    if len(missing_categories) == 0:
        return []
    
    # Prioritize high-value missing categories
    sorted_missing = sorted(missing_categories, 
                           key=lambda x: PERFORMATIVE_CHARACTERISTICS[x]["weight"], 
                           reverse=True)
    
    # Get top suggestions (up to 6, but prioritize the highest value ones)
    for category in sorted_missing[:6]:  # Top 6 suggestions
        if category in category_suggestions:
            # Suggestions already include point values, so just use them as-is
            suggestions.append(category_suggestions[category])
    
    return suggestions

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/analyze', methods=['POST'])
def analyze_image():
    try:
        # Check API key
        if not api_key:
            return jsonify({'error': 'Gemini API key not configured. Please set GEMINI_API_KEY environment variable.'}), 500
        
        data = request.json
        if not data:
            return jsonify({'error': 'No data provided'}), 400
            
        image_data = data.get('image')
        
        if not image_data:
            return jsonify({'error': 'No image provided'}), 400
        
        # Remove data URL prefix if present
        if ',' in image_data:
            image_data = image_data.split(',')[1]
        
        # Decode base64 image
        try:
            image_bytes = base64.b64decode(image_data)
            image = Image.open(BytesIO(image_bytes))
        except Exception as e:
            return jsonify({'error': f'Invalid image format: {str(e)}'}), 400
        
        # Initialize Gemini model (using gemini-1.5-flash for vision)
        try:
            model = genai.GenerativeModel('gemini-2.5-flash')
        except Exception as e:
            return jsonify({'error': f'Failed to initialize Gemini model: {str(e)}'}), 500
        
        # Create prompt for analysis
        characteristics_list = []
        for category, char_data in PERFORMATIVE_CHARACTERISTICS.items():
            characteristics_list.append(f"- {category.replace('_', ' ').title()}: {', '.join(char_data['items'])}")
        
        prompt = f"""Take a look at this image and identify items related to performative male culture. Here's what to look for:

Characteristics to check for:
{chr(10).join(characteristics_list)}

What to do:
- Look through the image and spot any items that match the categories above
- Check clothing, books, beverages, bags, accessories, the environment, and other objects
- For books: if you see books that seem feminist or written by feminist authors (even if you can't read the exact title), mention them. Look for books by women authors, books about feminism, gender, or social justice topics
- Describe what you see in a natural, casual way
- Don't worry about exact title matches - if a book looks like it could be feminist literature, mention it

Format your response in two sections:

SECTION 1 - DETECTED ITEMS:
List the items you found that match the categories. One item per line with a dash. Be specific but flexible - if you see a book that looks like feminist literature (even if you can't see the exact title), mention it. Describe what you observe naturally.

SECTION 2 - IMPROVEMENT SUGGESTIONS:
Give some relaxed, friendly suggestions for items that could boost the performativeness score. Keep it casual and light - like you're giving friendly advice to a friend. Focus on high-value items from the categories that seem to be missing, but don't be too prescriptive. Use a casual, conversational tone like "maybe add..." or "could throw in..." or "might help if you..."

That's it! Just look at the image and share what you find. Be flexible with book identification - if it looks like it could be feminist literature, include it."""
        
        # Analyze image with Gemini - use generation config for more thorough analysis
        try:
            # Use generation config for balanced analysis
            # Dictionary format works with Gemini API
            generation_config = {
                "temperature": 0.4,  # Balanced temperature for natural, flexible responses
                "top_p": 0.95,
                "top_k": 40,
                "max_output_tokens": 2048,  # Allow longer, detailed responses
            }
            response = model.generate_content(
                [prompt, image],
                generation_config=generation_config
            )
            detected_items_text = response.text if response.text else ""
            
            # Validate that we got a substantial response
            if detected_items_text and len(detected_items_text.strip()) < 100:
                # If response is too short, request a bit more detail
                enhanced_prompt = """Could you take another look at this image? Try to spot:
- Clothing items (shirt, pants, jacket, shoes)
- Books or reading materials
- Beverages or drinks
- Bags or accessories
- The environment or setting
- Any decorative items, plants, or other objects

Just list what you see that might match the performative male culture categories."""
                
                try:
                    enhanced_response = model.generate_content(
                        [enhanced_prompt, image],
                        generation_config=generation_config
                    )
                    if enhanced_response.text and len(enhanced_response.text.strip()) > len(detected_items_text.strip()):
                        detected_items_text = enhanced_response.text
                except:
                    # If enhanced analysis fails, continue with original response
                    pass
        except Exception as e:
            error_msg = str(e)
            if 'API_KEY' in error_msg or 'api key' in error_msg.lower():
                return jsonify({'error': 'Invalid Gemini API key. Please check your GEMINI_API_KEY.'}), 500
            elif 'quota' in error_msg.lower() or 'rate limit' in error_msg.lower():
                return jsonify({'error': 'API quota exceeded or rate limit reached. Please try again later.'}), 429
            else:
                return jsonify({'error': f'Gemini API error: {error_msg}'}), 500
        
        # Parse response into detected items and improvement suggestions
        detected_items = []
        improvement_suggestions = []
        
        # Find the split point between detected items and suggestions
        lines = detected_items_text.split('\n')
        items_end_index = len(lines)
        suggestion_keywords = ['improvement', 'suggestions', 'to improve', 'could be added', 'missing', 'section 2']
        
        # Find where suggestions section starts
        for i, line in enumerate(lines):
            line_lower = line.lower()
            if any(keyword in line_lower for keyword in suggestion_keywords):
                # Check if this line actually starts suggestions (not just mentions the word)
                if 'section' in line_lower or 'improve' in line_lower or 'suggestions' in line_lower:
                    items_end_index = i
                    break
        
        # Parse detected items (everything before suggestions)
        items_section = '\n'.join(lines[:items_end_index])
        for line in items_section.split('\n'):
            line = line.strip()
            if line and not any(keyword in line.lower() for keyword in ['section', 'detected items', 'format', 'example', 'instructions']):
                # Remove bullet points, dashes, numbers, etc.
                cleaned_line = line
                if cleaned_line.startswith('-') or cleaned_line.startswith('•') or cleaned_line.startswith('*'):
                    cleaned_line = cleaned_line[1:].strip()
                # Remove numbered lists
                if cleaned_line and cleaned_line[0].isdigit() and ('.' in cleaned_line[:3] or ')' in cleaned_line[:3]):
                    parts = cleaned_line.split('.', 1) if '.' in cleaned_line[:3] else cleaned_line.split(')', 1)
                    if len(parts) > 1:
                        cleaned_line = parts[1].strip()
                if cleaned_line and len(cleaned_line) > 2:
                    detected_items.append(cleaned_line)
        
        # Parse improvement suggestions (everything after the split point)
        suggestions_section = '\n'.join(lines[items_end_index:])
        for line in suggestions_section.split('\n'):
            line = line.strip()
            # Skip header lines
            if any(keyword in line.lower() for keyword in ['section', 'format', 'example', 'instructions']):
                continue
            if line and (line.startswith('-') or line.startswith('•') or line.startswith('*') or 
                        any(keyword in line.lower() for keyword in ['add', 'include', 'wear', 'display', 'take'])):
                # Remove bullet points, dashes, numbers, etc.
                cleaned_line = line
                if cleaned_line.startswith('-') or cleaned_line.startswith('•') or cleaned_line.startswith('*'):
                    cleaned_line = cleaned_line[1:].strip()
                # Remove numbered lists
                if cleaned_line and cleaned_line[0].isdigit() and ('.' in cleaned_line[:3] or ')' in cleaned_line[:3]):
                    parts = cleaned_line.split('.', 1) if '.' in cleaned_line[:3] else cleaned_line.split(')', 1)
                    if len(parts) > 1:
                        cleaned_line = parts[1].strip()
                if cleaned_line and len(cleaned_line) > 10:  # Longer threshold for suggestions
                    improvement_suggestions.append(cleaned_line)
        
        # If no items parsed, try splitting by sentences (fallback)
        if not detected_items:
            detected_items = [s.strip() for s in items_section.split('.') if s.strip() and len(s.strip()) > 2]
        
        # Calculate performativeness score
        percentage, detected_categories, score, max_score = calculate_performativeness_score(detected_items)
        
        # Log analysis quality for monitoring
        if len(detected_items) < 2:
            print(f"Analysis: Only {len(detected_items)} items detected - image may have limited performative elements")
        elif len(detected_items) >= 5:
            print(f"Analysis: Comprehensive scan - {len(detected_items)} items detected")
        
        # Always generate improvement suggestions based on missing categories
        # AI suggestions are nice to have, but we'll use our own as primary source
        generated_suggestions = generate_improvement_suggestions(detected_categories)
        
        # Combine AI suggestions with generated ones
        if improvement_suggestions:
            # Add AI suggestions that aren't already in generated list
            for ai_sugg in improvement_suggestions:
                # Check if similar suggestion already exists
                is_duplicate = any(
                    ai_sugg.lower() in gen_sugg.lower() or gen_sugg.lower() in ai_sugg.lower()
                    for gen_sugg in generated_suggestions
                )
                if not is_duplicate and len(ai_sugg) > 10:
                    generated_suggestions.append(ai_sugg)
        
        improvement_suggestions = generated_suggestions
        
        # Get category details
        category_details = []
        for category in detected_categories:
            category_details.append({
                "name": category.replace('_', ' ').title(),
                "items": PERFORMATIVE_CHARACTERISTICS[category]["items"],
                "weight": PERFORMATIVE_CHARACTERISTICS[category]["weight"]
            })
        
        return jsonify({
            'percentage': percentage,
            'detected_items': detected_items,
            'detected_categories': list(detected_categories),
            'category_details': category_details,
            'score': score,
            'max_score': max_score,
            'improvement_suggestions': improvement_suggestions
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)

