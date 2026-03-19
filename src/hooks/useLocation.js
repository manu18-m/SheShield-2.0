// src/hooks/useLocation.js
import { useState, useEffect, useRef } from "react";

export function useLocation() {
  const [state, setState] = useState({ lat:null,lng:null,place:"Requesting location…",accuracy:null,loading:true,error:null });
  const watchId = useRef(null);
  const timer   = useRef(null);

  useEffect(()=>{
    if(!navigator.geolocation){
      setState(s=>({...s,loading:false,error:"GPS not supported.",place:"Location unavailable"}));
      return;
    }
    const geo=async(lat,lng)=>{
      try{
        const r=await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,{headers:{"Accept-Language":"en-US,en"}});
        const d=await r.json();
        const a=d.address||{};
        const p=[a.suburb||a.neighbourhood||a.city_district,a.city||a.town||a.village].filter(Boolean);
        return p.join(", ")||`${lat}, ${lng}`;
      }catch{ return `${lat}°N, ${lng}°E`; }
    };
    watchId.current=navigator.geolocation.watchPosition(
      async pos=>{
        const lat=parseFloat(pos.coords.latitude.toFixed(6));
        const lng=parseFloat(pos.coords.longitude.toFixed(6));
        setState(s=>({...s,lat,lng,accuracy:Math.round(pos.coords.accuracy),loading:false,error:null}));
        clearTimeout(timer.current);
        timer.current=setTimeout(async()=>{
          const place=await geo(lat,lng);
          setState(s=>({...s,place}));
        },800);
      },
      err=>{
        setState({lat:17.385044,lng:78.486671,place:"Location permission denied",accuracy:null,loading:false,error:err.message});
      },
      {enableHighAccuracy:true,timeout:12000,maximumAge:5000}
    );
    return()=>{ if(watchId.current!==null) navigator.geolocation.clearWatch(watchId.current); clearTimeout(timer.current); };
  },[]);

  const getMapsLink  =()=>state.lat&&state.lng?`https://www.google.com/maps?q=${state.lat},${state.lng}`:"#";
  const getSOSMessage=()=>`🆘 EMERGENCY — I may be in danger!\n📍 Location: ${state.place}\n🗺️ Maps: ${getMapsLink()}`;
  return {...state,getMapsLink,getSOSMessage};
}