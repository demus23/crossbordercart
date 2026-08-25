// pages/login.tsx — Cross Border Cart · Design system v4 (matches homepage)
// Background: light ivory/white | Main CTA: brass gold gradient | Card: white, shadowed
// Logic unchanged from v3: next-auth signIn, resend-verification, same form fields.
import { useState, useEffect, useRef, FormEvent } from "react";
import Head from "next/head";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { AnimatedLogo } from "@/components/AnimatedLogo";

/* ─── Map canvas — recolored navy/gold for a light background ─── */
const CITIES: Record<string,{x:number;y:number;color:string;r:number}> = {
  Dubai:   {x:1.36,y:0.20,color:"#C9A227",r:5  },
  Nairobi: {x:0.72,y:0.58,color:"#0F2340",r:4  },
  Lagos:   {x:0.22,y:0.42,color:"#0F2340",r:4  },
  Accra:   {x:0.16,y:0.44,color:"#0F2340",r:3.5},
  Lusaka:  {x:0.62,y:0.74,color:"#0F2340",r:3.5},
  Dar:     {x:0.74,y:0.64,color:"#0F2340",r:3.5},
  Cairo:   {x:0.64,y:0.08,color:"#68707F",r:3  },
  JNB:     {x:0.56,y:0.88,color:"#0F2340",r:3.5},
};
const ROUTES:[string,string][] = [
  ["Dubai","Nairobi"],["Dubai","Lagos"],["Dubai","Accra"],
  ["Dubai","Lusaka"],["Dubai","Dar"],["Dubai","Cairo"],
  ["Dubai","JNB"],
];
const AFRICA = [
  [0.45,0],[0.52,0.01],[0.62,0.04],[0.72,0.09],[0.78,0.14],
  [0.82,0.20],[0.84,0.26],[0.86,0.32],[0.88,0.38],[0.87,0.45],
  [0.84,0.52],[0.80,0.58],[0.76,0.65],[0.70,0.72],[0.62,0.80],
  [0.52,0.88],[0.50,0.93],[0.48,0.98],[0.46,1.00],[0.44,0.98],
  [0.40,0.92],[0.34,0.84],[0.26,0.76],[0.18,0.68],[0.12,0.60],
  [0.08,0.52],[0.05,0.44],[0.04,0.36],[0.05,0.28],[0.08,0.22],
  [0.12,0.16],[0.18,0.10],[0.26,0.05],[0.34,0.02],[0.40,0.00],[0.45,0],
];

function MapCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef<number>(0);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const W = cv.offsetWidth||900, H = cv.offsetHeight||700;
    cv.width = W; cv.height = H;
    const ctx = cv.getContext("2d")!;
    const AW=W*0.38, AH=H*0.70, AX=W*0.03, AY=H*0.15;
    const mp = (x:number,y:number):[number,number] => [AX+x*AW, AY+y*AH];
    const cp = (c:{x:number;y:number}):[number,number] => [AX+c.x*AW, AY+c.y*AH];
    function quad(a:[number,number],b:[number,number]):[number,number]{
      const mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2,dx=b[0]-a[0],dy=b[1]-a[1],l=Math.sqrt(dx*dx+dy*dy);
      return[mx+(-dy/l)*l*0.22,my+(dx/l)*l*0.22];
    }
    function bz(a:[number,number],c:[number,number],b:[number,number],t:number):[number,number]{
      return[Math.pow(1-t,2)*a[0]+2*(1-t)*t*c[0]+t*t*b[0],Math.pow(1-t,2)*a[1]+2*(1-t)*t*c[1]+t*t*b[1]];
    }
    const pts = ROUTES.map(()=>({t:Math.random(),sp:0.0014+Math.random()*0.001}));
    function draw(){
      ctx.clearRect(0,0,W,H);
      ctx.beginPath();
      const[fx,fy]=mp(AFRICA[0][0],AFRICA[0][1]);ctx.moveTo(fx,fy);
      AFRICA.slice(1).forEach(([x,y])=>{const[px,py]=mp(x,y);ctx.lineTo(px,py);});
      ctx.closePath();ctx.fillStyle="rgba(15,35,64,0.035)";ctx.fill();
      ctx.strokeStyle="rgba(201,162,39,0.35)";ctx.lineWidth=1;ctx.stroke();
      for(let gx=0;gx<=1;gx+=0.07)for(let gy=0;gy<=1;gy+=0.07){
        const[px,py]=mp(gx,gy);ctx.beginPath();ctx.arc(px,py,0.8,0,Math.PI*2);
        ctx.fillStyle="rgba(15,35,64,0.10)";ctx.fill();
      }
      ROUTES.forEach(([a,b],i)=>{
        const p1=cp(CITIES[a]),p2=cp(CITIES[b]),c=quad(p1,p2);
        ctx.beginPath();ctx.moveTo(p1[0],p1[1]);ctx.quadraticCurveTo(c[0],c[1],p2[0],p2[1]);
        ctx.strokeStyle="rgba(201,162,39,0.35)";ctx.lineWidth=1;ctx.setLineDash([4,4]);ctx.stroke();ctx.setLineDash([]);
        const p=pts[i];p.t=(p.t+p.sp)%1;
        const[px,py]=bz(p1,c,p2,p.t);const pl=0.5+0.5*Math.sin(p.t*Math.PI*6);
        ctx.beginPath();ctx.arc(px,py,2.5+pl,0,Math.PI*2);ctx.fillStyle=`rgba(201,162,39,${0.6+pl*0.4})`;ctx.fill();
        ctx.beginPath();ctx.arc(px,py,5+pl*2,0,Math.PI*2);ctx.strokeStyle=`rgba(201,162,39,${0.15+pl*0.15})`;ctx.lineWidth=1;ctx.stroke();
      });
      Object.values(CITIES).forEach(c=>{
        const[px,py]=cp(c);
        ctx.beginPath();ctx.arc(px,py,c.r+3,0,Math.PI*2);ctx.strokeStyle=c.color+"40";ctx.lineWidth=1;ctx.stroke();
        ctx.beginPath();ctx.arc(px,py,c.r,0,Math.PI*2);ctx.fillStyle=c.color;ctx.fill();
      });
      raf.current=requestAnimationFrame(draw);
    }
    draw();
    return ()=>cancelAnimationFrame(raf.current);
  },[]);
  return <canvas ref={ref} style={{position:"fixed",inset:0,width:"100%",height:"100%",pointerEvents:"none",zIndex:0,opacity:0.5}}/>;
}

/* ─── Main page ─── */
export default function LoginPage(){
  const router = useRouter();
  const [email,    setEmail]   = useState("");
  const [password, setPassword]= useState("");
  const [showPw,   setShowPw]  = useState(false);
  const [loading,  setLoading] = useState(false);
  const [msg,setMsg] = useState<{type:"ok"|"err";text:string}|null>(null);

  async function handleSubmit(e:FormEvent){
    e.preventDefault(); setMsg(null); setLoading(true);
    const res = await signIn("credentials",{redirect:false,email,password});
    if(res?.ok && !res.error){
      setMsg({type:"ok",text:"Login successful. Redirecting…"});
      router.push("/dashboard");
    } else {
      setMsg({type:"err",text:res?.error==="Please verify your email"
        ?"Please verify your email before login."
        :"Invalid email or password."});
      setLoading(false);
    }
  }

  async function resendVerification(){
    if(!email){setMsg({type:"err",text:"Enter your email first, then click resend verification."});return;}
    const res  = await fetch("/api/auth/email/resend",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email})});
    const data = await res.json();
    if(res.ok) setMsg({type:"ok",text:"If this email exists and is not verified, we sent a verification link."});
    else        setMsg({type:"err",text:data.error||"Could not send verification email."});
  }

  return(
    <>
      <Head><title>Login • CBC (Cross Border Cart)</title><meta name="robots" content="noindex"/></Head>
      <main className="page">
        <MapCanvas/>

        {/* LEFT */}
        <section className="left">
          <div className="brand"><AnimatedLogo />CBC</div>
          <div>
            <div className="htag"><span className="pd"/>UAE → Africa Shipping</div>
            <h1>Track every parcel<br/><span className="accent">from Dubai to your door.</span></h1>
            <p className="hsub">Login to manage your CBC UAE address, package arrivals, shipment requests and delivery updates.</p>
            <div className="feats">
              {[{i:"📬",t:"Dedicated CBC UAE address"},{i:"📦",t:"Package tracking dashboard"},{i:"🔒",t:"Secure shipment updates"},{i:"✈️",t:"Built for UAE → Africa shipping"}].map(f=>(
                <div key={f.t} className="feat"><div className="fi">{f.i}</div>{f.t}</div>
              ))}
            </div>
          </div>
          <div className="lbot">
            <div className="rpills">
              {[["DXB","NBO"],["DXB","LOS"],["DXB","ACC"],["DXB","LUN"]].map(([a,b])=>(
                <div key={a+b} className="rpill"><span className="rpa">{a}</span><span className="rpdiv">→</span><span className="rpb">{b}</span></div>
              ))}
            </div>
            <p className="newacct">New customer? <Link href="/signup">Create account</Link></p>
          </div>
        </section>

        {/* RIGHT */}
        <section className="right">
          <div className="card">
            <div className="vban"><span className="vico">✉️</span><span className="vtxt">Please verify your email address before signing in.</span></div>
            <div className="ch"><h2>Welcome back</h2><p>Access your packages, shipments, payments and CBC UAE address.</p></div>
            <form onSubmit={handleSubmit}>
              <label className="fld">
                <span className="lbl">Email address</span>
                <input type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email" required/>
              </label>
              <label className="fld">
                <span className="lbl">Password</span>
                <div className="pw">
                  <input type={showPw?"text":"password"} placeholder="Enter your password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password" required/>
                  <button type="button" className="pwb" onClick={()=>setShowPw(v=>!v)}>{showPw?"Hide":"Show"}</button>
                </div>
              </label>
              <div className="acts">
                <Link href="/forgot-password">Forgot password?</Link>
                <button type="button" onClick={resendVerification}>Resend verification</button>
              </div>
              <button className="cta-primary" type="submit" disabled={loading}>{loading?"Signing in…":"Sign in"}</button>
              {msg&&<div className={`msg msg-${msg.type}`}>{msg.text}</div>}
            </form>
            <p className="lnk">Don&apos;t have an account? <Link href="/signup">Create account</Link></p>
          </div>
        </section>
      </main>

      <style jsx>{`
        .page{min-height:100vh;display:grid;grid-template-columns:1fr 1.15fr;background:linear-gradient(180deg,#FBF8F2 0%,#fff 100%);font-family:Inter,system-ui,sans-serif;color:#1C2436;position:relative}
        .left{position:relative;z-index:2;padding:40px 44px;display:flex;flex-direction:column;justify-content:space-between;border-right:1px solid #EAE3D2}
        .brand{display:flex;align-items:center;gap:11px;font-weight:900;font-size:17px;color:#0F2340}
        .htag{display:inline-flex;align-items:center;gap:7px;padding:5px 13px;border-radius:99px;background:#F3E7C9;border:1px solid #C9A227;font-size:11px;font-weight:700;color:#A8841A;margin-bottom:22px}
        .pd{width:6px;height:6px;border-radius:50%;background:#C9A227;display:inline-block;animation:pulse 2s infinite}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(1.5)}}
        h1{font-size:38px;font-weight:900;line-height:1.07;letter-spacing:-1.5px;color:#0F2340;margin-bottom:13px}
        .accent{color:#A8841A;font-style:italic}
        .hsub{font-size:14px;color:#68707F;line-height:1.75;max-width:360px}
        .feats{display:flex;flex-direction:column;gap:9px;margin-top:20px}
        .feat{display:flex;align-items:center;gap:10px;font-size:13px;color:#1C2436;padding:10px 12px;background:#fff;border:1px solid #EAE3D2;border-radius:11px;transition:all .2s;box-shadow:0 2px 10px -4px rgba(15,35,64,0.08)}
        .feat:hover{border-color:#C9A227;transform:translateY(-1px)}
        .fi{width:28px;height:28px;border-radius:9px;background:#F3E7C9;border:1px solid #C9A227;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0}
        .lbot{display:flex;flex-direction:column;gap:10px}
        .rpills{display:flex;gap:6px;flex-wrap:wrap}
        .rpill{display:flex;align-items:center;gap:4px;background:#fff;border:1px solid #EAE3D2;border-radius:99px;padding:5px 10px}
        .rpa{font-size:10px;font-weight:800;color:#A8841A}
        .rpdiv{font-size:10px;color:#68707F}
        .rpb{font-size:10px;font-weight:800;color:#0F2340}
        .newacct{font-size:13px;color:#68707F}
        .newacct :global(a){color:#A8841A;font-weight:800;text-decoration:none}
        .right{position:relative;z-index:2;display:flex;align-items:center;justify-content:center;padding:32px}
        .card{width:100%;max-width:450px;background:#fff;border:1px solid #EAE3D2;border-radius:24px;padding:34px 36px;box-shadow:0 24px 60px -24px rgba(15,35,64,0.30);position:relative;overflow:hidden}
        .vban{display:flex;align-items:center;gap:9px;background:#F3E7C9;border:1px solid #C9A227;border-radius:12px;padding:12px 14px;margin-bottom:22px}
        .vico{font-size:16px;flex-shrink:0}
        .vtxt{font-size:12px;font-weight:700;color:#A8841A;line-height:1.4}
        .ch{margin-bottom:22px}
        .ch h2{font-size:25px;font-weight:900;letter-spacing:-.8px;color:#0F2340;margin-bottom:5px}
        .ch p{font-size:13px;color:#68707F}
        form{display:grid;gap:18px}
        .fld{display:flex;flex-direction:column;gap:8px}
        .lbl{font-size:13px;font-weight:700;color:#1C2436;letter-spacing:.2px}
        input{width:100%;padding:15px 18px;border:1.5px solid #EAE3D2;border-radius:13px;font-size:15px;color:#1C2436;background:#FBF8F2;outline:none;height:52px;transition:all .2s;font-family:inherit}
        input::placeholder{color:#a3aab5;font-size:14px}
        input:focus{border-color:#C9A227;box-shadow:0 0 0 3px rgba(201,162,39,0.14);background:#fff}
        .pw{position:relative}.pw input{padding-right:80px}
        .pwb{position:absolute;right:9px;top:50%;transform:translateY(-50%);height:32px;border:1px solid #EAE3D2;border-radius:9px;background:#fff;color:#68707F;font-weight:700;font-size:11px;cursor:pointer;padding:0 11px;font-family:inherit;transition:all .2s}
        .pwb:hover{background:#F3E7C9;color:#A8841A;border-color:#C9A227}
        .acts{display:flex;justify-content:space-between;align-items:center;gap:10px}
        .acts :global(a),.acts button{border:none;background:transparent;padding:0;color:#A8841A;font-weight:700;font-size:13px;cursor:pointer;text-decoration:none;font-family:inherit;transition:color .2s}
        .acts :global(a:hover),.acts button:hover{color:#C9A227}
        .cta-primary{height:52px;border:none;border-radius:14px;background:linear-gradient(155deg,#C9A227,#A8841A);color:#fff;font-weight:800;font-size:16px;cursor:pointer;width:100%;font-family:inherit;box-shadow:0 12px 28px -10px rgba(169,132,26,0.5);transition:all .2s;letter-spacing:.2px}
        .cta-primary:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 16px 34px -10px rgba(169,132,26,0.6)}
        .cta-primary:disabled{opacity:.55;cursor:not-allowed;transform:none}
        .msg{padding:12px 15px;border-radius:12px;font-size:13px;font-weight:700;margin-top:2px}
        .msg-err{background:#FDECEC;color:#c0392b;border:1px solid #f5c6c6}
        .msg-ok{background:#F3E7C9;color:#A8841A;border:1px solid #C9A227}
        .lnk{text-align:center;color:#68707F;font-size:13px;margin-top:18px}
        .lnk :global(a){color:#A8841A;font-weight:800;text-decoration:none}
        .lnk :global(a:hover){text-decoration:underline}
        @media(max-width:900px){.page{grid-template-columns:1fr}.left{display:none}.right{padding:18px;align-items:flex-start}.card{padding:24px;border-radius:20px;max-width:100%}}
        @media(prefers-reduced-motion:reduce){*,*::before,*::after{animation:none!important;transition:none!important}}
      `}</style>
    </>
  );
}