const STORAGE="study-tracker-v1";
const seed=[
{name:"Webhooks",items:["Webhook fundamentals and how webhooks work","Receiving webhook payloads in FastAPI","Pydantic payload validation","model_dump() and payload inspection","Testing webhook endpoints (3 test cases)","Webhook signature verification","Handling duplicate events / idempotency","Webhook error handling and retries"]},
{name:"File Uploads",items:["FastAPI UploadFile and File","Single file upload","Multiple file uploads","File validation (type and size)","Saving files safely","Handling upload errors"]},
{name:"External API Integrations",items:["HTTP requests using httpx","GET and POST requests to external APIs","API authentication and headers","Timeouts and error handling","Integrating an external service into FastAPI","Testing API integrations"]},
{name:"Portfolio Project 1 — AI Document Processing",items:["Plan project requirements and API endpoints","Build FastAPI backend","Implement file uploads","Integrate AI processing","Store results in PostgreSQL","Add validation and error handling","Deploy and document project"]},
{name:"Portfolio Project 2 — AI Customer Support Backend",items:["Plan architecture and database schema","Build support request endpoints","Integrate Groq AI","Store conversations in PostgreSQL","Add webhook integration","Add external API integration","Deploy and document project"]},
{name:"Freelancing Preparation",items:["Create portfolio/GitHub showcase","Write project READMEs","Create Upwork profile","Create Fiverr profile","Define service packages","Prepare project demos","Start sending proposals"]}
];
let state=load();
function load(){try{return JSON.parse(localStorage.getItem(STORAGE))||{stages:seed.map(s=>({...s,items:s.items.map(t=>({text:t,done:false,custom:false}))})),daily:{},next:""}}catch{return {stages:seed.map(s=>({...s,items:s.items.map(t=>({text:t,done:false,custom:false}))})),daily:{},next:""}}}
function save(){localStorage.setItem(STORAGE,JSON.stringify(state));render()}
const $=id=>document.getElementById(id);
function dateKey(){return $("studyDate").value||new Date().toISOString().slice(0,10)}
function render(){
 const all=state.stages.flatMap(s=>s.items),done=all.filter(t=>t.done).length,p=all.length?Math.round(done/all.length*100):0;
 $("percent").textContent=p+"%";$("count").textContent=`${done} / ${all.length} tasks`;$("remaining").textContent=all.length-done;$("completed").textContent=done;$("stages").textContent=state.stages.length;$("progressBar").style.width=p+"%";
 $("roadmap").innerHTML="";
 state.stages.forEach((s,si)=>{const d=document.createElement("details");d.className="stage";d.open=true;const n=s.items.filter(x=>x.done).length;const sum=document.createElement("summary");sum.innerHTML=`<span>${esc(s.name)}</span><span class="stage-count">${n}/${s.items.length} complete　⌄</span>`;d.append(sum);const body=document.createElement("div");body.className="stage-body";
 s.items.forEach((t,ti)=>{const row=document.createElement("label");row.className="task"+(t.done?" done":"");const cb=document.createElement("input");cb.type="checkbox";cb.checked=t.done;cb.addEventListener("change",()=>{t.done=cb.checked;save()});const txt=document.createElement("span");txt.textContent=t.text;row.append(cb,txt);if(t.custom){const del=document.createElement("button");del.className="delete-task";del.textContent="×";del.title="Delete task";del.addEventListener("click",()=>{s.items.splice(ti,1);save()});row.append(del)}body.append(row)});d.append(body);$("roadmap").append(d)});
 renderDaily();
}
function renderDaily(){const d=state.daily[dateKey()]||{sessions:[false,false,false,false],notes:""};$("sessions").innerHTML="";["Session 1 · 25 min","Session 2 · 25 min","Session 3 · 30 min","Session 4 · 30 min"].forEach((label,i)=>{const l=document.createElement("label");l.className="session";const c=document.createElement("input");c.type="checkbox";c.checked=!!d.sessions[i];c.addEventListener("change",()=>{const x=getDay();x.sessions[i]=c.checked;saveDay(x)});l.append(c,document.createTextNode(label));$("sessions").append(l)});$("sessionCount").textContent=`${d.sessions.filter(Boolean).length} of 4 complete`;$("dailyNotes").value=d.notes||""}
function getDay(){return state.daily[dateKey()]||{sessions:[false,false,false,false],notes:""}}
function saveDay(d){state.daily[dateKey()]=d;localStorage.setItem(STORAGE,JSON.stringify(state));renderDaily()}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function openAdd(){const sel=$("taskStage");sel.innerHTML=state.stages.map((s,i)=>`<option value="${i}">${esc(s.name)}</option>`).join("");$("taskName").value="";$("taskDialog").showModal()}
$("addTask").onclick=$("addTaskTop").onclick=openAdd;
$("taskForm").addEventListener("submit",e=>{if(e.submitter?.id!=="saveTask")return;e.preventDefault();const name=$("taskName").value.trim();if(!name)return;state.stages[Number($("taskStage").value)].items.push({text:name,done:false,custom:true});$("taskDialog").close();save()});
$("studyDate").value=new Date().toISOString().slice(0,10);$("studyDate").addEventListener("change",renderDaily);
$("dailyNotes").addEventListener("input",()=>{const d=getDay();d.notes=$("dailyNotes").value;state.daily[dateKey()]=d;localStorage.setItem(STORAGE,JSON.stringify(state))});
$("saveNotes").onclick=()=>{const d=getDay();d.notes=$("dailyNotes").value;saveDay(d);alert("Daily notes saved.")};
$("resetSessions").onclick=()=>{const d=getDay();d.sessions=[false,false,false,false];saveDay(d)};
$("nextStep").value=state.next||"";$("saveNext").onclick=()=>{state.next=$("nextStep").value;localStorage.setItem(STORAGE,JSON.stringify(state));alert("Next step saved.")};
$("exportData").onclick=()=>{const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="study-tracker-backup.json";a.click();URL.revokeObjectURL(a.href)};
$("importData").onchange=async e=>{const f=e.target.files[0];if(!f)return;try{const v=JSON.parse(await f.text());if(!Array.isArray(v.stages))throw Error();state=v;localStorage.setItem(STORAGE,JSON.stringify(state));$("nextStep").value=state.next||"";render();alert("Backup imported.")}catch{alert("That backup file is not valid.")}e.target.value=""};
if("serviceWorker" in navigator && location.protocol.startsWith("http"))navigator.serviceWorker.register("./sw.js").catch(()=>{});
render();
