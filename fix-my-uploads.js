(function fixPrismUploads(){
  const uid = localStorage.getItem('prism_user_uid');
  console.log('Current UID:', uid);
  const keys = ['prism_user_uploaded_apps','prism_apps_registry'];
  keys.forEach(k=>{
    const raw = localStorage.getItem(k);
    if(!raw) return console.log(k,'- empty');
    try {
      const arr = JSON.parse(raw);
      console.log(k, `has ${arr.length} apps:`, arr.map(a=>({id:a.id, title:a.title||a.name, ownerId:a.ownerId||a.owner_id})));
      const fixed = arr.map(a=>({...a, ownerId: uid, owner_uid: uid, owner_id: uid}));
      localStorage.setItem(k, JSON.stringify(fixed));
      console.log(`✅ Fixed ${k}`);
    } catch(e){ console.error(k, e); }
  });
  console.log('Reloading...');
  setTimeout(()=>location.reload(), 1000);
})();
