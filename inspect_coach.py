with open('/Users/sudhanshu/.gemini/antigravity/scratch/fitguru-app/coach.html', 'r') as f:
    html = f.read()

# Let's find the occurrences of 'iphone-screen', 'Voice Assistant', and 'Bottom Navigation'
print("iphone-screen index:", html.find('iphone-screen'))
print("Voice Assistant index:", html.find('Voice Assistant & Interaction Layer'))
print("Bottom Navigation index:", html.find('Bottom Navigation Bar'))

# Let's print the lines around the Bottom Navigation Bar
lines = html.split('\n')
for idx, line in enumerate(lines):
    if 'Bottom Navigation Bar' in line:
        print(f"Line {idx+1}: {line}")
        for offset in range(1, 40):
            if idx+offset < len(lines):
                print(f"Line {idx+1+offset}: {lines[idx+offset]}")
        break
