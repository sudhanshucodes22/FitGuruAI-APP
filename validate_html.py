import os
from html.parser import HTMLParser

OUT_DIR = '/Users/sudhanshu/.gemini/antigravity/scratch/fitguru-app'

class SimpleHTMLValidator(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tags = []
        self.errors = []

    def handle_starttag(self, tag, attrs):
        # We don't track self-closing tags in simple HTML
        self_closing = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 
                        'link', 'meta', 'param', 'source', 'track', 'wbr']
        if tag not in self_closing:
            self.tags.append((tag, self.getpos()))

    def handle_endtag(self, tag):
        self_closing = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 
                        'link', 'meta', 'param', 'source', 'track', 'wbr']
        if tag in self_closing:
            return
            
        if not self.tags:
            self.errors.append(f"Unexpected end tag </{tag}> at line {self.getpos()[0]}")
            return
            
        expected_tag, pos = self.tags.pop()
        if expected_tag != tag:
            # We don't throw immediately, but log it
            self.errors.append(f"Mismatched end tag </{tag}> at line {self.getpos()[0]} (expected </{expected_tag}> from line {pos[0]})")

def validate_all():
    files = [f for f in os.listdir(OUT_DIR) if f.endswith('.html')]
    for fname in files:
        fpath = os.path.join(OUT_DIR, fname)
        with open(fpath, 'r', encoding='utf-8') as f:
            html_content = f.read()
            
        validator = SimpleHTMLValidator()
        try:
            validator.feed(html_content)
            print(f"File {fname}: parsed successfully. Unclosed tags remaining: {len(validator.tags)}")
            if validator.errors:
                print(f"  Errors found in {fname}:")
                for err in validator.errors[:5]: # Show first 5 errors
                    print(f"    {err}")
        except Exception as e:
            print(f"Error parsing {fname}: {e}")

if __name__ == '__main__':
    validate_all()
