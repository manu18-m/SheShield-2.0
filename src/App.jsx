// src/App.jsx — SafeGuard v3 (Startup Edition)

import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation }  from "./hooks/useLocation";
import { useShake }     from "./hooks/useShake";
import { useAlarm }     from "./hooks/useAlarm";
import {
  signUp, logIn, logOut, resetPassword,
  onAuthChange, friendlyError,
} from "./services/authService";
import {
  addContact, updateContact, deleteContact, listenToContacts,
  addIncident, deleteIncident, listenToIncidents,
  logSOSEvent,
} from "./services/dbService";

// ── Icons ──────────────────────────────────────────────────────
const Svg = ({ size = 20, fill, sw = 2, children, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24"
    fill={fill || "none"} stroke={fill ? "none" : "currentColor"}
    strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...p}>
    {children}
  </svg>
);
const IcShield   = (p) => <Svg fill="currentColor" {...p}><path d="M12 2L4 6v6c0 5.5 3.8 10.7 8 12 4.2-1.3 8-6.5 8-12V6l-8-4z"/></Svg>;
const IcHome     = (p) => <Svg {...p}><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></Svg>;
const IcUsers    = (p) => <Svg {...p}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></Svg>;
const IcSettings = (p) => <Svg {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></Svg>;
const IcPin      = (p) => <Svg {...p}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></Svg>;
const IcPhone    = (p) => <Svg {...p}><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></Svg>;
const IcClock    = (p) => <Svg {...p}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></Svg>;
const IcAlert    = (p) => <Svg {...p}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></Svg>;
const IcEye      = (p) => <Svg {...p}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></Svg>;
const IcEyeOff   = (p) => <Svg {...p}><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></Svg>;
const IcTrash    = (p) => <Svg {...p}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2"/></Svg>;
const IcEdit     = (p) => <Svg {...p}><path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></Svg>;
const IcCheck    = (p) => <Svg {...p}><polyline points="20 6 9 13 4 10"/></Svg>;
const IcChevR    = (p) => <Svg {...p}><polyline points="9 18 15 12 9 6"/></Svg>;
const IcPlus     = (p) => <Svg {...p}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></Svg>;
const IcLock     = (p) => <Svg {...p}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></Svg>;
const IcMail     = (p) => <Svg {...p}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></Svg>;
const IcUser     = (p) => <Svg {...p}><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></Svg>;
const IcActivity = (p) => <Svg {...p}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></Svg>;

// ── CSS ────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Clash+Display:wght@500;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#07070f;--s1:#0d0d1a;--s2:#131324;--s3:#1a1a2e;--s4:#22223c;--s5:#2a2a48;
  --brd:rgba(255,255,255,0.06);--brd2:rgba(255,255,255,0.11);
  --rose:#ff1f6b;--rg:rgba(255,31,107,0.22);--rs:rgba(255,31,107,0.08);
  --teal:#00d4aa;--tg:rgba(0,212,170,0.22);--ts:rgba(0,212,170,0.08);
  --amber:#ffb800;--as2:rgba(255,184,0,0.08);
  --violet:#7c6fff;--vs:rgba(124,111,255,0.1);
  --txt:#eeeef8;--dim:#7070a0;--muted:#404060;
  --r:18px;--rs2:12px;
  --fh:'Clash Display',sans-serif;--fb:'Plus Jakarta Sans',sans-serif;
}
body{font-family:var(--fb);background:var(--bg);color:var(--txt);min-height:100vh;display:flex;align-items:center;justify-content:center}
#root{width:100%;min-height:100vh;display:flex;align-items:center;justify-content:center;
  background:radial-gradient(ellipse 80% 60% at 10% -5%,rgba(255,31,107,.06) 0%,transparent 55%),
  radial-gradient(ellipse 60% 40% at 90% 105%,rgba(124,111,255,.05) 0%,transparent 55%),var(--bg)}

.shell{width:393px;height:852px;background:var(--s1);border-radius:50px;overflow:hidden;display:flex;flex-direction:column;position:relative;
  box-shadow:0 0 0 1px rgba(255,255,255,.07),0 50px 120px rgba(0,0,0,.85),inset 0 1px 0 rgba(255,255,255,.08)}
.sbar{height:50px;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:space-between;padding:0 28px;flex-shrink:0;font-size:12px;font-weight:700;letter-spacing:.02em;position:relative;z-index:10}
.notch{width:130px;height:32px;background:#000;border-radius:16px;position:absolute;left:50%;top:9px;transform:translateX(-50%)}
.scr{flex:1;overflow-y:auto;overflow-x:hidden;scrollbar-width:none;position:relative}
.scr::-webkit-scrollbar{display:none}

.bnav{height:84px;background:rgba(7,7,15,.97);backdrop-filter:blur(28px);border-top:1px solid var(--brd);display:flex;align-items:center;justify-content:space-around;padding:0 8px 14px;flex-shrink:0}
.nb{display:flex;flex-direction:column;align-items:center;gap:4px;padding:8px 20px;border-radius:18px;cursor:pointer;border:none;background:none;color:var(--muted);font-family:var(--fb);font-size:10px;font-weight:600;transition:all .2s;letter-spacing:.02em}
.nb.on{color:var(--rose);background:var(--rs)}

.auth{padding:38px 28px 56px;min-height:100%}
.alogo{display:flex;align-items:center;gap:11px;margin-bottom:44px}
.alogobox{width:48px;height:48px;background:var(--rose);border-radius:15px;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 28px var(--rg);color:#fff}
.alogoname{font-family:var(--fh);font-size:22px;font-weight:700}
.alogoname span{color:var(--rose)}
.atitle{font-family:var(--fh);font-size:34px;font-weight:700;line-height:1.1;margin-bottom:8px}
.asub{color:var(--dim);font-size:14px;margin-bottom:32px;line-height:1.6}
.flbl{display:block;font-size:11px;font-weight:700;color:var(--dim);text-transform:uppercase;letter-spacing:.09em;margin-bottom:8px}
.fwrap{position:relative;display:flex;align-items:center;margin-bottom:14px}
.fic{position:absolute;left:15px;color:var(--muted);pointer-events:none}
.finp{width:100%;background:var(--s2);border:1.5px solid var(--brd);border-radius:var(--rs2);padding:14px 16px 14px 46px;color:var(--txt);font-family:var(--fb);font-size:15px;outline:none;transition:all .2s}
.finp:focus{border-color:var(--rose);box-shadow:0 0 0 3px var(--rs)}
.finp::placeholder{color:var(--muted)}
.feye{position:absolute;right:14px;background:none;border:none;color:var(--muted);cursor:pointer;padding:4px}
.btn{width:100%;padding:15px;background:var(--rose);border:none;border-radius:var(--rs2);color:#fff;font-family:var(--fh);font-size:16px;font-weight:600;cursor:pointer;transition:all .2s;box-shadow:0 8px 24px var(--rg);letter-spacing:.02em;margin-top:6px;display:flex;align-items:center;justify-content:center;gap:8px}
.btn:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 12px 32px var(--rg)}
.btn:disabled{opacity:.5;cursor:not-allowed}
.btnghost{background:var(--s3);box-shadow:none;color:var(--txt)}
.btnghost:hover:not(:disabled){background:var(--s4);transform:none;box-shadow:none}
.adiv{display:flex;align-items:center;gap:12px;margin:18px 0;color:var(--muted);font-size:12px}
.adiv::before,.adiv::after{content:'';flex:1;height:1px;background:var(--brd)}
.afoot{margin-top:20px;text-align:center;color:var(--dim);font-size:14px}
.afoot button{color:var(--rose);font-weight:700;cursor:pointer;background:none;border:none;font-size:14px;font-family:inherit}
.backbtn{display:flex;align-items:center;gap:6px;background:none;border:none;color:var(--dim);font-family:var(--fb);font-size:14px;cursor:pointer;margin-bottom:28px}
.errbox{background:rgba(255,31,107,.1);border:1px solid rgba(255,31,107,.28);border-radius:var(--rs2);padding:11px 14px;font-size:13px;color:var(--rose);margin-bottom:16px;line-height:1.5}
.spin{width:18px;height:18px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .65s linear infinite;display:inline-block;flex-shrink:0}
@keyframes spin{to{transform:rotate(360deg)}}
.toast{position:absolute;top:58px;left:50%;transform:translateX(-50%);background:var(--s4);border:1px solid var(--brd2);border-radius:100px;padding:10px 22px;font-size:13px;font-weight:600;white-space:nowrap;z-index:9999;box-shadow:0 16px 48px rgba(0,0,0,.6);animation:tin .3s ease-out;pointer-events:none;max-width:340px;text-align:center}
@keyframes tin{from{opacity:0;transform:translateX(-50%) translateY(-12px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
.stitle{font-family:var(--fh);font-size:11px;font-weight:600;color:var(--dim);text-transform:uppercase;letter-spacing:.1em;margin-bottom:11px}

.hhdr{padding:22px 20px 0;display:flex;align-items:center;justify-content:space-between;margin-bottom:18px}
.hgreet{font-size:13px;color:var(--dim)}
.hname{font-family:var(--fh);font-size:22px;font-weight:700}
.hav{width:46px;height:46px;border-radius:50%;background:linear-gradient(135deg,var(--rose),var(--violet));display:flex;align-items:center;justify-content:center;font-family:var(--fh);font-size:18px;font-weight:700;color:#fff;cursor:pointer;flex-shrink:0}

.dc{margin:0 18px 16px;background:var(--s2);border:1px solid var(--brd);border-radius:var(--r);overflow:hidden}
.dch{padding:14px 16px 0;display:flex;align-items:center;justify-content:space-between}
.dcl{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--dim)}
.dcbadge{padding:3px 11px;border-radius:100px;font-size:11px;font-weight:700}
.dcbar{padding:12px 16px 14px;display:flex;align-items:center;gap:12px}
.dcbg{flex:1;height:8px;background:var(--s4);border-radius:4px;overflow:hidden}
.dcfill{height:100%;border-radius:4px;transition:width 1.2s ease}
.dcscore{font-family:var(--fh);font-size:22px;font-weight:700;min-width:40px;text-align:right}
.dcchips{display:flex;gap:7px;padding:0 16px 14px;flex-wrap:wrap}
.chip{padding:4px 10px;border-radius:100px;font-size:11px;font-weight:600}
.chs{background:var(--ts);color:var(--teal)}
.chw{background:var(--as2);color:var(--amber)}
.chd{background:var(--rs);color:var(--rose)}
.chm{background:var(--s3);color:var(--muted)}

.sbar2{margin:0 18px 16px;border-radius:var(--rs2);padding:11px 14px;display:flex;align-items:center;gap:10px;border:1px solid;transition:all .4s}
.sbar2.safe{background:var(--ts);border-color:rgba(0,212,170,.2)}
.sbar2.sos{background:var(--rs);border-color:rgba(255,31,107,.25)}
.sdot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
.sdot.safe{background:var(--teal);animation:pt 2s infinite}
.sdot.sos{background:var(--rose);animation:pr .75s infinite}
@keyframes pt{0%,100%{box-shadow:0 0 0 0 rgba(0,212,170,.7)}50%{box-shadow:0 0 0 6px rgba(0,212,170,0)}}
@keyframes pr{0%,100%{box-shadow:0 0 0 0 rgba(255,31,107,.8)}50%{box-shadow:0 0 0 8px rgba(255,31,107,0)}}
.sb2t{font-size:13px;font-weight:600;flex:1}

.lcard{margin:0 18px 16px;background:var(--s2);border:1px solid var(--brd);border-radius:var(--r);overflow:hidden;cursor:pointer;transition:border-color .2s}
.lcard:hover{border-color:rgba(0,212,170,.25)}
.lmap{height:88px;background:linear-gradient(135deg,#0c1520,#0c1a0e);position:relative;display:flex;align-items:center;justify-content:center}
.lgrid{position:absolute;inset:0;background-image:linear-gradient(rgba(0,212,170,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,170,.06) 1px,transparent 1px);background-size:22px 22px}
.linfo{padding:11px 14px;display:flex;align-items:center;gap:10px}
.lname{font-size:14px;font-weight:600}
.lcoord{font-size:11px;color:var(--muted);margin-top:2px}
.lpill{padding:3px 9px;border-radius:100px;font-size:11px;font-weight:700;flex-shrink:0}

.moodcard{margin:0 18px 16px;background:var(--s2);border:1px solid var(--brd);border-radius:var(--r);padding:14px}
.moodtitle{font-family:var(--fh);font-size:14px;font-weight:700;margin-bottom:12px}
.moodrow{display:flex;gap:7px}
.moodbtn{flex:1;padding:9px 4px;border-radius:var(--rs2);border:1.5px solid var(--brd);background:var(--s3);cursor:pointer;transition:all .2s;display:flex;flex-direction:column;align-items:center;gap:4px;font-family:var(--fb)}
.moodbtn:hover{transform:translateY(-2px)}
.moodbtn.sel{border-color:var(--rose)}
.me{font-size:20px}
.ml{font-size:10px;font-weight:600;color:var(--dim)}

.wcard{margin:0 18px 16px;background:var(--s2);border:1px solid var(--brd);border-radius:var(--r);padding:14px}
.whdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}
.wtitle{font-family:var(--fh);font-size:14px;font-weight:700;display:flex;align-items:center;gap:7px}
.wbadge{padding:3px 10px;border-radius:100px;font-size:11px;font-weight:700}
.wprog{height:5px;background:var(--s4);border-radius:3px;overflow:hidden;margin-bottom:10px}
.wfill{height:100%;border-radius:3px;background:linear-gradient(90deg,var(--amber),var(--rose));transition:width .5s}
.wrow{display:flex;align-items:center;justify-content:space-between}
.wtime{font-family:var(--fh);font-size:26px;font-weight:700}
.wsub{font-size:12px;color:var(--dim);margin-top:2px}
.wbtns{display:flex;gap:7px}
.wbtn{padding:8px 14px;border-radius:var(--rs2);border:none;font-family:var(--fb);font-size:13px;font-weight:600;cursor:pointer;transition:all .2s}

.sossec{display:flex;flex-direction:column;align-items:center;padding:0 18px 22px}
.soslbl{font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);margin-bottom:16px}
.sosrings{position:relative;width:190px;height:190px;display:flex;align-items:center;justify-content:center}
.sosring{position:absolute;inset:0;border-radius:50%;border:1.5px solid rgba(255,31,107,.13);animation:ridle 3s ease-in-out infinite}
.sosring:nth-child(2){inset:-12px;border-color:rgba(255,31,107,.08);animation-delay:.6s}
.sosring:nth-child(3){inset:-26px;border-color:rgba(255,31,107,.04);animation-delay:1.2s}
@keyframes ridle{0%,100%{transform:scale(1);opacity:.7}50%{transform:scale(1.02);opacity:1}}
.sosring.act{border-color:rgba(255,31,107,.5);animation:ract .7s ease-in-out infinite}
.sosring.act:nth-child(2){border-color:rgba(255,31,107,.3)}
.sosring.act:nth-child(3){border-color:rgba(255,31,107,.15)}
@keyframes ract{0%,100%{transform:scale(1)}50%{transform:scale(1.07)}}
.sosbtn{width:152px;height:152px;border-radius:50%;border:none;background:radial-gradient(circle at 34% 32%,#ff5085,#c8114e);cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;box-shadow:0 0 0 5px rgba(255,31,107,.18),0 18px 50px rgba(255,31,107,.5),inset 0 2px 4px rgba(255,255,255,.18);transition:all .15s;position:relative;z-index:1;color:#fff;font-family:var(--fh);font-size:44px;font-weight:700}
.sosbtn:active{transform:scale(.95)}
.sosbtn.act{background:radial-gradient(circle at 34% 32%,#ff6699,#ff1f6b);animation:sbp .7s ease-in-out infinite}
@keyframes sbp{0%,100%{box-shadow:0 0 0 5px rgba(255,31,107,.3),0 18px 50px rgba(255,31,107,.6),inset 0 2px 4px rgba(255,255,255,.2)}50%{box-shadow:0 0 0 14px rgba(255,31,107,.12),0 24px 72px rgba(255,31,107,.9),inset 0 2px 4px rgba(255,255,255,.2)}}
.sossub{font-size:11px;font-weight:600;letter-spacing:.06em;opacity:.8;margin-top:1px}
.soshint{margin-top:12px;font-size:12px;color:var(--muted);text-align:center}

.qsec{padding:0 18px;margin-bottom:20px}
.qgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.qcard{background:var(--s2);border:1px solid var(--brd);border-radius:var(--rs2);padding:13px 8px;display:flex;flex-direction:column;align-items:center;gap:6px;cursor:pointer;transition:all .2s;text-align:center}
.qcard:hover{border-color:rgba(255,31,107,.3);background:var(--rs);transform:translateY(-1px)}
.qi{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:17px}
.ql{font-size:11px;font-weight:600;color:var(--dim);line-height:1.3}

.sovlay{position:absolute;inset:0;background:linear-gradient(180deg,#120010,#07000a);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:200;padding:32px;gap:16px}
.sovico{width:74px;height:74px;border-radius:50%;background:var(--rs);border:2px solid var(--rose);display:flex;align-items:center;justify-content:center;animation:ract .7s ease-in-out infinite}
.sovtitle{font-family:var(--fh);font-size:26px;font-weight:700;color:var(--rose);text-align:center}
.sovsub{font-size:13px;color:var(--dim);text-align:center;line-height:1.65}
.sovlist{width:100%;display:flex;flex-direction:column;gap:8px}
.sovrow{background:var(--s2);border:1px solid var(--brd);border-radius:var(--rs2);padding:11px 14px;display:flex;align-items:center;gap:11px;font-size:13px}
.bcncl{width:100%;padding:14px;background:var(--s3);border:1px solid var(--brd2);border-radius:var(--rs2);color:var(--txt);font-family:var(--fh);font-size:15px;font-weight:600;cursor:pointer;transition:all .2s;margin-top:4px}
.bcncl:hover{border-color:var(--rose);color:var(--rose)}

.fcall{position:absolute;inset:0;z-index:250;background:linear-gradient(180deg,#091a10,#040c08);display:flex;flex-direction:column;align-items:center;justify-content:space-between;padding:64px 30px 60px}
.fcav{width:90px;height:90px;border-radius:50%;background:linear-gradient(135deg,var(--teal),var(--violet));display:flex;align-items:center;justify-content:center;font-family:var(--fh);font-size:36px;font-weight:700;color:#fff;box-shadow:0 0 0 6px rgba(0,212,170,.15),0 16px 40px rgba(0,212,170,.3)}
.fcname{font-family:var(--fh);font-size:28px;font-weight:700;margin-top:16px;text-align:center}
.fcsub{font-size:14px;color:var(--teal);margin-top:6px}
.fcwave{display:flex;gap:4px;align-items:center;height:22px;margin-top:10px}
.fcwave span{width:3px;background:var(--teal);border-radius:2px;animation:wave 1.2s ease-in-out infinite}
.fcwave span:nth-child(1){height:8px}
.fcwave span:nth-child(2){height:16px;animation-delay:.15s}
.fcwave span:nth-child(3){height:12px;animation-delay:.3s}
.fcwave span:nth-child(4){height:18px;animation-delay:.45s}
.fcwave span:nth-child(5){height:10px;animation-delay:.6s}
@keyframes wave{0%,100%{transform:scaleY(.5);opacity:.5}50%{transform:scaleY(1);opacity:1}}
.fcbtns{display:flex;gap:52px}
.fcgrp{display:flex;flex-direction:column;align-items:center;gap:8px}
.fcbtn{width:72px;height:72px;border-radius:50%;border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .2s}
.fcbtn:active{transform:scale(.93)}
.fcend{background:var(--rose);box-shadow:0 8px 28px var(--rg)}
.fcans{background:var(--teal);box-shadow:0 8px 28px var(--tg)}
.fclbl{font-size:12px;color:var(--dim)}

.pg{padding:22px 18px}
.pghdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px}
.pgtitle{font-family:var(--fh);font-size:24px;font-weight:700}
.addbtn{width:38px;height:38px;background:var(--rose);border:none;border-radius:12px;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 4px 14px var(--rg);color:#fff;transition:all .2s}
.addbtn:hover{transform:translateY(-1px)}
.ccard{background:var(--s2);border:1px solid var(--brd);border-radius:var(--rs2);padding:13px;margin-bottom:8px;display:flex;align-items:center;gap:12px;transition:border-color .2s}
.ccard:hover{border-color:rgba(255,31,107,.15)}
.cav{width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:var(--fh);font-size:17px;font-weight:700;flex-shrink:0}
.cinfo{flex:1;min-width:0}
.cname{font-weight:600;font-size:14px;margin-bottom:1px}
.cph{font-size:12px;color:var(--dim)}
.crel{font-size:10px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);margin-top:2px}
.cbtns{display:flex;gap:5px}
.cbtn{width:31px;height:31px;border-radius:9px;border:1px solid var(--brd);background:var(--s3);display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--dim);transition:all .2s}
.cbtn:hover{color:var(--rose);border-color:rgba(255,31,107,.3)}
.cbtn.on{background:var(--ts);border-color:rgba(0,212,170,.4);color:var(--teal)}

.icard{background:var(--s2);border:1px solid var(--brd);border-radius:var(--rs2);padding:13px;margin-bottom:8px}
.ichdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:5px}
.ictype{display:flex;align-items:center;gap:6px;font-size:13px;font-weight:700}
.ictime{font-size:11px;color:var(--muted)}
.icnote{font-size:13px;color:var(--dim);line-height:1.5}
.icloc{font-size:11px;color:var(--muted);margin-top:5px;display:flex;align-items:center;gap:4px}
.sh{color:var(--rose)}.sm{color:var(--amber)}.sl{color:var(--teal)}

.pbanner{background:linear-gradient(135deg,#1e0a10,#380d1e);border:1px solid rgba(255,31,107,.2);border-radius:var(--r);padding:18px;margin-bottom:20px;display:flex;align-items:center;gap:14px}
.pav{width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,var(--rose),var(--violet));display:flex;align-items:center;justify-content:center;font-family:var(--fh);font-size:22px;font-weight:700}
.pname{font-family:var(--fh);font-size:18px;font-weight:700}
.pemail{font-size:12px;color:rgba(255,255,255,.45);margin-top:2px}
.pbadge{font-size:11px;color:rgba(0,212,170,.8);margin-top:4px}
.sgrp{background:var(--s2);border:1px solid var(--brd);border-radius:var(--r);overflow:hidden;margin-bottom:14px}
.srow{display:flex;align-items:center;gap:12px;padding:14px;border-bottom:1px solid var(--brd);cursor:pointer;transition:background .15s}
.srow:last-child{border-bottom:none}
.srow:hover{background:var(--rs)}
.sico{width:33px;height:33px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0}
.slbl{flex:1;font-size:14px;font-weight:500}
.toggle{width:44px;height:24px;border-radius:12px;background:var(--s4);border:none;cursor:pointer;position:relative;transition:background .2s;flex-shrink:0}
.toggle.on{background:var(--rose)}
.toggle::after{content:'';position:absolute;width:18px;height:18px;border-radius:50%;background:#fff;top:3px;left:3px;transition:transform .2s;box-shadow:0 2px 4px rgba(0,0,0,.3)}
.toggle.on::after{transform:translateX(20px)}

.mbd{position:absolute;inset:0;background:rgba(0,0,0,.7);backdrop-filter:blur(6px);display:flex;align-items:flex-end;z-index:300}
.msh{width:100%;background:var(--s1);border-radius:28px 28px 0 0;padding:20px 20px 44px;border-top:1px solid var(--brd2);max-height:88%;overflow-y:auto;scrollbar-width:none}
.msh::-webkit-scrollbar{display:none}
.mhdl{width:36px;height:4px;background:var(--brd2);border-radius:2px;margin:0 auto 18px}
.mtitle{font-family:var(--fh);font-size:18px;font-weight:700;margin-bottom:16px}

.loadscr{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:16px}

.calc{background:#1a1a1a;width:100%;height:100%;display:flex;flex-direction:column;padding:16px}
.calcd{flex:1;display:flex;flex-direction:column;align-items:flex-end;justify-content:flex-end;padding:8px 6px 18px;gap:4px}
.calce{font-size:20px;color:#666;font-family:monospace}
.calcr{font-size:52px;font-weight:200;font-family:monospace;color:#fff;word-break:break-all;line-height:1}
.calcg{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;padding:0 2px}
.ck{height:62px;border-radius:50%;border:none;font-size:22px;cursor:pointer;transition:all .15s;display:flex;align-items:center;justify-content:center;font-family:inherit}
.ck:active{opacity:.6;transform:scale(.93)}
.ckfn{background:#333;color:#fff}.ckop{background:#ff9f0a;color:#fff;font-size:28px}.cknum{background:#636366;color:#fff}.ckeq{background:#ff9f0a;color:#fff}
.ck0{border-radius:31px!important;width:100%;justify-content:flex-start;padding-left:22px}
.calch{text-align:center;font-size:10px;color:#2a2a2a;margin-top:14px;padding-bottom:8px}
`;

// ── Constants ──────────────────────────────────────────────────
const AVC = [
  ["#ff1f6b","#ff8fab"],["#7c6fff","#c4b5fd"],["#00d4aa","#5eead4"],
  ["#ffb800","#fcd34d"],["#06b6d4","#67e8f9"],["#ec4899","#f9a8d4"],
];
const MOODS = [
  {e:"😌",l:"Very Safe",s:95,c:"#00d4aa"},{e:"🙂",l:"Safe",s:74,c:"#22dd88"},
  {e:"😐",l:"Unsure",  s:50,c:"#ffb800"},{e:"😟",l:"Uneasy",s:28,c:"#ff8800"},
  {e:"😨",l:"Unsafe",  s:8, c:"#ff1f6b"},
];
const FAKE_CALLERS = ["Mom 💗","Priya (BFF)","Rahul (Bro)","Meera Auntie","Manager"];
const INC_TYPES    = ["Followed","Harassment","Unsafe Area","Suspicious Person","Other"];
const fmt = (s) => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
const hour = () => new Date().getHours();
const greeting = () => { const h=hour(); return h<12?"Good morning":h<17?"Good afternoon":"Good evening"; };

// ── App ────────────────────────────────────────────────────────
export default function App() {
  const [authUser,    setAuthUser]    = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [page,        setPage]        = useState("login");

  const [lf,  setLf]  = useState({email:"",password:""});
  const [sf,  setSf]  = useState({name:"",email:"",phone:"",password:"",confirm:""});
  const [fe,  setFe]  = useState("");
  const [pwd, setPwd] = useState(false);
  const [aerr,setAerr]= useState("");
  const [busy,setBusy]= useState(false);

  const [tab,    setTab]    = useState("home");
  const [subTab, setSubTab] = useState("");

  const [contacts,  setContacts]  = useState([]);
  const [incidents, setIncidents] = useState([]);

  const [sosActive,   setSosActive]   = useState(false);
  const [sosCounting, setSosCounting] = useState(false);
  const [sosTimer,    setSosTimer]    = useState(3);
  const sosRef = useRef(null);

  const [buzzer, setBuzzer] = useState(true);
  const [shake,  setShake]  = useState(true);
  const [disc,   setDisc]   = useState(false);

  const [walkOn,    setWalkOn]    = useState(false);
  const [walkTotal, setWalkTotal] = useState(600);
  const [walkLeft,  setWalkLeft]  = useState(600);
  const walkRef = useRef(null);

  const [mood,   setMood]   = useState(null);
  const [danger, setDanger] = useState(22);

  const [fakeOn,     setFakeOn]     = useState(false);
  const [fakeCaller, setFakeCaller] = useState(FAKE_CALLERS[0]);
  const fakeRef = useRef(null);

  const [showCM, setShowCM] = useState(false);
  const [showIM, setShowIM] = useState(false);
  const [editC,  setEditC]  = useState(null);
  const [nc, setNc] = useState({name:"",phone:"",relation:""});
  const [ni, setNi] = useState({type:"",severity:"med",note:"",location:""});

  const [cval, setCval] = useState("0");
  const [cexp, setCexp] = useState("");

  const [toastMsg, setToastMsg] = useState(null);
  const tRef = useRef(null);

  const gps = useLocation();
  const { startAlarm, stopAlarm } = useAlarm();

  const toast = useCallback((m) => {
    setToastMsg(m);
    clearTimeout(tRef.current);
    tRef.current = setTimeout(() => setToastMsg(null), 2800);
  }, []);

  useEffect(() => {
    const u = onAuthChange((user) => {
      setAuthUser(user);
      setAuthLoading(false);
      if (user) setPage("app");
    });
    return u;
  }, []);

  useEffect(() => {
    if (!authUser) return;
    const u1 = listenToContacts(authUser.uid,  setContacts);
    const u2 = listenToIncidents(authUser.uid, setIncidents);
    return () => { u1(); u2(); };
  }, [authUser]);

  useEffect(() => {
    setDanger(hour() >= 21 || hour() < 6 ? 45 : 18);
  }, []);

  useEffect(() => {
    if (walkOn && walkLeft > 0) {
      walkRef.current = setInterval(() => {
        setWalkLeft((t) => {
          if (t <= 1) { clearInterval(walkRef.current); setWalkOn(false); toast("⚠️ Walk timer expired — SOS activated!"); activateSOS(); return 0; }
          return t - 1;
        });
      }, 1000);
    } else clearInterval(walkRef.current);
    return () => clearInterval(walkRef.current);
  }, [walkOn]);

  const activateSOS = useCallback(() => {
    setSosActive(true);
    if (buzzer) startAlarm();
    if (authUser && gps.lat) logSOSEvent(authUser.uid, { lat: gps.lat, lng: gps.lng, place: gps.place });
  }, [buzzer, startAlarm, authUser, gps]);

  const triggerSOS = useCallback(() => {
    if (sosActive) { cancelSOS(); return; }
    if (sosCounting) { clearInterval(sosRef.current); setSosCounting(false); setSosTimer(3); toast("SOS cancelled"); return; }
    setSosCounting(true); setSosTimer(3); let t = 3;
    sosRef.current = setInterval(() => { t--; setSosTimer(t); if (t <= 0) { clearInterval(sosRef.current); setSosCounting(false); activateSOS(); } }, 1000);
  }, [sosActive, sosCounting, activateSOS]);

  const cancelSOS = useCallback(() => {
    clearInterval(sosRef.current);
    setSosCounting(false); setSosActive(false); setSosTimer(3);
    stopAlarm();
    toast("✓ SOS cancelled. You're safe!");
  }, [stopAlarm]);

  useShake(
    useCallback(() => { if (!sosActive && !sosCounting) { toast("📳 Shake detected!"); triggerSOS(); } }, [sosActive, sosCounting, triggerSOS]),
    { enabled: shake }
  );

  const doLogin = async () => {
    setAerr(""); setBusy(true);
    try { await logIn(lf.email, lf.password); }
    catch (e) { setAerr(friendlyError(e.code)); }
    finally { setBusy(false); }
  };

  const doSignup = async () => {
    if (sf.password !== sf.confirm) { setAerr("Passwords don't match."); return; }
    if (sf.password.length < 6)    { setAerr("Password must be at least 6 characters."); return; }
    setAerr(""); setBusy(true);
    try { await signUp(sf.name, sf.email, sf.password); }
    catch (e) { setAerr(friendlyError(e.code)); }
    finally { setBusy(false); }
  };

  const doForgot = async () => {
    if (!fe) { setAerr("Enter your email."); return; }
    setAerr(""); setBusy(true);
    try { await resetPassword(fe); toast("✅ Reset email sent!"); setPage("login"); }
    catch (e) { setAerr(friendlyError(e.code)); }
    finally { setBusy(false); }
  };

  const doLogout = async () => {
    await logOut(); setAuthUser(null); setPage("login");
    setSosActive(false); stopAlarm();
  };

  const saveContact = async () => {
    if (!nc.name || !nc.phone) { toast("Name and phone required."); return; }
    if (editC) { await updateContact(editC.id, nc); toast("Contact updated ✓"); }
    else { await addContact(authUser.uid, { ...nc, color: contacts.length % AVC.length }); toast("Contact added ✓"); }
    setNc({name:"",phone:"",relation:""}); setEditC(null); setShowCM(false);
  };

  const saveIncident = async () => {
    if (!ni.type || !ni.note) { toast("Type and description required."); return; }
    await addIncident(authUser.uid, { ...ni, location: ni.location || gps.place || "Current Location" });
    setNi({type:"",severity:"med",note:"",location:""}); setShowIM(false); toast("Incident logged ✓");
  };

  const triggerFake = (caller, delay = 0) => {
    setFakeCaller(caller); setSubTab("");
    if (delay === 0) { setFakeOn(true); }
    else { toast(`📞 Fake call in ${delay}s…`); setTimeout(() => setFakeOn(true), delay * 1000); }
    clearTimeout(fakeRef.current);
    fakeRef.current = setTimeout(() => setFakeOn(false), 45000);
  };

  const calcPress = (v) => {
    if (v==="AC")  { setCval("0"); setCexp(""); return; }
    if (v==="⌫")   { setCval(p => p.length>1?p.slice(0,-1):"0"); return; }
    if (v==="%")   { setCval(p => String(parseFloat(p)/100)); return; }
    if (v==="=")   {
      if (cexp==="1234") { setDisc(false); setCval("0"); setCexp(""); return; }
      try { const r=Function('"use strict";return ('+cexp.replace(/×/g,"*").replace(/÷/g,"/")+')')(); setCval(isNaN(r)?"Error":String(r)); setCexp(""); } catch { setCval("Error"); }
      return;
    }
    if (["+","-","×","÷"].includes(v)) { setCexp(p=>p+(cval!=="0"?cval:"")+v); setCval("0"); return; }
    if (v===".") { setCval(p=>p.includes(".")?p:p+"."); return; }
    setCval(p=>p==="0"?v:p+v);
  };

  const fn    = authUser?.displayName?.split(" ")[0] || authUser?.email?.split("@")[0] || "User";
  const init  = (authUser?.displayName || authUser?.email || "U")[0].toUpperCase();
  const mlink = gps.getMapsLink?.() ?? "#";
  const actC  = contacts.filter(c => c.active);
  const dclr  = danger<35?"#00d4aa":danger<65?"#ffb800":"#ff1f6b";
  const dlbl  = danger<35?"Low Risk":danger<65?"Moderate":"High Risk";
  const isNight = hour()>=21||hour()<6;

  // ── Loading ────────────────────────────────────────────────
  if (authLoading) return (
    <>
      <style>{CSS}</style>
      <div className="shell">
        <div className="scr">
          <div className="loadscr">
            <div style={{width:54,height:54,background:"var(--rose)",borderRadius:17,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 8px 28px var(--rg)",color:"#fff"}}><IcShield size={26}/></div>
            <div style={{fontFamily:"var(--fh)",fontSize:22,fontWeight:700}}>Safe<span style={{color:"var(--rose)"}}>Guard</span></div>
            <div style={{display:"flex",alignItems:"center",gap:8,color:"var(--dim)",fontSize:13}}><span className="spin"/>Loading…</div>
          </div>
        </div>
      </div>
    </>
  );

  // ── Discreet Calculator ────────────────────────────────────
  if (disc) {
    const rows=[["AC","⌗","⌫","÷"],["7","8","9","×"],["4","5","6","-"],["1","2","3","+"],[null,"0",".","="]];
    return (
      <>
        <style>{CSS}</style>
        <div className="shell">
          <div className="sbar"><span style={{fontSize:13,fontWeight:700}}>9:41</span><div className="notch"/><span>88%</span></div>
          <div className="scr">
            <div className="calc">
              <div className="calcd"><div className="calce">{cexp}</div><div className="calcr">{cval}</div></div>
              <div className="calcg">
                {rows.map((row,ri)=>row.map((k,ki)=>{
                  if(!k)return<div key={ki}/>;
                  const isOp=["+","-","×","÷","="].includes(k);
                  const isFn=["AC","⌗","⌫"].includes(k);
                  return <button key={ki} className={`ck ${isOp?"ckop":isFn?"ckfn":"cknum"}${k==="0"?" ck0":""}`} style={k==="0"?{gridColumn:"span 2"}:{}} onClick={()=>calcPress(k==="⌗"?"%":k)}>{k==="⌗"?"+/-":k}</button>;
                }))}
              </div>
              <div className="calch">Type 1234 = to return to SafeGuard</div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{CSS}</style>
      <div className="shell">
        <div className="sbar">
          <span style={{fontSize:13,fontWeight:700}}>9:41</span>
          <div className="notch"/>
          <div style={{display:"flex",gap:6,alignItems:"center",fontSize:11}}><span>●●●</span><span>WiFi</span><span>88%</span></div>
        </div>

        {toastMsg && <div className="toast">{toastMsg}</div>}

        <div className="scr">

          {/* ══ LOGIN ══════════════════════════════════════════ */}
          {page==="login"&&(
            <div className="auth">
              <div className="alogo"><div className="alogobox"><IcShield size={24}/></div><div className="alogoname">Safe<span>Guard</span></div></div>
              <div className="atitle">Welcome<br/>back 💗</div>
              <div className="asub">Sign in to your safety companion.</div>
              {aerr&&<div className="errbox">⚠ {aerr}</div>}
              <label className="flbl">Email</label>
              <div className="fwrap"><IcMail size={15} className="fic"/><input className="finp" type="email" placeholder="you@email.com" value={lf.email} onChange={e=>setLf(f=>({...f,email:e.target.value}))}/></div>
              <label className="flbl">Password</label>
              <div className="fwrap"><IcLock size={15} className="fic"/><input className="finp" type={pwd?"text":"password"} placeholder="••••••••" value={lf.password} onChange={e=>setLf(f=>({...f,password:e.target.value}))}/><button className="feye" onClick={()=>setPwd(v=>!v)}>{pwd?<IcEyeOff size={16}/>:<IcEye size={16}/>}</button></div>
              <div style={{textAlign:"right",marginBottom:20}}><button style={{background:"none",border:"none",color:"var(--rose)",fontSize:13,fontWeight:700,cursor:"pointer"}} onClick={()=>{setAerr("");setPage("forgot");}}>Forgot password?</button></div>
              <button className="btn" onClick={doLogin} disabled={busy}>{busy?<><span className="spin"/>Signing in…</>:"Sign In"}</button>
              <div className="adiv">or</div>
              <div className="afoot">Don't have an account? <button onClick={()=>{setAerr("");setPage("signup");}}>Create account</button></div>
            </div>
          )}

          {/* ══ SIGNUP ═════════════════════════════════════════ */}
          {page==="signup"&&(
            <div className="auth">
              <div className="alogo"><div className="alogobox"><IcShield size={24}/></div><div className="alogoname">Safe<span>Guard</span></div></div>
              <div className="atitle">Create<br/>Account</div>
              <div className="asub">Your safety, our priority.</div>
              {aerr&&<div className="errbox">⚠ {aerr}</div>}
              {[{l:"Full Name",k:"name",t:"text",ph:"Anjali Sharma",ic:<IcUser size={15}/>},{l:"Email",k:"email",t:"email",ph:"you@email.com",ic:<IcMail size={15}/>},{l:"Phone",k:"phone",t:"tel",ph:"+91 98765 43210",ic:<IcPhone size={15}/>}].map(f=>(
                <div key={f.k}><label className="flbl">{f.l}</label><div className="fwrap"><span className="fic">{f.ic}</span><input className="finp" type={f.t} placeholder={f.ph} value={sf[f.k]} onChange={e=>setSf(p=>({...p,[f.k]:e.target.value}))}/></div></div>
              ))}
              <label className="flbl">Password</label>
              <div className="fwrap"><IcLock size={15} className="fic"/><input className="finp" type="password" placeholder="Min. 6 chars" value={sf.password} onChange={e=>setSf(p=>({...p,password:e.target.value}))}/></div>
              <label className="flbl">Confirm Password</label>
              <div className="fwrap"><IcLock size={15} className="fic"/><input className="finp" type="password" placeholder="Re-enter" value={sf.confirm} onChange={e=>setSf(p=>({...p,confirm:e.target.value}))}/></div>
              <button className="btn" onClick={doSignup} disabled={busy}>{busy?<><span className="spin"/>Creating…</>:"Create Account"}</button>
              <div className="afoot" style={{marginTop:20}}>Have account? <button onClick={()=>{setAerr("");setPage("login");}}>Sign in</button></div>
            </div>
          )}

          {/* ══ FORGOT ═════════════════════════════════════════ */}
          {page==="forgot"&&(
            <div className="auth">
              <button className="backbtn" onClick={()=>{setAerr("");setPage("login");}}>← Back to login</button>
              <div className="atitle">Reset<br/>Password</div>
              <div className="asub">We'll send a secure link to your email.</div>
              {aerr&&<div className="errbox">⚠ {aerr}</div>}
              <label className="flbl">Email</label>
              <div className="fwrap"><IcMail size={15} className="fic"/><input className="finp" type="email" placeholder="you@email.com" value={fe} onChange={e=>setFe(e.target.value)}/></div>
              <button className="btn" onClick={doForgot} disabled={busy}>{busy?<><span className="spin"/>Sending…</>:"Send Reset Link"}</button>
            </div>
          )}

          {/* ══ APP ════════════════════════════════════════════ */}
          {page==="app"&&(
            <>
              {/* SOS Overlay */}
              {sosActive&&(
                <div className="sovlay">
                  <div className="sovico"><IcAlert size={32} color="#ff1f6b"/></div>
                  <div className="sovtitle">🚨 SOS ACTIVATED</div>
                  <div className="sovsub">Alerting {actC.length} contact{actC.length!==1?"s":""}.<br/>Stay visible. Help is coming.</div>
                  <div className="sovlist">
                    {[
                      {e:"📍",t:gps.loading?"Fetching GPS…":`Location: ${gps.place}`},
                      {e:"📱",t:actC.length>0?`SMS → ${actC.map(c=>c.name).join(", ")}`:"⚠ No active contacts"},
                      {e:"🔊",t:buzzer?"Alarm buzzer active":"Buzzer off (enable in Settings)"},
                      {e:"🗺️",t:"Live Google Maps link shared"},
                    ].map((r,i)=>(
                      <div className="sovrow" key={i}>
                        <span style={{fontSize:18}}>{r.e}</span><span>{r.t}</span>
                        <IcCheck size={14} color="#00d4aa" style={{marginLeft:"auto"}}/>
                      </div>
                    ))}
                  </div>
                  {gps.lat&&<a href={mlink} target="_blank" rel="noreferrer" style={{color:"var(--teal)",fontSize:13,fontWeight:600,textDecoration:"none"}}>📍 Open my live location →</a>}
                  <button className="bcncl" onClick={cancelSOS}>✓ I'm Safe — Cancel SOS</button>
                </div>
              )}

              {/* Fake Call Overlay */}
              {fakeOn&&(
                <div className="fcall">
                  <div style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
                    <div className="fcav">{fakeCaller[0]}</div>
                    <div className="fcname">{fakeCaller}</div>
                    <div className="fcsub">Incoming call…</div>
                    <div className="fcwave">{[0,1,2,3,4].map(i=><span key={i}/>)}</div>
                  </div>
                  <div style={{textAlign:"center",color:"var(--dim)",fontSize:13}}>Use this to exit uncomfortable situations</div>
                  <div className="fcbtns">
                    <div className="fcgrp"><button className="fcbtn fcend" onClick={()=>{setFakeOn(false);clearTimeout(fakeRef.current);}}><IcPhone size={28} color="#fff" style={{transform:"rotate(135deg)"}}/></button><span className="fclbl">Decline</span></div>
                    <div className="fcgrp"><button className="fcbtn fcans" onClick={()=>{toast("Stay safe! 💗");setFakeOn(false);clearTimeout(fakeRef.current);}}><IcPhone size={28} color="#fff"/></button><span className="fclbl">Answer</span></div>
                  </div>
                </div>
              )}

              {/* Sub: Incidents */}
              {subTab==="incidents"&&(
                <div className="pg">
                  <div className="pghdr">
                    <div><button className="backbtn" style={{marginBottom:4}} onClick={()=>setSubTab("")}>← Back</button><div className="pgtitle">Incident Log</div></div>
                    <button className="addbtn" onClick={()=>setShowIM(true)}><IcPlus size={17}/></button>
                  </div>
                  <div style={{background:"rgba(124,111,255,.08)",border:"1px solid rgba(124,111,255,.2)",borderRadius:"var(--r)",padding:"12px 14px",marginBottom:14,fontSize:13,lineHeight:1.55}}>
                    <b style={{color:"var(--violet)"}}>Private & secure.</b> Each entry is timestamped + GPS logged — useful for police reports.
                  </div>
                  {incidents.length===0&&<div style={{textAlign:"center",padding:"48px 20px",color:"var(--muted)"}}>No incidents logged yet.</div>}
                  {incidents.map(inc=>(
                    <div className="icard" key={inc.id}>
                      <div className="ichdr">
                        <div className={`ictype ${inc.severity==="high"?"sh":inc.severity==="med"?"sm":"sl"}`}>
                          <span>{inc.severity==="high"?"🔴":inc.severity==="med"?"🟡":"🟢"}</span>{inc.type}
                        </div>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <span className="ictime">{inc.createdAt?.toDate?.()?.toLocaleString()||"Just now"}</span>
                          <button style={{background:"none",border:"none",color:"var(--muted)",cursor:"pointer"}} onClick={()=>deleteIncident(inc.id)}><IcTrash size={13}/></button>
                        </div>
                      </div>
                      <div className="icnote">{inc.note}</div>
                      <div className="icloc"><IcPin size={11}/>{inc.location}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Sub: Fake Call chooser */}
              {subTab==="fakecall"&&(
                <div className="pg">
                  <button className="backbtn" onClick={()=>setSubTab("")}>← Back</button>
                  <div className="pgtitle" style={{marginBottom:6}}>Fake Call</div>
                  <div style={{fontSize:13,color:"var(--dim)",marginBottom:16,lineHeight:1.6}}>Simulates a real incoming call to escape unsafe situations without suspicion.</div>
                  <div className="stitle">Choose Caller — Instant</div>
                  {FAKE_CALLERS.map(c=>(
                    <div key={c} className="ccard" style={{cursor:"pointer"}} onClick={()=>triggerFake(c,0)}>
                      <div className="cav" style={{background:"var(--ts)",color:"var(--teal)",border:"2px solid rgba(0,212,170,.3)",fontSize:20}}>{c[0]}</div>
                      <div className="cinfo"><div className="cname">{c}</div><div className="cph">Tap to trigger fake call</div></div>
                      <IcPhone size={16} color="var(--teal)"/>
                    </div>
                  ))}
                  <div className="stitle" style={{marginTop:14}}>Delayed Trigger</div>
                  {[5,10,30].map(d=>(
                    <button key={d} className="btn btnghost" style={{marginBottom:8}} onClick={()=>triggerFake(FAKE_CALLERS[0],d)}>Trigger in {d} seconds</button>
                  ))}
                </div>
              )}

              {/* ══ HOME TAB ══════════════════════════════════ */}
              {subTab===""&&tab==="home"&&(
                <div style={{paddingBottom:24}}>
                  <div className="hhdr">
                    <div><div className="hgreet">{greeting()},</div><div className="hname">{fn} 👋</div></div>
                    <div className="hav" onClick={()=>setTab("settings")}>{init}</div>
                  </div>

                  {/* AI Danger Score */}
                  <div className="dc">
                    <div className="dch"><div className="dcl">⚡ AI Safety Score</div><div className="dcbadge" style={{background:danger<35?"var(--ts)":danger<65?"var(--as2)":"var(--rs)",color:dclr}}>{dlbl}</div></div>
                    <div className="dcbar"><div className="dcbg"><div className="dcfill" style={{width:`${danger}%`,background:`linear-gradient(90deg,${dclr}88,${dclr})`}}/></div><div className="dcscore" style={{color:dclr}}>{danger}</div></div>
                    <div className="dcchips">
                      {actC.length>0?<span className="chip chs">✓ {actC.length} contact{actC.length>1?"s":""} active</span>:<span className="chip chd">⚠ No active contacts</span>}
                      {gps.loading?<span className="chip chw">⟳ Getting GPS…</span>:gps.lat?<span className="chip chs">✓ GPS active</span>:<span className="chip chd">✗ GPS off</span>}
                      {isNight&&<span className="chip chw">⚠ Night time</span>}
                      {mood!==null&&<span className={`chip ${mood>=3?"chd":"chs"}`}>Mood: {MOODS[mood].l}</span>}
                    </div>
                  </div>

                  {/* Status */}
                  <div className={`sbar2 ${sosActive?"sos":"safe"}`}>
                    <div className={`sdot ${sosActive?"sos":"safe"}`}/>
                    <div className="sb2t" style={{color:sosActive?"var(--rose)":"var(--teal)"}}>
                      {sosActive?"🚨 SOS Active — Alerting emergency contacts…":"✓ You are safe · Live GPS tracking on"}
                    </div>
                    <IcActivity size={14} color={sosActive?"var(--rose)":"var(--teal)"}/>
                  </div>

                  {/* GPS Card */}
                  <div className="lcard" onClick={()=>gps.lat&&window.open(mlink,"_blank")}>
                    <div className="lmap"><div className="lgrid"/><IcPin size={30} color="var(--rose)" style={{filter:"drop-shadow(0 0 8px var(--rose))",position:"relative",zIndex:1}}/></div>
                    <div className="linfo">
                      <IcPin size={13} color="var(--teal)"/>
                      <div style={{flex:1}}><div className="lname">{gps.loading?"Getting your location…":gps.place}</div><div className="lcoord">{gps.lat?`${gps.lat}°, ${gps.lng}°`:gps.error||"Enable GPS permission"}</div></div>
                      {gps.loading?<span className="lpill" style={{background:"var(--as2)",color:"var(--amber)"}}>⟳ LOADING</span>:gps.lat?<span className="lpill" style={{background:"var(--ts)",color:"var(--teal)"}}>● LIVE</span>:<span className="lpill" style={{background:"var(--rs)",color:"var(--rose)"}}>✗ OFF</span>}
                    </div>
                  </div>

                  {/* Mood */}
                  <div className="moodcard">
                    <div className="moodtitle">How safe do you feel right now?</div>
                    <div className="moodrow">
                      {MOODS.map((m,i)=>(
                        <button key={i} className={`moodbtn ${mood===i?"sel":""}`} style={mood===i?{borderColor:m.c,background:`${m.c}14`}:{}} onClick={()=>{setMood(i);setDanger(100-m.s);toast(`Mood: ${m.l}`);}}>
                          <span className="me">{m.e}</span><span className="ml">{m.l}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Safe Walk Timer */}
                  <div className="wcard">
                    <div className="whdr">
                      <div className="wtitle"><IcClock size={15} color="var(--amber)"/>Safe Walk Timer</div>
                      <div className="wbadge" style={{background:walkOn?"var(--rs)":"var(--as2)",color:walkOn?"var(--rose)":"var(--amber)",animation:walkOn?"pr .8s infinite":"none"}}>{walkOn?"ACTIVE":"SET"}</div>
                    </div>
                    {walkOn&&<div className="wprog"><div className="wfill" style={{width:`${(walkLeft/walkTotal)*100}%`}}/></div>}
                    <div className="wrow">
                      <div><div className="wtime">{fmt(walkLeft)}</div><div className="wsub">{walkOn?"until auto-SOS fires":"choose duration"}</div></div>
                      <div className="wbtns">
                        {!walkOn&&[5,10,15].map(m=><button key={m} className="wbtn" style={{background:"var(--s4)",color:"var(--amber)"}} onClick={()=>{setWalkTotal(m*60);setWalkLeft(m*60);}}>{m}m</button>)}
                        <button className="wbtn" style={{background:walkOn?"var(--rs)":"var(--as2)",color:walkOn?"var(--rose)":"var(--amber)"}} onClick={()=>{setWalkOn(v=>!v);if(walkOn)setWalkLeft(walkTotal);}}>
                          {walkOn?"Stop":"Start"}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* SOS Button */}
                  <div className="sossec">
                    <div className="soslbl">Emergency SOS</div>
                    <div className="sosrings">
                      <div className={`sosring ${sosActive?"act":""}`}/><div className={`sosring ${sosActive?"act":""}`}/><div className={`sosring ${sosActive?"act":""}`}/>
                      <button className={`sosbtn ${sosActive?"act":""}`} onClick={triggerSOS}>
                        {sosCounting?<><span style={{fontSize:50,lineHeight:1}}>{sosTimer}</span><span className="sossub">HOLD</span></>:sosActive?<span style={{fontSize:15,fontWeight:700}}>CANCEL</span>:<>SOS<span className="sossub">PRESS</span></>}
                      </button>
                    </div>
                    <div className="soshint">
                      {sosCounting?`Activating in ${sosTimer}s — tap again to cancel`:sosActive?"SOS is live · Tap to cancel":"Tap once · 3-second delay · Shake phone to trigger"}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="qsec">
                    <div className="stitle">Quick Actions</div>
                    <div className="qgrid">
                      {[
                        {e:"🚔",l:"Police\n100",    bg:"#1a1030",c:"#7c6fff",a:()=>{ window.location.href="tel:100"; }},
{e:"📲",l:"Alert\nAll",     bg:"#0a1a18",c:"#00d4aa",a:()=>{
  if(actC.length===0){ toast("⚠ Add contacts first!"); return; }
  const msg=encodeURIComponent(gps.getSOSMessage?.() ?? "🆘 I need help! Please respond immediately.");
  actC.forEach(c=>{ const ph=c.phone.replace(/\D/g,""); window.open(`https://wa.me/${ph}?text=${msg}`,"_blank"); });
  toast(`✅ Opening WhatsApp for ${actC.length} contact(s)!`);
}},
{e:"📞",l:"Fake\nCall",     bg:"#0d1a10",c:"#22dd88",a:()=>setSubTab("fakecall")},
{e:"📍",l:"Copy\nLocation", bg:"#0a1220",c:"#06b6d4",a:()=>{
  const msg=gps.getSOSMessage?.() ?? "🆘 I need help!";
  navigator.clipboard?.writeText(msg)
    .then(()=>toast("✅ SOS message copied!"))
    .catch(()=>toast("⚠ Copy failed — try on phone"));
}},
{e:"📋",l:"Log\nIncident",  bg:"#1a130a",c:"#ffb800",a:()=>setSubTab("incidents")},
{e:"🎤",l:"Voice\nHelp",    bg:"#1a0a18",c:"#ec4899",a:()=>{
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){ toast("⚠ Voice not supported on this browser"); return; }
  const r=new SR();
  r.start();
  toast("🎤 Listening… say 'help'");
  r.onresult=(e)=>{
    const word=e.results[0][0].transcript.toLowerCase();
    if(word.includes("help")||word.includes("sos")||word.includes("bachao")){ triggerSOS(); toast("🚨 Voice SOS triggered!"); }
    else { toast(`Heard: "${word}" — say 'help' to trigger SOS`); }
  };
  r.onerror=()=>toast("⚠ Mic error — check permissions");
}},
{e:"🏥",l:"Ambulance\n108", bg:"#0a150a",c:"#22c55e",a:()=>{ window.location.href="tel:108"; }},
{e:"🔥",l:"Fire\n101",      bg:"#1a1008",c:"#ff8800",a:()=>{ window.location.href="tel:101"; }},
{e:"🕵️",l:"Discreet\nMode", bg:"#0a0a1a",c:"#8888cc",a:()=>{ setDisc(true); toast("Calculator mode on. Type 1234 = to return."); }},,
                      ].map((a,i)=>(
                        <div className="qcard" key={i} onClick={a.a}><div className="qi" style={{background:a.bg,color:a.c}}>{a.e}</div><div className="ql">{a.l}</div></div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ══ CONTACTS TAB ═══════════════════════════════ */}
              {subTab===""&&tab==="contacts"&&(
                <div className="pg">
                  <div className="pghdr">
                    <div className="pgtitle">Contacts</div>
                    <button className="addbtn" onClick={()=>{setEditC(null);setNc({name:"",phone:"",relation:""});setShowCM(true);}}><IcPlus size={17}/></button>
                  </div>
                  <div style={{fontSize:13,color:"var(--dim)",marginBottom:16,lineHeight:1.6}}>Teal ✓ contacts receive SOS alerts with your live GPS location.</div>
                  {contacts.length===0&&<div style={{textAlign:"center",padding:"52px 20px",color:"var(--muted)"}}><div style={{fontSize:44,marginBottom:12}}>👥</div><div>No contacts yet. Add your trusted people.</div></div>}
                  {contacts.map(c=>{
                    const [bg]=AVC[c.color%AVC.length]||AVC[0];
                    return (
                      <div className="ccard" key={c.id}>
                        <div className="cav" style={{background:`${bg}1a`,color:bg,border:`2px solid ${bg}33`}}>{c.name[0].toUpperCase()}</div>
                        <div className="cinfo"><div className="cname">{c.name}</div><div className="cph">{c.phone}</div>{c.relation&&<div className="crel">{c.relation}</div>}</div>
                        <div className="cbtns">
                          <button className={`cbtn ${c.active?"on":""}`} onClick={()=>updateContact(c.id,{active:!c.active})}>{c.active?<IcCheck size={13}/>:<IcPhone size={13}/>}</button>
                          <button className="cbtn" onClick={()=>{setEditC(c);setNc({name:c.name,phone:c.phone,relation:c.relation||""});setShowCM(true);}}><IcEdit size={13}/></button>
                          <button className="cbtn" style={{color:"var(--rose)",borderColor:"rgba(255,31,107,.25)"}} onClick={()=>deleteContact(c.id).then(()=>toast("Contact removed."))}><IcTrash size={13}/></button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ══ SETTINGS TAB ═══════════════════════════════ */}
              {subTab===""&&tab==="settings"&&(
                <div className="pg">
                  <div style={{fontFamily:"var(--fh)",fontSize:22,fontWeight:700,marginBottom:18}}>Settings</div>
                  <div className="pbanner">
                    <div className="pav">{init}</div>
                    <div><div className="pname">{authUser?.displayName||fn}</div><div className="pemail">{authUser?.email}</div><div className="pbadge">● Verified account</div></div>
                  </div>
                  <div className="stitle">Safety Features</div>
                  <div className="sgrp">
                    {[
                      {e:"🔊",l:"Alarm Buzzer on SOS",r:<button className={`toggle ${buzzer?"on":""}`} onClick={()=>setBuzzer(v=>!v)}/>},
                      {e:"📱",l:"Shake Phone to SOS",r:<button className={`toggle ${shake?"on":""}`} onClick={()=>setShake(v=>!v)}/>},
                      {e:"📍",l:"Live GPS Tracking",r:<button className="toggle on"/>},
                      {e:"🎤",l:"Voice Command 'Help'",r:<button className="toggle on"/>},
                      {e:"🕵️",l:"Discreet Mode",r:<button className="toggle" onClick={()=>{setDisc(true);toast("Calculator mode. Type 1234= to return.");}}/>},
                    ].map((r,i)=>(
                      <div className="srow" key={i}><div className="sico" style={{background:"var(--s3)",fontSize:15}}>{r.e}</div><span className="slbl">{r.l}</span>{r.r}</div>
                    ))}
                  </div>
                  <div className="stitle">Tools</div>
                  <div className="sgrp">
                    {[
                      {e:"📋",l:"Incident Log",a:()=>setSubTab("incidents")},
                      {e:"📞",l:"Fake Call Simulator",a:()=>setSubTab("fakecall")},
                    ].map((r,i)=>(
                      <div className="srow" key={i} onClick={r.a}><div className="sico" style={{background:"var(--vs)",fontSize:15}}>{r.e}</div><span className="slbl">{r.l}</span><IcChevR size={16} color="var(--muted)"/></div>
                    ))}
                  </div>
                  <div className="stitle">Account</div>
                  <div className="sgrp">
                    <div className="srow" onClick={()=>resetPassword(authUser.email).then(()=>toast("Reset email sent!"))}>
                      <div className="sico" style={{background:"var(--s3)",fontSize:15}}>🔑</div><span className="slbl">Change Password</span><IcChevR size={16} color="var(--muted)"/>
                    </div>
                    <div className="srow" onClick={doLogout}>
                      <div className="sico" style={{background:"var(--rs)",fontSize:15}}>🚪</div><span className="slbl" style={{color:"var(--rose)"}}>Sign Out</span><IcChevR size={16} color="var(--rose)"/>
                    </div>
                  </div>
                  <div style={{textAlign:"center",color:"var(--muted)",fontSize:12,marginTop:16,paddingBottom:8,lineHeight:1.8}}>SafeGuard v3.0 — Startup Edition<br/>Firebase · GPS · Web Audio API<br/>Made with 💗 for women's safety</div>
                </div>
              )}

              {/* Contact Modal */}
              {showCM&&(
                <div className="mbd" onClick={()=>setShowCM(false)}>
                  <div className="msh" onClick={e=>e.stopPropagation()}>
                    <div className="mhdl"/><div className="mtitle">{editC?"Edit Contact":"Add Trusted Contact"}</div>
                    {[{l:"Full Name *",k:"name",t:"text",ph:"e.g. Mom",ic:<IcUser size={15}/>},{l:"Phone Number *",k:"phone",t:"tel",ph:"+91 98765 43210",ic:<IcPhone size={15}/>},{l:"Relation",k:"relation",t:"text",ph:"Family / Friend",ic:<IcUsers size={15}/>}].map(f=>(
                      <div key={f.k}><label className="flbl">{f.l}</label><div className="fwrap"><span className="fic">{f.ic}</span><input className="finp" type={f.t} placeholder={f.ph} value={nc[f.k]} onChange={e=>setNc(p=>({...p,[f.k]:e.target.value}))}/></div></div>
                    ))}
                    <button className="btn" onClick={saveContact} style={{marginTop:8}}>{editC?"Update Contact":"Save Contact"}</button>
                  </div>
                </div>
              )}

              {/* Incident Modal */}
              {showIM&&(
                <div className="mbd" onClick={()=>setShowIM(false)}>
                  <div className="msh" onClick={e=>e.stopPropagation()}>
                    <div className="mhdl"/><div className="mtitle">Log Incident</div>
                    <label className="flbl">Incident Type *</label>
                    <div style={{display:"flex",flexWrap:"wrap",gap:7,marginBottom:14}}>
                      {INC_TYPES.map(t=>(
                        <button key={t} style={{padding:"7px 14px",borderRadius:"100px",border:`1.5px solid ${ni.type===t?"var(--rose)":"var(--brd)"}`,background:ni.type===t?"var(--rs)":"var(--s3)",color:ni.type===t?"var(--rose)":"var(--dim)",cursor:"pointer",fontFamily:"var(--fb)",fontSize:13,fontWeight:600,transition:"all .15s"}} onClick={()=>setNi(p=>({...p,type:t}))}>{t}</button>
                      ))}
                    </div>
                    <label className="flbl">Location</label>
                    <div className="fwrap"><input className="finp" style={{paddingLeft:16}} type="text" placeholder={gps.place||"e.g. Near Metro Station"} value={ni.location} onChange={e=>setNi(p=>({...p,location:e.target.value}))}/></div>
                    <label className="flbl">Severity</label>
                    <div style={{display:"flex",gap:8,marginBottom:14}}>
                      {[{v:"low",l:"🟢 Low",c:"var(--teal)"},{v:"med",l:"🟡 Medium",c:"var(--amber)"},{v:"high",l:"🔴 High",c:"var(--rose)"}].map(s=>(
                        <button key={s.v} style={{flex:1,padding:"10px",border:`1.5px solid ${ni.severity===s.v?s.c:"var(--brd)"}`,borderRadius:"var(--rs2)",background:ni.severity===s.v?`${s.c}18`:"var(--s3)",color:ni.severity===s.v?s.c:"var(--dim)",cursor:"pointer",fontFamily:"var(--fb)",fontSize:13,fontWeight:600,transition:"all .15s"}} onClick={()=>setNi(p=>({...p,severity:s.v}))}>{s.l}</button>
                      ))}
                    </div>
                    <label className="flbl">Description *</label>
                    <div className="fwrap"><textarea className="finp" style={{paddingLeft:16,height:80,resize:"none"}} placeholder="Describe what happened…" value={ni.note} onChange={e=>setNi(p=>({...p,note:e.target.value}))}/></div>
                    <button className="btn" onClick={saveIncident}>Save Incident</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Bottom Nav */}
        {page==="app"&&subTab===""&&(
          <div className="bnav">
            {[{id:"home",Ic:IcHome,l:"Home"},{id:"contacts",Ic:IcUsers,l:"Contacts"},{id:"settings",Ic:IcSettings,l:"Settings"}].map(({id,Ic,l})=>(
              <button key={id} className={`nb ${tab===id?"on":""}`} onClick={()=>setTab(id)}><Ic size={22}/>{l}</button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}