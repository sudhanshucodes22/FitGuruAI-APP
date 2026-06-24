import json
import urllib.request
import re
import os

JSON_PATH = '/Users/sudhanshu/.gemini/antigravity/brain/9362d0ae-997d-490f-805d-70cb9eb5f707/.system_generated/steps/406/output.txt'
RAW_DIR = '/Users/sudhanshu/.gemini/antigravity/scratch/fitguru-app/raw_screens'
os.makedirs(RAW_DIR, exist_ok=True)

TITLE_TO_FILE = {
    "Welcome to FitGuru": "welcome.html",
    "Join the Elite": "join_the_elite.html",
    "Enhanced Dashboard": "dashboard.html",
    "Meal Scanner Pro - Advanced Vision": "meal_scanner.html",
    "AI Coach": "ai_coach.html",
    "AI Coach - Choose Exercise": "ai_coach_choose.html",
    "AI Pro Camera - Live Analysis": "ai_camera.html",
    "Habit Tracker - Optimized Mobile Layout": "habit_tracker.html",
    "Athlete Profile": "athlete_profile.html",
    "Pro Elite Rewards - Final Master Edition": "pro_elite_rewards.html"
}

with open(JSON_PATH, 'r', encoding='utf-8') as f:
    data = json.load(f)

screens = data.get('screens', [])
print(f"Found {len(screens)} screens in JSON.")

for s in screens:
    title = s.get('title')
    html_code_obj = s.get('htmlCode')
    if not html_code_obj:
        print(f"Skipping {title} (no htmlCode)")
        continue
    
    download_url = html_code_obj.get('downloadUrl')
    if not download_url:
        print(f"Skipping {title} (no downloadUrl)")
        continue
        
    filename = TITLE_TO_FILE.get(title)
    if not filename:
        print(f"Unknown screen title: {title}")
        continue
        
    print(f"Downloading '{title}' -> {filename}...")
    try:
        req = urllib.request.Request(download_url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            content = response.read().decode('utf-8')
            
            # Find the html block inside the raw content
            match = re.search(r'<!DOCTYPE html>.*</html>', content, re.DOTALL | re.IGNORECASE)
            if match:
                html_code = match.group(0)
            else:
                html_code = content
            
            out_path = os.path.join(RAW_DIR, filename)
            with open(out_path, 'w', encoding='utf-8') as out_f:
                out_f.write(html_code)
            print(f"  Saved {len(html_code)} bytes to {out_path}")
    except Exception as e:
        print(f"  Error downloading {title}: {e}")

print("Done!")
