import React, { useState } from 'react';
import { 
  BookOpen, CheckCircle2, Globe, ShieldCheck, ArrowRight, 
  Trash2, AlertTriangle, ExternalLink, Sparkles, Layers,
  Terminal, ShieldAlert, Check, Laptop, Smartphone, HelpCircle,
  FileCode, Play, Download
} from 'lucide-react';
import { AppItem } from '../types';

interface OwnerGuidePortalProps {
  onOpenPublish: () => void;
  onOpenManageOwner: () => void;
  onOpenModeration: () => void;
  onViewApp?: (appId: string) => void;
  apps?: AppItem[];
}

export const OwnerGuidePortal: React.FC<OwnerGuidePortalProps> = ({
  onOpenPublish,
  onOpenManageOwner,
  onOpenModeration,
  onViewApp,
  apps = []
}) => {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [testUrl, setTestUrl] = useState('https://adinkra-studio.app');
  const [testAppName, setTestAppName] = useState('Adinkra Studio');
  const [urlVerified, setUrlVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const myUploadedApps = apps.filter(a => a.isUserUploaded || a.id === 'adinkra-studio');
  const flaggedApps = apps.filter(a => a.isFlagged);

  const handleVerifyUrl = () => {
    if (!testUrl.trim()) return;
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setUrlVerified(true);
    }, 800);
  };

  const steps = [
    {
      step: 1,
      title: "Preparation & App Architecture",
      subtitle: "Zero-tracker web standard and HTTPS deployment",
      tag: "PHASE 1"
    },
    {
      step: 2,
      title: "Publishing & Providing Live URLs",
      subtitle: "Connecting your hosted domain or offline bundles",
      tag: "PHASE 2"
    },
    {
      step: 3,
      title: "How Users Experience & Use Your App",
      subtitle: "Live app launching, test drives & device installation",
      tag: "PHASE 3"
    },
    {
      step: 4,
      title: "Deleting Uploaded Apps (Owner Rights)",
      subtitle: "1-click sovereign unpublishing with zero penalties",
      tag: "PHASE 4"
    },
    {
      step: 5,
      title: "Moderating & Deleting Inappropriate Apps",
      subtitle: "Ecosystem protection, violation removal & safety",
      tag: "PHASE 5"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-950/70 via-slate-900 to-slate-950 border border-indigo-900/50 p-6 sm:p-8">
        <div className="max-w-3xl space-y-3">
          <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs uppercase tracking-wider">
            <BookOpen className="w-4 h-4" />
            <span>Official Creator & App Owner Handbook</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Step-by-Step Portal for App Owners & Developers
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Welcome to the open Prism distribution protocol. Learn how to publish your software, connect live website URLs, deliver uninterrupted experiences, and retain absolute authority to update or permanently delete your uploaded applications.
          </p>

          {/* Quick Shortcuts Bar */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenPublish}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 shadow-md shadow-indigo-600/30"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Upload / Publish New App</span>
            </button>

            <button
              onClick={onOpenManageOwner}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>My Uploaded Apps & Delete ({myUploadedApps.length})</span>
            </button>

            <button
              onClick={onOpenModeration}
              className="px-4 py-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 rounded-lg text-xs font-medium transition-colors flex items-center gap-2"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span>Delete Inappropriate Apps {flaggedApps.length > 0 ? `(${flaggedApps.length} Flagged)` : ''}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Step Selector Pills / Stepper */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
        {steps.map(s => (
          <button
            key={s.step}
            onClick={() => setActiveStep(s.step)}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              activeStep === s.step
                ? 'bg-slate-900 border-indigo-500 shadow-md ring-1 ring-indigo-500/50'
                : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between text-[10px] font-mono mb-1">
              <span className={activeStep === s.step ? 'text-indigo-400 font-bold' : 'text-slate-500'}>
                {s.tag}
              </span>
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                activeStep === s.step ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                {s.step}
              </span>
            </div>
            <h4 className="text-xs font-bold text-white line-clamp-1">{s.title}</h4>
            <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{s.subtitle}</p>
          </button>
        ))}
      </div>

      {/* Detailed Step Content Panels */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
        {/* STEP 1 */}
        {activeStep === 1 && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <span className="text-xs font-mono text-indigo-400 uppercase tracking-wider block mb-1">
                STEP 01 OF 05
              </span>
              <h3 className="text-xl font-bold text-white">
                Preparing Your Application & Architecture
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                How to structure your software so it runs reliably across mobile phones, tablets, and desktops.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs text-slate-300">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-indigo-400 font-semibold">
                  <Laptop className="w-4 h-4" />
                  <span>1. Supported Technologies & Frameworks</span>
                </div>
                <p className="leading-relaxed">
                  Prism supports any web application technology: Progressive Web Apps (PWA), React, Svelte, Vue, raw HTML5/Canvas, WebAssembly, or offline bundle packages (.zip / .apk).
                </p>
                <ul className="list-disc pl-4 space-y-1 text-slate-400 text-[11px]">
                  <li>Single Page Apps (Vite, Next.js, Remix, Astro)</li>
                  <li>Client-side vector studios (e.g. Adinkra Studio)</li>
                  <li>Real-time WebAudio synths and DSP tools</li>
                </ul>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>2. Zero-Tracker & Privacy Mandate</span>
                </div>
                <p className="leading-relaxed">
                  Unlike conventional app stores filled with invasive surveillance trackers, Prism requires verified zero third-party telemetry.
                </p>
                <ul className="list-disc pl-4 space-y-1 text-slate-400 text-[11px]">
                  <li>No third-party advertising SDKs or fingerprinting</li>
                  <li>Data stays sandboxed locally in user's browser or device</li>
                  <li>Passing grants your app an immediate <strong>Grade A+ Privacy Audit</strong></li>
                </ul>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-300 leading-relaxed">
                <strong className="text-white block mb-0.5">Need a reference example?</strong>
                Inspect <strong>Adinkra Studio</strong> in the store catalog. It runs 100% locally with procedural SVG vector rendering, Akan cultural philosophies, zero trackers, and instant offline availability.
              </div>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {activeStep === 2 && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <span className="text-xs font-mono text-indigo-400 uppercase tracking-wider block mb-1">
                STEP 02 OF 05
              </span>
              <h3 className="text-xl font-bold text-white">
                Publishing Your App & Providing Live Website URLs
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Where to enter your live website address and attach optional offline packages.
              </p>
            </div>

            <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-indigo-400 font-semibold">
                  <Globe className="w-4 h-4" />
                  <span>The "Live Hosted App URL" Feature</span>
                </div>
                <p>
                  When you open the <strong>Developer Studio &rarr; Publish / Upload App</strong> portal, you will see the field:
                </p>
                <div className="p-3 bg-slate-900 border border-slate-700 rounded-lg font-mono text-indigo-300 text-xs">
                  Live Hosted App URL (e.g. https://adinkra-studio.app)
                </div>
                <p>
                  As soon as you provide this URL, Prism Store automatically generates a prominent <strong className="text-emerald-400">"Launch Live App"</strong> button on your appâ€™s store listing and card. When visitors click it, they are instantly transported to your hosted app without needing manual file downloads.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <strong className="text-white block">Option A: Hosted Web Application</strong>
                  <p className="text-slate-400">
                    Host your app on any web server (Vercel, Cloudflare Pages, Netlify, Firebase, GitHub Pages, or a custom domain). Simply paste your HTTPS link.
                  </p>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <strong className="text-white block">Option B: Offline Package Bundle</strong>
                  <p className="text-slate-400">
                    You can also attach a zip file (<span className="font-mono text-slate-200">.zip</span>) or Android package (<span className="font-mono text-slate-200">.apk</span>) if users prefer to save an offline copy.
                  </p>
                </div>
              </div>
            </div>

            {/* Interactive Pre-flight Checker */}
            <div className="bg-slate-950 p-5 rounded-xl border border-indigo-900/60 space-y-3">
              <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs">
                <Terminal className="w-4 h-4" />
                <span>Interactive Live URL & Pre-Flight Tester</span>
              </div>
              <p className="text-xs text-slate-400">
                Test your website address below to preview how Prism Store registers your live software.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  type="text"
                  value={testAppName}
                  onChange={e => setTestAppName(e.target.value)}
                  placeholder="App Title (e.g. Adinkra Studio)"
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 sm:w-1/3"
                />
                <input
                  type="url"
                  value={testUrl}
                  onChange={e => {
                    setTestUrl(e.target.value);
                    setUrlVerified(false);
                  }}
                  placeholder="https://your-domain.app"
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 flex-1 font-mono"
                />
                <button
                  type="button"
                  onClick={handleVerifyUrl}
                  disabled={isVerifying}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shrink-0"
                >
                  {isVerifying ? (
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  <span>Test URL</span>
                </button>
              </div>

              {urlVerified && (
                <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-lg text-xs text-emerald-300 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Live URL format verified. Prism will generate a direct "Launch Live App" link for <strong>{testAppName}</strong>.</span>
                  </div>
                  <a
                    href={testUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 rounded text-[11px] font-mono flex items-center gap-1 shrink-0"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Launch</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {activeStep === 3 && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <span className="text-xs font-mono text-indigo-400 uppercase tracking-wider block mb-1">
                STEP 03 OF 05
              </span>
              <h3 className="text-xl font-bold text-white">
                How Users Experience & Use Your App in Prism Store
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Understanding the 4 touchpoints: Direct Web Launch, In-Browser Test Drive, Device Installation, and Non-Disruptive Updates.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                  <ExternalLink className="w-4 h-4" />
                  <span>1. Instant Live Launch</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Users can click <strong>"Launch Live App"</strong> directly from your store listing. This eliminates download friction and directs users straight to your web service.
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-indigo-400 font-semibold">
                  <Play className="w-4 h-4" />
                  <span>2. Interactive Test-Drive Sandboxes</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Prism features in-browser test playgrounds (like Adinkra vector canvas, WebAudio synths, and runner telemetry). Users experience your core interaction before deciding to install.
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-sky-400 font-semibold">
                  <Smartphone className="w-4 h-4" />
                  <span>3. Direct 1-Click Device Installation (Zero 3-Dots Hassle)</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Users can install directly from the Prism Store page with 1 click â€” completely avoiding the long process of searching through browser three-dot menus. Works across Android, iPhone, iPad, and desktop with offline support.
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-teal-400 font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>4. Non-Disruptive Background Updates</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  When you release updates, users never suffer forced app crashes or session restarts. Updates download silently in the background and activate seamlessly.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4 */}
        {activeStep === 4 && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <span className="text-xs font-mono text-indigo-400 uppercase tracking-wider block mb-1">
                STEP 04 OF 05
              </span>
              <h3 className="text-xl font-bold text-white">
                Deleting Uploaded Apps: Unique Identifiers & Owner Sovereignty
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Every user is assigned a Unique Identifier (UID). You can delete your own uploaded applications at any time, but cannot delete apps belonging to other users.
              </p>
            </div>

            <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
              <div className="bg-slate-950 p-4 rounded-xl border border-indigo-900/40 space-y-2">
                <strong className="text-white block font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 inline-block" />
                  <span>Unique Identifiers (UIDs) for App Access & Sovereignty:</span>
                </strong>
                <p className="text-slate-300 text-xs leading-relaxed">
                  When you upload or publish software, it is cryptographically stamped with your <strong>Unique Identifier (UID)</strong> (e.g. <code className="text-indigo-300">PRISM-UID-xxxx</code>). Your UID ensures that only you have authority to manage, update, and delete your respective applications. No other regular user can delete your app.
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <strong className="text-white block font-semibold">
                  How App Owners Delete Their Own Respective Apps:
                </strong>
                <ol className="list-decimal pl-5 space-y-2 text-slate-300">
                  <li>
                    Click the <strong className="text-indigo-300">Dev & Owner Studio</strong> button or your <strong className="text-indigo-300">UID badge</strong> in the top navigation bar.
                  </li>
                  <li>
                    Switch to the <strong className="text-white">"My Uploaded Apps & Delete"</strong> tab. All apps owned by your active UID are displayed.
                  </li>
                  <li>
                    Alternatively, open the app's detail modal and locate the <strong className="text-rose-400">"Delete My App (Owner)"</strong> button.
                  </li>
                  <li>
                    Select your reason for unpublishing (e.g. author deprecation or new release) and confirm deletion.
                  </li>
                  <li>
                    The app is immediately unpublished from the store catalog with zero waiting period or penalty.
                  </li>
                </ol>
              </div>

              <div className="p-4 bg-rose-950/30 border border-rose-800/50 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-rose-300 font-semibold">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>Zero Penalty & Protection Against Other Users</span>
                </div>
                <p className="text-slate-300 text-xs">
                  Other individual users cannot delete your app. Only you as the authentic owner (matching your UID) or the Prism Store Developer / Manager can remove software from the store.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end">
                <button
                  onClick={onOpenManageOwner}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-2 shadow-md shadow-rose-600/30"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Go to My Uploaded Apps ({myUploadedApps.length}) to Manage / Delete</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5 */}
        {activeStep === 5 && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <span className="text-xs font-mono text-indigo-400 uppercase tracking-wider block mb-1">
                STEP 05 OF 05
              </span>
              <h3 className="text-xl font-bold text-white">
                Developer Moderation: Delete Inappropriate Apps (Store Manager Exclusive)
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Ecosystem protection protocols: Only the developer or manager of Prism App Store has access to delete inappropriate apps from the store catalog.
              </p>
            </div>

            <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
              <div className="bg-amber-950/30 p-4 rounded-xl border border-amber-600/40 space-y-2">
                <strong className="text-amber-300 block font-semibold flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <span>Strict Access Boundary: Store Developer & Manager Exclusivity</span>
                </strong>
                <p className="text-slate-300 text-xs leading-relaxed">
                  To safeguard developer autonomy and prevent abuse, standard app owners cannot delete or tamper with apps uploaded by others. Only the <strong>Prism Store Developer or Manager</strong> possesses unique root credentials to access <strong className="text-white">Developer Moderation: Delete Inappropriate Apps</strong> and make changes to the store catalog as and when necessary.
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <strong className="text-white block font-semibold">
                  What Constitutes an Inappropriate App in Prism Store?
                </strong>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg space-y-1">
                    <span className="text-rose-400 font-bold block">1. Surveillance Ad Trackers</span>
                    <p className="text-slate-400">Apps embedding secret third-party advertising SDKs or data brokers.</p>
                  </div>
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg space-y-1">
                    <span className="text-rose-400 font-bold block">2. Malicious or Broken Code</span>
                    <p className="text-slate-400">Packages running unauthorized crypto mining, phishing, or broken URLs.</p>
                  </div>
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg space-y-1">
                    <span className="text-rose-400 font-bold block">3. Inappropriate Content</span>
                    <p className="text-slate-400">Harassing, illegal, deceptive, or copyrighted infringing materials.</p>
                  </div>
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg space-y-1">
                    <span className="text-rose-400 font-bold block">4. Deceptive Subscription Traps</span>
                    <p className="text-slate-400">Hidden recurring fees or dark-pattern payment traps.</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <strong className="text-white block font-semibold">
                  Store Developer Moderation Process:
                </strong>
                <ol className="list-decimal pl-5 space-y-1.5 text-slate-300">
                  <li>Store Developer or Manager authenticates using their unique master passkey.</li>
                  <li>Opens the <strong>Developer Moderation Console</strong>.</li>
                  <li>Reviews flagged apps or searches for inappropriate software.</li>
                  <li>Clicks <strong>"Delete Inappropriate App"</strong> and records policy violation justification.</li>
                  <li>The app is permanently excised from the catalog with an immutable audit entry.</li>
                </ol>
              </div>

              <div className="pt-2 flex items-center justify-end">
                <button
                  onClick={onOpenModeration}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-2 shadow-md shadow-rose-600/30"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Open Developer Moderation Console</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step Navigation Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={() => setActiveStep(prev => Math.max(1, prev - 1))}
            disabled={activeStep === 1}
            className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
          >
            &larr; Previous Step
          </button>

          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map(stepNum => (
              <button
                key={stepNum}
                onClick={() => setActiveStep(stepNum)}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  activeStep === stepNum ? 'bg-indigo-500' : 'bg-slate-700 hover:bg-slate-600'
                }`}
                title={`Jump to step ${stepNum}`}
              />
            ))}
          </div>

          <button
            onClick={() => setActiveStep(prev => Math.min(5, prev + 1))}
            disabled={activeStep === 5}
            className="px-3.5 py-1.5 text-xs text-indigo-400 hover:text-indigo-300 disabled:opacity-30 disabled:hover:text-indigo-400 transition-colors flex items-center gap-1"
          >
            <span>Next Step</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

