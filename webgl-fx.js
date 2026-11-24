/*! WebGL effects runtime — <webgl-fx> element. Runs on the visitor GPU. */
/* WebGL effects engine — one fullscreen shader per effect, shared cursor/click/scroll layer and finish.
   Used by the studio and, unchanged, inside every exported embed. */
(function(G){'use strict';
const HEAD=`precision highp float;
uniform vec2 R;uniform float T;uniform vec3 M;uniform vec3 K;uniform vec4 P;uniform vec3 C0,C1,C2,C3;
uniform vec4 U1;uniform vec4 U2;uniform vec4 U3;uniform vec4 U4;uniform vec4 U5;uniform sampler2D H;
/* U1 = scale, seed, native cursor (0/1), cursor mode  ·  U2 = cursor radius, strength, click mode, scroll mode
   U3 = brightness, contrast, saturation, dim  ·  U4 = grain, vignette, dither, transparent  ·  U5 = fluted, pixelate, scanlines, scroll 0-1 */
float h21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
vec2 h22(vec2 p){float n=h21(p);return vec2(n,h21(p+n));}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(0,1)),h21(i+1.),f.x),f.y);}
float fbm(vec2 p){float s=0.,a=.5;for(int i=0;i<5;i++){s+=a*vn(p);p=p*2.03+17.1;a*=.5;}return s;}
float fbm3(vec2 p){float s=0.,a=.5;for(int i=0;i<3;i++){s+=a*vn(p);p=p*1.9+7.3;a*=.5;}return s/.875;}
vec3 ramp(float t){t=clamp(t,0.,1.);return t<.5?mix(C0,C1,t*2.):t<.8?mix(C1,C2,(t-.5)/.3):mix(C2,C3,(t-.8)/.2);}
vec3 MM;float HT=0.;
vec2 fc(){vec2 f=gl_FragCoord.xy;
 if(U5.y>0.){float s=max(2.,floor(U5.y*24.)*2.);f=(floor(f/s)+.5)*s;}
 if(U5.x>0.){float w=R.y*mix(.09,.02,U5.x);float k=fract(f.x/w);f.x+=(k-.5)*w*1.2*U5.x;f.y+=sin(k*3.1416)*w*.1*U5.x;}
 vec2 d=f-M.xy;float r=R.y*(.05+U2.x*.45);float g=M.z*exp(-dot(d,d)/(r*r))*U2.y;int m=int(U1.w+.5);
 if(m==2)f+=normalize(d+.001)*g*r*.6;if(m==3)f-=normalize(d+.001)*g*r*.45;
 if(m==4){float a=g*2.2;float c=cos(a),s=sin(a);f=M.xy+mat2(c,-s,s,c)*d;}
 if(m==6)f+=(M.xy-R*.5)*.06*M.z*U2.y;
 int kc=int(U2.z+.5);if(K.x<3.){vec2 e=f-K.yz;float L=length(e)/R.y;
  if(kc==5){float w=K.x*.6;f-=normalize(e+.001)*R.y*.035*sin((L-w)*40.)*exp(-pow((L-w)*10.,2.))*(1.-K.x/3.);}
  if(kc==7){float a=3.*exp(-L*L*14.)*pow(max(0.,1.-K.x/2.5),2.);float c=cos(a),s=sin(a);f=K.yz+mat2(c,-s,s,c)*e;}}
 HT=texture2D(H,gl_FragCoord.xy/R).r;
 if(int(U2.w+.5)==1)f.y-=U5.w*R.y*.35;
 vec2 c=R*.5;f=c+(f-c)/U1.x+U1.y*vec2(911.,577.);
 MM=vec3(c+(M.xy-c)/U1.x+U1.y*vec2(911.,577.),M.z*U1.z);return f;}
vec4 post(vec3 c){vec2 uv=gl_FragCoord.xy/R;
 vec2 d=gl_FragCoord.xy-M.xy;float r=R.y*(.05+U2.x*.45);int m=int(U1.w+.5);
 if(m==1){float g=M.z*exp(-dot(d,d)/(r*r*1.6));c*=mix(1.,.25+.75*g*2.,U2.y*M.z);c+=C3*g*.18*U2.y;}
 if(m==5)c=mix(c,C3,HT*.6*U2.y)+C3*HT*.15;
 int k=int(U2.z+.5);if(K.x<3.){vec2 e=gl_FragCoord.xy-K.yz;float L=length(e)/R.y;
  if(k==1)c+=C3*exp(-pow(L-K.x*.55,2.)*260.)*(1.-K.x/2.)*.45;
  if(k==2)c+=C3*exp(-L*L*18.)*max(0.,1.-K.x*1.4)*.6;
  if(k==4)for(int i=0;i<3;i++){float t=K.x-float(i)*.22;if(t>0.)c+=C3*exp(-pow(L-t*.38,2.)*1800.)*max(0.,1.-t/2.2)*.5;}
  if(k==5){float w=K.x*.6;c+=C3*exp(-pow((L-w)*10.,2.))*(1.-K.x/3.)*.12;}
  if(k==6){float an=atan(e.y,e.x);float id=floor(an*5.093);float sp=.45+.5*h21(vec2(id,K.y));float t=K.x*sp;
   c+=C3*step(.35,h21(vec2(id,K.z)))*smoothstep(t*.55,t,L)*smoothstep(t+.006,t-.006,L)*smoothstep(.12,0.,abs(fract(an*5.093)-.5)*L*5.)*max(0.,1.-K.x*.7)*1.4;}}
 if(int(U2.w+.5)==3)c=mix(c,C0,smoothstep(.15,1.,U5.w));
 c=(c-.5)*(1.+U3.y)+.5+U3.x*.5;float l=dot(c,vec3(.2126,.7152,.0722));c=mix(vec3(l),c,1.+U3.z);c*=1.-U3.w*.7;
 vec2 q=uv-.5;c*=1.-dot(q,q)*1.6*U4.y;
 if(U5.z>0.)c*=1.-U5.z*.35*(.5+.5*sin(gl_FragCoord.y*2.1));
 if(U4.z>0.){vec2 b=mod(floor(gl_FragCoord.xy/2.),4.);float bay=(mod(b.x+b.y*2.,4.)*4.+mod(b.x*2.+b.y,4.))/16.;float n=mix(64.,4.,U4.z);c=floor(c*n+bay)/n;}
 c+=(h21(gl_FragCoord.xy+fract(T*13.)*91.)-.5)*U4.x*.16;
 float a=1.;if(U4.w>.5){a=clamp(length(c-C0)*4.,0.,1.);c=a>0.?c:vec3(0);}
 return vec4(clamp(c,0.,1.)*a,a);}
`;
const VS='attribute vec2 a;void main(){gl_Position=vec4(a,0,1);}';
const hex=h=>{h=(h||'#000').replace('#','');if(h.length===3)h=[...h].map(x=>x+x).join('');return [0,2,4].map(i=>parseInt(h.slice(i,i+2),16)/255)};
const NAMES=['R','T','M','K','P','C0','C1','C2','C3','U1','U2','U3','U4','U5','H'];
const CUR=['native','light','repel','attract','swirl','trail','parallax','none'],CLK=['none','pulse','burst','shuffle','ripple','warp','sparks','spin'],SCR=['none','shift','speed','fade'];
const DEF={fx:'mesh',look:0,p:[.5,.5,.5,.5],scale:1,seed:0,c:['#07070b','#2b1c6e','#6a4fe0','#a9b6d8'],
  speed:.5,mstyle:'drift',cursor:'native',crad:.35,cstr:.6,ctrail:.45,csmooth:.5,cidle:false,click:'pulse',scroll:'none',
  bri:0,con:0,sat:0,dim:0,bgT:false,grain:.25,vig:.35,dither:0,fluted:0,pix:0,scan:0,v:1};

/* cursor: smoothed position + presence, and a 48×48 heat field for the Trail mode */
function Field(){this.p=[0,0];this.pres=0;this.had=false;this.idle=0;this.N=48;this.h=new Float32Array(48*48);this.u8=new Uint8Array(48*48);this.live=false}
Field.prototype.step=function(dt,w,h,c,ptr){const N=this.N;let tg=ptr;
  if(!tg&&c.cidle){this.idle+=dt;const t=this.idle*.35;tg=[w*(.5+.3*Math.sin(t*1.3)),h*(.5+.28*Math.sin(t*.83+1.1))]}else if(tg)this.idle=0;
  this.pres+=((tg?1:0)-this.pres)*(1-Math.exp(-dt*6));const prev=this.p.slice();
  if(tg){if(!this.had){this.p=tg.slice();prev[0]=tg[0];prev[1]=tg[1]}const k=3+(1-c.csmooth)*36,e=1-Math.exp(-dt*k);this.p[0]+=(tg[0]-this.p[0])*e;this.p[1]+=(tg[1]-this.p[1])*e}this.had=!!tg;
  let mx=0;if(c.cursor==='trail'){const f=Math.exp(-dt/(.05+c.ctrail*1.5)),H=this.h;for(let i=0;i<H.length;i++){H[i]*=f;if(H[i]>mx)mx=H[i]}
    if(tg){const R=Math.max(1,(.04+c.crad*.35)*N),as=w/h,x0=prev[0]/w*N,y0=prev[1]/h*N,x1=this.p[0]/w*N,y1=this.p[1]/h*N,st=Math.max(1,Math.ceil(Math.hypot((x1-x0)*as,y1-y0)/(R*.3)));
      for(let s=1;s<=st;s++){const cx=x0+(x1-x0)*s/st,cy=y0+(y1-y0)*s/st;for(let y=Math.max(0,Math.floor(cy-R*1.5));y<Math.min(N,cy+R*1.5);y++)for(let x=Math.max(0,Math.floor(cx-R*1.5/as));x<Math.min(N,cx+R*1.5/as);x++){
        const dx=(x+.5-cx)*as,dy=y+.5-cy,v=Math.exp(-(dx*dx+dy*dy)/(R*R*.5))*this.pres,i=y*N+x;if(v>H[i])H[i]=v;if(v>mx)mx=v}}}
    for(let i=0;i<H.length;i++)this.u8[i]=H[i]*255}
  this.live=!!tg||this.pres>.003||mx>.004;return this};

function Engine(canvas,o){o=o||{};const gl=canvas.getContext('webgl',{antialias:false,alpha:true,premultipliedAlpha:true,preserveDrawingBuffer:!!o.preserve});
  if(!gl)throw new Error('webgl');this.cv=canvas;this.gl=gl;gl.getExtension('OES_standard_derivatives');this.progs={};
  const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
  this.tex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,this.tex);gl.pixelStorei(gl.UNPACK_ALIGNMENT,1);
  [gl.TEXTURE_MIN_FILTER,gl.TEXTURE_MAG_FILTER].forEach(k=>gl.texParameteri(gl.TEXTURE_2D,k,gl.LINEAR));[gl.TEXTURE_WRAP_S,gl.TEXTURE_WRAP_T].forEach(k=>gl.texParameteri(gl.TEXTURE_2D,k,gl.CLAMP_TO_EDGE));
  this.setHeat(new Uint8Array(48*48),48)}
Engine.prototype.setHeat=function(u8,N){const gl=this.gl;gl.bindTexture(gl.TEXTURE_2D,this.tex);gl.texImage2D(gl.TEXTURE_2D,0,gl.LUMINANCE,N,N,0,gl.LUMINANCE,gl.UNSIGNED_BYTE,u8)};
Engine.prototype.program=function(id,src){if(this.progs[id])return this.progs[id];const gl=this.gl;
  const sh=(t,s)=>{const x=gl.createShader(t);gl.shaderSource(x,s);gl.compileShader(x);if(!gl.getShaderParameter(x,gl.COMPILE_STATUS))throw new Error(id+': '+gl.getShaderInfoLog(x));return x};
  const p=gl.createProgram();gl.attachShader(p,sh(gl.VERTEX_SHADER,VS));gl.attachShader(p,sh(gl.FRAGMENT_SHADER,'#extension GL_OES_standard_derivatives : enable\n'+HEAD+src+'\nvoid main(){vec2 F=fc();gl_FragColor=post(fx(F));}'));
  gl.bindAttribLocation(p,0,'a');gl.linkProgram(p);const u={};NAMES.forEach(n=>u[n]=gl.getUniformLocation(p,n));return this.progs[id]={p,u}};
/* s: {src,id,cfg,t,w,h,m:[x,y,pres] px y-up,k:[age,x,y],scroll,blend} */
Engine.prototype.render=function(s){const gl=this.gl,cv=this.cv,c=s.cfg;if(cv.width!==s.w||cv.height!==s.h){cv.width=s.w;cv.height=s.h}
  const {p,u}=this.program(s.id,s.src);gl.viewport(0,0,s.w,s.h);gl.useProgram(p);gl.bindBuffer(gl.ARRAY_BUFFER,null);
  gl.enableVertexAttribArray(0);// buffer stays bound from init
  gl.uniform2f(u.R,s.w,s.h);gl.uniform1f(u.T,s.t);gl.uniform3fv(u.M,s.m||[0,0,0]);gl.uniform3fv(u.K,s.k||[9,0,0]);gl.uniform4fv(u.P,c.p);
  const cs=c.c.map(hex);['C0','C1','C2','C3'].forEach((n,i)=>gl.uniform3fv(u[n],cs[i]));
  const ci=CUR.indexOf(c.cursor);gl.uniform4f(u.U1,Math.max(.2,c.scale),c.seed,ci===0?1:0,ci<0?7:ci);
  gl.uniform4f(u.U2,c.crad,c.cstr,Math.max(0,CLK.indexOf(c.click)),Math.max(0,SCR.indexOf(c.scroll)));
  gl.uniform4f(u.U3,c.bri,c.con,c.sat,c.dim);gl.uniform4f(u.U4,c.grain,c.vig,c.dither,c.bgT?1:0);gl.uniform4f(u.U5,c.fluted,c.pix,c.scan,s.scroll||0);
  gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,this.tex);gl.uniform1i(u.H,0);
  if(s.blend!=null){gl.enable(gl.BLEND);gl.blendColor(0,0,0,s.blend);gl.blendFunc(gl.CONSTANT_ALPHA,gl.ONE_MINUS_CONSTANT_ALPHA)}else gl.disable(gl.BLEND);
  if(!this.vb){this.vb=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,this.vb);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW)}
  gl.bindBuffer(gl.ARRAY_BUFFER,this.vb);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);gl.drawArrays(gl.TRIANGLES,0,3);gl.disable(gl.BLEND)};

/* time with motion style: drift = steady, pulse = breathing speed, still = frozen frame */
function clock(c,t){const sp=.15+c.speed*1.7;if(c.mstyle==='still')return 20+c.seed*3;const x=t*sp;return c.mstyle==='pulse'?x+Math.sin(t*1.1)*.6*sp:x}

/* a live player: mounts an effect into any element, used by <webgl-fx> and by exported code */
function mount(el,src,cfg,o){o=o||{};cfg=Object.assign({},DEF,cfg);const cv=document.createElement('canvas');cv.style.cssText='position:absolute;inset:0;width:100%;height:100%;display:block';
  if(getComputedStyle(el).position==='static')el.style.position='relative';const cc=cfg.c.map(x=>x);el.style.background=`radial-gradient(120% 90% at 30% 20%, ${cc[2]} 0%, ${cc[1]} 40%, ${cc[0]} 80%)`;
  let eng;try{eng=new Engine(cv)}catch(e){return null}el.appendChild(cv);const f=new Field(),RM=matchMedia('(prefers-reduced-motion: reduce)');
  let ptr=null,vis=true,raf=0,last=0,t=0,click=[9,0,0],q=1,slow=0,scroll=0,vel=0;
  const pos=e=>{const r=cv.getBoundingClientRect(),d=cv.width/Math.max(1,r.width);return [(e.clientX-r.left)*d,(r.bottom-e.clientY)*d]};
  const inside=e=>{const r=el.getBoundingClientRect();return e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom};
  const mv=e=>{ptr=inside(e)?pos(e):null;kick()},dn=e=>{if(inside(e)){const p=pos(e);click=[0,p[0],p[1]];if(cfg.click==='shuffle'){cfg.c=[cfg.c[0],cfg.c[3],cfg.c[1],cfg.c[2]]}kick()}};
  addEventListener('pointermove',mv,{passive:true});addEventListener('pointerdown',dn,{passive:true});
  const sc=()=>{const r=el.getBoundingClientRect();const s=Math.min(1,Math.max(0,-r.top/Math.max(1,r.height)));vel=Math.min(1,vel+Math.abs(s-scroll)*6);scroll=s;kick()};if(cfg.scroll!=='none')addEventListener('scroll',sc,{passive:true});
  const io=new IntersectionObserver(e=>{vis=e[0].isIntersecting;kick()});io.observe(el);document.addEventListener('visibilitychange',()=>kick());
  function frame(now){raf=0;if(!vis||document.hidden)return;const dt=last?Math.min(.05,(now-last)/1000):1/60;last=now;
    if(dt>1/30)slow++;else slow=Math.max(0,slow-.5);if(slow>40&&q>.5){q-=.15;slow=0}
    const dpr=Math.min(devicePixelRatio||1,o.maxDpr||2)*q,w=Math.max(2,Math.round(el.clientWidth*dpr)),h=Math.max(2,Math.round(el.clientHeight*dpr));
    f.step(dt,w,h,cfg,ptr&&[ptr[0]*w/cv.width,ptr[1]*h/cv.height]);if(cfg.cursor==='trail')eng.setHeat(f.u8,48);click[0]+=dt;
    t+=RM.matches?0:dt*(cfg.scroll==='speed'?1+vel*12:1);vel*=Math.exp(-dt*2.5);
    eng.render({id:'fx',src,cfg,t:clock(cfg,t+(o.t0||0)),w,h,m:[f.p[0],f.p[1],f.pres],k:click,scroll});
    if(!RM.matches||f.live||click[0]<3)raf=requestAnimationFrame(frame);else last=0}
  function kick(){if(!raf&&vis&&!document.hidden)raf=requestAnimationFrame(frame)}kick();
  return {eng,cfg,set(c){Object.assign(cfg,c);kick()},destroy(){cancelAnimationFrame(raf);io.disconnect();removeEventListener('pointermove',mv);removeEventListener('pointerdown',dn);removeEventListener('scroll',sc);cv.remove()}}}

G.WebGLFX={HEAD,Engine,Field,mount,clock,hex,DEF,CUR,CLK,SCR};
})(window);

/* Effect library. One entry = one effect: name, category, weight, four sliders (P.xyzw, 0–1), three looks and the shader.
   Shader: vec3 fx(vec2 F) — F is the pixel after cursor/scale warps; MM = cursor (xy px, z = presence); T = time. */
(function(G){'use strict';
const PAL={
 violet:['#07070b','#2b1c6e','#6a4fe0','#c3c8e6'],ink:['#060708','#13283d','#3d6f8e','#cfd8de'],graphite:['#080808','#26262a','#6b6b73','#e6e4dd'],
 moss:['#060806','#1b2a1e','#4f7a5c','#d8dccb'],arctic:['#05080c','#123048','#4c8fb8','#e4f1f8'],steel:['#0a0b0d','#2a3038','#7a8794','#eef1f4'],
 midnight:['#04050b','#0f1636','#3a4cb0','#b9c4ff'],olive:['#0a0a06','#2c2c18','#7d7a46','#ebe7c9'],clay:['#0c0807','#3a221c','#a0624e','#f0dccf'],
 ocean:['#03090b','#0b3440','#1f8a8a','#d4f2ee'],paper:['#efece4','#d6d0c2','#8b8578','#1b1a17'],sand:['#f2efe8','#e2d6c3','#b39f80','#2a241c']};
const FX=[
/* ---------- Gradients ---------- */
{id:'mesh',name:'Mesh',cat:'Gradients',w:'Light',params:[['Softness',.5],['Spread',.5],['Glow',.5],['Drift',.5]],
 looks:[{pal:'violet'},{pal:'arctic',p:[.7,.6,.4,.4]},{pal:'clay',p:[.4,.4,.6,.6]}],
 src:`vec3 fx(vec2 F){float a=R.x/R.y;vec2 p=vec2(F.x/R.y,F.y/R.y);vec2 m=MM.xy/R.y;float t=T*.12;float sp=.6+P.y*.8;
 vec2 c0=vec2(a*.5+(-.25*a+.12*sin(t*1.3))*sp,.5+(-.2+.1*cos(t*1.1))*sp),c1=vec2(a*.5+(.25*a+.1*cos(t*.9))*sp,.5+(-.25+.12*sin(t*1.4))*sp),
 c2=vec2(a*.5+(.1*a+.14*sin(t*.7+2.))*sp,.5+(.25+.08*cos(t*1.2))*sp),c3=vec2(a*.5+(-.3*a+.1*cos(t+1.))*sp,.5+(.28+.1*sin(t*.8))*sp);
 c2=mix(c2,m,.35*MM.z);float k=2.+(1.-P.x)*3.;
 float w0=1./pow(length(p-c0)+.08,k),w1=1./pow(length(p-c1)+.08,k),w2=1./pow(length(p-c2)+.08,k),w3=1./pow(length(p-c3)+.08,k);
 vec3 col=(C1*w0+C2*w1+C3*(.6+P.z*.4)*w2+mix(C1,C2,.3)*w3)/(w0+w1+w2+w3);
 return mix(col,C0,smoothstep(.1,1.2,length(p-vec2(a*.5,.5)))*.6);}`},
{id:'silk',name:'Silk',cat:'Gradients',w:'Medium',params:[['Folds',.5],['Depth',.5],['Sheen',.5],['Twist',.5]],
 looks:[{pal:'graphite'},{pal:'violet',p:[.4,.6,.6,.5]},{pal:'sand',p:[.6,.5,.4,.4]}],
 src:`vec3 fx(vec2 F){vec2 p=F/R.y;float calm=1.-.7*MM.z*exp(-dot(F-MM.xy,F-MM.xy)/(R.y*R.y*.06));
 vec2 q=p*1.1+vec2(T*.025,-T*.015);float n=fbm3(q)+.5*fbm3(q*2.3+3.);float a=(p.x*cos(P.w)+p.y*sin(P.w))*(2.+P.x*4.)+n*(3.+P.y*5.)*calm;
 float s=sin(a);float sh=pow(.5+.5*sin(a+.9),6.+P.z*18.);float shade=.5+.5*s;
 return mix(C0,mix(C1,C2,shade),.35+.65*shade)+C3*sh*(.15+P.z*.45);}`},
{id:'grain',name:'Grain blur',cat:'Gradients',w:'Light',params:[['Blur',.5],['Grain',.6],['Contrast',.5],['Drift',.5]],
 looks:[{pal:'ocean'},{pal:'clay',p:[.6,.7,.4,.4]},{pal:'paper',p:[.5,.5,.6,.5]}],
 src:`vec3 fx(vec2 F){float a=R.x/R.y;vec2 p=F/R.y;vec2 m=MM.xy/R.y;float t=T*(.05+P.w*.15);
 vec2 b1=vec2(a*(.3+.15*sin(t*1.7)),.35+.15*cos(t*1.3)),b2=vec2(a*(.7+.12*cos(t*1.1)),.6+.12*sin(t*1.9)),b3=vec2(a*(.5+.2*sin(t*.8+2.)),.15+.1*cos(t*1.5));
 b2=mix(b2,m,.3*MM.z);float r=.35+P.x*.4;float g1=exp(-dot(p-b1,p-b1)/(r*r*.4)),g2=exp(-dot(p-b2,p-b2)/(r*r*.35)),g3=exp(-dot(p-b3,p-b3)/(r*r*.5));
 vec3 col=C0;col=mix(col,C1,g1);col=mix(col,C2,g2*(.6+P.z*.4));col=mix(col,C3*.9,g3*.6*P.z);
 return col+(h21(F+fract(T)*7.)-.5)*P.y*.07;}`},
/* ---------- Patterns ---------- */
{id:'dots',name:'Dot grid',cat:'Patterns',w:'Light',params:[['Spacing',.4],['Size',.4],['Wave',.5],['Glow',.5]],
 looks:[{pal:'violet'},{pal:'graphite',p:[.3,.3,.3,.4]},{pal:'paper',p:[.5,.5,.5,.3]}],
 src:`vec3 fx(vec2 F){float s=R.y*(.014+P.x*.03);vec2 g=floor(F/s);vec2 f=fract(F/s)-.5;vec2 cp=(g+.5)*s;
 float dm=length(cp-MM.xy)/R.y;float near=MM.z*exp(-dm*dm*28.);float wave=fbm3(g*.08+vec2(T*.08,-T*.05));
 float r=.05+P.y*.1+.06*wave*P.z*2.+.28*near;float dt=smoothstep(r,r-.06,length(f));
 vec3 bg=mix(C0,C1*.5,F.y/R.y*.6);vec3 dc=mix(C2*.55,C3,clamp(wave*.6*P.w*2.+near*1.2,0.,1.));return mix(bg,dc,dt);}`},
{id:'lines',name:'Line grid',cat:'Patterns',w:'Light',params:[['Density',.5],['Horizon',.5],['Speed',.5],['Fade',.5]],
 looks:[{pal:'midnight'},{pal:'steel',p:[.6,.4,.3,.6]},{pal:'sand',p:[.4,.55,.5,.5]}],
 src:`vec3 fx(vec2 F){vec2 p=(F-vec2(R.x*.5,0.))/R.y;float hz=.45+P.y*.3;float y=hz-p.y;if(y<=.003)return mix(C0,C1,smoothstep(0.,.4,p.y-hz)*.0+.15);
 float z=.35/y;float bump=MM.z*.35*exp(-dot(F-MM.xy,F-MM.xy)/(R.y*R.y*.03));vec2 g=vec2(p.x*z*(2.+P.x*4.),z*(2.+P.x*4.)+T*(.2+P.z*1.5));g.x+=bump*sign(p.x-(MM.x-R.x*.5)/R.y)*3.;
 vec2 w=fwidth(g);vec2 l=1.-smoothstep(vec2(0.),w*1.3,min(fract(g),1.-fract(g)));float ln=max(l.x,l.y);float fade=exp(-z*(.15+P.w*.5));
 vec3 col=mix(C0,C1*.6,smoothstep(.0,hz,p.y));col+=C2*ln*fade*.9+C3*exp(-pow((p.y-hz)*14.,2.))*.25;return col;}`},
{id:'contours',name:'Contours',cat:'Patterns',w:'Medium',params:[['Lines',.5],['Scale',.5],['Weight',.4],['Relief',.5]],
 looks:[{pal:'violet'},{pal:'ink',p:[.6,.4,.3,.5]},{pal:'paper',p:[.4,.6,.5,.4]}],
 src:`vec3 fx(vec2 F){vec2 p=F/R.y*(.8+P.y*1.4);vec2 m=MM.xy/R.y*(.8+P.y*1.4);float h=fbm3(p+vec2(T*.025,T*.015));float dm=length(p-m);h+=.22*MM.z*exp(-dm*dm*6.);
 float n=h*(12.+P.x*24.);float fw=fwidth(n);float dl=min(fract(n),1.-fract(n));float th=.8+P.z*1.6;
 float line=1.-smoothstep(0.,fw*th,dl);float n5=n/5.;float major=1.-smoothstep(0.,fw*th*1.4,min(fract(n5),1.-fract(n5))*5.);
 vec3 c=mix(C0,C1*.6,smoothstep(.2,.9,h)*P.w*1.6);c=mix(c,C2,line*.45);return mix(c,C3,major*.55);}`},
{id:'halftone',name:'Halftone',cat:'Patterns',w:'Light',params:[['Cell',.4],['Angle',.5],['Tone',.5],['Ink',.5]],
 looks:[{pal:'paper'},{pal:'ink',p:[.3,.5,.6,.6]},{pal:'clay',p:[.5,.3,.5,.5]}],
 src:`mat2 inverse2(mat2 m){return mat2(m[0][0],m[1][0],m[0][1],m[1][1]);}
 vec3 fx(vec2 F){float an=.2+P.y*1.2;mat2 r=mat2(cos(an),-sin(an),sin(an),cos(an));float s=R.y*(.012+P.x*.03);vec2 q=r*F/s;vec2 g=floor(q)+.5;vec2 cp=inverse2(r)*g*s;
 float tone=fbm3(cp/R.y*2.+vec2(T*.04,-T*.03))*(.6+P.z*.8)+.35*MM.z*exp(-dot(cp-MM.xy,cp-MM.xy)/(R.y*R.y*.03));
 float rad=clamp(tone-.15,0.,1.)*.75;float d=length(q-g);float a=fwidth(d);float dot=1.-smoothstep(rad-a,rad+a,d);
 return mix(C0,mix(C2,C3,P.w),dot);}`},
{id:'cells',name:'Cells',cat:'Patterns',w:'Medium',params:[['Size',.5],['Edge',.4],['Fill',.5],['Motion',.5]],
 looks:[{pal:'steel'},{pal:'violet',p:[.4,.5,.6,.5]},{pal:'moss',p:[.6,.3,.4,.4]}],
 src:`vec3 fx(vec2 F){float s=R.y*(.08+P.x*.14);vec2 p=F/s;vec2 i=floor(p);float d1=9.,d2=9.;vec2 best=vec2(0);
 for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++){vec2 c=i+vec2(x,y);vec2 o=h22(c);o=.5+.4*sin(T*(.2+P.w*.8)+6.28*o);float d=length(p-c-o);if(d<d1){d2=d1;d1=d;best=c;}else if(d<d2)d2=d;}
 float e=d2-d1;float edge=1.-smoothstep(.0,.03+P.y*.12,e);float hl=MM.z*exp(-dot((best+.5)*s-MM.xy,(best+.5)*s-MM.xy)/(R.y*R.y*.02));
 vec3 fill=ramp(h21(best)*P.z+.1);return mix(fill*(.4+.6*P.z)+C3*hl*.35,C3*.8,edge*.8);}`},
/* ---------- Particles ---------- */
{id:'constellation',name:'Constellation',cat:'Particles',w:'Heavy',params:[['Density',.5],['Reach',.5],['Glow',.5],['Drift',.5]],
 looks:[{pal:'midnight'},{pal:'graphite',p:[.4,.6,.4,.4]},{pal:'arctic',p:[.6,.4,.6,.6]}],
 src:`vec2 pt(vec2 c){vec2 r=h22(c);return c+.5+.38*vec2(sin(T*(.35+P.w*.8)*(.6+r.y)+r.x*6.28),cos(T*(.3+P.w*.7)*(.6+r.x)+r.y*6.28));}
 float seg(vec2 p,vec2 a,vec2 b){vec2 pa=p-a,ba=b-a;float h=clamp(dot(pa,ba)/dot(ba,ba),0.,1.);return length(pa-ba*h);}
 vec3 fx(vec2 F){float S=R.y/(4.+P.x*8.);vec2 p=F/S;vec2 m=MM.xy/S;vec2 o=vec2(T*.07,T*.03)*(.4+P.w);p+=o;m+=o;vec2 c=floor(p);vec2 Q[9];float dots=0.,ln=0.;float lw=.018*(8./(4.+P.x*8.));
 for(int k=0;k<9;k++){vec2 q=pt(c+vec2(mod(float(k),3.)-1.,floor(float(k)/3.)-1.));Q[k]=q;float d=length(p-q);dots+=smoothstep(.06,0.,d)+smoothstep(.3,0.,d)*.12*P.z;}
 float rc=1.1+P.y*.8;for(int k=0;k<9;k++){if(k==4)continue;ln+=smoothstep(rc,rc*.4,length(Q[4]-Q[k]))*smoothstep(lw,0.,seg(p,Q[4],Q[k]));}
 ln+=smoothstep(rc,rc*.4,length(Q[1]-Q[3]))*smoothstep(lw,0.,seg(p,Q[1],Q[3]))+smoothstep(rc,rc*.4,length(Q[5]-Q[7]))*smoothstep(lw,0.,seg(p,Q[5],Q[7]));
 float ml=0.;for(int k=0;k<9;k++)ml+=MM.z*smoothstep(rc*1.2,.3,length(m-Q[k]))*smoothstep(lw*1.4,0.,seg(p,m,Q[k]));
 return mix(C0,C1*.5,F.y/R.y)+C2*ln*.55+C3*dots+C3*ml*.8+C3*MM.z*smoothstep(.08,0.,length(p-m));}`},
{id:'stars',name:'Stars',cat:'Particles',w:'Medium',params:[['Density',.5],['Twinkle',.5],['Depth',.5],['Nebula',.4]],
 looks:[{pal:'midnight'},{pal:'graphite',p:[.6,.3,.4,.2]},{pal:'ocean',p:[.4,.6,.6,.6]}],
 src:`vec3 fx(vec2 F){vec2 p=F/R.y;vec2 par=(MM.xy/R-.5)*MM.z;vec3 col=mix(C0,C1*.6,fbm3(p*1.5+T*.01)*P.w*1.4);
 for(int i=0;i<3;i++){float fi=float(i);float sc=(30.+fi*30.)*(.6+P.x*.8);vec2 q=(p+par*(.01+fi*.02*P.z*2.)+vec2(T*.004*(fi+1.),0.))*sc;vec2 g=floor(q);vec2 o=h22(g+fi*13.);
  float pr=step(.55,h21(g+fi*7.1));float d=length(fract(q)-o);float tw=.6+.4*sin(T*(1.+P.y*3.)+h21(g)*20.);float sz=.05+.06*h21(g+3.);col+=mix(C2,C3,h21(g+9.))*pr*(smoothstep(sz,0.,d)*1.4+smoothstep(sz*4.,0.,d)*.15)*tw*(1.-fi*.25);}
 return col;}`},
{id:'bokeh',name:'Bokeh',cat:'Particles',w:'Medium',params:[['Size',.5],['Amount',.5],['Blur',.5],['Rise',.4]],
 looks:[{pal:'ocean'},{pal:'clay',p:[.6,.4,.6,.3]},{pal:'violet',p:[.4,.6,.4,.5]}],
 src:`vec3 fx(vec2 F){vec2 p=F/R.y;vec3 col=mix(C0,C1*.7,p.y*.6);
 for(int i=0;i<2;i++){float fi=float(i);float sc=(3.+fi*3.)/(.5+P.x);vec2 q=(p+vec2(sin(T*.07+fi)*.05,-T*.02*(1.+P.w*3.)*(fi+1.))+(MM.xy/R-.5)*MM.z*.03*(fi+1.))*sc;vec2 g0=floor(q);
  for(int j=0;j<9;j++){vec2 g=g0+vec2(mod(float(j),3.)-1.,floor(float(j)/3.)-1.);vec2 o=.2+.6*h22(g+fi*5.);float on=step(1.-P.y*.8,h21(g+fi*3.3));float r=.25+.3*h21(g+1.7);
   float d=length(q-g-o);float soft=.02+P.z*.15;float disc=smoothstep(r,r-soft,d);float rim=smoothstep(r,r-.025,d)-smoothstep(r-.025,r-.09,d);float tw=.75+.25*sin(T*.8+h21(g)*20.);
   col+=mix(C2,C3,h21(g))*on*(disc*.28+rim*.12*(1.-P.z))*(1.-fi*.3)*tw;}}
 return col;}`},
{id:'flow',name:'Flow lines',cat:'Particles',w:'Medium',params:[['Lines',.5],['Curl',.5],['Length',.5],['Weight',.4]],
 looks:[{pal:'graphite'},{pal:'arctic',p:[.6,.4,.6,.3]},{pal:'sand',p:[.4,.6,.5,.5]}],
 src:`vec3 fx(vec2 F){vec2 p=F/R.y;vec2 d=F-MM.xy;float push=MM.z*exp(-dot(d,d)/(R.y*R.y*.04));
 float w=fbm3(p*(.6+P.y*.8)+vec2(T*.03,0.))*(1.5+P.y*2.)+push*.6;float n=18.+P.x*40.;float v=(p.y+w*.35)*n;
 float fw=fwidth(v);float ln=1.-smoothstep(0.,fw*(.7+P.w*1.8),min(fract(v),1.-fract(v)));
 float fade=.35+.65*smoothstep(.2,.8,fbm3(vec2(p.x*(1.5-P.z),floor(v)*.37)+T*.05));return mix(mix(C0,C1*.6,p.y),mix(C2,C3,push+.2),ln*fade*.85);}`},
/* ---------- Light ---------- */
{id:'rays',name:'Rays',cat:'Light',w:'Medium',params:[['Rays',.5],['Spread',.5],['Dust',.5],['Glow',.5]],
 looks:[{pal:'violet'},{pal:'arctic',p:[.4,.6,.6,.6]},{pal:'olive',p:[.6,.4,.4,.5]}],
 src:`vec3 fx(vec2 F){float a=R.x/R.y;vec2 p=F/R.y;vec2 src=vec2(a*.5+.18*sin(T*.11)+(MM.x/R.y-a*.5)*.4*MM.z,1.3);vec2 d=p-src;float ang=atan(d.x,-d.y)+.08*sin(T*.17);float r=length(d);
 float k=5.+P.x*14.;float sh=pow(vn(vec2(ang*k,T*.25)),2.5)+.7*pow(vn(vec2(ang*k*2.3+7.,T*.4)),3.)+.5*pow(vn(vec2(ang*k*5.+3.,T*.7)),4.);
 float trav=.55+.45*vn(vec2(ang*k*.7,r*2.5-T*.9));float cone=smoothstep(.5+P.y,0.,abs(ang));float fall=exp(-r*.9)*cone;float haze=fbm3(p*2.+vec2(T*.05,-T*.03));
 vec3 col=C0+C1*fall*(.5+.5*haze)*.7+C2*sh*trav*fall*1.1+C3*pow(sh*trav,3.)*fall*.5+C3*exp(-r*r*4.)*P.w*.5;
 for(int l=0;l<2;l++){float fl=float(l);float sc=18.+fl*16.;vec2 dg=p*sc+vec2(T*(.15+fl*.1)+sin(T*.3+fl),T*(.25+fl*.2));vec2 di=floor(dg);vec2 rr=h22(di+fl*7.);
  float dd=length(fract(dg)-.15-.7*rr);float tw=.5+.5*sin(T*2.+rr.x*30.);col+=C3*smoothstep(.07-fl*.02,0.,dd)*step(1.-P.z*.6,h21(di+3.1+fl))*(fall*2.2+.04)*(.3+sh)*tw;}
 return col;}`},
{id:'beams',name:'Beams',cat:'Light',w:'Light',params:[['Beams',.5],['Width',.5],['Angle',.6],['Haze',.5]],
 looks:[{pal:'steel'},{pal:'midnight',p:[.6,.4,.4,.6]},{pal:'sand',p:[.4,.6,.6,.4]}],
 src:`vec3 fx(vec2 F){vec2 p=F/R.y;vec2 m=MM.xy/R.y;float an=.4+P.z*1.2;vec2 n=vec2(cos(an),sin(an));vec2 t=vec2(-n.y,n.x);float x=dot(p,n),y=dot(p,t),mx=dot(m,n);
 vec3 col=C0+C1*fbm3(p*2.+T*.03)*P.w*.6;float near=MM.z*exp(-dot(p-m,p-m)*6.);
 float cnt=2.+floor(P.x*5.);for(int i=0;i<7;i++){float fi=float(i);if(fi>=cnt)break;float h=h21(vec2(fi,2.));
  float pos=(fi+.5)/cnt*2.2-.3+(h21(vec2(fi,1.))-.5)*.3+.18*sin(T*.12*(.5+h)+h*6.28);float d=mx-pos;pos+=MM.z*.6*d*exp(-d*d*5.);
  float w=.025+P.y*.11*(.4+.6*h21(vec2(fi,3.)));float b=exp(-pow((x-pos)/w,2.))+.35*exp(-pow((x-pos)/(w*3.),2.));
  float fl=.65+.35*vn(vec2(y*1.2-T*.25,fi*7.));col+=mix(C2,C3,h21(vec2(fi,4.)))*b*fl*(.3+near*.5);}
 return col;}`},
{id:'spot',name:'Spotlight',cat:'Light',w:'Light',params:[['Size',.5],['Softness',.5],['Haze',.4],['Drift',.5]],
 looks:[{pal:'graphite'},{pal:'clay',p:[.6,.6,.5,.4]},{pal:'arctic',p:[.4,.4,.4,.6]}],
 src:`vec3 fx(vec2 F){vec2 c=R*.5+vec2(sin(T*.3),cos(T*.23))*R.y*.15*P.w*2.;c=mix(c,MM.xy,MM.z);float r=R.y*(.2+P.x*.4);float d=length(F-c)/r;
 float l=pow(smoothstep(1.2,0.,d),1.5+P.y*2.);float haze=fbm3(F/R.y*2.+T*.04)*P.z;return C0+C1*haze*.6+mix(C1,C2,l)*l*.75+C3*l*l*.25;}`},
{id:'prism',name:'Prism',cat:'Light',w:'Medium',params:[['Spread',.5],['Angle',.5],['Sharp',.5],['Glow',.5]],
 looks:[{pal:'graphite'},{pal:'paper',p:[.5,.5,.6,.4]},{pal:'midnight',p:[.6,.4,.4,.6]}],
 src:`vec3 fx(vec2 F){vec2 p=(F-R*.5)/R.y;float an=(P.y-.5)*1.6+.15*sin(T*.12)+(MM.x/R.x-.5)*MM.z*.6;vec2 n=vec2(cos(an),sin(an));
 float x=dot(p,n),y=dot(p,vec2(-n.y,n.x));float fan=.03+P.x*.12;float w=(.03+(1.-P.z)*.08)*(1.+max(0.,y+.5)*1.5);float s=fan*(y+.5);
 vec3 b=vec3(exp(-pow((x-s)/w,2.)),exp(-pow(x/w,2.)),exp(-pow((x+s)/w,2.)));vec3 tint=(b.r*C2+b.g*C3*.7+b.b*C1*1.4)*.55;
 float glow=exp(-x*x*8.)*P.w*.25*(.6+.4*fbm3(p*3.+T*.05));return C0+tint*smoothstep(-.6,.2,y)+C2*glow;}`},
/* ---------- Texture ---------- */
{id:'smoke',name:'Smoke',cat:'Texture',w:'Heavy',params:[['Density',.5],['Detail',.5],['Contrast',.5],['Flow',.5]],
 looks:[{pal:'violet'},{pal:'ink',p:[.6,.5,.5,.4]},{pal:'graphite',p:[.4,.6,.6,.5]}],
 src:`vec3 fx(vec2 F){vec2 p=F/R.y*(1.+P.y*1.5);vec2 m=MM.xy/R.y*(1.+P.y*1.5);vec2 dm=p-m;p+=normalize(dm+1e-4)*MM.z*exp(-dot(dm,dm)*4.)*.35;
 float t=T*(.02+P.w*.06);vec2 q=vec2(fbm(p+vec2(0,t)),fbm(p+vec2(5.2,1.3)-t));vec2 r=vec2(fbm(p+2.*q+vec2(1.7,9.2)+t*.6),fbm(p+2.*q+vec2(8.3,2.8)));float f=fbm(p+1.6*r);
 float v=smoothstep(.15+(1.-P.x)*.2,.85,f*f*1.9);v=pow(v,.6+P.z);vec3 c=mix(C0,C1,smoothstep(0.,.6,v));c=mix(c,C2,smoothstep(.45,.9,v)*.7);return c+C3*pow(v,4.)*.35;}`},
{id:'fog',name:'Fog',cat:'Texture',w:'Medium',params:[['Layers',.5],['Density',.5],['Height',.5],['Drift',.5]],
 looks:[{pal:'steel'},{pal:'moss',p:[.6,.6,.4,.4]},{pal:'paper',p:[.5,.4,.5,.5]}],
 src:`vec3 fx(vec2 F){vec2 p=F/R.y;vec3 col=mix(C0,C1,p.y*.5);float L=2.+floor(P.x*3.);
 for(int i=0;i<5;i++){float fi=float(i);if(fi>=L)break;vec2 q=p*(1.+fi*.6)+vec2(T*.02*(fi+1.)*(.5+P.w),fi*3.)+(MM.xy/R-.5)*MM.z*.04*(fi+1.);
  float n=fbm3(q*1.3);float h=smoothstep(.2+P.z*.5+fi*.05,-.2,p.y-n*.4);col=mix(col,mix(C2,C3,fi/L),h*(.18+P.y*.3));}
 return col;}`},
{id:'dither',name:'Dither',cat:'Texture',w:'Light',params:[['Pixel',.4],['Levels',.3],['Scale',.5],['Drift',.5]],
 looks:[{pal:'paper'},{pal:'midnight',p:[.3,.4,.5,.5]},{pal:'olive',p:[.5,.2,.4,.4]}],
 src:`vec3 fx(vec2 F){float s=2.+floor(P.x*8.)*2.;vec2 g=floor(F/s);vec2 cp=(g+.5)*s;float v=fbm3(cp/R.y*(1.+P.z*2.)+vec2(T*.04*(.5+P.w),T*.02));
 v+=.35*MM.z*exp(-dot(cp-MM.xy,cp-MM.xy)/(R.y*R.y*.03));vec2 b=mod(g,4.);float bay=(mod(b.x+b.y*2.,4.)*4.+mod(b.x*2.+b.y,4.))/16.;
 float n=2.+floor(P.y*4.);float q=floor(clamp(v*1.3-.1,0.,.999)*n+bay)/n;return ramp(q*.85+.05);}`},
{id:'scan',name:'Scanlines',cat:'Texture',w:'Light',params:[['Lines',.5],['Glow',.5],['Roll',.4],['Noise',.4]],
 looks:[{pal:'moss'},{pal:'midnight',p:[.6,.5,.5,.3]},{pal:'graphite',p:[.4,.4,.3,.6]}],
 src:`vec3 fx(vec2 F){vec2 p=F/R.y;float d=exp(-dot(F-MM.xy,F-MM.xy)/(R.y*R.y*.02))*MM.z;float y=F.y+sin(F.x*.02+T)*d*8.;
 float lines=.5+.5*sin(y*(.3+P.x*.9));float roll=smoothstep(.0,.15,abs(fract(p.y*.5-T*.05*P.z*2.)-.5));float base=fbm3(p*2.+T*.05)*(.6+P.y*.6);
 float n=(h21(floor(F/2.)+floor(T*24.))-.5)*P.w*.3;return mix(C0,ramp(base+.2),lines*(.4+.6*roll))+C3*d*.2+n;}`},
{id:'pixels',name:'Pixels',cat:'Texture',w:'Light',params:[['Size',.5],['Fill',.4],['Flicker',.5],['Gap',.4]],
 looks:[{pal:'violet'},{pal:'ocean',p:[.4,.5,.4,.3]},{pal:'sand',p:[.6,.4,.6,.5]}],
 src:`vec3 fx(vec2 F){float s=R.y*(.02+P.x*.05);vec2 g=floor(F/s);vec2 f=fract(F/s);float on=step(1.-P.y*.6,h21(g+floor(T*(.5+P.z*3.)+h21(g)*4.)));
 float near=MM.z*exp(-dot((g+.5)*s-MM.xy,(g+.5)*s-MM.xy)/(R.y*R.y*.015));on=max(on,step(.4,near*h21(g+floor(T*12.))));float box=step(P.w*.3,f.x)*step(P.w*.3,f.y);
 return mix(C0+C1*.12,mix(C2,C3,h21(g+1.)),on*box*(.5+.5*h21(g+2.)));}`},
{id:'waves',name:'Wave lines',cat:'Patterns',w:'Medium',params:[['Lines',.4],['Detail',.5],['Height',.5],['Weight',.4]],
 looks:[{pal:'graphite'},{pal:'arctic',p:[.5,.6,.6,.3]},{pal:'paper',p:[.3,.4,.5,.5]}],
 src:`vec3 fx(vec2 F){vec2 p=F/R.y;float a=R.x/R.y;float n=24.+P.x*40.;float row=floor(p.y*n);float acc=0.,hi=0.;vec2 m=MM.xy/R.y;
 for(int j=0;j<4;j++){float r=row-float(j);float y0=(r+.5)/n;float env=smoothstep(0.,.35*a,p.x)*smoothstep(a,.65*a,p.x);
  float h=max(fbm3(vec2(p.x*(2.+P.y*3.),r*.15+T*.12))-.38,0.)*(.6+P.z*1.4)*3.5/n*env;h+=MM.z*2.5/n*exp(-dot(vec2(p.x,y0)-m,vec2(p.x,y0)-m)*30.);
  float dd=abs(p.y-y0-h);float w=(.6+P.w*2.)/R.y;float l=smoothstep(w+1.2/R.y,w,dd);acc+=l;hi+=l*clamp(h*n*.6,0.,1.);}
 return mix(C0,mix(C2,C3,clamp(hi,0.,1.)),clamp(acc,0.,1.));}`},
{id:'ripple',name:'Ripples',cat:'Patterns',w:'Medium',params:[['Spacing',.4],['Size',.4],['Pace',.5],['Glow',.5]],
 looks:[{pal:'midnight'},{pal:'moss',p:[.3,.5,.5,.5]},{pal:'clay',p:[.5,.4,.4,.6]}],
 src:`vec3 fx(vec2 F){float s=R.y*(.018+P.x*.03);vec2 cp=(floor(F/s)+.5)*s;float h=0.;
 for(int i=0;i<3;i++){float fi=float(i);float per=4.+fi*1.3;float tt=T*(.4+P.z)+fi*1.7;float k=floor(tt/per);float age=fract(tt/per)*per;
  vec2 o=h22(vec2(k,fi))*R;float d=length(cp-o)/R.y;h+=exp(-pow((d-age*.25)*18.,2.))*exp(-age*.5);}
 float dm=length(cp-MM.xy)/R.y;h+=MM.z*exp(-dm*dm*30.)*.8;float rad=s*(.12+P.y*.15+h*.25);float dd=length(F-cp);float dt0=smoothstep(rad,rad-1.5,dd);
 return C0+mix(C1*.8,mix(C2,C3,clamp(h,0.,1.)),clamp(h*1.5+.25,0.,1.))*dt0*(.4+P.w*.6+h);}`},
{id:'dust',name:'Dust',cat:'Particles',w:'Medium',params:[['Density',.5],['Size',.4],['Depth',.5],['Drift',.5]],
 looks:[{pal:'ink'},{pal:'olive',p:[.4,.5,.6,.4]},{pal:'violet',p:[.6,.4,.5,.6]}],
 src:`vec3 fx(vec2 F){vec2 p=F/R.y;vec3 col=mix(C0,C1*.6,fbm3(p*1.5+T*.02)*.8);
 for(int l=0;l<3;l++){float fl=float(l);float z=1.+fl*.8;float sc=(8.+P.x*12.)*z;vec2 q=p*sc+vec2(T*(.3+P.w*.8)/z,-T*.2/z)+MM.xy/R.y*MM.z*.4*sc/z;
  q+=.35*vec2(sin(q.y*.3+T*.4),cos(q.x*.3+T*.3));vec2 i=floor(q);vec2 r=h22(i+fl*13.);float d=length(fract(q)-.2-.6*r);
  float sz=.03+.08*P.y*(3.-fl)/3.;float bl=.015+fl*.05*P.z;float b=smoothstep(sz+bl,max(sz-bl,0.),d)*step(.45,h21(i+fl*5.));
  col+=mix(C3,C2,fl/2.)*b*(.6+.4*sin(T*1.5+r.x*20.))*(1.-fl*.25);}
 return col;}`},
{id:'holo',name:'Holo foil',cat:'Gradients',w:'Medium',params:[['Scale',.4],['Warp',.5],['Bands',.5],['Sheen',.5]],
 looks:[{pal:'steel'},{pal:'ocean',p:[.5,.6,.4,.6]},{pal:'sand',p:[.4,.4,.6,.4]}],
 src:`vec3 fx(vec2 F){vec2 p=(F-R*.5)/R.y;vec2 m=(MM.xy-R*.5)/R.y;float n=fbm(p*(1.2+P.x*2.)+vec2(T*.05,-T*.04));float n2=fbm(p*3.+n*2.+T*.03);
 float t=n*2.+n2*(.6+P.y)+dot(p,vec2(.6,.3))+T*.08+length(p-m)*MM.z*.8;float band=.5+.5*sin(t*6.2832*(.6+P.z*.8));
 vec3 c=mix(C1,C2,band);c=mix(c,C3,pow(.5+.5*sin(t*6.2832*1.7+1.),4.)*(.3+P.w*.7));float sheen=pow(max(0.,1.-abs(p.x*.7+p.y-sin(T*.2)*.6)),8.)*.5;
 return mix(C0,c,.85)+C3*sheen*P.w;}`},
{id:'terrain',name:'Terrain',cat:'Patterns',w:'Medium',params:[['Grid',.5],['Relief',.5],['Speed',.5],['Weight',.4]],
 looks:[{pal:'midnight'},{pal:'graphite',p:[.4,.6,.4,.3]},{pal:'moss',p:[.6,.4,.5,.5]}],
 src:`vec3 fx(vec2 F){vec2 uv=(F-vec2(R.x*.5,R.y*.62))/R.y;uv.x-=(MM.x/R.x-.5)*.3*MM.z;vec3 col=mix(C0,C1*.45,smoothstep(-.6,.38,uv.y));col+=C2*exp(-abs(uv.y)*30.)*.25;
 if(uv.y<-.004){float z=.35/(-uv.y);float k=1.5+P.x*2.;vec2 g=vec2(uv.x*z*k,z*k+T*(.5+P.z*1.5));float h=fbm3(g*.3)*(.4+P.y*1.4);g.y+=h*2.;g.x+=h*.6;
  vec2 fw=fwidth(g)*(1.+P.w*1.5);vec2 gl=abs(fract(g-.5)-.5)/max(fw,1e-4);float line=1.-min(min(gl.x,gl.y),1.);float fog=exp(-z*.12);
  col+=mix(C2,C3,clamp(h,0.,1.))*line*fog;}
 return col;}`},
{id:'moire',name:'Moiré',cat:'Patterns',w:'Light',params:[['Rings',.5],['Contrast',.5],['Sharp',.4],['Glow',.5]],
 looks:[{pal:'paper'},{pal:'violet',p:[.4,.6,.5,.5]},{pal:'arctic',p:[.6,.5,.3,.6]}],
 src:`vec3 fx(vec2 F){vec2 p=F/R.y;float a=R.x/R.y;vec2 c1=vec2(a*.5+.25*sin(T*.13),.5+.2*cos(T*.11));vec2 c2=mix(vec2(a*.5-.25*sin(T*.1),.5-.2*cos(T*.15)),MM.xy/R.y,MM.z);
 float f=60.+P.x*120.;float v=pow(.5+.5*sin(length(p-c1)*f)*sin(length(p-c2)*f),1.+P.z*6.);float fade=1.-smoothstep(.2,.9,length(p-vec2(a*.5,.5)));
 return mix(C0,mix(C2,C3,v),v*(.3+P.y*.7)*(.4+.6*fade))+C1*fade*.15*P.w;}`},
{id:'code',name:'Code rain',cat:'Texture',w:'Medium',params:[['Cell',.4],['Trail',.5],['Speed',.5],['Glow',.5]],
 looks:[{pal:'moss'},{pal:'graphite',p:[.3,.4,.4,.5]},{pal:'arctic',p:[.5,.6,.5,.6]}],
 src:`vec3 fx(vec2 F){float s=R.y*(.016+P.x*.02);vec2 g=floor(F/s);vec2 f=fract(F/s);float rows=R.y/s;
 float sp=(.5+h21(vec2(g.x,1.)))*(2.+P.z*6.);float head=fract(T*sp*.05+h21(vec2(g.x,2.)))*rows*1.6;float y=rows-g.y;float d=head-y;
 float trail=d>0.?exp(-d/(4.+P.y*20.)):0.;vec2 cg=floor(f*vec2(3.,5.));float bit=step(.5,h21(cg+g*7.+floor(T*(2.+h21(g)*6.))*.37));
 float inside=step(.15,f.x)*step(f.x,.85)*step(.1,f.y)*step(f.y,.9);float near=MM.z*exp(-dot(F-MM.xy,F-MM.xy)/(R.y*R.y*.02));
 float v=bit*inside*(trail+near*.6);vec3 c=mix(C1,C2,trail);c=mix(c,C3,smoothstep(.85,1.,trail));return C0+c*v*(.5+P.w*.8);}`}];
const CATS=['Featured','Gradients','Patterns','Particles','Light','Texture'];
const FEATURED=['mesh','holo','waves','terrain','contours','constellation','rays','ripple','moire','smoke'];
G.WebGLFX_LIB={FX,PAL,CATS,FEATURED};
})(window);

/* <webgl-fx config='{"fx":"mesh",...}'></webgl-fx> — the element fills its own box; give it a size or put it behind content. */
(function(){
if(!window.customElements||customElements.get('webgl-fx'))return;
class WebGLFxEl extends HTMLElement{
  static get observedAttributes(){return['config']}
  connectedCallback(){this._go()}
  disconnectedCallback(){if(this._p)this._p.destroy();this._p=null}
  attributeChangedCallback(){if(this.isConnected)this._go()}
  _go(){if(this._p)this._p.destroy();let c={};try{c=JSON.parse(this.getAttribute('config')||'{}')}catch(e){}
    const L=window.WebGLFX_LIB,f=L&&L.FX.find(x=>x.id===c.fx);if(!f){console.warn('<webgl-fx> unknown effect',c.fx);return}
    if(!this.style.display)this.style.display='block';this._p=WebGLFX.mount(this,f.src,c)}
}
customElements.define('webgl-fx',WebGLFxEl);
})();
