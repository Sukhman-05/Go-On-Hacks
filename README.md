# Performative Male Evaluator 🎭

A web application that uses Google's Gemini Vision API to analyze images and determine a "performativeness" percentage based on distinctive characteristics associated with performative male culture.

## Features

- **Image Analysis**: Upload images and analyze them using Gemini Vision AI
- **Performativeness Scoring**: Calculate a percentage score based on detected characteristics
- **Characteristic Detection**: Identifies items like:
  - Feminist literature (bell hooks, Roxane Gay, etc.)
  - Matcha lattes
  - Tote bags
  - Labubu keychains
  - Baggy jeans and vintage clothing
  - Female indie artist merchandise
  - Aesthetic items (film cameras, journals, etc.)
  - Coffee shop aesthetics
  - And more...

## Setup

### Prerequisites

- Python 3.8 or higher
- Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))

### Installation

1. Clone this repository or navigate to the project directory

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set your Gemini API key as an environment variable:
```bash
export GEMINI_API_KEY='your-api-key-here'
```

Or create a `.env` file in the project root:
```
GEMINI_API_KEY=your-api-key-here
```

4. Run the application:
```bash
python app.py
```

5. Open your browser and navigate to:
```
http://localhost:5000
```

## Usage

1. Click or drag an image into the upload area
2. Click "Analyze Image" to process the image
3. View the performativeness percentage and detected characteristics

## How It Works

The application uses Google's Gemini 1.5 Flash Vision model to analyze uploaded images. It searches for specific items and characteristics associated with performative male culture, then calculates a weighted score based on the presence of these items.

Each characteristic category has a weight:
- Feminist Literature: 15 points
- Tote Bag: 12 points
- Female Indie Artists: 12 points
- Matcha Latte: 10 points
- Baggy Jeans: 10 points
- And more...

The final percentage is calculated as: (Total Score / Maximum Possible Score) × 100

## Technologies Used

- **Backend**: Flask (Python)
- **Frontend**: HTML, CSS, JavaScript
- **AI Model**: Google Gemini 1.5 Flash Vision API
- **Image Processing**: Pillow (PIL)

## Notes

This is a satirical/pop culture reference tool. The concept of "performative male" refers to an internet archetype describing men who adopt traditionally feminine interests and aesthetics to superficially appeal to progressive women.

## License

This project is for educational and entertainment purposes.

