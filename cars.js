(function(){
const RATE = 2.71; // 1$ = 2.71₾
const MAKES = {
  "Toyota":["Camry","Prius","RAV4","Land Cruiser 200","Corolla"],
  "Mercedes-Benz":["E 300","C 200","GLE 350","S 500","Sprinter"],
  "BMW":["X5","530","328","X3"],
  "Lexus":["RX 350","GX 460","ES 350","NX 200"],
  "Hyundai":["Elantra","Sonata","Tucson","Santa Fe"],
  "Ford":["Fusion","Escape","Mustang","Transit"],
  "Honda":["Fit","CR-V","Civic","Accord"],
  "Subaru":["Forester","Outback","Impreza"],
  "Kia":["Optima","Sportage","Soul"],
  "Tesla":["Model 3","Model Y"],
  "Volkswagen":["Jetta","Golf","Passat","Tiguan"],
  "Nissan":["Leaf","X-Trail","Juke"]
};
const CATS=[["all","ყველა"],["sedan","სედანი"],["suv","ჯიპი"],["hatch","ჰეჩბეკი"],["coupe","კუპე"],["van","მიკროავტობუსი"],["moto","მოტოციკლი"]];
const CAT_OF={"Land Cruiser 200":"suv","RAV4":"suv","GLE 350":"suv","X5":"suv","X3":"suv","RX 350":"suv","GX 460":"suv","NX 200":"suv","Tucson":"suv","Santa Fe":"suv","Escape":"suv","CR-V":"suv","Forester":"suv","Outback":"suv","Sportage":"suv","Model Y":"suv","Tiguan":"suv","X-Trail":"suv","Juke":"suv",
 "Prius":"hatch","Fit":"hatch","Golf":"hatch","Leaf":"hatch","Soul":"hatch","Impreza":"hatch","Mustang":"coupe","Sprinter":"van","Transit":"van"};
const FUELS=["ბენზინი","დიზელი","ჰიბრიდი","ელექტრო","გაზი/ბენზინი"];
const TRANS=["ავტომატიკა","მექანიკა","ტიპტრონიკი","ვარიატორი"];
const LOCS=["თბილისი","ბათუმი","ქუთაისი","რუსთავი","ზუგდიდი","გორი","თელავი"];
const COLORS=[["თეთრი","#eef0f2"],["შავი","#1f2226"],["ვერცხლისფერი","#b8bcc4"],["ნაცრისფერი","#6d737c"],["ლურჯი","#2a5bb8"],["წითელი","#c0302c"],["მწვანე","#2f6b4f"],["ყავისფერი","#6b4a33"]];

// სტაბილური შემთხვევითი რიცხვები სანიმუშო განცხადებებისთვის
let seed=7; const rnd=()=>{seed=(seed*16807)%2147483647;return (seed-1)/2147483646};
const pick=a=>a[Math.floor(rnd()*a.length)];

const makeList=Object.keys(MAKES);
let LIST=[];
for(let i=0;i<46;i++){
  const make=pick(makeList), model=pick(MAKES[make]);
  const year=2006+Math.floor(rnd()*20);
  const isEV=model.startsWith("Model")||model==="Leaf";
  const isHyb=model==="Prius"||(!isEV&&rnd()<.15);
  const fuel=isEV?"ელექტრო":isHyb?"ჰიბრიდი":pick(["ბენზინი","ბენზინი","დიზელი","გაზი/ბენზინი"]);
  const age=2026-year;
  let base={Toyota:22000,"Mercedes-Benz":34000,BMW:32000,Lexus:36000,Hyundai:16000,Ford:15000,Honda:14000,Subaru:15000,Kia:14000,Tesla:38000,Volkswagen:15000,Nissan:12000}[make];
  if(/Land Cruiser|S 500|GX|GLE|X5/.test(model)) base*=1.9;
  const usd=Math.max(2500,Math.round(base*Math.pow(.88,age)*(0.85+rnd()*.3)/100)*100);
  const color=pick(COLORS);
  LIST.push({
    id:100000+i*137, make, model, year, usd,
    cat:CAT_OF[model]||"sedan",
    fuel, engine:isEV?0:+(1.4+Math.floor(rnd()*30)/10).toFixed(1),
    trans:isEV?"ავტომატიკა":pick(TRANS), km:Math.round((age*14000+rnd()*40000)/1000)*1000,
    loc:pick(LOCS), customs:rnd()>.25, wheel:rnd()>.85?"მარჯვენა":"მარცხენა",
    color:color[0], hex:color[1], dealer:rnd()>.6, vip:i<8, srp:rnd()>.85,
    deal:rnd()>.12?"sale":(rnd()>.5?"rent":"order"),
    photos:4+Math.floor(rnd()*14), mins:Math.floor(rnd()*60*24*6), views:50+Math.floor(rnd()*3000),
    phone:"5"+String(Math.floor(rnd()*1e8)).padStart(8,"0")
  });
}
// მოტოციკლები
[["Honda","CBR 600RR",2019,8900],["BMW","R 1250 GS",2021,19500],["Yamaha","MT-07",2020,7200]].forEach((m,i)=>LIST.push({id:200000+i,make:m[0],model:m[1],year:m[2],usd:m[3],cat:"moto",fuel:"ბენზინი",engine:[0.6,1.25,0.7][i],trans:"მექანიკა",km:8000+i*6000,loc:"თბილისი",customs:true,wheel:"მარცხენა",color:"შავი",hex:"#1f2226",dealer:false,vip:false,srp:false,deal:"sale",photos:6,mins:300+i*900,views:400,phone:"599123456"}));
if(!MAKES.Yamaha) MAKES.Yamaha=["MT-07"];
MAKES.Honda.push("CBR 600RR"); MAKES.BMW.push("R 1250 GS");

// ---------- მდგომარეობა ----------
const st={cur:"GEL",deal:"sale",cat:"all",make:"",model:"",yf:"",yt:"",pf:"",pt:"",fuel:"",loc:"",trans:"",wheel:"",ef:"",et:"",kmTo:"",customs:false,dealer:false,favOnly:false,sort:"new",page:1};
let favs=new Set();
try{favs=new Set(JSON.parse(localStorage.getItem("ab-favs")||"[]"))}catch(e){}
const saveFavs=()=>{try{localStorage.setItem("ab-favs",JSON.stringify([...favs]))}catch(e){}};
try{const c=localStorage.getItem("ab-cur");if(c)st.cur=c}catch(e){}

const $=s=>document.querySelector(s);
const fmt=n=>n.toLocaleString("en-US").replace(/,/g," ");
const priceOf=c=>st.cur==="GEL"?Math.round(c.usd*RATE/10)*10:c.usd;
const sym=()=>st.cur==="GEL"?"₾":"$";
const ago=m=>m<60?m+" წთ წინ":m<1440?Math.floor(m/60)+" სთ წინ":Math.floor(m/1440)+" დღის წინ";

// ---------- მანქანის ილუსტრაცია (SVG) ----------
function carSVG(c,variant=0){
  const bgA=["#dfe6ee","#e8e2da","#dde8e2","#e5e0ec"][(c.id+variant)%4];
  const bgB="#c7d0db";
  const col=c.hex, dark="#22252b", glass="#9fb6cc";
  let body;
  if(c.cat==="moto"){
    body=`<circle cx="95" cy="140" r="30" fill="${dark}"/><circle cx="95" cy="140" r="14" fill="#8a8f98"/>
    <circle cx="225" cy="140" r="30" fill="${dark}"/><circle cx="225" cy="140" r="14" fill="#8a8f98"/>
    <path d="M95 140 L140 100 L200 100 L225 140" stroke="${dark}" stroke-width="7" fill="none"/>
    <path d="M125 98 Q150 72 190 80 L205 98 Z" fill="${col}"/><rect x="150" y="76" width="40" height="10" rx="5" fill="${dark}"/>
    <path d="M200 86 L215 62 L228 62" stroke="${dark}" stroke-width="5" fill="none"/>`;
  } else {
    const suv=c.cat==="suv", van=c.cat==="van", hatch=c.cat==="hatch", coupe=c.cat==="coupe";
    const roofY=van?40:suv?58:coupe?78:70, baseY=128;
    const roof = van?`M40 ${baseY-10} L44 ${roofY} L250 ${roofY} L282 92 L292 ${baseY-10} Z`
      : suv?`M34 ${baseY-6} L40 92 L78 90 L102 ${roofY} L222 ${roofY} L246 90 L288 96 L292 ${baseY-6} Z`
      : hatch?`M38 ${baseY-6} L42 98 L88 92 L118 ${roofY} L218 ${roofY} L250 94 L284 100 L290 ${baseY-6} Z`
      : coupe?`M30 ${baseY-6} L36 104 L100 96 L150 ${roofY} L210 ${roofY} L258 98 L292 104 L296 ${baseY-6} Z`
      : `M30 ${baseY-6} L34 102 L92 96 L124 ${roofY} L206 ${roofY} L242 96 L288 102 L294 ${baseY-6} Z`;
    const win = van?`<path d="M60 52 L240 52 L268 92 L60 92 Z" fill="${glass}"/>`
      : `<path d="M${suv?110:hatch?126:coupe?156:132} ${roofY+6} L${suv?214:hatch?212:206} ${roofY+6} L${suv?236:hatch?238:coupe?246:232} 94 L${suv?92:hatch?102:coupe?120:106} 96 Z" fill="${glass}"/>`;
    body=`<path d="${roof}" fill="${col}" stroke="rgba(0,0,0,.18)" stroke-width="1.5"/>
      ${win}<rect x="30" y="${baseY-8}" width="266" height="10" rx="4" fill="${dark}" opacity=".85"/>
      <rect x="276" y="104" width="14" height="7" rx="3" fill="#ffd56a"/><rect x="32" y="104" width="10" height="7" rx="3" fill="#d03a2f"/>
      <circle cx="90" cy="130" r="22" fill="${dark}"/><circle cx="90" cy="130" r="11" fill="#a9aeb6"/>
      <circle cx="240" cy="130" r="22" fill="${dark}"/><circle cx="240" cy="130" r="11" fill="#a9aeb6"/>`;
  }
  return `<svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs><linearGradient id="g${c.id}${variant}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${bgA}"/><stop offset="1" stop-color="${bgB}"/></linearGradient></defs>
    <rect width="320" height="200" fill="url(#g${c.id}${variant})"/>
    <ellipse cx="163" cy="156" rx="140" ry="10" fill="rgba(0,0,0,.14)"/>
    <g transform="${variant?`translate(${variant*6-8},0)`:''}">${body}</g></svg>`;
}
const catIcon={all:"M4 16h40v4H4z M8 10h32v4H8z",sedan:"M2 16 L6 10 L16 9 L22 4 L32 4 L38 9 L46 11 L46 16 Z",suv:"M2 17 L3 8 L12 7 L15 3 L35 3 L38 8 L46 9 L46 17 Z",hatch:"M2 16 L4 10 L14 8 L19 3 L33 3 L38 9 L46 11 L46 16 Z",coupe:"M2 16 L6 11 L18 9 L25 5 L33 5 L40 10 L46 12 L46 16 Z",van:"M2 17 L3 2 L38 2 L46 9 L46 17 Z",moto:"M8 18 a5 5 0 1 0 0.1 0 M40 18 a5 5 0 1 0 0.1 0 M8 18 L18 8 L32 8 L40 18 M20 7 L30 5"};

// ---------- ფილტრაცია ----------
function filtered(ignoreCat){
  const toUsd=v=>st.cur==="GEL"?v/RATE:v;
  return LIST.filter(c=>{
    if(c.deal!==st.deal) return false;
    if(!ignoreCat && st.cat!=="all" && c.cat!==st.cat) return false;
    if(st.make && c.make!==st.make) return false;
    if(st.model && c.model!==st.model) return false;
    if(st.yf && c.year<+st.yf) return false;
    if(st.yt && c.year>+st.yt) return false;
    if(st.pf && c.usd<toUsd(+st.pf)) return false;
    if(st.pt && c.usd>toUsd(+st.pt)) return false;
    if(st.fuel && c.fuel!==st.fuel) return false;
    if(st.loc && c.loc!==st.loc) return false;
    if(st.trans && c.trans!==st.trans) return false;
    if(st.wheel && c.wheel!==st.wheel) return false;
    if(st.ef && c.engine<+st.ef) return false;
    if(st.et && c.engine>+st.et) return false;
    if(st.kmTo && c.km>+st.kmTo) return false;
    if(st.customs && !c.customs) return false;
    if(st.dealer && !c.dealer) return false;
    if(st.favOnly && !favs.has(c.id)) return false;
    return true;
  });
}
function sorted(a){
  const s={new:(x,y)=>x.mins-y.mins,pAsc:(x,y)=>x.usd-y.usd,pDesc:(x,y)=>y.usd-x.usd,yDesc:(x,y)=>y.year-x.year,km:(x,y)=>x.km-y.km}[st.sort];
  return a.slice().sort((x,y)=>(y.vip-x.vip)||s(x,y));
}

// ---------- რენდერი ----------
function card(c){
  return `<article class="card ${c.vip?'vip':''}" data-id="${c.id}" tabindex="0">
    <div class="ph">${carSVG(c)}
      ${c.vip?'<span class="badge">VIP</span>':c.srp?'<span class="badge sr">S-VIP</span>':''}
      <button class="favb ${favs.has(c.id)?'on':''}" data-fav="${c.id}" aria-label="რჩეულებში დამატება"><svg viewBox="0 0 24 24"><path d="M12 21s-7-4.4-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6C19 16.6 12 21 12 21z"/></svg></button>
      <span class="photos">📷 ${c.photos}</span>
    </div>
    <div class="cb">
      <div class="ttl"><span>${c.make} ${c.model}</span><span class="yr">${c.year}</span></div>
      <div class="specs">
        <span>${c.engine?c.engine.toFixed(1)+' ':''}${c.fuel}</span><span>${fmt(c.km)} კმ</span>
        <span>${c.trans}</span><span>${c.wheel} საჭე</span>
      </div>
      <div class="loc"><span>${c.loc}${c.dealer?' · დილერი':''}</span><span>${ago(c.mins)}</span></div>
      <div class="price"><strong>${fmt(priceOf(c))} ${sym()}</strong>
        <span class="tag ${c.customs?'ok':'no'}">${c.customs?'განბაჟებული':'განუბაჟებელი'}</span></div>
    </div></article>`;
}
const PER=12;
function render(){
  document.querySelectorAll(".curSym").forEach(e=>e.textContent=sym());
  $("#curGel").classList.toggle("on",st.cur==="GEL"); $("#curUsd").classList.toggle("on",st.cur==="USD");
  const all=sorted(filtered());
  const pages=Math.max(1,Math.ceil(all.length/PER)); if(st.page>pages) st.page=pages;
  const slice=all.slice((st.page-1)*PER,st.page*PER);
  $("#grid").innerHTML=slice.length?slice.map(card).join(""):`<div class="empty" style="grid-column:1/-1"><strong>განცხადება ვერ მოიძებნა</strong>შეცვალეთ ფილტრები ან გაასუფთავეთ ისინი.</div>`;
  $("#pager").innerHTML=pages>1?Array.from({length:pages},(_,i)=>`<button class="${i+1===st.page?'on':''}" data-pg="${i+1}">${i+1}</button>`).join(""):"";
  $("#resultMeta").textContent=`ნაპოვნია ${all.length} განცხადება`;
  $("#countMeta").textContent=`სულ ${LIST.length} განცხადება`;
  $("#foundCnt").textContent=`(${all.length})`;
  $("#favCount").textContent=favs.size;
  $("#vipRow").innerHTML=LIST.filter(c=>c.vip).map(card).join("");
  const base=filtered(true);
  $("#cats").innerHTML=CATS.map(([k,l])=>`<button class="cat ${st.cat===k?'on':''}" data-cat="${k}"><svg viewBox="0 0 48 22"><path d="${catIcon[k]}" ${k==='moto'?'fill="none" stroke="currentColor" stroke-width="2.5"':''}/></svg>${l}<small>${k==='all'?base.length:base.filter(c=>c.cat===k).length}</small></button>`).join("");
}

function fillSelect(el,opts,first="ყველა"){el.innerHTML=`<option value="">${first}</option>`+opts.map(o=>Array.isArray(o)?`<option value="${o[0]}">${o[1]}</option>`:`<option>${o}</option>`).join("")}
function initSelects(){
  fillSelect($("#sMake"),Object.keys(MAKES).sort());
  const yrs=[];for(let y=2026;y>=1990;y--)yrs.push(y);
  fillSelect($("#sYearFrom"),yrs,"დან"); fillSelect($("#sYearTo"),yrs,"მდე");
  fillSelect($("#sFuel"),FUELS); fillSelect($("#sLoc"),LOCS);
  const eng=[];for(let e=0.6;e<=6.01;e+=0.2)eng.push([e.toFixed(1),e.toFixed(1)]);
  fillSelect($("#fEngFrom"),eng,"დან"); fillSelect($("#fEngTo"),eng,"მდე");
  $("#fTrans").innerHTML=["",...TRANS].map(t=>`<button class="chip ${st.trans===t?'on':''}" data-trans="${t}">${t||'ყველა'}</button>`).join("");
  $("#fWheel").innerHTML=["","მარცხენა","მარჯვენა"].map(t=>`<button class="chip ${st.wheel===t?'on':''}" data-wheel="${t}">${t||'ყველა'}</button>`).join("");
}
function updModels(){fillSelect($("#sModel"),st.make?MAKES[st.make]:[])}

// ---------- დეტალური ფანჯარა ----------
function openDetail(id){
  const c=LIST.find(x=>x.id===id); if(!c) return; c.views++;
  const alt=st.cur==="GEL"?`≈ ${fmt(c.usd)} $`:`≈ ${fmt(Math.round(c.usd*RATE))} ₾`;
  showModal(`<div class="mh"><h3>${c.make} ${c.model}, ${c.year}</h3><button class="x" data-close aria-label="დახურვა">×</button></div>
  <div class="dgrid">
    <div style="min-width:0"><div class="ph">${carSVG(c)}</div>
      <div class="thumbs">${[1,2,3,0].map(v=>`<div>${carSVG(c,v)}</div>`).join("")}</div>
      <p style="color:var(--muted);font-size:13px;margin-top:14px">ID ${c.id} · ${ago(c.mins)} · ${fmt(c.views)} ნახვა</p></div>
    <div style="min-width:0">
      <div class="bigp">${fmt(priceOf(c))} ${sym()}</div><div style="color:var(--muted);margin-bottom:10px">${alt}</div>
      <table class="dt"><tbody>
        <tr><td>მწარმოებელი</td><td>${c.make}</td></tr><tr><td>მოდელი</td><td>${c.model}</td></tr>
        <tr><td>წელი</td><td>${c.year}</td></tr>
        <tr><td>ძრავი</td><td>${c.engine?c.engine.toFixed(1)+' ':''}${c.fuel}</td></tr>
        <tr><td>გარბენი</td><td>${fmt(c.km)} კმ</td></tr><tr><td>კოლოფი</td><td>${c.trans}</td></tr>
        <tr><td>საჭე</td><td>${c.wheel}</td></tr><tr><td>ფერი</td><td>${c.color}</td></tr>
        <tr><td>განბაჟება</td><td>${c.customs?'განბაჟებული':'განუბაჟებელი'}</td></tr>
        <tr><td>მდებარეობა</td><td>${c.loc}</td></tr>
      </tbody></table>
      <div class="seller"><span style="color:var(--muted);font-size:12px">${c.dealer?'დილერი':'კერძო პირი'} · ტელეფონი</span>
        <span class="phone" id="phoneTxt">${c.phone.replace(/(\d{3})(\d{2})(\d{2})(\d{2})/,"$1 $2 $3 $4")}</span>
        <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn pri" id="copyPhone">ნომრის კოპირება</button>
        <button class="btn" data-fav="${c.id}">${favs.has(c.id)?'♥ რჩეულებშია':'♡ რჩეულებში'}</button></div></div>
    </div></div>`);
  $("#copyPhone").onclick=()=>{navigator.clipboard?.writeText(c.phone).then(()=>toast("ნომერი დაკოპირდა"),()=>{const r=document.createRange();r.selectNodeContents($("#phoneTxt"));getSelection().removeAllRanges();getSelection().addRange(r);toast("ნომერი მონიშნულია")})};
}

// ---------- განცხადების დამატება ----------
function openAdd(){
  const mk=Object.keys(MAKES).sort();
  showModal(`<div class="mh"><h3>განცხადების დამატება</h3><button class="x" data-close aria-label="დახურვა">×</button></div>
  <form class="form" id="addForm">
    <div class="fld"><label for="aMake">მწარმოებელი</label><select id="aMake" required>${mk.map(m=>`<option>${m}</option>`).join("")}</select></div>
    <div class="fld"><label for="aModel">მოდელი</label><select id="aModel"></select></div>
    <div class="fld"><label for="aYear">წელი</label><input id="aYear" type="number" min="1980" max="2027" value="2018" required></div>
    <div class="fld"><label for="aPrice">ფასი ($)</label><input id="aPrice" type="number" min="100" value="12500" required></div>
    <div class="fld"><label for="aFuel">საწვავი</label><select id="aFuel">${FUELS.map(f=>`<option>${f}</option>`).join("")}</select></div>
    <div class="fld"><label for="aEngine">ძრავი (ლ)</label><input id="aEngine" type="number" step="0.1" min="0" value="2.0"></div>
    <div class="fld"><label for="aKm">გარბენი (კმ)</label><input id="aKm" type="number" min="0" value="120000"></div>
    <div class="fld"><label for="aTrans">კოლოფი</label><select id="aTrans">${TRANS.map(f=>`<option>${f}</option>`).join("")}</select></div>
    <div class="fld"><label for="aLoc">მდებარეობა</label><select id="aLoc">${LOCS.map(f=>`<option>${f}</option>`).join("")}</select></div>
    <div class="fld"><label for="aColor">ფერი</label><select id="aColor">${COLORS.map((c,i)=>`<option value="${i}">${c[0]}</option>`).join("")}</select></div>
    <div class="fld"><label for="aPhone">ტელეფონი</label><input id="aPhone" inputmode="tel" placeholder="5XX XX XX XX" pattern="5\\d{8}|5\\d{2} ?\\d{2} ?\\d{2} ?\\d{2}" required></div>
    <label class="chk" style="align-self:end"><input type="checkbox" id="aCustoms" checked> განბაჟებული</label>
    <div class="full" style="display:flex;gap:8px;justify-content:flex-end"><button type="button" class="btn" data-close>გაუქმება</button><button class="btn pri" type="submit">გამოქვეყნება</button></div>
  </form>`);
  const upd=()=>{$("#aModel").innerHTML=MAKES[$("#aMake").value].map(m=>`<option>${m}</option>`).join("")};
  $("#aMake").onchange=upd; upd();
  $("#addForm").onsubmit=e=>{e.preventDefault();
    const col=COLORS[+$("#aColor").value], model=$("#aModel").value, fuel=$("#aFuel").value;
    LIST.unshift({id:300000+LIST.length,make:$("#aMake").value,model,year:+$("#aYear").value,usd:+$("#aPrice").value,cat:CAT_OF[model]||"sedan",
      fuel,engine:fuel==="ელექტრო"?0:+$("#aEngine").value,trans:$("#aTrans").value,km:+$("#aKm").value,loc:$("#aLoc").value,customs:$("#aCustoms").checked,
      wheel:"მარცხენა",color:col[0],hex:col[1],dealer:false,vip:false,srp:false,deal:"sale",photos:1,mins:0,views:0,phone:$("#aPhone").value.replace(/\s/g,"")});
    closeModal(); Object.assign(st,{deal:"sale",cat:"all",sort:"new",page:1}); syncTabs(); render(); toast("განცხადება გამოქვეყნდა");
  };
}

function showModal(html){$("#ovWrap").innerHTML=`<div class="ov" id="ov"><div class="modal" role="dialog" aria-modal="true">${html}</div></div>`;document.body.style.overflow="hidden";$(".modal .x")?.focus()}
function closeModal(){$("#ovWrap").innerHTML="";document.body.style.overflow=""}
let tt;function toast(m){document.querySelector(".toast")?.remove();const t=document.createElement("div");t.className="toast";t.textContent=m;document.body.appendChild(t);clearTimeout(tt);tt=setTimeout(()=>t.remove(),2200)}
function syncTabs(){document.querySelectorAll("#dealTabs button").forEach(b=>b.classList.toggle("on",b.dataset.v===st.deal))}

// ---------- მოვლენები ----------
document.addEventListener("click",e=>{
  const t=e.target;
  const fv=t.closest("[data-fav]");
  if(fv){e.stopPropagation();const id=+fv.dataset.fav;favs.has(id)?favs.delete(id):favs.add(id);saveFavs();toast(favs.has(id)?"დაემატა რჩეულებში":"წაიშალა რჩეულებიდან");
    if(fv.classList.contains("btn")) fv.textContent=favs.has(id)?'♥ რჩეულებშია':'♡ რჩეულებში'; render(); return;}
  if(t.closest("[data-close]")||t.id==="ov"){closeModal();return}
  const cd=t.closest(".card"); if(cd){openDetail(+cd.dataset.id);return}
  const ct=t.closest("[data-cat]"); if(ct){st.cat=ct.dataset.cat;st.page=1;render();return}
  const pg=t.closest("[data-pg]"); if(pg){st.page=+pg.dataset.pg;render();$("#countMeta").scrollIntoView({behavior:"smooth",block:"start"});return}
  if(t.dataset.trans!==undefined){st.trans=t.dataset.trans;st.page=1;initChips();render();return}
  if(t.dataset.wheel!==undefined){st.wheel=t.dataset.wheel;st.page=1;initChips();render();return}
  const dt=t.closest("#dealTabs button"); if(dt){st.deal=dt.dataset.v;st.page=1;syncTabs();render();return}
});
document.addEventListener("keydown",e=>{
  if(e.key==="Escape") closeModal();
  if(e.key==="Enter"&&e.target.classList?.contains("card")) openDetail(+e.target.dataset.id);
});
function initChips(){
  document.querySelectorAll("[data-trans]").forEach(b=>b.classList.toggle("on",b.dataset.trans===st.trans));
  document.querySelectorAll("[data-wheel]").forEach(b=>b.classList.toggle("on",b.dataset.wheel===st.wheel));
}
const bind=(sel,key,ev="change",fn)=>$(sel).addEventListener(ev,e=>{st[key]=e.target.type==="checkbox"?e.target.checked:e.target.value;st.page=1;fn&&fn();render()});
bind("#sMake","make","change",()=>{st.model="";updModels()});
bind("#sModel","model"); bind("#sYearFrom","yf"); bind("#sYearTo","yt");
bind("#sPriceFrom","pf","input"); bind("#sPriceTo","pt","input");
bind("#sFuel","fuel"); bind("#sLoc","loc"); bind("#sort","sort");
bind("#fEngFrom","ef"); bind("#fEngTo","et"); bind("#fKmTo","kmTo","input");
bind("#fCustoms","customs"); bind("#fDealer","dealer"); bind("#fFavOnly","favOnly");
$("#searchBtn").onclick=()=>$("#countMeta").scrollIntoView({behavior:"smooth",block:"start"});
$("#addBtn").onclick=openAdd;
$("#mobFilter").onclick=()=>$("#filters").classList.toggle("open");
$("#favBtn").onclick=()=>{st.favOnly=!st.favOnly;$("#fFavOnly").checked=st.favOnly;st.page=1;render();$("#countMeta").scrollIntoView({behavior:"smooth"})};
const setCur=c=>{st.cur=c;try{localStorage.setItem("ab-cur",c)}catch(e){};st.pf=st.pt="";$("#sPriceFrom").value=$("#sPriceTo").value="";render()};
$("#curGel").onclick=()=>setCur("GEL"); $("#curUsd").onclick=()=>setCur("USD");
$("#resetBtn").onclick=()=>{Object.assign(st,{cat:"all",make:"",model:"",yf:"",yt:"",pf:"",pt:"",fuel:"",loc:"",trans:"",wheel:"",ef:"",et:"",kmTo:"",customs:false,dealer:false,favOnly:false,page:1});
  document.querySelectorAll("select:not(#sort)").forEach(s=>s.value="");document.querySelectorAll(".sgrid input,#fKmTo").forEach(i=>i.value="");
  document.querySelectorAll("aside input[type=checkbox]").forEach(i=>i.checked=false);updModels();initChips();render()};

initSelects(); updModels(); render();
})();
