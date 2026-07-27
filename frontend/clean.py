import os, re
for root, _, files in os.walk('src'):
    for file in files:
        if file.endswith('.jsx'):
            path = os.path.join(root, file)
            with open(path, 'r') as f:
                content = f.read()
            original = content
            content = re.sub(r'import\s+\{\s*motion\s*\}\s+from\s+[\'"]framer-motion[\'"];?\n?', '', content)
            content = re.sub(r',\s*motion\s*\}', '}', content)
            content = re.sub(r'\{\s*motion\s*,', '{', content)
            content = re.sub(r'\{\s*motion\s*\}', '{}', content)
            content = re.sub(r'import\s+\{\s*\}\s+from\s+[\'"]framer-motion[\'"];?\n?', '', content)
            content = re.sub(r'catch\s*\(\s*err\s*\)', 'catch', content)
            content = re.sub(r'catch\s*\(\s*e\s*\)', 'catch', content)
            content = re.sub(r'catch\s*\(\s*_\s*\)', 'catch', content)
            content = re.sub(r'catch\s*\(\s*error\s*\)', 'catch', content)
            if content != original:
                with open(path, 'w') as f:
                    f.write(content)
                print(f"Fixed {path}")
