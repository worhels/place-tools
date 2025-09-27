// ==UserScript==
// @name         KB Toolkit Pro (ingest/search/rules)
// @version      1.0.0
// @match        *://*/*
// @grant        none
// ==/UserScript==

(()=>{

function el(tag,attrs={},html){const d=document.createElement(tag);Object.assign(d,attrs);if(html!=null)d.innerHTML=html;return d}
function css(n,s){for(const k in s)n.style[k]=s[k];return n}
function panel(){
  const d=el('div'); css(d,{position:'fixed',right:'12px',top:'56px',zIndex:999999,background:'#0f1113',color:'#ddd',padding:'10px',font:'12px/1.4 system-ui',width:'360px',border:'1px solid #222',borderRadius:'8px',boxShadow:'0 2px 12px rgba(0,0,0,.5)'})
  d.innerHTML=`
  <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
    <b style="font-size:13px">KB Toolkit Pro</b>
    <span style="flex:1"></span>
    <button id="kb_close" style="background:#222;border:0;color:#ddd;padding:4px 8px;border-radius:4px">x</button>
  </div>
  <div style="display:flex;gap:6px;margin-bottom:8px">
    <input id="kb_api"  placeholder="http://127.0.0.1:8080" value="http://127.0.0.1:8080" style="flex:1;background:#0b0c0d;color:#ddd;border:1px solid #222;padding:6px;border-radius:6px">
    <input id="kb_key"  placeholder="dev key" style="width:140px;background:#0b0c0d;color:#ddd;border:1px solid #222;padding:6px;border-radius:6px">
  </div>

  <div style="display:flex;gap:6px;margin-bottom:8px">
    <button id="tab_ing"  style="flex:1;background:#1f2937;border:0;color:#fff;padding:6px;border-radius:6px">Ingest</button>
    <button id="tab_srch" style="flex:1;background:#111827;border:0;color:#ddd;padding:6px;border-radius:6px">Search</button>
    <button id="tab_rule" style="flex:1;background:#111827;border:0;color:#ddd;padding:6px;border-radius:6px">Rules</button>
    <button id="kb_ping"  style="background:#333;border:0;color:#ddd;padding:6px;border-radius:6px">Health</button>
  </div>

  <div id="view_ing">
    <input id="kb_file" type="file" style="width:100%;margin-bottom:8px">
    <div style="display:flex;gap:6px">
      <button id="kb_send"  style="flex:1;background:#2563eb;border:0;color:#fff;padding:8px;border-radius:6px">Ingest file</button>
      <button id="kb_sample"style="background:#374151;border:0;color:#ddd;padding:8px;border-radius:6px">Sample JSON</button>
    </div>
  </div>

  <div id="view_srch" style="display:none">
    <input id="q_text" placeholder="query" style="width:100%;margin-bottom:6px;background:#0b0c0d;color:#ddd;border:1px solid #222;padding:6px;border-radius:6px">
    <div style="display:flex;gap:6px;margin-bottom:6px">
      <button id="btn_text"  style="flex:1;background:#374151;border:0;color:#fff;padding:8px;border-radius:6px">Text</button>
      <button id="btn_vec"   style="flex:1;background:#374151;border:0;color:#fff;padding:8px;border-radius:6px">Vector</button>
      <button id="btn_hyb"   style="flex:1;background:#2563eb;border:0;color:#fff;padding:8px;border-radius:6px">Hybrid</button>
    </div>
    <div id="kb_res" style="max-height:280px;overflow:auto;border:1px solid #222;border-radius:6px;padding:6px;background:#0b0c0d"></div>
  </div>

  <div id="view_rule" style="display:none">
    <textarea id="rule_json" placeholder='{"id":"rule-1","q":"keyword","tags":["kb"],"notifyWebhook":""}' style="width:100%;height:120px;background:#0b0c0d;color:#ddd;border:1px solid #222;padding:6px;border-radius:6px"></textarea>
    <div style="display:flex;gap:6px;margin-top:6px">
      <button id="rule_list" style="flex:1;background:#374151;border:0;color:#fff;padding:8px;border-radius:6px">List</button>
      <button id="rule_add"  style="flex:1;background:#2563eb;border:0;color:#fff;padding:8px;border-radius:6px">Upsert</button>
      <button id="rule_del"  style="flex:1;background:#7f1d1d;border:0;color:#fff;padding:8px;border-radius:6px">Delete</button>
    </div>
    <div id="rule_out" style="margin-top:6px;max-height:160px;overflow:auto;border:1px solid #222;border-radius:6px;padding:6px;background:#0b0c0d"></div>
  </div>

  <div id="kb_st" style="margin-top:8px;color:#9ca3af">ready</div>
  `
  document.body.appendChild(d); return d
}

const ui=panel(); const st=ui.querySelector('#kb_st')
const api = ()=> ui.querySelector('#kb_api').value.trim() || "http://127.0.0.1:8080"
const key = ()=> ui.querySelector('#kb_key').value.trim()

function setTab(name){
  const t1=ui.querySelector('#tab_ing'),t2=ui.querySelector('#tab_srch'),t3=ui.querySelector('#tab_rule')
  const v1=ui.querySelector('#view_ing'),v2=ui.querySelector('#view_srch'),v3=ui.querySelector('#view_rule')
  t1.style.background = name==='ing' ? '#1f2937' : '#111827'
  t2.style.background = name==='srch'? '#1f2937' : '#111827'
  t3.style.background = name==='rule'? '#1f2937' : '#111827'
  v1.style.display = name==='ing' ? '' : 'none'
  v2.style.display = name==='srch'? '' : 'none'
  v3.style.display = name==='rule'? '' : 'none'
}

async function req(method, path, body){
  const r = await fetch(api()+path,{
    method, headers: {"Content-Type":"application/json","x-dev-key": key()}, body: body?JSON.stringify(body):undefined
  })
  if(!r.ok){ throw new Error(await r.text()) }
  return r.json()
}

ui.querySelector('#kb_close').onclick=()=>ui.remove()

ui.querySelector('#kb_ping').onclick=async()=>{
  try{ const r=await fetch(api()+"/health").then(r=>r.json()); st.textContent="health: "+JSON.stringify(r) }catch(e){ st.textContent="health err: "+e.message }
}

ui.querySelector('#tab_ing').onclick = ()=>setTab('ing')
ui.querySelector('#tab_srch').onclick= ()=>setTab('srch')
ui.querySelector('#tab_rule').onclick= ()=>setTab('rule')

ui.querySelector('#kb_sample').onclick=()=>{
  const blob=new Blob([JSON.stringify([{id:"1",title:"Doc A",text:"пример текста про поиск ботов",tags:["kb"],ts:Math.floor(Date.now()/1000)}],null,2)],{type:"application/json"})
  const a=el('a',{href:URL.createObjectURL(blob),download:'sample.json'}); document.body.appendChild(a); a.click(); a.remove()
}

ui.querySelector('#kb_send').onclick=async()=>{
  const f=ui.querySelector('#kb_file').files[0]; if(!f){ st.textContent="choose file"; return }
  if(!key()){ st.textContent="set dev key"; return }
  st.textContent="reading..."
  let docs=[]
  try{
    const txt=await f.text()
    if(f.name.endsWith(".ndjson")) docs = txt.trim().split(/\r?\n/).map(s=>JSON.parse(s))
    else if(f.name.endsWith(".json")) docs = JSON.parse(txt)
    else docs = [{ id:crypto.randomUUID(), text: txt.slice(0,2000) }]
  }catch(e){ st.textContent="parse err"; return }
  st.textContent="sending "+docs.length
  try{
    const j = await req("POST","/ingest",docs)
    st.textContent = "ingested: "+JSON.stringify(j)
  }catch(e){ st.textContent="err: "+e.message }
}

async function runSearch(endpoint){
  if(!key()){ st.textContent="set dev key"; return }
  const q=ui.querySelector('#q_text').value.trim()
  if(!q){ st.textContent="empty query"; return }
  st.textContent="searching..."
  try{
    const j = await req("POST",endpoint,{ q, limit: 10 })
    const box = ui.querySelector('#kb_res'); box.innerHTML=""
    const hits = j.hits||[]
    if(!hits.length){ box.textContent="ничего нет"; st.textContent="ok"; return }
    for(const h of hits){
      const div=el('div'); css(div,{border:'1px solid #222',borderRadius:'6px',padding:'6px',margin:'4px 0',background:'#0b0c0d'})
      div.innerHTML = `<div style="color:#fff">${(h.title||h.id||"")}</div><div style="color:#9ca3af;font-size:11px">${(h.snippet||"")}</div>`
      box.appendChild(div)
    }
    st.textContent="ok"
  }catch(e){ st.textContent="err: "+e.message }
}

ui.querySelector('#btn_text').onclick = ()=>runSearch("/search_text")
ui.querySelector('#btn_vec').onclick  = ()=>runSearch("/search_vec")
ui.querySelector('#btn_hyb').onclick  = ()=>runSearch("/search_hybrid")

ui.querySelector('#rule_list').onclick=async()=>{
  if(!key()){ st.textContent="set dev key"; return }
  try{ const j=await req("GET","/rules"); ui.querySelector('#rule_out').textContent=JSON.stringify(j,null,2); st.textContent="ok" }catch(e){ st.textContent="err: "+e.message }
}

ui.querySelector('#rule_add').onclick=async()=>{
  if(!key()){ st.textContent="set dev key"; return }
  let obj; try{ obj = JSON.parse(ui.querySelector('#rule_json').value||"{}") }catch(e){ st.textContent="bad json"; return }
  try{
    const j = await req("POST","/rules",obj)
    ui.querySelector('#rule_out').textContent=JSON.stringify(j,null,2)
    st.textContent="ok"
  }catch(e){ st.textContent="err: "+e.message }
}

ui.querySelector('#rule_del').onclick=async()=>{
  if(!key()){ st.textContent="set dev key"; return }
  let obj; try{ obj = JSON.parse(ui.querySelector('#rule_json').value||"{}") }catch(e){ st.textContent="bad json"; return }
  if(!obj.id){ st.textContent="need id"; return }
  try{
    const j = await fetch(api()+"/rules/"+encodeURIComponent(obj.id),{ method:"DELETE", headers:{ "x-dev-key": key() } })
    if(!j.ok) throw new Error(await j.text())
    ui.querySelector('#rule_out').textContent="deleted: "+obj.id
    st.textContent="ok"
  }catch(e){ st.textContent="err: "+e.message }
}

})();