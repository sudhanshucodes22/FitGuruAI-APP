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
scanner_mods = [
    # Profile photo click -> goes to profile.html
    ('<div class="w-10 h-10 rounded-full overflow-hidden border border-primary/20">',
     '<div onclick="window.location.href=\'profile.html\'" class="w-10 h-10 rounded-full overflow-hidden border border-primary/20 cursor-pointer active:scale-95 transition-transform">'),
     
    # Add inline script for logMeal function
    ('<button class="w-full bg-primary-container text-on-primary-container py-md rounded-2xl font-headline-md flex items-center justify-center gap-sm transition-all duration-300 active:scale-95 shadow-lg shadow-primary/20 glow-neon">',
     '<button onclick="logMeal()" class="w-full bg-primary-container text-on-primary-container py-md rounded-2xl font-headline-md flex items-center justify-center gap-sm transition-all duration-300 active:scale-95 shadow-lg shadow-primary/20 glow-neon">'),
     
    ('</main>',
     """
     <script>
         function logMeal() {
             // Create standard premium toast notification
             const toast = document.createElement('div');
             toast.className = 'fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-background border border-[#39ff14]/50 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 backdrop-blur-md max-w-sm w-[90%] transition-all duration-300 transform scale-90 opacity-0';
             toast.innerHTML = `
                 <span class="material-symbols-outlined text-[#39ff14] animate-bounce">check_circle</span>
                 <div>
                     <p class="text-xs font-bold font-['Hanken_Grotesk'] uppercase tracking-wider">macros logged</p>
                     <p class="text-[10px] text-on-surface-variant font-['Inter']">42g Protein & 542kcal synced successfully.</p>
                 </div>
             `;
             document.body.appendChild(toast);
             setTimeout(() => {
                 toast.classList.remove('scale-90', 'opacity-0');
             }, 50);
             
             setTimeout(() => {
                 toast.classList.add('scale-90', 'opacity-0');
                 setTimeout(() => {
                     toast.remove();
                     window.location.href = 'tracker.html';
                 }, 300);
             }, 2500);
         }
     </script>
     </main>
     """)
]
modify_file('scanner.html', scanner_mods)


# --- 5. coach.html ---
# Let's add a dynamic chat box simulation so they can chat with the coach
coach_mods = [
    # Send button action
    ('<button class="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container shadow-lg shadow-primary/20 active:scale-90 transition-transform">',
     '<button id="send-chat-btn" class="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container shadow-lg shadow-primary/20 active:scale-90 transition-transform">'),
     
    # Add ID to input
    ('<input class="bg-transparent border-none focus:ring-0 text-sm text-on-surface w-full placeholder:text-on-surface-variant/50" placeholder="Ask your coach anything..." type="text">',
     '<input id="chat-input" class="bg-transparent border-none focus:ring-0 text-sm text-on-surface w-full placeholder:text-on-surface-variant/50" placeholder="Ask your coach anything..." type="text" onkeydown="if(event.key === \'Enter\') document.getElementById(\'send-chat-btn\').click()">'),
     
    ('</main>',
     """
     <script>
         document.addEventListener('DOMContentLoaded', () => {
             const chatInput = document.getElementById('chat-input');
             const sendBtn = document.getElementById('send-chat-btn');
             const mainSec = document.querySelector('main');
             
             // Dynamic Chat Interface Setup
             sendBtn.addEventListener('click', () => {
                 const text = chatInput.value.trim();
                 if(!text) return;
                 
                 chatInput.value = '';
                 
                 // If this is the first message, replace the main content with a chat thread!
                 let thread = document.getElementById('chat-thread');
                 if (!thread) {
                     // Hide other sections
                     const sections = mainSec.querySelectorAll('section');
                     sections.forEach(sec => sec.classList.add('hidden'));
                     
                     // Create Chat Thread Container
                     thread = document.createElement('div');
                     thread.id = 'chat-thread';
                     thread.className = 'w-full max-w-md mx-auto space-y-4 pb-4 overflow-y-auto max-h-[50vh] hide-scrollbar';
                     
                     // Insert at top of main
                     mainSec.insertBefore(thread, mainSec.firstChild);
                     
                     // Add initial system message
                     appendMessage('AI Coach', 'Hydration logged at 2.4L. Starting performance Protocol Briefing. Ready for your query, Alex.', false);
                 }
                 
                 // Append User Message
                 appendMessage('You', text, true);
                 
                 // Simulate AI Response
                 setTimeout(() => {
                     let reply = "Processing biometric feedback... ";
                     const q = text.toLowerCase();
                     if (q.includes('hydrate') || q.includes('water')) {
                         reply = "Your hydration is currently at 60%. I recommend consuming 500ml of mineralized water before your bench session to maintain muscular output.";
                     } else if (q.includes('workout') || q.includes('routine') || q.includes('bench')) {
                         reply = "Your central nervous system recovery is at 88% today. You are cleared for high-load bench presses. Squat form correction is also recommended.";
                     } else if (q.includes('protein') || q.includes('diet') || q.includes('eat')) {
                         reply = "Lean Bulking plan requires 3,200kcal. Your dinner should focus on grilled salmon (32g protein) for overnight muscle fiber recovery.";
                     } else {
                         reply = "Affirmative, Alex. Analyzing load-path variables. Form analysis indicates left elbow deviation. Keep core braced and push past your previous limits.";
                     }
                     appendMessage('AI Coach', reply, false);
                 }, 1000);
             });
             
             function appendMessage(sender, text, isUser) {
                 const thread = document.getElementById('chat-thread');
                 const msg = document.createElement('div');
                 msg.className = isUser 
                     ? 'flex flex-col items-end' 
                     : 'flex flex-col items-start';
                     
                 const cardClass = isUser 
                     ? 'bg-primary-container text-on-primary-container rounded-t-2xl rounded-l-2xl' 
                     : 'glass-card text-on-surface rounded-t-2xl rounded-r-2xl border-white/5';
                     
                 msg.innerHTML = `
                     <span class="font-['Geist'] text-[8px] text-on-surface-variant uppercase tracking-widest mb-1 px-2">${sender}</span>
                     <div class="${cardClass} p-4 max-w-[85%] text-xs leading-relaxed shadow-lg">
                         ${text}
                     </div>
                 `;
                 thread.appendChild(msg);
                 
                 // Scroll to bottom
                 const scrollArea = document.querySelector('.scroll-area');
                 if (scrollArea) {
                     scrollArea.scrollTop = scrollArea.scrollHeight;
                 }
             }
         });
     </script>
     </main>
     """)
]
modify_file('coach.html', coach_mods)


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
tracker_mods = [
    # Enhance toggleHabit function to update score & counts in real-time
    ("""function toggleHabit(card) {
            const checkbox = card.querySelector('.habit-checkbox');
            const icon = checkbox.querySelector('span');
            const sparkleContainer = card.querySelector('.sparkle-container');
            
            const isCompleted = checkbox.classList.contains('bg-primary');
            
            if (!isCompleted) {
                // Complete action
                checkbox.classList.add('bg-primary', 'border-primary');
                checkbox.classList.remove('border-white/10');
                icon.classList.remove('hidden');
                
                // Celebration Sparkles
                createSparkles(sparkleContainer);
                
                // Card feedback
                card.classList.add('border-primary/50');
            } else {
                // Undo action
                checkbox.classList.remove('bg-primary', 'border-primary');
                checkbox.classList.add('border-white/10');
                icon.classList.add('hidden');
                card.classList.remove('border-primary/50');
            }
        }""",
     """
        let completedHabits = 3;
        function updateScore(diff) {
            completedHabits += diff;
            if (completedHabits < 0) completedHabits = 0;
            if (completedHabits > 5) completedHabits = 5;
            
            // Update subtitle counts
            const counts = document.querySelector('section.mb-xl .text-on-surface-variant');
            if (counts) counts.textContent = `${completedHabits} of 5 Completed`;
            
            // Update circular readiness score
            const scoreText = document.getElementById('score-percentage-text') || document.querySelector('.text-headline-lg.text-primary');
            const scoreRing = document.getElementById('score-ring');
            
            let percentage = 60 + (completedHabits * 8); // Base 60%, +8% per habit
            if (scoreText) scoreText.textContent = percentage + '%';
            if (scoreRing) {
                // Circumference is 282.7
                const offset = 282.7 - (282.7 * percentage / 100);
                scoreRing.style.strokeDashoffset = offset;
            }
        }

        function toggleHabit(card) {
            const checkbox = card.querySelector('.habit-checkbox');
            const icon = checkbox.querySelector('span');
            const sparkleContainer = card.querySelector('.sparkle-container');
            
            const isCompleted = checkbox.classList.contains('bg-primary');
            
            if (!isCompleted) {
                // Complete action
                checkbox.classList.add('bg-primary', 'border-primary');
                checkbox.classList.remove('border-white/10');
                icon.classList.remove('hidden');
                
                // Celebration Sparkles
                createSparkles(sparkleContainer);
                
                // Card feedback
                card.classList.add('border-primary/50');
                updateScore(1);
            } else {
                // Undo action
                checkbox.classList.remove('bg-primary', 'border-primary');
                checkbox.classList.add('border-white/10');
                icon.classList.add('hidden');
                card.classList.remove('border-primary/50');
                updateScore(-1);
            }
        }
     """)
]
modify_file('tracker.html', tracker_mods)


# --- 9. profile.html ---
profile_mods = [
    # Update PR update button interaction
    ('<div class="bg-primary px-md py-sm rounded-lg text-on-primary font-label-caps text-label-caps active:scale-95 transition-transform cursor-pointer">',
     '<div onclick="updatePR(this)" class="bg-primary px-md py-sm rounded-lg text-on-primary font-label-caps text-label-caps active:scale-95 transition-transform cursor-pointer">'),
     
    # Script update for PR
    ('</main>',
     """
     <script>
         function updatePR(btn) {
             const parent = btn.closest('.relative');
             const display = parent.querySelector('h3');
             const currentVal = parseInt(display.textContent);
             const newVal = prompt("Enter new Personal Record (KG):", currentVal);
             if (newVal && !isNaN(newVal)) {
                 display.innerHTML = newVal + '<span class="text-headline-md text-on-surface-variant ml-xs">KG</span>';
                 
                 // Show premium alert
                 const toast = document.createElement('div');
                 toast.className = 'fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-background border border-[#39ff14]/50 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 backdrop-blur-md max-w-sm w-[90%] transition-all duration-300';
                 toast.innerHTML = '<span class="material-symbols-outlined text-[#39ff14]">check_circle</span><span class="text-xs font-mono-data uppercase">PR DATABASE UPDATED</span>';
                 document.body.appendChild(toast);
                 setTimeout(() => toast.remove(), 2000);
             }
         }
         
         // Select Avatar Forge options and update avatar profile picture!
         document.addEventListener('DOMContentLoaded', () => {
             const avatarOptions = document.querySelectorAll('.grid-cols-2 .relative, .grid-cols-2 button');
             const mainAvatarImg = document.querySelector('.avatar-inner img');
             
             avatarOptions.forEach(opt => {
                 opt.addEventListener('click', () => {
                     const img = opt.querySelector('img');
                     if (img && mainAvatarImg) {
                         // Update main profile picture
                         mainAvatarImg.src = img.src;
                         
                         // Clear active classes from other options
                         avatarOptions.forEach(o => {
                             o.classList.remove('border-2', 'border-primary/50', 'shadow-lg', 'shadow-primary/20');
                             const badge = o.querySelector('.absolute.top-xs');
                             if(badge) badge.remove();
                             const activeLabel = o.querySelector('.bg-primary\\/80');
                             if (activeLabel) {
                                 activeLabel.className = 'absolute bottom-0 inset-x-0 p-xs text-center bg-black/60 backdrop-blur-sm';
                                 activeLabel.querySelector('span').textContent = activeLabel.querySelector('span').textContent.replace('ACTIVE', '');
                             }
                         });
                         
                         // Set current as active
                         opt.classList.add('border-2', 'border-primary/50', 'shadow-lg', 'shadow-primary/20');
                         
                         // Add check icon badge
                         const badge = document.createElement('div');
                         badge.className = 'absolute top-xs right-xs';
                         badge.innerHTML = '<span class="material-symbols-outlined text-primary text-sm">check_circle</span>';
                         opt.appendChild(badge);
                     }
                 });
             });
             
             // Forge new button action
             const forgeBtn = document.querySelector('.border-dashed');
             if(forgeBtn) {
                 forgeBtn.addEventListener('click', () => {
                     forgeBtn.disabled = true;
                     const originalText = forgeBtn.querySelector('span:last-child').textContent;
                     forgeBtn.querySelector('span:last-child').textContent = 'SYNTHESIZING...';
                     
                     setTimeout(() => {
                         forgeBtn.disabled = false;
                         forgeBtn.querySelector('span:last-child').textContent = originalText;
                         alert("New AI Athlete avatar synthesized and added to collection!");
                     }, 2000);
                 });
             }
         });
     </script>
     </main>
     """)
]
modify_file('profile.html', profile_mods)

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
