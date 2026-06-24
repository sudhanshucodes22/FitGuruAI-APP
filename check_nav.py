import os
import re

raw_dir = '/Users/sudhanshu/.gemini/antigravity/scratch/fitguru-app/raw_screens'
files_to_check = ['ai_coach.html', 'ai_coach_choose.html', 'athlete_profile.html', 'ai_camera.html', 'habit_tracker.html']

for fname in files_to_check:
    fpath = os.path.join(raw_dir, fname)
    if not os.path.exists(fpath):
        print(f"File not found: {fname}")
        continue
    with open(fpath, 'r', encoding='utf-8') as f:
        html = f.read()
        print(f"=== File: {fname} ===")
        nav_match = re.search(r'<nav[^>]*>.*?</nav>', html, re.DOTALL | re.IGNORECASE)
        if nav_match:
            print(nav_match.group(0))
        else:
            print("No <nav> tag found")
        print("="*50)
