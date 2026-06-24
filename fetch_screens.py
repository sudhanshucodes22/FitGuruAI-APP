import urllib.request
import re
import os

os.makedirs('/Users/sudhanshu/.gemini/antigravity/scratch/fitguru-app/raw_screens', exist_ok=True)

screens = {
    "habit_tracker": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ6Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpZCiVodG1sXzA1MDIwZmM0NjQ1NjQ3NjhhZDQ1YWExOWQxNmFlNTNmEgsSBxDmx5TcjxsYAZIBIgoKcHJvamVjdF9pZBIUQhI4NDc3OTY4OTM1NTQ2MTgwMDY&filename=&opi=89354086",
    "ai_coach": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ6Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpZCiVodG1sXzAwMDY1NGQ2NDVkODhiMTgwNmRjMDFhNGRmMWE1NTM3EgsSBxDmx5TcjxsYAZIBIgoKcHJvamVjdF9pZBIUQhI4NDc3OTY4OTM1NTQ2MTgwMDY&filename=&opi=89354086",
    "athlete_profile": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ6Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpZCiVodG1sXzAwMDY1NGQ2NDQyZDE5YWUwNGVhYTZlNjgzMDg5Zjg1EgsSBxDmx5TcjxsYAZIBIgoKcHJvamVjdF9pZBIUQhI4NDc3OTY4OTM1NTQ2MTgwMDY&filename=&opi=89354086",
    "dashboard": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ6Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpZCiVodG1sXzAwMDY1NGQ2NDJhNDNkOGQwNjM5NzEyMzA4M2JmMjU2EgsSBxDmx5TcjxsYAZIBIgoKcHJvamVjdF9pZBIUQhI4NDc3OTY4OTM1NTQ2MTgwMDY&filename=&opi=89354086",
    "join_the_elite": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ6Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpZCiVodG1sXzAwMDY1NGQ2NDI0NGYwMTIwOTI1YzJkMDE5MWY1ODhmEgsSBxDmx5TcjxsYAZIBIgoKcHJvamVjdF9pZBIUQhI4NDc3OTY4OTM1NTQ2MTgwMDY&filename=&opi=89354086",
    "pro_elite_rewards": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ6Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpZCiVodG1sXzAwMDY1NGQ2NDM2Nzk2YzgwMzc0OWY5NWIxMmVlMjdkEgsSBxDmx5TcjxsYAZIBIgoKcHJvamVjdF9pZBIUQhI4NDc3OTY4OTM1NTQ2MTgwMDY&filename=&opi=89354086",
    "welcome": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ6Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpZCiVodG1sXzAwMDY1NGQ2NDI1NThlOTUwMzMyY2U3NDAxMjRkMzE3EgsSBxDmx5TcjxsYAZIBIgoKcHJvamVjdF9pZBIUQhI4NDc3OTY4OTM1NTQ2MTgwMDY&filename=&opi=89354086",
    "meal_scanner": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ6Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpZCiVodG1sXzAwMDY1NGQ2NDI5NDVhNmYwNzkyZjVjNjNmMTNmY2U0EgsSBxDmx5TcjxsYAZIBIgoKcHJvamVjdF9pZBIUQhI4NDc3OTY4OTM1NTQ2MTgwMDY&filename=&opi=89354086",
    "ai_camera": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ6Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpZCiVodG1sXzlkMjQyNDBmMjcwNTQwNTE4MGFmZGJhYzhiZGNhYmE3EgsSBxDmx5TcjxsYAZIBIgoKcHJvamVjdF9pZBIUQhI4NDc3OTY4OTM1NTQ2MTgwMDY&filename=&opi=89354086",
    "ai_coach_choose": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ6Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpZCiVodG1sXzAwMDY1NGQ2NDI4NWU3ODAwNjM5NDJmNzE1MGIwZjIyEgsSBxDmx5TcjxsYAZIBIgoKcHJvamVjdF9pZBIUQhI4NDc3OTY4OTM1NTQ2MTgwMDY&filename=&opi=89354086"
}

for name, url in screens.items():
    print(f"Downloading {name}...")
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            content = response.read().decode('utf-8')
            
            # Find the html block inside the markdown or raw content
            # Often it's just the HTML starting with <!DOCTYPE html>
            match = re.search(r'<!DOCTYPE html>.*</html>', content, re.DOTALL | re.IGNORECASE)
            if match:
                html_code = match.group(0)
            else:
                html_code = content
            
            out_path = f'/Users/sudhanshu/.gemini/antigravity/scratch/fitguru-app/raw_screens/{name}.html'
            with open(out_path, 'w', encoding='utf-8') as f:
                f.write(html_code)
            print(f"Saved {name} to {out_path}")
    except Exception as e:
        print(f"Error downloading {name}: {e}")
