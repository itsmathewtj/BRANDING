import sys
sys.path.insert(0,'tmp/pypdf-7.1.0-py3-none-any.whl')
from pypdf import PdfReader
paths=[r'C:\Users\LENOVO\Downloads\EDE.pdf',r'C:\Users\LENOVO\Downloads\94a88471-c8d1-48b4-b87b-04e67f0815b4.pdf']
for path in paths:
 r=PdfReader(path);print('\n',path)
 for i,p in enumerate(r.pages):
  res=p.get('/Resources');xo=res.get('/XObject') if res else None; stats=[]
  if xo:
   for name,ref in xo.items():
    obj=ref.get_object()
    stats.append((str(name),str(obj.get('/Subtype')),obj.get('/Width'),obj.get('/Height'),str(obj.get('/Filter')),len(obj._data or b'')))
  print(i+1,stats[:10])
