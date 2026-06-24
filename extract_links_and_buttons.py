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
        # Extract buttons
        buttons = re.findall(r'<button[^>]*>(.*?)</button>', html, re.DOTALL | re.IGNORECASE)
        clean_buttons = [re.sub(r'<[^>]+>', '', b).strip().replace('\n', ' ') for b in buttons]
        clean_buttons = [b for b in clean_buttons if b]
        print(f"Buttons: {clean_buttons}")
        
        # Extract links (excluding nav links)
        links = re.findall(r'<a[^>]*>(.*?)</a>', html, re.DOTALL | re.IGNORECASE)
        clean_links = [re.sub(r'<[^>]+>', '', l).strip().replace('\n', ' ') for l in links]
        clean_links = [l for l in clean_links if l]
        # filter out links that are just nav bar names
        nav_names = ['coach', 'scan', 'home', 'log', 'gym', 'habits']
        clean_links = [l for l in clean_links if l.lower() not in nav_names]
        print(f"Other Links: {clean_links}")
        
        print("\n" + "="*50 + "\n")
