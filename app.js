;(function(){
  var sections=[].slice.call(document.querySelectorAll("[data-section]"))
  var navList=document.getElementById("nav-list")
  var navToggle=document.getElementById("nav-toggle")
  function load(k,def){try{var v=localStorage.getItem("lab7_"+k);return v?JSON.parse(v):def}catch(e){return def}}
  function save(k,val){localStorage.setItem("lab7_"+k,JSON.stringify(val))}
  function uid(){return Math.random().toString(36).slice(2)}
  function showSection(id){sections.forEach(function(s){s.hidden=s.id!==id});history.replaceState(null,"","#"+id)}
  navToggle.addEventListener("click",function(){navList.classList.toggle("show")})
  document.querySelectorAll("[data-link]").forEach(function(a){
    a.addEventListener("click",function(){
      var id=a.getAttribute("href").replace("#","")
      showSection(id)
      navList.classList.remove("show")
      if(id==="respondents")renderRespondents()
      if(id==="criteria")renderMetrics();renderCriteria()
      if(id==="analysis")renderAnalysisSelectors()
      if(id==="physio")renderPhysioSelectors();renderPhysioList()
    })
  })
  function setRole(r){save("role",r);refreshRoleUI()}
  function getRole(){return load("role",null)}
  function setExpert(e){save("expert",e)}
  function getExpert(){return load("expert",null)}
  function setRespondent(r){save("respondent",r)}
  function getRespondent(){return load("respondent",null)}
  function getRespondents(){return load("respondents",[])}
  function setRespondents(arr){save("respondents",arr)}
  function addRespondent(obj){var arr=getRespondents();arr.push(obj);setRespondents(arr)}
  function refreshRoleUI(){
    var role=getRole()
    ;[].slice.call(document.querySelectorAll(".role-expert")).forEach(function(el){el.style.display=role==="expert"?"":"none"})
    ;[].slice.call(document.querySelectorAll(".role-respondent")).forEach(function(el){el.style.display=role==="respondent"?"":"none"})
  }
  document.getElementById("expert-login").addEventListener("submit",function(e){
    e.preventDefault()
    var name=document.getElementById("exp-name").value.trim()
    var email=document.getElementById("exp-email").value.trim()
    setExpert({id:uid(),name:name,email:email})
    setRole("expert")
    showSection("respondents")
  })
  document.getElementById("respondent-login").addEventListener("submit",function(e){
    e.preventDefault()
    var name=document.getElementById("resp-name").value.trim()
    var sex=document.getElementById("resp-sex").value
    var age=parseInt(document.getElementById("resp-age").value,10)
    var r={id:uid(),name:name,sex:sex,age:age}
    setRespondent(r)
    var list=getRespondents()
    if(!list.find(function(x){return x.name===r.name && x.age===r.age && x.sex===r.sex})){addRespondent(r)}
    setRole("respondent")
    showSection("analysis")
  })
  document.getElementById("add-respondent").addEventListener("submit",function(e){
    e.preventDefault()
    var name=document.getElementById("add-name").value.trim()
    var sex=document.getElementById("add-sex").value
    var age=parseInt(document.getElementById("add-age").value,10)
    var r={id:uid(),name:name,sex:sex,age:age}
    addRespondent(r)
    e.target.reset()
    renderRespondents()
    renderAnalysisSelectors()
    renderPhysioSelectors()
  })
  function renderRespondents(){
    var wrap=document.getElementById("resp-list")
    var arr=getRespondents()
    wrap.innerHTML=arr.length?arr.map(function(r){return '<div>'+r.name+' • '+(r.sex==="M"?"М":"Ж")+' • '+r.age+' лет</div>'}).join(""):'<div class="muted">Список пуст</div>'
  }
  function readLabResults(){
    function read(key){try{var v=localStorage.getItem(key);return v?JSON.parse(v):[]}catch(e){return []}}
    var l3=read("lab3_results")
    var l4=read("lab4_results")
    var l5=read("lab5_results")
    var l6=read("lab6_results")
    return {l3:l3,l4:l4,l5:l5,l6:l6}
  }
  function discoverMetrics(){
    var all=readLabResults()
    var m=[]
    if(all.l3&&all.l3.length){
      m.push({key:"l3_light_mean",label:"ЛР3: Простая реакция на свет (среднее, мс)",src:"l3",test:"light",field:"mean",dir:"lower"})
      m.push({key:"l3_sound_mean",label:"ЛР3: Простая реакция на звук (среднее, мс)",src:"l3",test:"sound",field:"mean",dir:"lower"})
    }
    if(all.l4&&all.l4.length){
      m.push({key:"l4_simple_mean",label:"ЛР4: Простая реакция на движ. объект (среднее, мс)",src:"l4",mode:"simple",field:"mean",dir:"lower"})
      m.push({key:"l4_complex_mean",label:"ЛР4: Сложная реакция на движ. объект (среднее, мс)",src:"l4",mode:"complex",field:"mean",dir:"lower"})
      m.push({key:"l4_simple_hits",label:"ЛР4: Простая реакция попадания (шт)",src:"l4",mode:"simple",field:"hits",dir:"higher"})
    }
    if(all.l5&&all.l5.length){
      m.push({key:"l5_analog_dev",label:"ЛР5: Аналоговое слежение средн. отклонение (px)",src:"l5",mode:"analog",field:"mean",dir:"lower"})
      m.push({key:"l5_pursuit_dev",label:"ЛР5: Преследование средн. отклонение (px)",src:"l5",mode:"pursuit",field:"mean",dir:"lower"})
      m.push({key:"l5_analog_lock",label:"ЛР5: Аналоговое слежение в захвате (с)",src:"l5",mode:"analog",field:"lockSec",dir:"higher"})
    }
    if(all.l6&&all.l6.length){
      var keys=Array.from(new Set(all.l6.map(function(x){return x.testKey})))
      keys.forEach(function(k){m.push({key:"l6_"+k,label:"ЛР6: "+k+" (баллы)",src:"l6",testKey:k,field:"score",dir:"higher"})})
    }
    return m
  }
  function metricsForRespondent(rid){
    var all=readLabResults()
    var vals={}
    // L3
    all.l3.filter(function(x){return x.resp===rid}).forEach(function(x){
      vals["l3_"+x.test+"_mean"]=x.mean
    })
    // L4
    all.l4.filter(function(x){return x.resp===rid}).forEach(function(x){
      vals["l4_"+x.mode+"_mean"]=x.mean
      vals["l4_"+x.mode+"_hits"]=x.hits
    })
    // L5
    all.l5.filter(function(x){return x.resp===rid}).forEach(function(x){
      vals["l5_"+x.mode+"_dev"]=x.mean
      vals["l5_"+x.mode+"_lock"]=x.lockSec
    })
    // L6
    all.l6.filter(function(x){return x.resp===rid}).forEach(function(x){
      vals["l6_"+x.testKey]=x.score
    })
    return vals
  }
  function renderMetrics(){
    var list=document.getElementById("metrics-list")
    var m=discoverMetrics()
    list.innerHTML=m.length?m.map(function(x){return "<div>"+x.label+" ("+x.key+")</div>"}).join(""):"<div class='muted'>Метрики из ЛР3–ЛР6 не найдены</div>"
  }
  function getCriteria(){return load("criteria",[])}
  function setCriteria(c){save("criteria",c)}
  function addIndicatorRow(){
    var row=document.createElement("div")
    row.className="ind-row"
    var metrics=discoverMetrics()
    row.innerHTML='<select class="ind-metric">'+metrics.map(function(x){return '<option value="'+x.key+'">'+x.label+'</option>'}).join("")+'</select><select class="ind-dir"><option value="higher">Больше — лучше</option><option value="lower">Меньше — лучше</option></select><input class="ind-weight" type="number" step="0.1" min="0" max="10" value="1"><input class="ind-cutoff" type="number" step="0.01" placeholder="Срез"><button type="button" class="btn ind-del">×</button>'
    row.querySelector(".ind-del").addEventListener("click",function(){row.remove()})
    document.getElementById("indicators").appendChild(row)
  }
  document.getElementById("add-ind").addEventListener("click",addIndicatorRow)
  addIndicatorRow()
  document.getElementById("add-crit").addEventListener("submit",function(e){
    e.preventDefault()
    var prof=document.getElementById("crit-prof").value.trim()
    var name=document.getElementById("crit-name").value.trim()
    var w=parseFloat(document.getElementById("crit-weight").value)||1
    var pvk=document.getElementById("crit-pvk").value.trim()
    var inds=[].slice.call(document.querySelectorAll("#indicators .ind-row")).map(function(r){
      return {
        metric:r.querySelector(".ind-metric").value,
        dir:r.querySelector(".ind-dir").value,
        weight:parseFloat(r.querySelector(".ind-weight").value)||1,
        cutoff:r.querySelector(".ind-cutoff").value?parseFloat(r.querySelector(".ind-cutoff").value):null
      }
    })
    var arr=getCriteria()
    arr.push({id:uid(),prof:prof,name:name,weight:w,pvk:pvk,inds:inds})
    setCriteria(arr)
    e.target.reset()
    document.getElementById("indicators").innerHTML=""
    addIndicatorRow()
    renderCriteria()
  })
  function renderCriteria(){
    var wrap=document.getElementById("crit-list")
    var arr=getCriteria()
    wrap.innerHTML=arr.length?arr.map(function(c,i){
      return '<div class="card"><div><strong>'+c.prof+'</strong> • '+c.name+' • вес '+c.weight+'</div><div class="muted">'+(c.pvk||'')+'</div><div>'+c.inds.map(function(ind){return '<div>'+ind.metric+' • '+(ind.dir==="higher"?"↑":"↓")+' • w='+ind.weight+(ind.cutoff!=null?(' • срез='+ind.cutoff):'')+'</div>'}).join("")+'</div><button class="btn" data-del="'+i+'">Удалить</button></div>'
    }).join(""):"<div class='muted'>Критерии отсутствуют</div>"
    wrap.querySelectorAll("[data-del]").forEach(function(btn){
      btn.onclick=function(){
        var idx=parseInt(btn.getAttribute("data-del"),10)
        var arr=getCriteria()
        arr.splice(idx,1)
        setCriteria(arr)
        renderCriteria()
      }
    })
    renderAnalysisSelectors()
  }
  function renderAnalysisSelectors(){
    var respSel=document.getElementById("ana-respondent")
    var profSel=document.getElementById("ana-prof")
    if(respSel){
      var arr=getRespondents()
      respSel.innerHTML=arr.map(function(r){return '<option value="'+r.id+'">'+r.name+'</option>'}).join("")
    }
    if(profSel){
      var proflist=Array.from(new Set(getCriteria().map(function(c){return c.prof})))
      profSel.innerHTML=proflist.map(function(p){return '<option>'+p+'</option>'}).join("")
    }
  }
  function groupStats(values){
    if(!values.length)return {mean:0,std:0}
    var mean=values.reduce(function(a,b){return a+b},0)/values.length
    var v=values.reduce(function(a,b){return a+(b-mean)*(b-mean)},0)/values.length
    return {mean:mean,std:Math.sqrt(v)}
  }
  function percentile(values,x){
    var arr=values.slice().sort(function(a,b){return a-b})
    var k=arr.filter(function(v){return v<=x}).length
    return arr.length? (k/arr.length*100) : 0
  }
  function sampleForMetric(metricKey,sex,age){
    var res=[]
    var all=readLabResults()
    function pushIf(v){if(isFinite(v))res.push(v)}
    all.l3.forEach(function(r){if(metricKey==="l3_"+r.test+"_mean"){if(sex && r.sex && r.sex!==sex)return;if(age!=null && r.age!=null && Math.abs(r.age-age)>5)return;pushIf(r.mean)}})
    all.l4.forEach(function(r){if(metricKey==="l4_"+r.mode+"_mean"){if(sex && r.sex && r.sex!==sex)return;if(age!=null && r.age!=null && Math.abs(r.age-age)>5)return;pushIf(r.mean)};if(metricKey==="l4_"+r.mode+"_hits"){if(sex && r.sex && r.sex!==sex)return;if(age!=null && r.age!=null && Math.abs(r.age-age)>5)return;pushIf(r.hits)}})
    all.l5.forEach(function(r){if(metricKey==="l5_"+r.mode+"_dev"){if(sex && r.sex && r.sex!==sex)return;if(age!=null && r.age!=null && Math.abs(r.age-age)>5)return;pushIf(r.mean)};if(metricKey==="l5_"+r.mode+"_lock"){if(sex && r.sex && r.sex!==sex)return;if(age!=null && r.age!=null && Math.abs(r.age-age)>5)return;pushIf(r.lockSec)}})
    all.l6.forEach(function(r){if(metricKey==="l6_"+r.testKey){if(sex && r.sex && r.sex!==sex)return;if(age!=null && r.age!=null && Math.abs(r.age-age)>5)return;pushIf(r.score)}})
    return res
  }
  document.getElementById("run-ana").addEventListener("click",function(){
    var rid=document.getElementById("ana-respondent").value
    var prof=document.getElementById("ana-prof").value
    var resp=getRespondents().find(function(r){return r.id===rid})
    var vals=metricsForRespondent(rid)
    var criteria=getCriteria().filter(function(c){return c.prof===prof})
    var out=[]
    var totalWeight=criteria.reduce(function(a,c){return a+(c.weight||1)},0)||1
    var overall=0
    criteria.forEach(function(c){
      var critOk=true
      var parts=[]
      var critScore=0, wsum=0
      c.inds.forEach(function(ind){
        var v=vals[ind.metric]
        if(v==null){parts.push({label:ind.metric,score:0,reason:"нет данных"});critOk=false;return}
        if(ind.cutoff!=null){
          if(ind.dir==="higher" && v<ind.cutoff){critOk=false}
          if(ind.dir==="lower" && v>ind.cutoff){critOk=false}
        }
        var sample=sampleForMetric(ind.metric,resp?resp.sex:null,resp?resp.age:null)
        var p=percentile(sample,v)
        var s= ind.dir==="higher" ? p : (100-p)
        critScore+=s*(ind.weight||1);wsum+=(ind.weight||1)
        parts.push({label:ind.metric,score:Math.round(s),value:v})
      })
      var agg=wsum?critScore/wsum:0
      var final=critOk?agg:0
      overall+=final*(c.weight||1)
      out.push({crit:c.name,pvk:c.pvk||"",ok:critOk,score:Math.round(final),parts:parts})
    })
    var overallScore=Math.round(overall/totalWeight)
    var box=document.getElementById("ana-result")
    box.innerHTML='<div><strong>Итоговый индекс ПВК: '+overallScore+' / 100</strong></div>'+out.map(function(o){
      return '<div class="card"><div><strong>'+o.crit+'</strong> '+(o.pvk?('• '+o.pvk):'')+' • '+(o.ok?'<span class="badge ok">срез OK</span>':'<span class="badge warn">срез НЕ выполнен</span>')+'</div><div>Балл: '+o.score+'</div><div>'+o.parts.map(function(p){return '<div class="muted">'+p.label+': '+(p.value!=null?('v='+p.value+', '):'')+'балл='+p.score+'</div>'}).join("")+'</div></div>'
    }).join("")
  })
  function getPhysio(){return load("physio",[])}
  function setPhysio(a){save("physio",a)}
  function renderPhysioSelectors(){
    var sel=document.getElementById("phys-respondent")
    if(sel){var arr=getRespondents();sel.innerHTML=arr.map(function(r){return '<option value="'+r.id+'">'+r.name+'</option>'}).join("")}
  }
  document.getElementById("phys-form").addEventListener("submit",function(e){
    e.preventDefault()
    var rid=document.getElementById("phys-respondent").value
    var metric=document.getElementById("phys-metric").value
    var pre=parseFloat(document.getElementById("phys-pre").value)
    var during=parseFloat(document.getElementById("phys-during").value)
    var post=parseFloat(document.getElementById("phys-post").value)
    var arr=getPhysio()
    arr.push({id:uid(),resp:rid,metric:metric,pre:pre,during:during,post:post,ts:Date.now()})
    setPhysio(arr)
    renderPhysioList()
  })
  function renderPhysioList(){
    var wrap=document.getElementById("phys-list")
    var arr=getPhysio()
    wrap.innerHTML=arr.length?arr.map(function(p){
      var ch=Math.round(((p.during-p.pre)/Math.max(1e-9,Math.abs(p.pre)))*100)
      var rec=Math.round(((p.post-p.pre)/Math.max(1e-9,Math.abs(p.pre)))*100)
      var ok=Math.abs(rec)<=5
      return '<div class="card"><div><strong>'+p.metric+'</strong> • '+new Date(p.ts).toLocaleString()+'</div><div>ДО: '+p.pre+' • ВО ВРЕМЯ: '+p.during+' ('+(ch>=0?'+':'')+ch+'%) • ПОСЛЕ: '+p.post+' ('+(rec>=0?'+':'')+rec+'%) '+(ok?'<span class="badge ok">вернулся к фону</span>':'<span class="badge warn">не вернулся</span>')+'</div></div>'
    }).join(""):'<div class="muted">Нет данных</div>'
  }
  function renderAnalysisSelectorsInit(){
    renderAnalysisSelectors()
    renderPhysioSelectors()
  }
  // init
  refreshRoleUI()
  renderAnalysisSelectorsInit()
  showSection((location.hash||"#home").replace("#",""))
})()

