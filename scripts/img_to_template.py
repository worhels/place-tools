from PIL import Image
import sys, csv, math

# палитра Wplace (RGB)
PALETTE = [
    (0,0,0),(34,34,34),(85,85,85),(136,136,136),(221,221,221),(255,255,255),
    (102,0,17),(221,34,34),(255,102,34),(255,153,34),(255,187,34),(255,221,34),
    (255,255,153),(34,153,85),(34,221,85),(102,255,102),(34,119,136),(34,187,170),
    (34,102,204),(68,153,255),(68,221,221),(102,34,204),(153,102,255),(170,136,255),
    (187,34,187),(204,68,153),(221,68,119),(255,102,170),(255,153,187),
    (85,51,34),(153,102,51),(221,153,85)
]

def nearest_color(r,g,b):
    return min(PALETTE, key=lambda c: math.dist(c,(r,g,b)))

def run(src, out_png, out_csv, w, h):
    img = Image.open(src).convert('RGB').resize((w,h), Image.Resampling.NEAREST)
    q = Image.new("RGB",(w,h))
    px = q.load()
    with open(out_csv,'w',newline='') as f:
        wri = csv.writer(f); wri.writerow(['x','y','r','g','b'])
        for y in range(h):
            for x in range(w):
                r,g,b = img.getpixel((x,y))
                nr,ng,nb = nearest_color(r,g,b)
                px[x,y] = (nr,ng,nb)
                wri.writerow([x,y,nr,ng,nb])
    q.save(out_png)

if __name__=="__main__":
    if len(sys.argv)<6:
        print("usage: img_to_template.py src.png out.png out.csv width height"); sys.exit(1)
    _,src,out_png,out_csv,w,h=sys.argv
    run(src,out_png,out_csv,int(w),int(h))
