const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync('index.html','utf8'),scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
scripts.forEach(script=>new vm.Script(script));
const storage=new Map([['prilozhuhaData','existing app data']]);
function boot(systemDark=false){
 const elements={profileName:{},profileButton:{},profileNickname:{value:''}},meta={};
 const context={matchMedia:()=>({matches:systemDark}),localStorage:{getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v)},document:{documentElement:{dataset:{}},querySelector:s=>s.startsWith('meta')?meta:{value:context.themeChoice},getElementById:id=>elements[id]},modalContent:{innerHTML:''},modal:{classList:{add(){}}},closeModal(){},toast(message){context.message=message},themeChoice:'light'};
 vm.createContext(context);vm.runInContext(scripts[0],context);
 vm.runInContext(scripts[1].split('\n').filter(l=>/^function (esc|profileInitial|applyProfile|openProfile|saveProfile)\(/.test(l)).join('\n'),context);
 return {context,elements,meta};
}
let a=boot();a.elements.profileNickname.value='  Новый ник  ';a.context.themeChoice='dark';a.context.saveProfile();
assert.equal(a.elements.profileName.textContent,'Новый ник');assert.equal(a.elements.profileButton.textContent,'Н');assert.equal(a.context.document.documentElement.dataset.theme,'dark');assert.equal(a.meta.content,'#10171e');
let b=boot(false);b.context.applyProfile();assert.equal(b.context.profileSettings.nickname,'Новый ник');assert.equal(b.context.document.documentElement.dataset.theme,'dark');
b.elements.profileNickname.value='   ';b.context.saveProfile();assert.equal(JSON.parse(storage.get('prilozhuhaProfile')).nickname,'Новый ник');
b.elements.profileNickname.value='<img onerror="bad">';b.context.themeChoice='light';b.context.saveProfile();b.context.openProfile();assert(!b.context.modalContent.innerHTML.includes('<img'));assert(b.context.modalContent.innerHTML.includes('&lt;img'));assert.equal(b.meta.content,'#f3f5f7');
let c=boot(true);assert.equal(c.context.profileSettings.theme,'light');assert.equal(storage.get('prilozhuhaData'),'existing app data');
storage.set('prilozhuhaProfile','invalid json');assert.equal(boot(true).context.profileSettings.theme,'dark');
console.log('PASS: script syntax, nickname, escaping, theme switching, reload persistence, empty name, corrupt settings, app data preserved');
