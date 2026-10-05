"use client";
import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../leaflet-overrides.css";

const CATEGORIES = [["bache","Bache"],["basura","Basura"],["fuga-de-agua","Fuga de agua"],["alumbrado","Alumbrado"],["drenaje","Drenaje"],["banqueta-danada","Banqueta dañada"],["calle-peligrosa","Calle peligrosa"],["senalizacion","Señalización"],["arbol-obstruyendo","Árbol obstruyendo"],["ruido-excesivo","Ruido excesivo"],["semaforo-fallando","Semáforo fallando"],["alcantarilla-destapada","Alcantarilla destapada"],["otro","Otro"]];

export default function ReportFormClient() {
  const mapNode = useRef(null); const map = useRef(null); const marker = useRef(null);
  const [photo,setPhoto]=useState(null); const [category,setCategory]=useState(""); const [description,setDescription]=useState("");
  const [location,setLocation]=useState(null); const [locState,setLocState]=useState("idle"); const [privacy,setPrivacy]=useState(false);
  const [status,setStatus]=useState(null); const [sending,setSending]=useState(false);
  useEffect(()=>{
    if(!mapNode.current || map.current) return;
    const instance=L.map(mapNode.current,{center:[20.653,-105.225],zoom:14,minZoom:11,maxZoom:19,zoomControl:false});
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19,attribution:"© OpenStreetMap contributors"}).addTo(instance);
    map.current=instance; return ()=>{instance.remove();map.current=null;};
  },[]);
  useEffect(()=>{if(!location||!map.current)return;if(marker.current)marker.current.remove();marker.current=L.marker([location.latitude,location.longitude]).addTo(map.current);map.current.setView([location.latitude,location.longitude],17);},[location]);
  function getLocation(){
    if(!navigator.geolocation){setLocState("error");setStatus("Tu navegador no permite obtener ubicación.");return;}
    setLocState("loading");setStatus(null);
    navigator.geolocation.getCurrentPosition(p=>{setLocation({latitude:Number(p.coords.latitude.toFixed(6)),longitude:Number(p.coords.longitude.toFixed(6))});setLocState("ready");},()=>{setLocState("error");setStatus("No pudimos obtener tu ubicación. Revisa el permiso de ubicación.");},{enableHighAccuracy:true,timeout:12000,maximumAge:60000});
  }
  async function submit(e){
    e.preventDefault();
    if(!photo||!category||description.trim().length<15||!location||!privacy){setStatus("Falta completar foto, categoría, ubicación, descripción y aviso de privacidad.");return;}
    setSending(true);setStatus(null);
    try{
      const body=new FormData();body.append("photo",photo);body.append("category",category);body.append("description",description.trim());
      body.append("latitude",String(location.latitude));body.append("longitude",String(location.longitude));body.append("privacyAcknowledged","true");
      const response=await fetch("/api/reports",{method:"POST",body});const data=await response.json();
      if(!response.ok||!data.ok)throw new Error(data.error||"No pudimos enviar el reporte.");
      setStatus(data.message);setPhoto(null);setCategory("");setDescription("");setLocation(null);setPrivacy(false);setLocState("idle");
      if(marker.current){marker.current.remove();marker.current=null;}
    }catch(e){setStatus(e instanceof Error?e.message:"No pudimos enviar el reporte.");}finally{setSending(false);}
  }
  return <main className="report-shell">
    <header className="report-header"><a href="/" className="back-link">← Mapa público</a><span className="eyebrow">LA CALLE HABLA · REPORTE CIUDADANO</span></header>
    <section className="report-intro"><h1>Haz visible lo que pasa en tu calle.</h1><p>Una foto, tu ubicación y una explicación breve. Sin cuentas y sin vueltas.</p></section>
    <form className="report-card" onSubmit={submit}>
      <label className="upload-box"><span>📸 {photo?"Foto lista":"Toma o selecciona una foto"}</span><small>{photo?photo.name:"La foto es necesaria para documentar el reporte."}</small><input type="file" accept="image/*" capture="environment" onChange={e=>setPhoto(e.target.files?.[0]||null)}/></label>
      <div className="report-field"><label htmlFor="category">¿Qué está pasando?</label><select id="category" value={category} onChange={e=>setCategory(e.target.value)} required><option value="">Selecciona una categoría</option>{CATEGORIES.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></div>
      <div className="report-field"><label htmlFor="description">Cuéntanos brevemente</label><textarea id="description" value={description} onChange={e=>setDescription(e.target.value)} minLength={15} maxLength={1000} placeholder="Ej. Hay un bache grande que ocupa casi todo el carril." required/><small>{description.length}/1000</small></div>
      <div className="location-block"><div className="location-head"><div><label>¿Dónde está?</label><small>Usaremos tu ubicación solo para colocar el reporte.</small></div><button type="button" className="location-button" onClick={getLocation} disabled={locState==="loading"}>{locState==="loading"?"Buscando…":location?"Ubicación lista ✓":"Usar mi ubicación"}</button></div><div ref={mapNode} className="report-mini-map"/>{location&&<small className="coordinates">📍 {location.latitude}, {location.longitude}</small>}</div>
      <label className="privacy-check"><input type="checkbox" checked={privacy} onChange={e=>setPrivacy(e.target.checked)}/><span>Confirmo que la foto y descripción no incluyen datos personales sensibles de terceros y acepto el aviso de privacidad.</span></label>
      {status&&<div className={status.startsWith("Reporte recibido")?"report-status success":"report-status"}>{status}</div>}
      <button className="submit-report" type="submit" disabled={sending}>{sending?"Enviando reporte…":"Enviar reporte"}</button>
    </form></main>;
}