import os
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BFS = """(areaId)=>{
  FC.state.flags.gateOpen=true; FC.state.xp=FC.xpForLevel(6);
  FC.Map.load(areaId); const M=FC.Map, step=4, W=Math.ceil(M.PW/step), H=Math.ceil(M.PH/step);
  const sp=M.current.spawn; const free=(x,y)=>!M.collides(x-5,y-6,10,6);
  const sx=Math.round(sp.x/step), sy=Math.round(sp.y/step);
  if(!free(sp.x,sp.y)) return {err:'spawn bloqueado '+JSON.stringify(sp)};
  const seen=new Uint8Array(W*H); const q=[[sx,sy]]; seen[sy*W+sx]=1;
  while(q.length){const [cx,cy]=q.pop(); for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=cx+dx,ny=cy+dy; if(nx<0||ny<0||nx>=W||ny>=H||seen[ny*W+nx])continue; if(!free(nx*step,ny*step))continue; seen[ny*W+nx]=1; q.push([nx,ny]);}}
  const reach=(x,y,r)=>{for(let j=0;j<H;j++)for(let i=0;i<W;i++){if(seen[j*W+i]&&Math.hypot(i*step-x,j*step-4-y)<=r)return true}return false};
  const out={props:[], exits:[], plots:[]};
  Object.values(M.props).forEach(p=>{ if(!reach(p.x,p.y,p.r)) out.props.push(p.id)});
  M.exits.forEach(e=>{ const cx=e.rect.x+e.rect.w/2, cy=e.rect.y+e.rect.h/2; let ok=false; for(let j=0;j<H&&!ok;j++)for(let i=0;i<W;i++){ const x=i*step,y=j*step; if(seen[j*W+i]&&x>=e.rect.x&&x<=e.rect.x+e.rect.w&&y>=e.rect.y&&y<=e.rect.y+e.rect.h){ok=true;break} } if(!ok) out.exits.push(e.id||e.to)});
  M.plots.forEach(p=>{ if(!reach(p.px+8,p.py+8,17)) out.plots.push(p.id)});
  out.cells=seen.reduce((a,b)=>a+b,0); out.props_n=Object.keys(M.props).length; out.exits_n=M.exits.length;
  return out;}"""
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width':1280,'height':800}); logs=[]
    pg.on('pageerror', lambda e: logs.append('PAGEERROR: '+str(e)))
    pg.goto('file://' + os.path.join(ROOT, 'index.html')); pg.wait_for_timeout(500)
    for a in ['farm','html','css','js']:
        print(a, pg.evaluate(BFS, a))
    # el punto de aparición al volver a la granja también debe estar libre
    print('spawns de regreso libres:', pg.evaluate("""()=>{FC.Map.load('farm'); return Object.entries(FC.Areas._farmBack).map(([k,s])=>[k, !FC.Map.collides(s.x-5,s.y-6,10,6)])}"""))
    # nivel bajo: salidas de la granja bloqueadas
    print('niveles bajos bloquean:', pg.evaluate("""()=>{FC.state.xp=0; FC.Map.load('farm'); return FC.Map.exits.map(e=>[e.id, !!(e.locked&&e.locked()), FC.Map.collides(e.rect.x+4, e.rect.y+10, 10, 6)])}"""))
    print(logs); b.close()
