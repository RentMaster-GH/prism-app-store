import { Compass, AppWindow, Library, MessageSquare, Key } from 'lucide-react';

export function MobileBottomNav({ currentTab, onSelectTab, installedCount }: any) {
  const items = [
    { id:'discover', label:'Discover', icon: Compass },
    { id:'apps', label:'Apps', icon: AppWindow },
    { id:'library', label:'Library', icon: Library, badge: installedCount },
    { id:'feedback', label:'Feedback', icon: MessageSquare },
    { id:'myapps', label:'My Portal', icon: Key },
  ];
  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-[#05060f]/90 backdrop-blur-xl border-t border-white/10 safe-bottom">
      <div className="grid grid-cols-5 h-[64px]">
        {items.map(item => (
          <button key={item.id} onClick={()=>onSelectTab(item.id)} className={`flex flex-col items-center justify-center gap-1 relative ${currentTab===item.id ? 'text-white' : 'text-white/40'}`}>
            <item.icon className={`w-5 h-5 ${currentTab===item.id?'scale-110':''}`}/>
            <span className="text-[10px] font-medium">{item.label}</span>
            {item.badge > 0 && <span className="absolute top-1.5 right-5 w-4 h-4 bg-indigo-600 text-white text-[9px] rounded-full flex items-center justify-center">{item.badge > 9 ? '9+' : item.badge}</span>}
            {currentTab===item.id && <div className="absolute bottom-1 w-1 h-1 bg-white rounded-full"/>}
          </button>
        ))}
      </div>
    </div>
  );
}
