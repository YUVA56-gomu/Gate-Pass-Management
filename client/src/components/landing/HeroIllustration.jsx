import React from 'react'

export const HeroIllustration = () => {
  return (
    <div className="relative w-full h-full flex items-center justify-center select-none" style={{ minHeight: 420 }}>

      {/* ── Background glow blobs ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div style={{ position:'absolute', top:20, right:30, width:180, height:180, background:'radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 70%)', borderRadius:'50%' }} />
        <div style={{ position:'absolute', bottom:30, left:20, width:140, height:140, background:'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)', borderRadius:'50%' }} />
        <div style={{ position:'absolute', top:'40%', left:'30%', width:100, height:100, background:'radial-gradient(circle, rgba(167,139,250,0.15) 0%, transparent 70%)', borderRadius:'50%' }} />
      </div>

      {/* ── Decorative floating bubbles ── */}
      {/* Large purple bubble top-right */}
      <div className="animate-float-slow" style={{ position:'absolute', top:10, right:10, width:52, height:52, borderRadius:'50%', background:'linear-gradient(135deg,rgba(139,92,246,0.35),rgba(99,102,241,0.2))', border:'1.5px solid rgba(139,92,246,0.3)', backdropFilter:'blur(4px)' }} />
      {/* Medium blue bubble top-left */}
      <div className="animate-float-medium" style={{ position:'absolute', top:50, left:10, width:32, height:32, borderRadius:'50%', background:'linear-gradient(135deg,rgba(99,102,241,0.3),rgba(59,130,246,0.2))', border:'1px solid rgba(99,102,241,0.25)', backdropFilter:'blur(4px)' }} />
      {/* Small violet bubble mid-right */}
      <div className="animate-bounce-slow" style={{ position:'absolute', top:'35%', right:5, width:20, height:20, borderRadius:'50%', background:'rgba(167,139,250,0.4)', border:'1px solid rgba(167,139,250,0.4)' }} />
      {/* Tiny dot bottom-left */}
      <div className="animate-pulse-slow" style={{ position:'absolute', bottom:60, left:30, width:12, height:12, borderRadius:'50%', background:'rgba(99,102,241,0.5)' }} />
      {/* Medium bubble bottom-right */}
      <div className="animate-float-slow" style={{ position:'absolute', bottom:20, right:50, width:28, height:28, borderRadius:'50%', background:'linear-gradient(135deg,rgba(139,92,246,0.25),rgba(99,102,241,0.15))', border:'1px solid rgba(139,92,246,0.2)', animationDelay:'1.2s' }} />
      {/* Extra small dots */}
      <div className="animate-bounce-slow" style={{ position:'absolute', top:'60%', left:5, width:8, height:8, borderRadius:'50%', background:'rgba(139,92,246,0.6)', animationDelay:'0.5s' }} />
      <div className="animate-float-medium" style={{ position:'absolute', top:15, left:'40%', width:10, height:10, borderRadius:'50%', background:'rgba(99,102,241,0.4)', animationDelay:'0.3s' }} />

      {/* ── Main composition wrapper ── */}
      <div style={{ position:'relative', width:420, height:360 }}>

        {/* ── Central shield platform ── */}
        {/* Canvas 420px wide. Shield: left:145 → x:145–275. Security card: left:285 → x:285–413. Gap=10px ✓ */}
        <div className="animate-float" style={{
          position:'absolute', bottom:40, left:145,
          width:130, height:130, borderRadius:'50%',
          background:'linear-gradient(145deg,rgba(255,255,255,0.9),rgba(237,233,254,0.85))',
          boxShadow:'0 20px 60px rgba(139,92,246,0.3), 0 0 0 1px rgba(139,92,246,0.12), inset 0 1px 0 rgba(255,255,255,0.8)',
          backdropFilter:'blur(16px)',
          display:'flex', alignItems:'center', justifyContent:'center',
        }}>
          <svg width="64" height="72" viewBox="0 0 64 72" fill="none">
            <defs>
              <linearGradient id="sg1" x1="0" y1="0" x2="64" y2="72" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#7C3AED"/>
                <stop offset="100%" stopColor="#4F46E5"/>
              </linearGradient>
            </defs>
            {/* Outer shield glow */}
            <path d="M32 4L4 15v18c0 16.6 11.6 32.2 28 36 16.4-3.8 28-19.4 28-36V15L32 4z" fill="url(#sg1)" opacity="0.12"/>
            {/* Main shield */}
            <path d="M32 8L8 18v15c0 14.4 10 27.8 24 31 14-3.2 24-16.6 24-31V18L32 8z" fill="url(#sg1)"/>
            {/* Checkmark */}
            <path d="M21 34l7 7 15-15" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        {/* ── Student card — top left ── */}
        <div className="animate-float-slow" style={{
          position:'absolute', top:8, left:0,
          width:138, padding:'10px 12px',
          background:'rgba(255,255,255,0.95)',
          borderRadius:14,
          boxShadow:'0 8px 30px rgba(99,102,241,0.15), 0 0 0 1px rgba(99,102,241,0.08)',
          backdropFilter:'blur(12px)',
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
            <div style={{ width:28, height:28, borderRadius:'50%', background:'linear-gradient(135deg,#6366f1,#4f46e5)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <svg width="14" height="14" fill="white" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
              </svg>
            </div>
            <div>
              <p style={{ fontSize:11, fontWeight:700, color:'#1e1b4b', lineHeight:1.3 }}>Student</p>
              <p style={{ fontSize:9, color:'#6b7280', lineHeight:1.3 }}>Pass Applied</p>
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:5 }}>
            <div style={{ width:7, height:7, borderRadius:'50%', background:'#10b981' }}/>
            <span style={{ fontSize:9, color:'#059669', fontWeight:600 }}>Submitted</span>
          </div>
        </div>

        {/* ── QR Pass card — top right ── */}
        <div className="animate-float-medium" style={{
          position:'absolute', top:0, right:0,
          width:128, padding:'10px 12px',
          background:'rgba(255,255,255,0.95)',
          borderRadius:14,
          boxShadow:'0 8px 30px rgba(139,92,246,0.15), 0 0 0 1px rgba(139,92,246,0.08)',
          backdropFilter:'blur(12px)',
        }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:7 }}>
            <p style={{ fontSize:11, fontWeight:700, color:'#1e1b4b' }}>QR Pass</p>
            <div style={{ width:7, height:7, borderRadius:'50%', background:'#8b5cf6' }}/>
          </div>
          {/* Proper QR code SVG */}
          <svg width="80" height="80" viewBox="0 0 80 80" style={{ display:'block', margin:'0 auto 6px' }}>
            {/* Top-left position square */}
            <rect x="4" y="4" width="24" height="24" rx="3" fill="#4F46E5"/>
            <rect x="8" y="8" width="16" height="16" rx="2" fill="white"/>
            <rect x="11" y="11" width="10" height="10" rx="1" fill="#4F46E5"/>
            {/* Top-right position square */}
            <rect x="52" y="4" width="24" height="24" rx="3" fill="#4F46E5"/>
            <rect x="56" y="8" width="16" height="16" rx="2" fill="white"/>
            <rect x="59" y="11" width="10" height="10" rx="1" fill="#4F46E5"/>
            {/* Bottom-left position square */}
            <rect x="4" y="52" width="24" height="24" rx="3" fill="#4F46E5"/>
            <rect x="8" y="56" width="16" height="16" rx="2" fill="white"/>
            <rect x="11" y="59" width="10" height="10" rx="1" fill="#4F46E5"/>
            {/* Data modules — middle area */}
            <rect x="32" y="4"  width="4" height="4" rx="1" fill="#4F46E5"/>
            <rect x="38" y="4"  width="4" height="4" rx="1" fill="#4F46E5"/>
            <rect x="44" y="4"  width="4" height="4" rx="1" fill="#4F46E5"/>
            <rect x="32" y="10" width="4" height="4" rx="1" fill="#4F46E5"/>
            <rect x="44" y="10" width="4" height="4" rx="1" fill="#4F46E5"/>
            <rect x="38" y="16" width="4" height="4" rx="1" fill="#4F46E5"/>
            <rect x="32" y="22" width="4" height="4" rx="1" fill="#4F46E5"/>
            <rect x="38" y="22" width="4" height="4" rx="1" fill="#4F46E5"/>
            <rect x="44" y="22" width="4" height="4" rx="1" fill="#4F46E5"/>
            {/* Right column data */}
            <rect x="52" y="32" width="4" height="4" rx="1" fill="#4F46E5"/>
            <rect x="58" y="32" width="4" height="4" rx="1" fill="#4F46E5"/>
            <rect x="64" y="32" width="4" height="4" rx="1" fill="#4F46E5"/>
            <rect x="70" y="32" width="4" height="4" rx="1" fill="#4F46E5"/>
            <rect x="52" y="38" width="4" height="4" rx="1" fill="#4F46E5"/>
            <rect x="64" y="38" width="4" height="4" rx="1" fill="#4F46E5"/>
            <rect x="58" y="44" width="4" height="4" rx="1" fill="#4F46E5"/>
            <rect x="70" y="44" width="4" height="4" rx="1" fill="#4F46E5"/>
            <rect x="52" y="50" width="4" height="4" rx="1" fill="#4F46E5"/>
            <rect x="64" y="50" width="4" height="4" rx="1" fill="#4F46E5"/>
            <rect x="70" y="50" width="4" height="4" rx="1" fill="#4F46E5"/>
            {/* Bottom-right data area */}
            <rect x="52" y="58" width="4" height="4" rx="1" fill="#4F46E5"/>
            <rect x="58" y="58" width="4" height="4" rx="1" fill="#4F46E5"/>
            <rect x="70" y="58" width="4" height="4" rx="1" fill="#4F46E5"/>
            <rect x="52" y="64" width="4" height="4" rx="1" fill="#4F46E5"/>
            <rect x="64" y="64" width="4" height="4" rx="1" fill="#4F46E5"/>
            <rect x="58" y="70" width="4" height="4" rx="1" fill="#4F46E5"/>
            <rect x="70" y="70" width="4" height="4" rx="1" fill="#4F46E5"/>
            {/* Center data modules */}
            <rect x="4"  y="32" width="4" height="4" rx="1" fill="#4F46E5"/>
            <rect x="10" y="32" width="4" height="4" rx="1" fill="#4F46E5"/>
            <rect x="16" y="32" width="4" height="4" rx="1" fill="#4F46E5"/>
            <rect x="22" y="32" width="4" height="4" rx="1" fill="#4F46E5"/>
            <rect x="4"  y="38" width="4" height="4" rx="1" fill="#4F46E5"/>
            <rect x="16" y="38" width="4" height="4" rx="1" fill="#4F46E5"/>
            <rect x="22" y="38" width="4" height="4" rx="1" fill="#4F46E5"/>
            <rect x="10" y="44" width="4" height="4" rx="1" fill="#4F46E5"/>
            <rect x="22" y="44" width="4" height="4" rx="1" fill="#4F46E5"/>
            <rect x="4"  y="50" width="4" height="4" rx="1" fill="#4F46E5"/>
            <rect x="16" y="50" width="4" height="4" rx="1" fill="#4F46E5"/>
            <rect x="4"  y="56" width="4" height="4" rx="1" fill="#4F46E5"/>
            <rect x="10" y="56" width="4" height="4" rx="1" fill="#4F46E5"/>
            <rect x="22" y="56" width="4" height="4" rx="1" fill="#4F46E5"/>
            <rect x="16" y="62" width="4" height="4" rx="1" fill="#4F46E5"/>
            <rect x="4"  y="68" width="4" height="4" rx="1" fill="#4F46E5"/>
            <rect x="10" y="68" width="4" height="4" rx="1" fill="#4F46E5"/>
            <rect x="22" y="68" width="4" height="4" rx="1" fill="#4F46E5"/>
            {/* Center cross data */}
            <rect x="32" y="32" width="4" height="4" rx="1" fill="#4F46E5"/>
            <rect x="38" y="32" width="4" height="4" rx="1" fill="#4F46E5"/>
            <rect x="44" y="32" width="4" height="4" rx="1" fill="#4F46E5"/>
            <rect x="32" y="38" width="4" height="4" rx="1" fill="#4F46E5"/>
            <rect x="44" y="38" width="4" height="4" rx="1" fill="#4F46E5"/>
            <rect x="38" y="44" width="4" height="4" rx="1" fill="#4F46E5"/>
            <rect x="32" y="50" width="4" height="4" rx="1" fill="#4F46E5"/>
            <rect x="44" y="50" width="4" height="4" rx="1" fill="#4F46E5"/>
            <rect x="38" y="56" width="4" height="4" rx="1" fill="#4F46E5"/>
            <rect x="32" y="62" width="4" height="4" rx="1" fill="#4F46E5"/>
            <rect x="44" y="62" width="4" height="4" rx="1" fill="#4F46E5"/>
            <rect x="38" y="68" width="4" height="4" rx="1" fill="#4F46E5"/>
          </svg>
          <div style={{ display:'flex', alignItems:'center', gap:5 }}>
            <div style={{ width:7, height:7, borderRadius:'50%', background:'#8b5cf6' }}/>
            <span style={{ fontSize:9, color:'#7c3aed', fontWeight:600 }}>Generated</span>
          </div>
        </div>

        {/* ── Approval card — left middle ── */}
        <div className="animate-float-medium" style={{
          position:'absolute', top:'42%', left:-10, transform:'translateY(-50%)',
          width:118, padding:'9px 12px',
          background:'rgba(255,255,255,0.95)',
          borderRadius:13,
          boxShadow:'0 8px 28px rgba(245,158,11,0.15), 0 0 0 1px rgba(245,158,11,0.1)',
          backdropFilter:'blur(12px)',
          animationDelay:'0.4s',
        }}>
          <p style={{ fontSize:9, fontWeight:800, color:'#92400e', letterSpacing:'0.06em', marginBottom:6 }}>APPROVAL</p>
          {[
            { label:'Coordinator', done:true },
            { label:'Hostel Staff', done:true },
          ].map(({ label, done }) => (
            <div key={label} style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
              <div style={{ width:13, height:13, borderRadius:'50%', background: done ? '#10b981' : '#e5e7eb', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                {done && <svg width="8" height="8" fill="white" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>}
              </div>
              <span style={{ fontSize:9, color:'#374151', fontWeight:500 }}>{label}</span>
            </div>
          ))}
        </div>

        {/* ── Security card — RIGHT of shield, vertically centered with it ── */}
        {/* Shield: left:145, width:130 → right edge at 275. Security left:290 → 15px gap ✓ */}
        <div className="animate-float-slow" style={{
          position:'absolute', bottom:55, left:290,
          width:128, padding:'10px 12px',
          background:'rgba(255,255,255,0.95)',
          borderRadius:14,
          boxShadow:'0 8px 30px rgba(16,185,129,0.15), 0 0 0 1px rgba(16,185,129,0.08)',
          backdropFilter:'blur(12px)',
          animationDelay:'0.6s',
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
            <div style={{ width:28, height:28, borderRadius:'50%', background:'linear-gradient(135deg,#10b981,#059669)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <svg width="14" height="14" fill="white" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
            </div>
            <div>
              <p style={{ fontSize:11, fontWeight:700, color:'#1e1b4b', lineHeight:1.3 }}>Security</p>
              <p style={{ fontSize:9, color:'#6b7280', lineHeight:1.3 }}>Gate Check</p>
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:5 }}>
            <div style={{ width:7, height:7, borderRadius:'50%', background:'#10b981' }}/>
            <span style={{ fontSize:9, color:'#059669', fontWeight:600 }}>Verified ✓</span>
          </div>
        </div>

        {/* ── Scan line animation on QR card ── */}
        <div style={{ position:'absolute', top:12, right:2, width:128, height:108, borderRadius:14, overflow:'hidden', pointerEvents:'none' }}>
          <div style={{
            position:'absolute', left:12, right:12, height:1.5,
            background:'linear-gradient(90deg,transparent,rgba(99,102,241,0.7),transparent)',
            animation:'scanLine 2.5s linear infinite',
            boxShadow:'0 0 6px rgba(99,102,241,0.5)',
          }}/>
        </div>

      </div>
    </div>
  )
}

export default HeroIllustration
