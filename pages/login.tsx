// pages/login.tsx — Cross Border Cart · Design system v3
// Background: #0B1220 | Main CTA: #00E5A0/#002B1A | Secondary CTA: border #38BDF8 | Card: rgba(17,28,52,0.75) blur(20px)
import { useState, useEffect, useRef, FormEvent } from "react";
import Head from "next/head";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { AnimatedLogo } from "@/components/AnimatedLogo";

/* ─── Map canvas ─── */
const CITIES: Record<string,{x:number;y:number;color:string;r:number}> = {
  Dubai:   {x:1.36,y:0.20,color:"#00E5A0",r:5  },
  Nairobi: {x:0.72,y:0.58,color:"#38BDF8",r:4  },
  Lagos:   {x:0.22,y:0.42,color:"#38BDF8",r:4  },
  Accra:   {x:0.16,y:0.44,color:"#38BDF8",r:3.5},
  Lusaka:  {x:0.62,y:0.74,color:"#38BDF8",r:3.5},
  Dar:     {x:0.74,y:0.64,color:"#38BDF8",r:3.5},
  Cairo:   {x:0.64,y:0.08,color:"#94a3b8",r:3  },
  JNB:     {x:0.56,y:0.88,color:"#38BDF8",r:3.5},
  Mumbai:  {x:1.62,y:0.28,color:"#fbbf24",r:3.5},
};
const ROUTES:[string,string][] = [
  ["Dubai","Nairobi"],["Dubai","Lagos"],["Dubai","Accra"],
  ["Dubai","Lusaka"],["Dubai","Dar"],["Dubai","Cairo"],
  ["Dubai","JNB"],["Dubai","Mumbai"],
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
      ctx.closePath();ctx.fillStyle="rgba(0,229,160,0.03)";ctx.fill();
      ctx.strokeStyle="rgba(0,229,160,0.12)";ctx.lineWidth=1;ctx.stroke();
      for(let gx=0;gx<=1;gx+=0.07)for(let gy=0;gy<=1;gy+=0.07){
        const[px,py]=mp(gx,gy);ctx.beginPath();ctx.arc(px,py,0.8,0,Math.PI*2);
        ctx.fillStyle="rgba(0,229,160,0.09)";ctx.fill();
      }
      ROUTES.forEach(([a,b],i)=>{
        const p1=cp(CITIES[a]),p2=cp(CITIES[b]),c=quad(p1,p2);
        ctx.beginPath();ctx.moveTo(p1[0],p1[1]);ctx.quadraticCurveTo(c[0],c[1],p2[0],p2[1]);
        ctx.strokeStyle="rgba(0,229,160,0.16)";ctx.lineWidth=1;ctx.setLineDash([4,4]);ctx.stroke();ctx.setLineDash([]);
        const p=pts[i];p.t=(p.t+p.sp)%1;
        const[px,py]=bz(p1,c,p2,p.t);const pl=0.5+0.5*Math.sin(p.t*Math.PI*6);
        ctx.beginPath();ctx.arc(px,py,2.5+pl,0,Math.PI*2);ctx.fillStyle=`rgba(0,229,160,${0.5+pl*0.5})`;ctx.fill();
        ctx.beginPath();ctx.arc(px,py,5+pl*2,0,Math.PI*2);ctx.strokeStyle=`rgba(0,229,160,${0.1+pl*0.1})`;ctx.lineWidth=1;ctx.stroke();
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
  return <canvas ref={ref} style={{position:"fixed",inset:0,width:"100%",height:"100%",pointerEvents:"none",zIndex:0}}/>;
}

/* ─── Animated Logo ─── */


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
      <Head><title>Login • Cross Border Cart</title><meta name="robots" content="noindex"/></Head>
      <main className="page">
        <MapCanvas/>
        <div className="orb o1" aria-hidden="true"/>
        <div className="orb o2" aria-hidden="true"/>
        <div className="orb o3" aria-hidden="true"/>
        <div className="gridl"  aria-hidden="true"/>

        {/* LEFT */}
        <section className="left">
          <div className="brand"><AnimatedLogo />CrossBorderCart</div>
          <div>
            <div className="htag"><span className="pd"/>UAE → Africa Shipping</div>
            <h1>Track every parcel<br/><span className="accent">from Dubai to your door.</span></h1>
            <p className="hsub">Login to manage your UAE suite address, package arrivals, shipment requests and live delivery updates.</p>
            <div className="feats">
              {[{i:"📬",t:"Dedicated UAE Suite ID"},{i:"📦",t:"Package tracking dashboard"},{i:"🔒",t:"Secure shipment updates"},{i:"✈️",t:"Built for UAE → Africa shipping"}].map(f=>(
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
            <div className="co1" aria-hidden="true"/><div className="co2" aria-hidden="true"/>
            <div className="vban"><span className="vico">✉️</span><span className="vtxt">Please verify your email address before signing in.</span></div>
            <div className="ch"><h2>Welcome back</h2><p>Access your packages, shipments, payments and UAE suite address.</p></div>
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
              {/* MAIN CTA */}
              <button className="cta-primary" type="submit" disabled={loading}>{loading?"Signing in…":"Sign in"}</button>
              {/* SECONDARY CTA */}
              <button className="cta-secondary" type="button">Continue with Google</button>
              {msg&&<div className={`msg msg-${msg.type}`}>{msg.text}</div>}
            </form>
            <p className="lnk">Don&apos;t have an account? <Link href="/signup">Create account</Link></p>
          </div>
        </section>
      </main>

      <style jsx>{`
        .page{min-height:100vh;display:grid;grid-template-columns:1fr 1.15fr;background:#0B1220;font-family:Inter,system-ui,sans-serif;color:#f1f5f9;position:relative}
        .orb{position:fixed;border-radius:50%;pointer-events:none;z-index:0}
        .o1{width:650px;height:650px;background:radial-gradient(circle,rgba(0,229,160,0.10),transparent 70%);top:-200px;left:-150px;animation:drift 9s ease-in-out infinite}
        .o2{width:520px;height:520px;background:radial-gradient(circle,rgba(56,189,248,0.08),transparent 70%);bottom:-150px;right:-110px;animation:drift 12s ease-in-out infinite reverse}
        .o3{width:360px;height:360px;background:radial-gradient(circle,rgba(0,229,160,0.05),transparent 70%);top:40%;left:38%;animation:drift 15s ease-in-out infinite 2s}
        @keyframes drift{0%,100%{transform:translate(0,0)}33%{transform:translate(22px,-16px)}66%{transform:translate(-14px,20px)}}
        .gridl{position:fixed;inset:0;pointer-events:none;z-index:0;
          background-image:linear-gradient(rgba(0,229,160,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,229,160,0.03) 1px,transparent 1px);
          background-size:56px 56px;
          mask-image:radial-gradient(ellipse 80% 80% at 50% 50%,black 0%,transparent 100%);
          -webkit-mask-image:radial-gradient(ellipse 80% 80% at 50% 50%,black 0%,transparent 100%)}
        .left{position:relative;z-index:2;padding:40px 44px;display:flex;flex-direction:column;justify-content:space-between;border-right:1px solid rgba(255,255,255,0.06)}
        .brand{display:flex;align-items:center;gap:11px;font-weight:900;font-size:17px;color:#f1f5f9}
        .htag{display:inline-flex;align-items:center;gap:7px;padding:5px 13px;border-radius:99px;background:rgba(0,229,160,0.08);border:1px solid rgba(0,229,160,0.22);font-size:11px;font-weight:700;color:#00E5A0;margin-bottom:22px}
        .pd{width:6px;height:6px;border-radius:50%;background:#00E5A0;display:inline-block;animation:pulse 2s infinite}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(1.5)}}
        h1{font-size:38px;font-weight:900;line-height:1.07;letter-spacing:-1.5px;color:#f1f5f9;margin-bottom:13px}
        .accent{background:linear-gradient(90deg,#00E5A0,#38BDF8);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
        .hsub{font-size:14px;color:#475569;line-height:1.75;max-width:360px}
        .feats{display:flex;flex-direction:column;gap:9px;margin-top:20px}
        .feat{display:flex;align-items:center;gap:10px;font-size:13px;color:#94a3b8;padding:10px 12px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:11px;backdrop-filter:blur(4px);transition:all .2s}
        .feat:hover{background:rgba(0,229,160,0.05);border-color:rgba(0,229,160,0.18);color:#f1f5f9}
        .fi{width:28px;height:28px;border-radius:9px;background:rgba(0,229,160,0.08);border:1px solid rgba(0,229,160,0.16);display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0}
        .lbot{display:flex;flex-direction:column;gap:10px}
        .rpills{display:flex;gap:6px;flex-wrap:wrap}
        .rpill{display:flex;align-items:center;gap:4px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:99px;padding:5px 10px}
        .rpa{font-size:10px;font-weight:800;color:#00E5A0}
        .rpdiv{font-size:10px;color:#475569}
        .rpb{font-size:10px;font-weight:800;color:#38BDF8}
        .newacct{font-size:13px;color:#475569}
        .newacct :global(a){color:#00E5A0;font-weight:800;text-decoration:none}
        .right{position:relative;z-index:2;display:flex;align-items:center;justify-content:center;padding:32px}
        /* CARD — rgba(17,28,52,0.75) blur(20px) */
        .card{width:100%;max-width:450px;background:rgba(17,28,52,0.75);border:1px solid rgba(255,255,255,0.09);border-radius:24px;padding:34px 36px;backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);box-shadow:0 0 0 1px rgba(255,255,255,0.03) inset,0 28px 64px rgba(0,0,0,0.5),0 0 50px rgba(0,229,160,0.04);position:relative;overflow:hidden}
        .co1{position:absolute;width:220px;height:220px;border-radius:50%;background:radial-gradient(circle,rgba(0,229,160,0.07),transparent 70%);top:-65px;right:-65px;pointer-events:none}
        .co2{position:absolute;width:160px;height:160px;border-radius:50%;background:radial-gradient(circle,rgba(56,189,248,0.05),transparent 70%);bottom:-50px;left:-50px;pointer-events:none}
        .vban{display:flex;align-items:center;gap:9px;background:rgba(0,229,160,0.07);border:1px solid rgba(0,229,160,0.2);border-radius:12px;padding:12px 14px;margin-bottom:22px;position:relative;z-index:1}
        .vico{font-size:16px;flex-shrink:0}
        .vtxt{font-size:12px;font-weight:700;color:#00E5A0;line-height:1.4}
        .ch{margin-bottom:22px;position:relative;z-index:1}
        .ch h2{font-size:25px;font-weight:900;letter-spacing:-.8px;color:#f1f5f9;margin-bottom:5px}
        .ch p{font-size:13px;color:#475569}
        form{display:grid;gap:18px;position:relative;z-index:1}
        .fld{display:flex;flex-direction:column;gap:8px}
        .lbl{font-size:13px;font-weight:700;color:#94a3b8;letter-spacing:.2px}
        input{width:100%;padding:15px 18px;border:1.5px solid rgba(255,255,255,0.10);border-radius:13px;font-size:15px;color:#f1f5f9;background:rgba(255,255,255,0.05);backdrop-filter:blur(4px);outline:none;height:52px;transition:all .2s;font-family:inherit}
        input::placeholder{color:#334155;font-size:14px}
        input:focus{border-color:rgba(0,229,160,0.5);box-shadow:0 0 0 3px rgba(0,229,160,0.10),0 0 18px rgba(0,229,160,0.07);background:rgba(255,255,255,0.08)}
        .pw{position:relative}.pw input{padding-right:80px}
        .pwb{position:absolute;right:9px;top:50%;transform:translateY(-50%);height:32px;border:1px solid rgba(255,255,255,0.12);border-radius:9px;background:rgba(255,255,255,0.05);color:#94a3b8;font-weight:700;font-size:11px;cursor:pointer;padding:0 11px;font-family:inherit;transition:all .2s}
        .pwb:hover{background:rgba(0,229,160,0.1);color:#00E5A0;border-color:rgba(0,229,160,0.3)}
        .acts{display:flex;justify-content:space-between;align-items:center;gap:10px}
        .acts :global(a),.acts button{border:none;background:transparent;padding:0;color:#38BDF8;font-weight:700;font-size:13px;cursor:pointer;text-decoration:none;font-family:inherit;transition:color .2s}
        .acts :global(a:hover),.acts button:hover{color:#7dd3fc}
        /* MAIN CTA — #00E5A0 / #002B1A */
        .cta-primary{height:52px;border:none;border-radius:14px;background:#00E5A0;color:#002B1A;font-weight:900;font-size:16px;cursor:pointer;width:100%;font-family:inherit;box-shadow:0 10px 28px rgba(0,229,160,0.32),0 0 0 1px rgba(0,229,160,0.2) inset;transition:all .2s;position:relative;overflow:hidden;letter-spacing:.2px}
        .cta-primary::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,0.16),transparent);pointer-events:none}
        .cta-primary:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 16px 36px rgba(0,229,160,0.42)}
        .cta-primary:disabled{opacity:.55;cursor:not-allowed;transform:none}
        /* SECONDARY CTA — transparent / border #38BDF8 */
        .cta-secondary{height:48px;border:1px solid #38BDF8;border-radius:14px;background:transparent;color:#38BDF8;font-weight:700;font-size:14px;cursor:pointer;width:100%;font-family:inherit;transition:all .2s;margin-top:8px}
        .cta-secondary:hover{background:rgba(56,189,248,0.08);box-shadow:0 0 20px rgba(56,189,248,0.15)}
        .msg{padding:12px 15px;border-radius:12px;font-size:13px;font-weight:700;margin-top:2px}
        .msg-err{background:rgba(239,68,68,0.1);color:#f87171;border:1px solid rgba(239,68,68,0.2)}
        .msg-ok{background:rgba(0,229,160,0.08);color:#00E5A0;border:1px solid rgba(0,229,160,0.2)}
        .lnk{text-align:center;color:#475569;font-size:13px;margin-top:18px;position:relative;z-index:1}
        .lnk :global(a){color:#00E5A0;font-weight:800;text-decoration:none}
        .lnk :global(a:hover){text-decoration:underline}
        @media(max-width:900px){.page{grid-template-columns:1fr}.left{display:none}.right{padding:18px;align-items:flex-start}.card{padding:24px;border-radius:20px;max-width:100%}}
        @media(prefers-reduced-motion:reduce){*,*::before,*::after{animation:none!important;transition:none!important}}
      `}</style>
    </>
  );
}