import { useEffect, useId, useRef, useState } from 'react';
import { Play, Square, Check } from 'lucide-react';
import { NetworkArt } from '../art/NetworkArt';
import { Button } from '../ui/button';
const nodes = [
 { name:'Cyber 2',location:'Jakarta',category:'Data center · Jakarta',title:'Cyber 2 Data Center',variant:'data-center',description:'Titik di Jakarta dalam ekosistem NEX+, terhubung ke neuCentrIX Banjarmasin melalui Local Loop.' },
 { name:'neuCentrIX',location:'Banjarmasin',category:'Data center · Banjarmasin',title:'neuCentrIX',variant:'regional-center',description:'Titik di Banjarmasin yang terhubung ke Cyber 2 melalui Local Loop. Alur konektivitas berlanjut ke Customer melalui FTTH.' },
 { name:'Customer',location:'Lokasi bisnis',category:'Customer · Lokasi bisnis',title:'Bisnis Anda',variant:'business',description:'Titik pelanggan terhubung dari neuCentrIX melalui FTTH. Jalur lain menghubungkan Cyber 2 ke Customer melalui VSAT atau Local Loop.' },
] as const;
export function InfrastructureExplorer(){
 const [selected,setSelected]=useState(0);
 const [playing,setPlaying]=useState(false);
 const [reduced,setReduced]=useState(false);
 const timer=useRef<ReturnType<typeof setTimeout>|null>(null);
 const id=useId();
 const node=nodes[selected]??nodes[0];
 function stop(){if(timer.current)clearTimeout(timer.current);timer.current=null;setPlaying(false);}
 useEffect(()=>{const media=window.matchMedia('(prefers-reduced-motion: reduce)');const sync=()=>{setReduced(media.matches);if(media.matches)stop();};const visibility=()=>{if(document.hidden)stop();};sync();media.addEventListener('change',sync);document.addEventListener('visibilitychange',visibility);return()=>{if(timer.current)clearTimeout(timer.current);media.removeEventListener('change',sync);document.removeEventListener('visibilitychange',visibility);};},[]);
 function play(){if(playing){stop();return;}if(reduced||document.hidden)return;setPlaying(true);timer.current=setTimeout(stop,1800);}
 return <div className="space-y-6"><div className="glass overflow-hidden p-6 sm:p-10"><div className="mb-8 flex flex-wrap items-center justify-between gap-4"><p className="text-xs uppercase tracking-widest text-muted">NEX+ / Connectivity Flow</p><Button variant="outline" type="button" disabled={reduced} onClick={play}>{playing?<Square size={16} aria-hidden/>:<Play size={16} aria-hidden/>}{playing?'Hentikan alur':'Putar alur'}</Button></div><div className="grid items-center gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr]">{nodes.map((n,index)=><div key={n.name} className="contents"><button type="button" aria-pressed={selected===index} aria-controls={id} onClick={()=>setSelected(index)} className={'relative rounded-panel border border-rule p-4 transition-colors hover:bg-raised '+(selected===index?'bg-raised':'bg-canvas')}><NetworkArt variant={n.variant} className="mx-auto w-40 sm:w-48"/><span className="mt-4 block font-display text-xl">{n.name}</span><span className="mt-2 block text-xs text-muted">{n.location}</span>{selected===index&&<Check size={16} className="absolute top-4 right-4" aria-hidden/>}</button>{index<2&&<div className="relative flex flex-col items-center justify-center gap-2 py-3 text-[10px] uppercase tracking-widest text-muted"><span>{index===0?'Local Loop':'FTTH'}</span><span className="text-xl" aria-hidden>→</span>{playing&&<span className="route-pulse absolute bottom-0 h-1 w-6 rounded-full bg-accent"/>}</div>}</div>)}</div><div className="mt-8 border-t border-rule pt-6 text-center text-xs text-muted">Jalur alternatif: Cyber 2 → VSAT / Local Loop → Customer</div>{reduced&&<p className="mt-4 text-center text-xs text-muted">Animasi dijeda sesuai preferensi pengurangan gerakan.</p>}</div><section id={id} className="glass grid items-center gap-6 p-6 sm:p-8 md:grid-cols-[1fr_2fr]" aria-live="polite"><div><p className="text-xs uppercase tracking-widest text-accent-text">{node.category}</p><h2 className="mt-4 text-2xl">{node.title}</h2></div><p className="text-muted">{node.description}</p></section></div>;
}
