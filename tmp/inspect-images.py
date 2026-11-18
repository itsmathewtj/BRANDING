import sys
sys.path.insert(0,'tmp/pypdf-7.1.0-py3-none-any.whl')
from pypdf import PdfReader
for path in [r'C:\Users\LENOVO\Downloads\EDE.pdf',r'C:\Users\LENOVO\Downloads\94a88471-c8d1-48b4-b87b-04e67f0815b4.pdf']:
 r=PdfReader(path); print(path, len(r.pages))
 for i,p in enumerate(r.pages):
  print(i+1, [(im.name,len(im.data),im.image.format,im.image.size) for im in p.images][:8])
