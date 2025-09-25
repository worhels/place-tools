# scripts/img_to_template.py
from PIL import Image
import sys,csv,math,os
PALETTE=[(0,0,0),(34,34,34),(85,85,85),(136,136,136),(221,221,221),(255,255,255),(102,0,17),(221,34,34),(255,102,34),(255,153,34),(255,187,34),(255,221,34),(255,255,153),(34,153,85),(34,221,85),(102,255,102),(34,119,136),(34,187,170),(34,102,204),(68,153,255),(68,221,221),(102,34,204),(153,102,255),(170,136,255),(187,34,187),(204,68,153),(221,68,119),(255,102,170),(255,153,187),(85,51,34),(153,102,51),(221,153,85)]
def nearest(c,palette,cache):
    if c in cache: return cache[c]
    r,g,b=c
    best=None;bd=10**9
    for p in palette:
        d=(r-p[0])*(r-p[0])+(g-p[1])*(g-p[1])+(b-p[2])*(b-p[2])
        if d<bd: bd=d;best=p
    cache[c]=best
    return best
def run(src,out_png,out_csv,w,h,alpha_thr=40):
    img=Image.open(src).convert('RGBA')
    img=img.resize((w,h),Image.Resampling.NEAREST)
    out=Image.new('RGB',(w,h))
    cache={}
    with open(out_csv,'w',newline='') as f:
        wri=csv.writer(f);wri.writerow(['x','y','r','g','b'])
        for y in range(h):
            for x in range(w):
                r,g,b,a=img.getpixel((x,y))
                if a<alpha_thr:
                    nr,ng,nb=(255,255,255)
                else:
                    nr,ng,nb=nearest((r,g,b),PALETTE,cache)
                out.putpixel((x,y),(nr,ng,nb))
                wri.writerow([x,y,nr,ng,nb])
    out.save(out_png)
if __name__=='__main__':
    if len(sys.argv)<6:
        print('usage: img_to_template.py src.png out.png out.csv width height');sys.exit(1)
    src,op,oc,ws,hs=sys.argv[1:6]
    if not os.path.exists(src): print('src not found');sys.exit(2)
    run(src,op,oc,int(ws),int(hs))
