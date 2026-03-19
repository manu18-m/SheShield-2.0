// src/hooks/useShake.js
import { useEffect, useRef } from "react";

export function useShake(onShake,{threshold=28,cooldownMs=4000,enabled=true}={}){
  const lastPos   =useRef({x:0,y:0,z:0});
  const lastFired =useRef(0);
  const cbRef     =useRef(onShake);
  useEffect(()=>{cbRef.current=onShake;},[onShake]);

  useEffect(()=>{
    if(!enabled) return;
    const handle=e=>{
      const acc=e.accelerationIncludingGravity;
      if(!acc) return;
      const {x=0,y=0,z=0}=acc;
      const prev=lastPos.current;
      const delta=Math.abs(x-prev.x)+Math.abs(y-prev.y)+Math.abs(z-prev.z);
      if(delta>threshold){
        const now=Date.now();
        if(now-lastFired.current>cooldownMs){ lastFired.current=now; cbRef.current?.(); }
      }
      lastPos.current={x,y,z};
    };
    if(typeof DeviceMotionEvent!=="undefined"&&typeof DeviceMotionEvent.requestPermission==="function"){
      window.__requestShakePermission=async()=>{
        try{ const r=await DeviceMotionEvent.requestPermission(); if(r==="granted") window.addEventListener("devicemotion",handle); }catch{}
      };
    } else { window.addEventListener("devicemotion",handle); }
    return()=>{ window.removeEventListener("devicemotion",handle); delete window.__requestShakePermission; };
  },[enabled,threshold,cooldownMs]);
}