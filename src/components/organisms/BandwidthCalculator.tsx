import { useId, useState } from 'react';
import { Building2, Hotel, GraduationCap, Ellipsis, Check, ArrowUpRight } from 'lucide-react';
import { Button } from '../ui/button';
import { Field } from '../ui/field';
import { MessageResult } from '../molecules/MessageResult';
import { estimateBandwidth, composeBandwidth } from '@/lib/bandwidth';
const profiles = [{ name: 'Kantor', icon: Building2 }, { name: 'Hotel', icon: Hotel }, { name: 'Sekolah', icon: GraduationCap }, { name: 'Lainnya', icon: Ellipsis }] as const;
const needs = ['Internet utama', 'IPTV / Hotel TV', 'CCTV (IP Camera)', 'Video conference', 'Cloud / server', 'Kebutuhan lainnya'] as const;
export function BandwidthCalculator() {
  const id = useId();
  const [profile, setProfile] = useState('Kantor');
  const [users, setUsers] = useState(250);
  const [perUser, setPerUser] = useState('2');
  const [selected, setSelected] = useState<readonly string[]>(['Internet utama', 'CCTV (IP Camera)', 'Video conference']);
  const [cameras, setCameras] = useState('10');
  const [other, setOther] = useState('');
  const [message, setMessage] = useState('');
  const estimate = estimateBandwidth({ users, perUserMbps: perUser });
  const cameraValid = /^[1-9]\d{0,3}$/.test(cameras);
  const selectedServices = selected.map(s => s === 'CCTV (IP Camera)' ? s + ' · ' + cameras + ' kamera' : s === 'Kebutuhan lainnya' && other.trim() ? s + ': ' + other.trim() : s);
  function toggle(need: string) { setSelected(current => current.includes(need) ? current.filter(s => s !== need) : [...current, need]); setMessage(''); }
  return <div className="grid items-start gap-6 lg:grid-cols-[1.4fr_1fr]" onChange={() => setMessage('')}>
    <div className="glass space-y-8 p-6 sm:p-8">
      <fieldset><legend className="mb-5 font-display text-xl">1. Profil lokasi</legend><div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{profiles.map(({ name, icon: Icon }) => <button key={name} type="button" aria-pressed={profile === name} onClick={() => { setProfile(name); setMessage(''); }} className={'flex min-h-20 flex-col items-center justify-center gap-2 rounded-control border border-rule p-3 text-sm ' + (profile === name ? 'bg-raised' : 'hover:bg-raised/60')}><Icon size={22} aria-hidden />{name}{profile === name && <Check size={14} aria-hidden />}</button>)}</div><p className="mt-4 text-xs text-muted">Jenis lokasi menjadi konteks konsultasi dan tidak mengubah hitungan otomatis.</p></fieldset>
      <div className="border-t border-rule pt-8"><h2 className="text-xl">2. Pengguna aktif bersamaan</h2><div className="mt-5 flex justify-between gap-4"><label htmlFor={id + '-users'} className="text-sm text-muted">Jumlah dipilih</label><span className="font-semibold">{users} pengguna</span></div><input id={id + '-users'} type="range" min="10" max="1000" step="10" value={users} onChange={e => setUsers(Number(e.target.value))} aria-valuetext={users + ' pengguna'} className="mt-3 h-11 w-full accent-action"/><div className="flex justify-between text-xs text-muted" aria-hidden="true"><span>10</span><span>250</span><span>500</span><span>750</span><span>1.000</span></div><div className="mt-6"><Field label="Asumsi per pengguna (Mbps)" type="number" min="1" max="1000" step="0.1" value={perUser} onChange={e => setPerUser(e.target.value)} error={estimate === null ? 'Isi angka antara 1 dan 1.000 Mbps.' : undefined}/></div></div>
      <fieldset className="border-t border-rule pt-8"><legend className="pt-8 font-display text-xl">3. Informasi layanan</legend><p className="my-4 text-xs text-muted">Pilihan ini masuk ke ringkasan konsultasi dan tidak menambah bandwidth secara otomatis.</p><div className="space-y-2">{needs.map(need => <div key={need}><label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-control p-3 hover:bg-raised"><input type="checkbox" checked={selected.includes(need)} onChange={() => toggle(need)} className="size-5 accent-action"/><span className="text-sm">{need}</span></label>{need === 'CCTV (IP Camera)' && selected.includes(need) && <div className="my-3 pl-3"><Field label="Jumlah kamera CCTV" type="number" min="1" max="9999" value={cameras} onChange={e => setCameras(e.target.value)} error={cameraValid ? undefined : 'Isi jumlah kamera antara 1 dan 9.999.'}/></div>}{need === 'Kebutuhan lainnya' && selected.includes(need) && <div className="my-3 pl-3"><Field label="Jelaskan singkat" maxLength={300} value={other} onChange={e => setOther(e.target.value)} placeholder="Contoh: akses VPN untuk 5 cabang"/></div>}</div>)}</div></fieldset>
    </div>
    <aside className="glass p-6 sm:p-8 lg:sticky lg:top-28"><h2 className="text-xl">4. Hasil perencanaan</h2><div className="my-6 border-y border-rule py-6" aria-live="polite"><p className="text-sm text-muted">Estimasi kebutuhan bandwidth</p><p className="mt-3 font-display text-4xl sm:text-5xl">{estimate?.toLocaleString('id-ID') ?? '—'} <span className="text-xl text-muted">Mbps</span></p><p className="mt-4 text-xs text-muted">{users} pengguna aktif × {perUser || '—'} Mbps per pengguna.</p></div><p className="text-sm text-muted">Estimasi perencanaan. Kapasitas teknis dan harga resmi perlu divalidasi bersama tim NEX+.</p><h3 className="mt-6 text-sm">Informasi konsultasi · {profile}</h3><ul className="mt-4 space-y-3 text-sm text-muted">{selectedServices.map(s => <li key={s} className="flex gap-3"><Check size={16} className="shrink-0" aria-hidden />{s}</li>)}</ul><Button type="button" className="mt-8 w-full" disabled={estimate === null || (selected.includes('CCTV (IP Camera)') && !cameraValid)} onClick={() => setMessage(composeBandwidth({ profile, users, perUserMbps: Number(perUser), services: selectedServices }))}>Konsultasikan konfigurasi<ArrowUpRight size={18} aria-hidden /></Button>{message && <MessageResult key={message} message={message}/>}</aside>
  </div>;
}
