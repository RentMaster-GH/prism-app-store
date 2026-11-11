import React, { useState, useRef } from 'react';
import { X, Upload, Shield, Globe, Smartphone, FileDown, Check, ExternalLink, Download } from 'lucide-react';
import { supabase } from '../lib/supabase';

function maskUID(uid: string) { return uid ? uid.slice(0, 9) + '••••' + uid.slice(-3) : '••••'; }

const CATEGORIES = ['Other', 'Social', 'Dating', 'Finance', 'Productivity', 'Games', 'Tools', 'Education', 'Health', 'Business'];

export function DevSubmitModal({ onClose, apps, initialTab = 'publish', onAppPublished, userUID, isStoreManager }: any) {
  const [tab, setTab] = useState(initialTab);
  const [appType, setAppType] = useState<'web' | 'android'>('android');
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [includeWeb, setIncludeWeb] = useState(true);
  const [packageName, setPackageName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Other');
  const [versionName, setVersionName] = useState('1.0.0');
  const [versionCode, setVersionCode] = useState('1');
  const [apkFile, setApkFile] = useState<File | null>(null);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const apkInputRef = useRef<HTMLInputElement>(null);
  const iconInputRef = useRef<HTMLInputElement>(null);

  const handlePublish = async () => {
    if (!title.trim()) return alert('Enter app title');
    if (appType === 'web' && !url.trim()) return alert('Enter web URL');
    if (appType === 'android') {
      if (!packageName.trim()) return alert('Enter package name e.g. com.rentmaster.intent');
      if (!/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/.test(packageName.trim())) return alert('Package name must look like com.company.app (lowercase, with dots)');
      if (!apkFile) return alert('Select an APK file to upload');
      if (!apkFile.name.toLowerCase().endsWith('.apk')) return alert('File must be .apk');
      if (includeWeb && !url.trim()) return alert('You checked "Also include Web Version" — enter the Web URL, or uncheck it');
      if (includeWeb && url.trim() && !url.trim().startsWith('http')) return alert('Web URL must start with https://');
    }

    const localApps = JSON.parse(localStorage.getItem('prism_user_uploaded_apps') || '[]');
    const MAX_APPS = isStoreManager ? 9999 : 3;
    if (localApps.length >= MAX_APPS) {
      return alert(isStoreManager ? 'Manager can publish unlimited' : `Limit reached: You can only publish ${MAX_APPS} apps. Contact store manager.`);
    }
    if (supabase && !isStoreManager) {
      try {
        const { count } = await supabase.from('apps').select('*', { count: 'exact', head: true }).eq('owner_uid', userUID);
        if ((count || 0) >= MAX_APPS) return alert(`Limit reached: ${MAX_APPS} apps max`);
      } catch {}
    }

    setLoading(true);
    setUploadProgress('');
    try {
      let apkUrl = '';
      let iconUrl = '';

      // --- Upload APK ---
      if (appType === 'android' && apkFile && supabase) {
        setUploadProgress('Uploading APK...');
        const filePath = `${packageName.trim()}/v${versionName.trim()}-${Date.now()}.apk`;
        const { error: uploadError } = await supabase.storage
          .from('prism-apks')
          .upload(filePath, apkFile, { contentType: 'application/vnd.android.package-archive', upsert: true });
        if (uploadError) throw new Error(`APK upload failed: ${uploadError.message}. Did you create the public 'prism-apks' bucket?`);
        const { data: urlData } = supabase.storage.from('prism-apks').getPublicUrl(filePath);
        apkUrl = urlData.publicUrl;
      }

      // --- Upload Icon (optional) ---
      if (iconFile && supabase) {
        setUploadProgress('Uploading icon...');
        const iconPath = `icons/${Date.now()}-${iconFile.name}`;
        const { error: iconErr } = await supabase.storage.from('prism-apks').upload(iconPath, iconFile, { upsert: true });
        if (!iconErr) {
          const { data } = supabase.storage.from('prism-apks').getPublicUrl(iconPath);
          iconUrl = data.publicUrl;
        }
      }

      // --- KEY: Web and APK stay SEPARATE ---
      // Web-only: live_web_url = web, download_url = web
      // Android + Web: live_web_url = web, download_url = apk
      // Android only: live_web_url = '', download_url = apk
      const finalWebUrl = appType === 'web' ? url.trim() : (includeWeb ? url.trim() : '');
      const finalApkUrl = appType === 'android' ? apkUrl : '';

      const payload = {
        title: title.trim(),
        studio: "SwipeDebt Studio",
        live_web_url: finalWebUrl,
        download_url: appType === 'android' ? finalApkUrl : finalWebUrl,
        owner_uid: userUID,
        status: 'pending',
        app_type: appType,
        package_name: appType === 'android' ? packageName.trim() : null,
        description: description.trim() || url.trim() || title.trim(),
        category,
        version_name: appType === 'android' ? versionName.trim() : '1.0.0',
        version_code: appType === 'android' ? parseInt(versionCode) || 1 : 1,
        apk_url: finalApkUrl || null,
        icon_url: iconUrl || null,
      };

      if (supabase) {
        const { error } = await supabase.from('apps').insert(payload as any);
        if (error) throw error;
      }

      const local = JSON.parse(localStorage.getItem('prism_user_uploaded_apps') || '[]');
      local.unshift({
        id: `app-${Date.now()}`,
        name: title.trim(),
        liveAppUrl: finalWebUrl,
        download_url: payload.download_url,
        apk_url: finalApkUrl,
        app_type: appType,
        package_name: payload.package_name,
        ownerId: userUID,
        category,
        tagline: description.trim() || url.trim(),
      });
      localStorage.setItem('prism_user_uploaded_apps', JSON.stringify(local));
      setSuccess(true);
      setTimeout(() => { onAppPublished?.({ id: `app-${Date.now()}`, name: title.trim() }); onClose(); }, 1200);
    } catch (e: any) {
      console.log('Publish error:', e.message);
      alert(`Publish failed: ${e.message}`);
    } finally {
      setLoading(false);
      setUploadProgress('');
    }
  };

  return (
    <div className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#10111f] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden max-h-[92vh] flex flex-col">
        <div className="p-4 border-b border-white/10 flex justify-between items-center shrink-0">
          <h2 className="text-sm font-bold">Developer Portal</h2>
          <button onClick={onClose} className="w-7 h-7 bg-white/10 rounded-full flex items-center justify-center"><X className="w-4 h-4" /></button>
        </div>

        <div className="p-2 flex gap-2 border-b border-white/5 shrink-0">
          <button onClick={() => setTab('publish')} className={`flex-1 h-8 rounded-full text-xs ${tab === 'publish' ? 'bg-white text-black' : 'bg-white/10'}`}>Publish</button>
          <button onClick={() => setTab('owner-apps')} className={`flex-1 h-8 rounded-full text-xs ${tab === 'owner-apps' ? 'bg-white text-black' : 'bg-white/10'}`}>My Uploads</button>
          <button onClick={() => setTab('guide')} className={`flex-1 h-8 rounded-full text-xs ${tab === 'guide' ? 'bg-white text-black' : 'bg-white/10'}`}>Guide</button>
        </div>

        <div className="p-5 space-y-3 overflow-y-auto">
          {tab === 'publish' && !success && (
            <>
              <div className="p-3 bg-white/[0.04] rounded-xl border border-white/10">
                <div className="text-[10px] text-white/40">Your Private Passkey (owner only)</div>
                <div className="text-xs font-mono mt-1">{maskUID(userUID)}</div>
                <div className="text-[10px] text-white/30 mt-1">Only you see this. Other users have their own different masked ID.</div>
              </div>

              {/* TYPE TOGGLE */}
              <div className="flex gap-2">
                <button
                  onClick={() => setAppType('web')}
                  className={`flex-1 h-10 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border ${appType === 'web' ? 'bg-white text-black border-white' : 'bg-white/5 text-white/70 border-white/10'}`}
                >
                  <Globe className="w-4 h-4" /> Web App Only
                </button>
                <button
                  onClick={() => setAppType('android')}
                  className={`flex-1 h-10 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border ${appType === 'android' ? 'bg-white text-black border-white' : 'bg-white/5 text-white/70 border-white/10'}`}
                >
                  <Smartphone className="w-4 h-4" /> Android APK
                </button>
              </div>

              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="App title e.g. Intent-App" className="w-full h-11 px-4 bg-black/40 border border-white/10 rounded-full text-sm" />

              {appType === 'web' && (
                <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://your-app.vercel.app" className="w-full h-11 px-4 bg-black/40 border border-white/10 rounded-full text-sm" />
              )}

              {appType === 'android' && (
                <>
                  <input value={packageName} onChange={e => setPackageName(e.target.value.toLowerCase().trim())} placeholder="Package name e.g. com.rentmaster.intent" className="w-full h-11 px-4 bg-black/40 border border-white/10 rounded-full text-sm font-mono" />
                  <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="What does your app do? e.g. Intentional dating - max 3 active chats" rows={2} className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-2xl text-sm resize-none" />
                  <div className="flex gap-2">
                    <select value={category} onChange={e => setCategory(e.target.value)} className="flex-1 h-11 px-3 bg-black/40 border border-white/10 rounded-full text-sm">
                      {CATEGORIES.map(c => <option key={c} value={c} className="bg-[#10111f]">{c}</option>)}
                    </select>
                    <input value={versionName} onChange={e => setVersionName(e.target.value)} placeholder="1.0.0" className="w-24 h-11 px-3 bg-black/40 border border-white/10 rounded-full text-sm text-center" />
                    <input value={versionCode} onChange={e => setVersionCode(e.target.value.replace(/[^0-9]/g, ''))} placeholder="Code 1" className="w-20 h-11 px-3 bg-black/40 border border-white/10 rounded-full text-sm text-center" />
                  </div>

                  {/* APK UPLOAD */}
                  <input ref={apkInputRef} type="file" accept=".apk" className="hidden" onChange={e => setApkFile(e.target.files?.[0] || null)} />
                  <button onClick={() => apkInputRef.current?.click()} className="w-full h-14 border-2 border-dashed border-white/20 rounded-2xl flex items-center justify-center gap-2 text-sm bg-white/[0.03] hover:bg-white/[0.06]">
                    <FileDown className="w-5 h-5 text-emerald-400" />
                    {apkFile ? <span className="font-bold text-emerald-400 truncate max-w-[280px]">{apkFile.name} — {(apkFile.size / 1024 / 1024).toFixed(1)} MB</span> : <span className="text-white/60">Tap to select .apk file (required)</span>}
                  </button>

                  {/* CHECKBOX - ALSO INCLUDE WEB VERSION */}
                  <button
                    onClick={() => setIncludeWeb(!includeWeb)}
                    className={`w-full p-3 rounded-xl border flex items-start gap-2.5 text-left transition ${includeWeb ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-white/[0.03] border-white/10'}`}
                  >
                    <span className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${includeWeb ? 'bg-emerald-400 border-emerald-400' : 'border-white/30'}`}>
                      {includeWeb && <Check className="w-3.5 h-3.5 text-black" />}
                    </span>
                    <span>
                      <span className="text-[13px] font-bold text-white block">Also include Web Version</span>
                      <span className="text-[11px] text-white/50 leading-snug block">Users can choose: Open in browser (instant) OR Download APK (native). Recommended.</span>
                    </span>
                  </button>

                  {includeWeb && (
                    <input value={url} onChange={e => setUrl(e.target.value)} placeholder="Web URL e.g. https://intent-app.vercel.app" className="w-full h-11 px-4 bg-black/40 border border-emerald-500/40 rounded-full text-sm" />
                  )}
                  {!includeWeb && (
                    <p className="text-[11px] text-white/40 text-center">APK only — users will only see Download APK, no Open button.</p>
                  )}

                  {/* LIVE PREVIEW - what users will see */}
                  <div className="p-3 bg-white/[0.04] rounded-xl border border-white/10">
                    <div className="text-[10px] text-white/40 mb-2">Users will see:</div>
                    <div className="flex gap-2">
                      {includeWeb && (
                        <div className="flex-1 h-9 bg-white text-black rounded-full text-[12px] font-bold flex items-center justify-center gap-1.5"><ExternalLink className="w-3.5 h-3.5" /> Open</div>
                      )}
                      <div className="flex-1 h-9 bg-violet-600 text-white rounded-full text-[12px] font-bold flex items-center justify-center gap-1.5"><Download className="w-3.5 h-3.5" /> Download APK</div>
                    </div>
                  </div>
                </>
              )}

              {/* Icon */}
              <input ref={iconInputRef} type="file" accept="image/*" className="hidden" onChange={e => setIconFile(e.target.files?.[0] || null)} />
              <button onClick={() => iconInputRef.current?.click()} className="w-full h-10 border border-white/10 rounded-full text-xs text-white/60 flex items-center justify-center gap-2">
                <Upload className="w-3 h-3" /> {iconFile ? `Icon: ${iconFile.name}` : 'App Icon (optional, 512x512 PNG)'}
              </button>

              {uploadProgress && <div className="text-center text-xs text-amber-400 font-bold">{uploadProgress}</div>}

              <button onClick={handlePublish} disabled={loading} className="w-full h-11 bg-white text-black rounded-full font-bold text-sm flex items-center justify-center disabled:opacity-50">
                {loading ? 'Publishing...' : 'Submit for Review'}
              </button>
              <p className="text-[10px] text-white/30 text-center flex items-center justify-center gap-1"><Shield className="w-3 h-3" /> Manager reviews before it goes live in Discover</p>
            </>
          )}
          {success && <div className="text-center py-8 text-emerald-400 font-bold">Submitted! Awaiting approval</div>}
          {tab === 'owner-apps' && <div className="text-xs text-white/50">You have {JSON.parse(localStorage.getItem('prism_user_uploaded_apps') || '[]').length} uploads tied to your private UID. Other users cannot see this list.</div>}
          {tab === 'guide' && <div className="text-xs text-white/60 space-y-2"><p>1. Your UID is generated automatically, stored locally.</p><p>2. No one else sees it — masked as PRISM-••••-XXX</p><p>3. Your uploads are tied to your UID, only you can edit/delete them.</p><p>4. Manager needs secret, not UID.</p><p>5. <b>Web Only:</b> just a URL. <b>Android APK:</b> APK file required. Tick “Also include Web Version” to give users both Open + Download APK.</p></div>}
        </div>
      </div>
    </div>
  );
}