const partsList=document.getElementById("partsList");
const stepsBox=document.getElementById("steps");
const stage=document.getElementById("stage");
const zones=[...document.querySelectorAll(".drop-zone")];
const progressFill=document.getElementById("progressFill");
const progressText=document.getElementById("progressText");
const scorePoints=document.getElementById("scorePoints");
const timerBox=document.getElementById("timer");
const message=document.getElementById("message");
const toast=document.getElementById("toast");
const modal=document.getElementById("modal");
const modalText=document.getElementById("modalText");
let dragged=null, installed=new Set(), score=0, seconds=0, timerId=null, zoom=1;

const parts=[
{id:"cpu",ar:"المعالج CPU",en:"Intel Core i7 واقعي",step:"تركيب المعالج",w:140,h:112,x:495,y:250,cls:"cpu-placed"},
{id:"thermal",ar:"المعجون الحراري",en:"نقطة معجون فوق CPU",step:"وضع المعجون",w:82,h:50,x:525,y:284,cls:"paste-placed"},
{id:"cooler",ar:"مبرد المعالج",en:"Air Cooler فوق CPU",step:"تركيب المبرّد فوق المعالج",w:290,h:265,x:420,y:175,cls:"cooler-placed"},
{id:"ram",ar:"RAM DDR5",en:"ذاكرة واقعية",step:"تركيب الرام",w:175,h:320,x:780,y:115},
{id:"m2",ar:"M.2 NVMe SSD",en:"قرص تخزين واقعي",step:"تركيب M.2",w:400,h:64,x:390,y:505},
{id:"gpu",ar:"كرت الشاشة GPU",en:"كرت شاشة بثلاث مراوح",step:"تركيب GPU",w:610,h:78,x:245,y:624},
{id:"psu24",ar:"كابل 24-Pin",en:"طاقة المذربورد",step:"توصيل 24-Pin",w:60,h:250,x:1010,y:175},
{id:"cpu8",ar:"كابل CPU 8-Pin",en:"طاقة المعالج",step:"توصيل CPU 8-Pin",w:130,h:64,x:500,y:100},
{id:"sata",ar:"SSD SATA",en:"قرص 2.5 inch",step:"تركيب SATA SSD",w:170,h:93,x:895,y:545}
];

const req={thermal:["cpu"],cooler:["thermal"],gpu:["ram","m2"],cpu8:["cooler"]};

function svg(id){
if(id==="cpu")return `<svg viewBox="0 0 180 140" xmlns="http://www.w3.org/2000/svg"><rect x="14" y="12" width="152" height="116" rx="12" fill="#cbd5e1" stroke="#64748b" stroke-width="6"/><rect x="35" y="32" width="110" height="76" rx="8" fill="#f8fafc"/><text x="90" y="65" text-anchor="middle" font-size="18" fill="#111827">intel</text><text x="90" y="88" text-anchor="middle" font-size="20" font-weight="bold" fill="#111827">CORE i7</text><g fill="#d97706"><rect x="20" y="130" width="7" height="8"/><rect x="36" y="130" width="7" height="8"/><rect x="52" y="130" width="7" height="8"/><rect x="68" y="130" width="7" height="8"/><rect x="84" y="130" width="7" height="8"/><rect x="100" y="130" width="7" height="8"/><rect x="116" y="130" width="7" height="8"/><rect x="132" y="130" width="7" height="8"/></g></svg>`;
if(id==="thermal")return `<svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg"><ellipse cx="60" cy="42" rx="38" ry="24" fill="#e0f2fe" opacity=".95"/><ellipse cx="60" cy="42" rx="24" ry="14" fill="#38bdf8" opacity=".8"/><text x="60" y="47" text-anchor="middle" font-size="12" fill="#082f49">PASTE</text></svg>`;
if(id==="cooler")return `<svg viewBox="0 0 300 270" xmlns="http://www.w3.org/2000/svg"><rect x="18" y="18" width="264" height="230" rx="20" fill="#1e293b" stroke="#94a3b8" stroke-width="4"/><g fill="#475569"><rect x="42" y="30" width="216" height="8"/><rect x="42" y="48" width="216" height="8"/><rect x="42" y="66" width="216" height="8"/><rect x="42" y="84" width="216" height="8"/></g><circle cx="150" cy="145" r="82" fill="#020617" stroke="#cbd5e1" stroke-width="9"/><circle cx="150" cy="145" r="22" fill="#94a3b8"/><path d="M150 63 C188 94 190 124 150 145 C112 112 113 86 150 63Z" fill="#334155"/><path d="M232 145 C201 183 171 185 150 145 C183 107 209 108 232 145Z" fill="#334155"/><path d="M150 227 C112 196 110 166 150 145 C188 178 187 204 150 227Z" fill="#334155"/><path d="M68 145 C99 107 129 105 150 145 C117 183 91 182 68 145Z" fill="#334155"/><rect x="95" y="240" width="110" height="20" rx="6" fill="#64748b"/></svg>`;
if(id==="ram")return `<svg viewBox="0 0 180 330" xmlns="http://www.w3.org/2000/svg"><rect x="30" y="8" width="45" height="314" rx="9" fill="#111827" stroke="#22c55e" stroke-width="4"/><rect x="105" y="8" width="45" height="314" rx="9" fill="#111827" stroke="#22c55e" stroke-width="4"/><g fill="#16a34a"><rect x="38" y="30" width="29" height="44"/><rect x="38" y="95" width="29" height="44"/><rect x="38" y="160" width="29" height="44"/><rect x="38" y="225" width="29" height="44"/><rect x="113" y="30" width="29" height="44"/><rect x="113" y="95" width="29" height="44"/><rect x="113" y="160" width="29" height="44"/><rect x="113" y="225" width="29" height="44"/></g><rect x="25" y="0" width="130" height="8" fill="#cbd5e1"/></svg>`;
if(id==="m2")return `<svg viewBox="0 0 420 80" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="18" width="400" height="44" rx="7" fill="#111827" stroke="#facc15" stroke-width="3"/><circle cx="30" cy="40" r="7" fill="#e2e8f0"/><rect x="68" y="27" width="100" height="26" rx="4" fill="#334155"/><rect x="185" y="27" width="72" height="26" rx="4" fill="#475569"/><text x="310" y="45" text-anchor="middle" font-size="18" fill="#e2e8f0">NVMe SSD</text></svg>`;
if(id==="gpu")return `<svg viewBox="0 0 640 95" xmlns="http://www.w3.org/2000/svg"><rect x="12" y="12" width="610" height="64" rx="13" fill="#111827" stroke="#64748b" stroke-width="4"/><rect x="25" y="22" width="130" height="44" rx="8" fill="#1e293b"/><g><circle cx="235" cy="45" r="25" fill="#020617" stroke="#cbd5e1" stroke-width="5"/><circle cx="320" cy="45" r="25" fill="#020617" stroke="#cbd5e1" stroke-width="5"/><circle cx="405" cy="45" r="25" fill="#020617" stroke="#cbd5e1" stroke-width="5"/></g><path d="M510 18 L595 70" stroke="#a855f7" stroke-width="8"/><text x="85" y="50" text-anchor="middle" font-size="17" fill="#e2e8f0">RTX GPU</text><rect x="110" y="76" width="350" height="12" fill="#d97706"/></svg>`;
if(id==="psu24"||id==="cpu8")return `<svg viewBox="0 0 140 260" xmlns="http://www.w3.org/2000/svg"><rect x="30" y="10" width="80" height="230" rx="10" fill="#020617" stroke="${id==="psu24"?"#22c55e":"#fb923c"}" stroke-width="5"/><g fill="#334155"><rect x="45" y="30" width="16" height="20"/><rect x="78" y="30" width="16" height="20"/><rect x="45" y="68" width="16" height="20"/><rect x="78" y="68" width="16" height="20"/><rect x="45" y="106" width="16" height="20"/><rect x="78" y="106" width="16" height="20"/><rect x="45" y="144" width="16" height="20"/><rect x="78" y="144" width="16" height="20"/><rect x="45" y="182" width="16" height="20"/><rect x="78" y="182" width="16" height="20"/></g><path d="M70 240 C40 260 95 260 70 280" stroke="#111827" stroke-width="12" fill="none"/></svg>`;
return `<svg viewBox="0 0 190 110" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="18" width="170" height="74" rx="10" fill="#475569" stroke="#94a3b8" stroke-width="4"/><rect x="28" y="35" width="118" height="34" rx="5" fill="#cbd5e1"/><text x="88" y="58" text-anchor="middle" font-size="16" fill="#111827">SATA SSD</text><rect x="150" y="42" width="16" height="22" fill="#111827"/></svg>`;
}

function build(){
partsList.innerHTML=parts.map(p=>`<div class="part" draggable="true" data-part="${p.id}"><div class="thumb">${svg(p.id)}</div><div><b>${p.ar}</b><small>${p.en}</small></div></div>`).join("");
stepsBox.innerHTML=parts.map((p,i)=>`<li data-step="${p.id}">${i+1}. ${p.step}</li>`).join("");
document.querySelectorAll(".part").forEach(el=>{
el.addEventListener("dragstart",()=>{dragged=el;el.classList.add("dragging");highlight(el.dataset.part);startTimer();});
el.addEventListener("dragend",()=>{el.classList.remove("dragging");clearHighlight();});
});
}
zones.forEach(z=>{
z.addEventListener("dragover",e=>{
  if (z.classList.contains("locked")) return;
  e.preventDefault();
  z.classList.add("hover");
});
z.addEventListener("dragleave",()=>z.classList.remove("hover"));
z.addEventListener("drop",()=>{
  z.classList.remove("hover");

  // مهم: أي منطقة مقفلة لا تستقبل التركيب حتى لا تغطي منطقة CPU
  if (z.classList.contains("locked")) return;

  if(!dragged||z.classList.contains("correct"))return;
  let id=dragged.dataset.part;
  if(id!==z.dataset.accept){
    wrong(z,`${name(id)} ليس هنا. المكان الصحيح: ${z.dataset.label}`);
    return;
  }
  let m=missing(id);
  if(m.length){
    wrong(z,`ركّب أولاً: ${m.map(name).join("، ")}`);
    return;
  }
  install(id,dragged,z);
});
});
function install(id,el,z){let p=parts.find(x=>x.id===id);installed.add(id);score+=100;z.classList.add("correct");z.classList.remove("hover","available");el.classList.add("installed");el.draggable=false;let d=document.createElement("div");d.className=`placed ${p.cls||""}`;d.style.left=p.x+"px";d.style.top=p.y+"px";d.style.width=p.w+"px";d.style.height=p.h+"px";d.innerHTML=svg(id);stage.appendChild(d);document.querySelector(`[data-step="${id}"]`)?.classList.add("done");updateLocks();
if(id==="cpu") msg("تم تركيب CPU. الآن اسحب المعجون الحراري إلى الدائرة الزرقاء فوق المعالج.", "success");
else if(id==="thermal") msg("تم وضع المعجون. الآن اسحب المبرّد إلى الإطار الأخضر الكبير فوق المعالج.", "success");
else msg(`تم تركيب ${name(id)} بشكل صحيح.`, "success");
toastMsg("تركيب صحيح ✅");tone(620);updateProgress();if(installed.size===parts.length){modalText.textContent=`تم تركيب كل القطع. الدرجة: ${score}`;modal.classList.remove("hidden")}}
function wrong(z,t){z.classList.add("wrong");score=Math.max(0,score-20);msg(t,"error");toastMsg("تركيب خاطئ ❌");tone(180);setTimeout(()=>z.classList.remove("wrong"),420);updateProgress()}
function missing(id){return (req[id]||[]).filter(x=>!installed.has(x))}
function name(id){return parts.find(p=>p.id===id)?.ar||id}
function updateLocks(){zones.forEach(z=>{if(!z.classList.contains("correct"))z.classList.toggle("locked",missing(z.dataset.accept).length>0)})}
function updateProgress(){let pct=Math.round(installed.size/parts.length*100);progressText.textContent=pct+"%";progressFill.style.width=pct+"%";scorePoints.textContent=score}
function msg(t,c){message.textContent=t;message.className=`message ${c}`}
function highlight(id){zones.forEach(z=>{if(z.dataset.accept===id&&!z.classList.contains("correct"))z.classList.add("available")})}
function clearHighlight(){zones.forEach(z=>z.classList.remove("available"))}
function toastMsg(t){toast.textContent=t;toast.classList.add("show");setTimeout(()=>toast.classList.remove("show"),1500)}
function tone(f){try{let c=new (window.AudioContext||window.webkitAudioContext)(),o=c.createOscillator(),g=c.createGain();o.frequency.value=f;g.gain.value=.06;o.connect(g);g.connect(c.destination);o.start();setTimeout(()=>{o.stop();c.close()},100)}catch(e){}}
function startTimer(){if(timerId)return;timerId=setInterval(()=>{seconds++;timerBox.textContent=String(Math.floor(seconds/60)).padStart(2,"0")+":"+String(seconds%60).padStart(2,"0")},1000)}
function reset(){installed=new Set();score=0;seconds=0;clearInterval(timerId);timerId=null;timerBox.textContent="00:00";document.querySelectorAll(".placed").forEach(x=>x.remove());zones.forEach(z=>z.classList.remove("correct","wrong","hover","available"));modal.classList.add("hidden");build();updateLocks();updateProgress();msg("ابدأ بتركيب المعالج داخل Socket.","")}
document.getElementById("resetBtn").onclick=reset;
document.getElementById("hintBtn").onclick=()=>{let n=parts.find(p=>!installed.has(p.id));if(!n)return;highlight(n.id);msg(`التلميح: اسحب ${n.ar} إلى ${document.querySelector(`[data-accept="${n.id}"]`).dataset.label}.`,"");setTimeout(clearHighlight,2200)}
document.getElementById("zoomIn").onclick=()=>{zoom=Math.min(1.3,zoom+.1);stage.style.transform=`scale(${zoom})`;document.getElementById("zoomText").textContent=Math.round(zoom*100)+"%"}
document.getElementById("zoomOut").onclick=()=>{zoom=Math.max(.7,zoom-.1);stage.style.transform=`scale(${zoom})`;document.getElementById("zoomText").textContent=Math.round(zoom*100)+"%"}
document.getElementById("closeModal").onclick=()=>modal.classList.add("hidden");
build();updateLocks();updateProgress();
