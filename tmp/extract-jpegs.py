import sys, os
sys.path.insert(0,'tmp/pypdf-7.1.0-py3-none-any.whl')
from pypdf import PdfReader
reader=PdfReader(r'C:\Users\LENOVO\Downloads\94a88471-c8d1-48b4-b87b-04e67f0815b4.pdf')
outdir='tmp/pdf-pages'
os.makedirs(outdir,exist_ok=True)
for i,page in enumerate(reader.pages,1):
    resources=page['/Resources'].get_object()
    xobjects=resources['/XObject'].get_object()
    for name,ref in xobjects.items():
        obj=ref.get_object()
        if obj.get('/Subtype')=='/Image' and obj.get('/Filter')=='/DCTDecode':
            path=f'{outdir}/brochure-{i:02d}.jpg'
            with open(path,'wb') as f:f.write(obj._data)
            print(path, obj.get('/Width'), obj.get('/Height'), len(obj._data))
            break
