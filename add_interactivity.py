import os
import re

OUT_DIR = '/Users/sudhanshu/.gemini/antigravity/scratch/fitguru-app'

def modify_file(filename, replacements_list):
    filepath = os.path.join(OUT_DIR, filename)
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    original = content
    for target, replacement in replacements_list:
        if target in content:
            content = content.replace(target, replacement)
        else:
            print(f"Warning: Target string not found in {filename}: {target[:50]}...")
            
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Successfully modified {filename}")
    else:
        print(f"No changes made to {filename}")

# --- 1. index.html ---
index_mods = [
    # Add link to auth.html on the "Get Started" button
    ('<button class="group relative overflow-hidden bg-primary-container text-on-primary px-xl py-md font-headline-md transition-all duration-300 active:scale-95 neon-glow flex items-center justify-center gap-md w-full md:w-auto rounded-lg">',
     '<button onclick="window.location.href=\'auth.html\'" class="group relative overflow-hidden bg-primary-container text-on-primary px-xl py-md font-headline-md transition-all duration-300 active:scale-95 neon-glow flex items-center justify-center gap-md w-full md:w-auto rounded-lg">'),
     
    # Discover Elite Ecosystem -> goes to auth.html
    ('<div class="flex items-center gap-sm opacity-60 hover:opacity-100 transition-opacity cursor-pointer">',
     '<div onclick="window.location.href=\'auth.html\'" class="flex items-center gap-sm opacity-60 hover:opacity-100 transition-opacity cursor-pointer">')
]
modify_file('index.html', index_mods)

# --- 2. auth.html ---
auth_mods = [
    # Create Account button
    ('<button class="group relative w-full h-16 bg-primary-container text-on-primary-container font-headline-md text-headline-md rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-95 flex items-center justify-center px-gutter"',
     '<button onclick="window.location.href=\'dashboard.html\'" class="group relative w-full h-16 bg-primary-container text-on-primary-container font-headline-md text-headline-md rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-95 flex items-center justify-center px-gutter"'),
     
    # Sign In button
    ('<button class="w-full h-16 glass-container text-on-surface font-headline-md text-headline-md rounded-xl transition-all duration-300 hover:bg-white/5 hover:border-white/20 active:scale-95 flex items-center justify-center px-gutter">',
     '<button onclick="window.location.href=\'dashboard.html\'" class="w-full h-16 glass-container text-on-surface font-headline-md text-headline-md rounded-xl transition-all duration-300 hover:bg-white/5 hover:border-white/20 active:scale-95 flex items-center justify-center px-gutter">'),
     
    # Google/Apple social log-ins
    ('href="#"', 'href="dashboard.html"'),
    ('apple button tag placeholder', 'apple button tag placeholder') # dummy to test
]
modify_file('auth.html', auth_mods)

# Let's fix Apple and Google buttons in auth.html specifically
with open(os.path.join(OUT_DIR, 'auth.html'), 'r') as f:
    auth_content = f.read()

# Add onclick to the apple and google login buttons
auth_content = auth_content.replace(
    '<button class="flex items-center justify-center gap-sm h-14 rounded-xl glass-container hover:bg-white/5 transition-all group">',
    '<button onclick="window.location.href=\'dashboard.html\'" class="flex items-center justify-center gap-sm h-14 rounded-xl glass-container hover:bg-white/5 transition-all group">',
    2 # Apply to both Apple and Google buttons
)
with open(os.path.join(OUT_DIR, 'auth.html'), 'w') as f:
    f.write(auth_content)

# --- 3. dashboard.html ---
dashboard_mods = [
    # Click profile photo -> goes to profile.html
    ('<div class="w-10 h-10 rounded-full overflow-hidden border border-primary/20">',
     '<div onclick="window.location.href=\'profile.html\'" class="w-10 h-10 rounded-full overflow-hidden border border-primary/20 cursor-pointer active:scale-95 transition-transform">'),
     
    # Connect with AI Coach bento card click
    ('<div class="md:col-span-2 glass-card-elite rounded-xl overflow-hidden relative min-h-[280px] p-lg flex flex-col justify-between group cursor-pointer"',
     '<div onclick="window.location.href=\'coach.html\'" class="md:col-span-2 glass-card-elite rounded-xl overflow-hidden relative min-h-[280px] p-lg flex flex-col justify-between group cursor-pointer"'),
     
    # Start briefing button inside AI Coach bento card
    ('<button class="relative z-10 self-start bg-primary text-on-primary px-sm py-xs rounded-lg font-label-caps text-sm hover:scale-105 active:scale-95 transition-all flex items-center gap-2">',
     '<button onclick="window.location.href=\'coach.html\'" class="relative z-10 self-start bg-primary text-on-primary px-sm py-xs rounded-lg font-label-caps text-sm hover:scale-105 active:scale-95 transition-all flex items-center gap-2">'),
     
    # Leg Day bento card click -> goes to exercises.html
    ('<div class="glass-card rounded-xl overflow-hidden flex flex-col"',
     '<div onclick="window.location.href=\'exercises.html\'" class="glass-card rounded-xl overflow-hidden flex flex-col cursor-pointer hover:border-primary-container/30 transition-all duration-300"'),
     
    # AI Posture Check bento card click -> goes to camera.html
    ('<div class="glass-card rounded-xl p-md flex flex-col justify-between min-h-[200px] border-t border-primary-fixed/20 relative overflow-hidden">',
     '<div onclick="window.location.href=\'camera.html\'" class="glass-card rounded-xl p-md flex flex-col justify-between min-h-[200px] border-t border-primary-fixed/20 relative overflow-hidden cursor-pointer hover:border-primary-container/30 transition-all duration-300">'),
     
    # Log your dinner card click -> goes to scanner.html
    ('<div class="glass-card p-md rounded-xl flex items-center gap-md group cursor-pointer transition-all duration-300 hover:bg-white/10"',
     '<div onclick="window.location.href=\'scanner.html\'" class="glass-card p-md rounded-xl flex items-center gap-md group cursor-pointer transition-all duration-300 hover:bg-white/10"'),
]
modify_file('dashboard.html', dashboard_mods)


# --- 4. scanner.html ---
# Scanner is fully API-integrated in raw templates; skip static mock injection
scanner_mods = []
# modify_file('scanner.html', scanner_mods)


# --- 5. coach.html ---
# Coach is fully API-integrated in raw templates; skip static mock injection
coach_mods = []
# modify_file('coach.html', coach_mods)


# --- 6. exercises.html ---
exercises_mods = [
    # Make profile photo go to profile.html
    ('<div class="w-10 h-10 rounded-full border border-primary-fixed-dim/30 overflow-hidden bg-surface-container flex items-center justify-center">',
     '<div onclick="window.location.href=\'profile.html\'" class="w-10 h-10 rounded-full border border-primary-fixed-dim/30 overflow-hidden bg-surface-container flex items-center justify-center cursor-pointer active:scale-95 transition-transform">'),
     
    # Resume plan button
    ('<button class="bg-primary-container text-on-primary font-bold py-sm px-lg rounded-xl flex items-center gap-sm hover:brightness-110 transition-all active:scale-95">',
     '<button onclick="window.location.href=\'camera.html\'" class="bg-primary-container text-on-primary font-bold py-sm px-lg rounded-xl flex items-center gap-sm hover:brightness-110 transition-all active:scale-95">'),
]
modify_file('exercises.html', exercises_mods)

# Let's fix START AI SCAN buttons in exercises.html
with open(os.path.join(OUT_DIR, 'exercises.html'), 'r') as f:
    ex_content = f.read()

ex_content = ex_content.replace(
    '<button class="w-full py-sm bg-background border border-primary-fixed-dim/30 text-primary-fixed-dim font-label-caps text-label-caps rounded-xl flex items-center justify-center gap-xs neon-glow-hover transition-all h-10">',
    '<button onclick="window.location.href=\'camera.html\'" class="w-full py-sm bg-background border border-[#39ff14] text-[#39ff14] font-label-caps text-label-caps rounded-xl flex items-center justify-center gap-xs neon-glow-hover transition-all h-10">',
)
with open(os.path.join(OUT_DIR, 'exercises.html'), 'w') as f:
    f.write(ex_content)


# --- 7. camera.html ---
camera_mods = []
modify_file('camera.html', camera_mods)


# --- 8. tracker.html ---
# Tracker is fully API-integrated in raw templates; skip static mock injection
tracker_mods = []
# modify_file('tracker.html', tracker_mods)


# --- 9. profile.html ---
# Profile is fully API-integrated in raw templates; skip static mock injection
profile_mods = []
# modify_file('profile.html', profile_mods)

# Let's verify that rewards.html claim button works
rewards_mods = [
    # Claim Reward Button action
    ('<button class="bg-primary-container text-on-primary-fixed font-label-caps text-[12px] px-12 py-4 rounded-full font-bold uppercase tracking-[0.3em] hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(57,255,20,0.4)]">',
     '<button onclick="claimReward(this)" class="bg-primary-container text-on-primary-fixed font-label-caps text-[12px] px-12 py-4 rounded-full font-bold uppercase tracking-[0.3em] hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(57,255,20,0.4)]">'),
     
    ('</main>',
     """
     <script>
         function claimReward(btn) {
             btn.disabled = true;
             btn.textContent = 'CLAIMED';
             btn.className = 'bg-white/10 text-on-surface-variant font-label-caps text-[12px] px-12 py-4 rounded-full font-bold uppercase tracking-[0.3em] cursor-not-allowed';
             
             // Show premium alert
             const toast = document.createElement('div');
             toast.className = 'fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-background border border-[#39ff14]/50 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 backdrop-blur-md max-w-sm w-[90%] transition-all duration-300';
             toast.innerHTML = '<span class="material-symbols-outlined text-[#39ff14]">emoji_events</span><span class="text-xs font-mono-data uppercase">REWARD CLAIMED! 500 XP GRANTED</span>';
             document.body.appendChild(toast);
             setTimeout(() => toast.remove(), 2500);
         }
     </script>
     </main>
     """)
]
modify_file('rewards.html', rewards_mods)
