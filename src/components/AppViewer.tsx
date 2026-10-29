export const AppViewer = ({ app, onClose }) => {
  if (!app) return null
  const isHttps = app.live_web_url?.startsWith('https://')
  return (
    <div className="fixed inset-0 z-[100] bg-[#05060f] flex flex-col">
      <div className="h-12 px-4 flex items-center justify-between bg-[#0a0b18] border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-white text-[13px] font-bold">{app.title}</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-300 border border-green-500/30">Sandboxed</span>
        </div>
        <button onClick={onClose} className="w-8 h-8 rounded-full bg-white text-black">✕</button>
      </div>
      {isHttps ? (<iframe src={app.live_web_url} className="flex-1 w-full border-0" sandbox="allow-scripts allow-forms allow-popups allow-modals" allow="autoplay; clipboard-write" referrerPolicy="no-referrer" />) : (<div className="flex-1 grid place-items-center text-white">Invalid HTTPS URL</div>)}
    </div>
  )
}
