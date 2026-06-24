import os
import re

raw_dir = '/Users/sudhanshu/.gemini/antigravity/scratch/fitguru-app/raw_screens'
for fname in sorted(os.listdir(raw_dir)):
    if not fname.endswith('.html'):
        continue
    fpath = os.path.join(raw_dir, fname)
    with open(fpath, 'r', encoding='utf-8') as f:
        html = f.read()
        
        print(f"=== File: {fname} ===")
        # Search for <nav>...</nav>
        nav_match = re.search(r'<nav[^>]*>.*?</nav>', html, re.DOTALL | re.IGNORECASE)
        if nav_match:
            print(nav_match.group(0))
        else:
            print("No <nav> tag found")
            # Let's search for footer or other common nav indicators
            footer_match = re.search(r'<footer[^>]*>.*?</footer>', html, re.DOTALL | re.IGNORECASE)
            if footer_match:
                print("Found Footer:")
                print(footer_match.group(0)[:500])
        print("\n" + "="*50 + "\n")
