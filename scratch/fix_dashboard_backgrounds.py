import re

def fix_backgrounds():
    with open('src/styles/dashboard.css', 'r', encoding='utf-8') as f:
        content = f.read()

    # Replace borders that were invisible on light canvas:
    content = re.sub(r'border(-[a-z]+)?:\s*1px solid rgba\(255,\s*255,\s*255,\s*0\.0[1-9]\);', r'border\1: 1px solid var(--border-subtle);', content)
    content = re.sub(r'border-top:\s*1px solid rgba\(255,\s*255,\s*255,\s*0\.0[1-9]\);', r'border-top: 1px solid var(--border-subtle);', content)
    content = re.sub(r'border-bottom:\s*1px solid rgba\(255,\s*255,\s*255,\s*0\.0[1-9]\);', r'border-bottom: 1px solid var(--border-subtle);', content)
    content = re.sub(r'border-right:\s*1px solid rgba\(255,\s*255,\s*255,\s*0\.0[1-9]\);', r'border-right: 1px solid var(--border-subtle);', content)

    # Replace item backgrounds (except inside .sidebar):
    # We can safely replace background: rgba(255, 255, 255, 0.0[1-9]) with background: var(--bg-hover);
    # First protect sidebar lines
    lines = content.split('\n')
    new_lines = []
    in_sidebar = False
    
    for line in lines:
        if '.sidebar' in line:
            in_sidebar = True
        elif line.startswith('/* ===') and 'SIDEBAR' not in line:
            in_sidebar = False
            
        if not in_sidebar and ('rgba(255, 255, 255, 0.0' in line or 'rgba(255,255,255,0.0' in line):
            if 'background:' in line or 'background-color:' in line:
                line = re.sub(r'background(-color)?:\s*rgba\(255,\s*255,\s*255,\s*0\.0[1-9]\);', r'background\1: var(--bg-hover);', line)
                line = re.sub(r'background(-color)?:\s*rgba\(255,\s*255,\s*255,\s*0\.0[1-9]\)\s*!important;', r'background\1: var(--bg-hover) !important;', line)
        new_lines.append(line)

    content = '\n'.join(new_lines)

    with open('src/styles/dashboard.css', 'w', encoding='utf-8') as f:
        f.write(content)
    print('dashboard.css backgrounds and borders updated successfully.')

if __name__ == '__main__':
    fix_backgrounds()
