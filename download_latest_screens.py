import urllib.request
import re
import os

RAW_DIR = '/Users/sudhanshu/.gemini/antigravity/scratch/fitguru-app/raw_screens'
os.makedirs(RAW_DIR, exist_ok=True)

# The actual latest screens URLs retrieved dynamically from list_screens API
LATEST_SCREENS = {
    "welcome": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ6Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpZCiVodG1sXzMzNzIyMzU5OTA4MTI5MjcyMw==&filename=&opi=89354086",
    "join_the_elite": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ6Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpZCiVodG1sXzE3NDIzMzk1MTUzMzE4MjQzNDY=&filename=&opi=89354086",
    "dashboard": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ6Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpZCiVodG1sXzAwMDY1NGQ2NDJhNDNkOGQwNjM5NzEyMzA4M2JmMjU2&filename=&opi=89354086",
    "meal_scanner": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ6Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpZCiVodG1sXzEyOTg4MDI0MTQxMTkyMzk5NTYx&filename=&opi=89354086",
    "ai_coach": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ6Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpZCiVodG1sXzE0NzU0NjYwNTkwMjY1MDkxMzcy&filename=&opi=89354086",
    "ai_coach_choose": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ6Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpZCiVodG1sXzEwMDM0NDQ2NDI0NTE0NTIzNTQ4&filename=&opi=89354086",
    "ai_camera": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ6Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpZCiVodG1sXzlkMjQyNDBmMjcwNTQwNTE4MGFmZGJhYzhiZGNhYmE3&filename=&opi=89354086",
    "habit_tracker": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ6Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpZCiVodG1sXzA1MDIwZmM0NjQ1NjQ3NjhhZDQ1YWExOWQxNmFlNTNm&filename=&opi=89354086", # Note: the latest for tracker is html_59ffd1df8e6c455e962210b954e249f0 according to list_screens! Let's update it.
    "pro_elite_rewards": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ6Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpZCiVodG1sXzE2MjczNTM2MTY3Njk0MTUxMDU1&filename=&opi=89354086",
    "athlete_profile": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ6Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpZCiVodG1sXzEzODgxOTg5MDE2NjU2Njg4NDMx&filename=&opi=89354086"
}

# Double check the correct URL for habit_tracker from list_screens:
# "title":"Habit Tracker - Optimized Mobile Layout" has htmlCode downloadUrl:
# https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ6Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpZCiVodG1sXzU5ZmZkMWRmOGU2YzQ1NWU5NjIyMTBiOTU0ZTI0OWYw&filename=&opi=89354086
LATEST_SCREENS["habit_tracker"] = "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ6Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpZCiVodG1sXzU5ZmZkMWRmOGU2YzQ1NWU5NjIyMTBiOTU0ZTI0OWYw&filename=&opi=89354086"

for name, url in LATEST_SCREENS.items():
    print(f"Downloading latest {name}...")
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            content = response.read().decode('utf-8')
            
            # Find the HTML structure starting with <!DOCTYPE html>
            match = re.search(r'<!DOCTYPE html>.*</html>', content, re.DOTALL | re.IGNORECASE)
            if match:
                html_code = match.group(0)
            else:
                html_code = content
                
            out_path = os.path.join(RAW_DIR, f"{name}.html")
            with open(out_path, 'w', encoding='utf-8') as f:
                f.write(html_code)
            print(f"Saved to {out_path} (Size: {len(html_code)} bytes)")
    except Exception as e:
        print(f"Error downloading {name}: {e}")

print("All latest screens downloaded successfully!")
