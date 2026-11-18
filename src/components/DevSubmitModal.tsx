import React, { useState, useRef } from 'react';
import { X, Upload, Shield, Globe, Smartphone, FileDown, Check, ExternalLink, Download, Image as ImageIcon, Link2 } from 'lucide-react';
import { backend } from '../lib/backend';

function maskUID(uid: string) {
  return uid ? uid.slice(0, 9) + '••••' + uid.slice(-3) : '••••';
}

export const STORE_CATEGORIES = [
  'All',
  'Social',
  'Dating',
  'Finance',
  'Productivity',
  'Games',
  'Tools',
  'Education',
  'Health',
  'Business',
  'Other',
];

const SUBMIT_CATEGORIES = STORE_CATEGORIES.filter((c) => c !== 'All');

async function compressImageToDataUrl(file: File, maxWidth = 800, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxWidth / Math.max(img.width, 1));
        const width = Math.round(img.width * scale);
        const height = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(String(reader.result || ''));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/webp', quality));
      };
      img.onerror = () => reject(new Error('Invalid image file'));
      img.src = String(reader.result || '');
    };
    reader.onerror = () => reject(new Error('Could not read image file'));
    reader.readAsDataURL(file);
  });
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Could not read APK file'));
    reader.readAsDataURL(file);
  });
}

export function DevSubmitModal({ onClose, initialTab = 'publish', onAppPublished, userUID, isStoreManager }: any) {
  const [tab, setTab] = useState(initialTab);
  const [appType, setAppType] = useState<'web' | 'android'>('web');
  const [title, setTitle] = useState('');
  const [studio, setStudio] = useState('');
  const [url, setUrl] = useState('');
  const [includeWeb, setIncludeWeb] = useState(true);
  const [packageName, setPackageName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Tools');
  const [versionName, setVersionName] = useState('1.0.0');
  const [versionCode, setVersionCode] = useState('1');
  const [apkFile, setApkFile] = useState<File | null>(null);
  const [apkExternalUrl, setApkExternalUrl] = useState('');
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [thumbnailUrlInput, setThumbnailUrlInput] = useState('');
  const [uploadProgress, setUploadProgress] = useState('');
  const [uploadPct, setUploadPct] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const apkInputRef = useRef<HTMLInputElement>(null);
  const iconInputRef = useRef<HTMLInputElement>(null);

  const handleSelectImage = async (file: File | null) => {
    setIconFile(file);
    if (!file) {
      setThumbnailPreview(thumbnailUrlInput.trim());
      return;
    }
    try {
      const compressed = await compressImageToDataUrl(file, 800, 0.82);
      setThumbnailPreview(compressed);
    } catch (e: any) {
      alert(e.message || 'Could not process image');
    }
  };

  const handleImageUrlChange = (val: string) => {
    setThumbnailUrlInput(val);
    if (!iconFile) {
      setThumbnailPreview(val.trim());
    }
  };

  const handlePublish = async () => {
    if (!title.trim()) return alert('Enter app title');
    if (appType === 'web' && !url.trim()) return alert('Enter web URL');
    if (appType === 'web' && !url.trim().startsWith('http')) return alert('Web URL must start with https://');

    if (appType === 'android') {
      if (!packageName.trim()) return alert('Enter package name e.g. com.rentmaster.intent');
      if (!/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/.test(packageName.trim())) {
        return alert('Package name must look like com.company.app (lowercase, with dots)');
      }
      if (!apkFile && !apkExternalUrl.trim()) {
        return alert('Select an .apk file or paste a direct .apk download URL');
      }
      if (apkFile && !apkFile.name.toLowerCase().endsWith('.apk')) return alert('File must be .apk');
      if (apkFile && apkFile.size > 15 * 1024 * 1024) {
        return alert('Direct upload supports APKs up to 15 MB. For larger APKs, upload to GitHub Releases and paste the .apk link below.');
      }
      if (includeWeb && !url.trim()) return alert('You checked "Also include Web Version" — enter the Web URL, or uncheck it');
      if (includeWeb && url.trim() && !url.trim().startsWith('http')) return alert('Web URL must start with https://');
    }

    const managerActive = Boolean(isStoreManager) || localStorage.getItem('prism_is_manager') === 'true';
    if (!managerActive) {
      try {
        const activeUid = localStorage.getItem('prism_imported_uid') || userUID;
        const existingRecords = await backend.list<any>('apps');
        const ownedCount = existingRecords.filter((r) => {
          const item = r?.data || r || {};
          return item.owner_uid === activeUid && item.status !== 'deleted';
        }).length;
        if (ownedCount >= 5) {
          return alert('Limit reached: You can list up to 5 active apps. Delete one or more existing apps in My Uploads to free up space for a new app.');
        }
      } catch {}
    }
    setLoading(true);
    setUploadProgress('');
    setUploadPct(15);

    try {
      let apkUrl = apkExternalUrl.trim();
      let finalThumbnailUrl = thumbnailPreview || thumbnailUrlInput.trim();

      if (appType === 'android' && apkFile) {
        setUploadProgress('Packaging APK...');
        setUploadPct(45);
        apkUrl = await fileToDataUrl(apkFile);
      }

      if (iconFile && !finalThumbnailUrl) {
        setUploadProgress('Optimizing thumbnail...');
        setUploadPct(70);
        finalThumbnailUrl = await compressImageToDataUrl(iconFile, 800, 0.82);
      }

      setUploadProgress('Saving app to store...');
      setUploadPct(90);

      const finalWebUrl = appType === 'web' ? url.trim() : includeWeb ? url.trim() : '';
      const finalApkUrl = appType === 'android' ? apkUrl : '';
      const resolvedStudio = studio.trim() || 'Indie Developer';

      const payload = {
        title: title.trim(),
        name: title.trim(),
        studio: resolvedStudio,
        live_web_url: finalWebUrl,
        download_url: appType === 'android' ? finalApkUrl : finalWebUrl,
        owner_uid: userUID,
        status: isStoreManager ? 'approved' : 'pending',
        app_type: appType,
        package_name: appType === 'android' ? packageName.trim() : null,
        description: description.trim() || url.trim() || title.trim(),
        tagline: description.trim() || url.trim() || title.trim(),
        category,
        version_name: appType === 'android' ? versionName.trim() : '1.0.0',
        version_code: appType === 'android' ? parseInt(versionCode, 10) || 1 : 1,
        apk_url: finalApkUrl || null,
        icon_url: finalThumbnailUrl || null,
        thumbnail_url: finalThumbnailUrl || null,
        install_count: 0,
        created_at: new Date().toISOString(),
      };

      const created = await backend.create('apps', payload);
      setUploadPct(100);

      const local = JSON.parse(localStorage.getItem('prism_user_uploaded_apps') || '[]');
      local.unshift({
        id: created.id,
        name: title.trim(),
        developer: resolvedStudio,
        studio: resolvedStudio,
        thumbnail: finalThumbnailUrl,
        thumbnail_url: finalThumbnailUrl,
        liveAppUrl: finalWebUrl,
        download_url: payload.download_url,
        apk_url: finalApkUrl,
        app_type: appType,
        package_name: payload.package_name,
        ownerId: userUID,
        category,
        tagline: description.trim() || url.trim(),
        status: payload.status,
      });
      localStorage.setItem('prism_user_uploaded_apps', JSON.stringify(local));

      setSuccess(true);
      setTimeout(() => {
        onAppPublished?.({ id: created.id, name: title.trim() });
        onClose();
      }, 1100);
    } catch (e: any) {
      alert(`Publish failed: ${e.message || 'Check your connection and try again.'}`);
    } finally {
      setLoading(false);
      setUploadProgress('');
      setUploadPct(0);
    }
  };

  return (
    <div className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#10111f] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden max-h-[92vh] flex flex-col">
        <div className="p-4 border-b border-white/10 flex justify-between items-center shrink-0">
          <h2 className="text-sm font-bold text-white">Developer Portal</h2>
          <button onClick={onClose} className="w-7 h-7 bg-white/10 rounded-full flex items-center justify-center text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-2 flex gap-2 border-b border-white/5 shrink-0">
          <button
            onClick={() => setTab('publish')}
            className={`flex-1 h-8 rounded-full text-xs font-bold ${tab === 'publish' ? 'bg-white text-black' : 'bg-white/10 text-white'}`}
          >
            Publish
          </button>
          <button
            onClick={() => setTab('owner-apps')}
            className={`flex-1 h-8 rounded-full text-xs font-bold ${tab === 'owner-apps' ? 'bg-white text-black' : 'bg-white/10 text-white'}`}
          >
            My Uploads
          </button>
          <button
            onClick={() => setTab('guide')}
            className={`flex-1 h-8 rounded-full text-xs font-bold ${tab === 'guide' ? 'bg-white text-black' : 'bg-white/10 text-white'}`}
          >
            Guide
          </button>
        </div>

        <div className="p-5 space-y-3 overflow-y-auto">
          {tab === 'publish' && !success && (
            <>
              <div className="p-3 bg-white/[0.04] rounded-xl border border-white/10">
                <div className="text-[10px] text-white/40">Your Private Passkey (owner only)</div>
                <div className="text-xs font-mono mt-1 text-white">{maskUID(userUID)}</div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setAppType('web')}
                  className={`flex-1 h-10 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border ${
                    appType === 'web' ? 'bg-white text-black border-white' : 'bg-white/5 text-white/70 border-white/10'
                  }`}
                >
                  <Globe className="w-4 h-4" /> Web App Only
                </button>
                <button
                  onClick={() => setAppType('android')}
                  className={`flex-1 h-10 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border ${
                    appType === 'android' ? 'bg-white text-black border-white' : 'bg-white/5 text-white/70 border-white/10'
                  }`}
                >
                  <Smartphone className="w-4 h-4" /> Android APK
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="App title e.g. Rent Master"
                  className="w-full h-11 px-4 bg-black/40 border border-white/10 rounded-full text-sm text-white"
                />
                <input
                  value={studio}
                  onChange={(e) => setStudio(e.target.value)}
                  placeholder="Studio / Developer name"
                  className="w-full h-11 px-4 bg-black/40 border border-white/10 rounded-full text-sm text-white"
                />
              </div>

              <div className="flex gap-2">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="flex-1 h-11 px-4 bg-black/40 border border-white/10 rounded-full text-sm text-white"
                >
                  {SUBMIT_CATEGORIES.map((c) => (
                    <option key={c} value={c} className="bg-[#10111f]">
                      {c}
                    </option>
                  ))}
                </select>
                {appType === 'android' && (
                  <>
                    <input
                      value={versionName}
                      onChange={(e) => setVersionName(e.target.value)}
                      placeholder="1.0.0"
                      className="w-24 h-11 px-3 bg-black/40 border border-white/10 rounded-full text-sm text-center text-white"
                    />
                    <input
                      value={versionCode}
                      onChange={(e) => setVersionCode(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="Code"
                      className="w-20 h-11 px-3 bg-black/40 border border-white/10 rounded-full text-sm text-center text-white"
                    />
                  </>
                )}
              </div>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short description of what your app does..."
                rows={2}
                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-2xl text-sm text-white resize-none"
              />

              {appType === 'web' && (
                <input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://your-app.vercel.app"
                  className="w-full h-11 px-4 bg-black/40 border border-white/10 rounded-full text-sm text-white"
                />
              )}

              {appType === 'android' && (
                <>
                  <input
                    value={packageName}
                    onChange={(e) => setPackageName(e.target.value.toLowerCase().trim())}
                    placeholder="Package name e.g. com.rentmaster.intent"
                    className="w-full h-11 px-4 bg-black/40 border border-white/10 rounded-full text-sm font-mono text-white"
                  />

                  <input
                    ref={apkInputRef}
                    type="file"
                    accept=".apk"
                    className="hidden"
                    onChange={(e) => setApkFile(e.target.files?.[0] || null)}
                  />
                  <button
                    onClick={() => apkInputRef.current?.click()}
                    className="w-full h-14 border-2 border-dashed border-white/20 rounded-2xl flex items-center justify-center gap-2 text-sm bg-white/[0.03] hover:bg-white/[0.06] text-white"
                  >
                    <FileDown className="w-5 h-5 text-emerald-400" />
                    {apkFile ? (
                      <span className="font-bold text-emerald-400 truncate max-w-[280px]">
                        {apkFile.name} — {(apkFile.size / 1024 / 1024).toFixed(1)} MB
                      </span>
                    ) : (
                      <span className="text-white/60">Tap to select .apk file (up to 15 MB)</span>
                    )}
                  </button>

                  <input
                    value={apkExternalUrl}
                    onChange={(e) => setApkExternalUrl(e.target.value)}
                    placeholder="Or paste external .apk download link (GitHub Releases, etc.)"
                    className="w-full h-10 px-4 bg-black/40 border border-white/10 rounded-full text-xs text-white"
                  />

                  <button
                    onClick={() => setIncludeWeb(!includeWeb)}
                    className={`w-full p-3 rounded-xl border flex items-start gap-2.5 text-left transition ${
                      includeWeb ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-white/[0.03] border-white/10'
                    }`}
                  >
                    <span
                      className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                        includeWeb ? 'bg-emerald-400 border-emerald-400' : 'border-white/30'
                      }`}
                    >
                      {includeWeb && <Check className="w-3.5 h-3.5 text-black" />}
                    </span>
                    <span>
                      <span className="text-[13px] font-bold text-white block">Also include Web Version</span>
                      <span className="text-[11px] text-white/50 leading-snug block">
                        Users can choose: Open in browser OR Download APK.
                      </span>
                    </span>
                  </button>

                  {includeWeb && (
                    <input
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="Web URL e.g. https://intent-app.vercel.app"
                      className="w-full h-11 px-4 bg-black/40 border border-emerald-500/40 rounded-full text-sm text-white"
                    />
                  )}

                  <div className="p-3 bg-white/[0.04] rounded-xl border border-white/10">
                    <div className="text-[10px] text-white/40 mb-2">Users will see:</div>
                    <div className="flex gap-2">
                      {includeWeb && (
                        <div className="flex-1 h-9 bg-white text-black rounded-full text-[12px] font-bold flex items-center justify-center gap-1.5">
                          <ExternalLink className="w-3.5 h-3.5" /> Open
                        </div>
                      )}
                      <div className="flex-1 h-9 bg-violet-600 text-white rounded-full text-[12px] font-bold flex items-center justify-center gap-1.5">
                        <Download className="w-3.5 h-3.5" /> Download APK
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Custom Thumbnail Upload & Live Preview */}
              <div className="p-3.5 bg-white/[0.04] border border-white/10 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-indigo-400" /> Custom App Thumbnail / Banner
                  </span>
                  {thumbnailPreview && (
                    <button
                      type="button"
                      onClick={() => {
                        setIconFile(null);
                        setThumbnailPreview('');
                        setThumbnailUrlInput('');
                      }}
                      className="text-[11px] text-red-400 hover:text-red-300"
                    >
                      Remove
                    </button>
                  )}
                </div>

                {thumbnailPreview && (
                  <div className="relative h-28 w-full rounded-xl overflow-hidden border border-white/15 bg-black/40">
                    <img src={thumbnailPreview} alt="App preview" className="w-full h-full object-cover" />
                  </div>
                )}

                <input
                  ref={iconInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleSelectImage(e.target.files?.[0] || null)}
                />
                <button
                  type="button"
                  onClick={() => iconInputRef.current?.click()}
                  className="w-full h-10 border border-dashed border-white/20 hover:border-white/40 rounded-full text-xs text-white/80 flex items-center justify-center gap-2 bg-black/30"
                >
                  <Upload className="w-3.5 h-3.5 text-indigo-400" />
                  {iconFile ? `Selected: ${iconFile.name}` : 'Upload Custom Cover Image (PNG, JPG, WebP)'}
                </button>

                <div className="relative">
                  <Link2 className="w-3.5 h-3.5 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    value={thumbnailUrlInput}
                    onChange={(e) => handleImageUrlChange(e.target.value)}
                    placeholder="Or paste cover image URL (https://...)"
                    className="w-full h-9 pl-9 pr-3 bg-black/40 border border-white/10 rounded-full text-xs text-white"
                  />
                </div>
                <p className="text-[10px] text-white/40">
                  Leave blank to auto-generate a unique gradient emblem cover for your app.
                </p>
              </div>

              {uploadProgress && (
                <div className="w-full p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span className="text-amber-400">{uploadProgress}</span>
                    <span className="text-amber-400">{uploadPct}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-emerald-400 h-2.5 rounded-full transition-all duration-200"
                      style={{ width: `${uploadPct}%` }}
                    />
                  </div>
                </div>
              )}

              <button
                onClick={handlePublish}
                disabled={loading}
                className="w-full h-11 bg-white text-black rounded-full font-bold text-sm flex items-center justify-center disabled:opacity-50"
              >
                {loading ? 'Publishing...' : isStoreManager ? 'Publish Now' : 'Submit for Review'}
              </button>
              <p className="text-[10px] text-white/30 text-center flex items-center justify-center gap-1">
                <Shield className="w-3 h-3" /> Manager reviews before it goes live in Discover
              </p>
            </>
          )}
          {success && (
            <div className="text-center py-8 text-emerald-400 font-bold">
              {isStoreManager ? 'Published live to store!' : 'Submitted! Awaiting approval'}
            </div>
          )}
          {tab === 'owner-apps' && (
            <div className="text-xs text-white/50">
              You have {JSON.parse(localStorage.getItem('prism_user_uploaded_apps') || '[]').length} uploads tied to your
              private UID. Open &ldquo;My Apps&rdquo; in the top bar to edit thumbnails, URLs, or descriptions anytime.
            </div>
          )}
          {tab === 'guide' && (
            <div className="text-xs text-white/60 space-y-2">
              <p>1. Your UID is generated automatically and stored locally.</p>
              <p>2. Upload any custom cover image (PNG, JPG, WebP) so users recognize your app immediately.</p>
              <p>3. Your uploads are tied to your UID — only you can edit or delete them.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
