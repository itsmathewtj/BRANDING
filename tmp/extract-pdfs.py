import sys
sys.stdout.reconfigure(encoding="utf-8")
sys.path.insert(0, 'tmp/pypdf-7.1.0-py3-none-any.whl')
from pypdf import PdfReader
files = [r'C:\Users\LENOVO\Downloads\EDE.pdf', r'C:\Users\LENOVO\Downloads\94a88471-c8d1-48b4-b87b-04e67f0815b4.pdf']
for path in files:
    reader = PdfReader(path)
    print(f'FILE: {path}\nPAGES: {len(reader.pages)}\nMETADATA: {reader.metadata}')
    chunks = []
    for i, page in enumerate(reader.pages):
        text = page.extract_text(extraction_mode='layout') or ''
        chunks.append(f'\n\n===== PAGE {i+1} =====\n{text}')
        preview = ' / '.join(text.splitlines())[:180]
        print(f'PAGE {i+1}: {len(text)} chars | {preview}')
    target = 'tmp/' + path.split('\\')[-1] + '.txt'
    with open(target, 'w', encoding='utf-8') as f: f.write(''.join(chunks))
    print('EXTRACTED:', target)

