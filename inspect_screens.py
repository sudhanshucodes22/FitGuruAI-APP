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
        # Title
        title_match = re.search(r'<title>(.*?)</title>', html, re.IGNORECASE)
        print(f"Title: {title_match.group(1).strip() if title_match else 'None'}")
        
        # H1
        h1_match = re.search(r'<h1[^>]*>(.*?)</h1>', html, re.IGNORECASE | re.DOTALL)
        print(f"H1: {re.sub(r'<[^>]+>', '', h1_match.group(1)).strip() if h1_match else 'None'}")
        
        # H2
        h2_match = re.search(r'<h2[^>]*>(.*?)</h2>', html, re.IGNORECASE | re.DOTALL)
        print(f"H2: {re.sub(r'<[^>]+>', '', h2_match.group(1)).strip().replace(chr(10), ' ') if h2_match else 'None'}")
        
        # Let's search for typical bottom navigation tags (e.g. navigation container at bottom)
        # Search for elements with id/class containing "nav", "footer", "tab"
        # Specifically, search for text content or icons at the bottom of the page
        # Often there's a nav element with icons like 'home', 'fitness_center', 'restaurant', 'person'
        # Let's print out all material-symbols-outlined in the last 2000 chars of the page!
        last_chars = html[-3000:]
        icons = re.findall(r'material-symbols-outlined[^>]*>([^<]+)', last_chars)
        print(f"Icons in last 3000 chars: {icons}")
        
        # Let's find any text near these icons
        links = re.findall(r'<a[^>]*>(.*?)</a>', last_chars, re.DOTALL)
        clean_links = [re.sub(r'<[^>]+>', '', l).strip().replace('\n', '') for l in links]
        clean_links = [l for l in clean_links if l]
        print(f"Links in last 3000 chars: {clean_links}")
        print("\n")
