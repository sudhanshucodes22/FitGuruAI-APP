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
        
        # Find script tags (excluding tailwind config)
        scripts = re.findall(r'<script[^>]*>(.*?)</script>', html, re.DOTALL | re.IGNORECASE)
        for i, s in enumerate(scripts):
            if 'tailwind' in s:
                continue
            print(f"Script {i+1}:")
            print(s.strip()[:1000]) # Print first 1000 chars of each script
            print("-" * 30)
        
        # Find style tags
        styles = re.findall(r'<style[^>]*>(.*?)</style>', html, re.DOTALL | re.IGNORECASE)
        if styles:
            print("Styles:")
            for style in styles:
                print(style.strip()[:300])
                print("-" * 30)
        print("\n" + "="*50 + "\n")
