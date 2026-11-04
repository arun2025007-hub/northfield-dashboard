(function(){
  "use strict";
  /* Validation helper: per-field messages + summary */
  function fieldMessage(c){
    var label=c.dataset.label||"This field";
    if(c.validity.valueMissing){return label+" is required.";}
    if(c.validity.typeMismatch){return "Enter a valid "+label.toLowerCase()+".";}
    if(c.validity.patternMismatch){return "Check the format of "+label.toLowerCase()+".";}
    if(c.validity.tooShort){return label+" must be at least "+c.minLength+" characters.";}
    return c.validationMessage;
  }
  function validate(form,summary){
    var problems=[];
    form.querySelectorAll("input,select,textarea").forEach(function(c){
      if(c.type==="radio"||c.type==="checkbox"){return;}
      var err=document.getElementById(c.id+"-err");
      if(!err){return;}
      if(c.checkValidity()){
        c.removeAttribute("aria-invalid");err.textContent="";
      }else{
        var m=fieldMessage(c);
        c.setAttribute("aria-invalid","true");err.textContent=m;
        problems.push({id:c.id,msg:m});
      }
    });
    form.querySelectorAll("fieldset[data-required-group]").forEach(function(fs){
      var err=fs.querySelector(".error");
      var ok=fs.querySelector("input:checked");
      var first=fs.querySelector("input");
      if(ok){err.textContent="";}
      else{err.textContent="Choose one option.";problems.push({id:first.id,msg:"Choose one option."});}
    });
    summary.textContent="";
    if(problems.length){
      var h=document.createElement("h3");
      h.textContent="Fix "+problems.length+(problems.length===1?" problem":" problems")+" to continue";
      var ul=document.createElement("ul");
      problems.forEach(function(p){
        var li=document.createElement("li"),a=document.createElement("a");
        a.href="#";a.textContent=p.msg;
        a.addEventListener("click",function(e){e.preventDefault();document.getElementById(p.id).focus();});
        li.appendChild(a);ul.appendChild(li);
      });
      summary.appendChild(h);summary.appendChild(ul);
      summary.focus();
    }
    return problems.length===0;
  }

  /* Settings form */
  var sf=document.getElementById("settings-form");
  if(sf){
  sf.addEventListener("submit",function(e){
    e.preventDefault();
    var live=document.getElementById("settings-live");
    live.textContent="";
    if(validate(sf,document.getElementById("settings-summary"))){
      live.textContent="Settings saved.";
    }
  });
  sf.addEventListener("reset",function(){
    document.getElementById("settings-summary").textContent="";
    sf.querySelectorAll("[aria-invalid]").forEach(function(c){c.removeAttribute("aria-invalid");});
    sf.querySelectorAll(".error").forEach(function(p){p.textContent="";});
  });

  }

  /* Dialog and table (users page only) */
  if(document.getElementById("add-dialog")){
  var dlg=document.getElementById("add-dialog"),af=document.getElementById("add-form");
  var opener=document.getElementById("open-add");
  function closeDlg(){if(dlg.open){dlg.close();}}
  opener.addEventListener("click",function(){
    af.reset();
    document.getElementById("add-summary").textContent="";
    af.querySelectorAll(".error").forEach(function(p){p.textContent="";});
    af.querySelectorAll("[aria-invalid]").forEach(function(c){c.removeAttribute("aria-invalid");});
    if(typeof dlg.showModal==="function"){dlg.showModal();document.getElementById("a-name").focus();}
  });
  document.getElementById("close-add").addEventListener("click",closeDlg);
  document.getElementById("cancel-add").addEventListener("click",closeDlg);
  dlg.addEventListener("close",function(){opener.focus();});

  /* Table helpers */
  var tbody=document.querySelector("#users-table tbody");
  var cap=document.getElementById("tbl-cap");
  var headers=document.querySelectorAll("#users-table thead th");
  function cellValue(tr,i){
    var cell=tr.children[i],t=cell.querySelector("time");
    return t?t.getAttribute("datetime"):cell.textContent.trim().toLowerCase();
  }
  function sortBy(col,dir){
    var rows=Array.prototype.slice.call(tbody.rows);
    rows.sort(function(a,b){
      var x=cellValue(a,col),y=cellValue(b,col);
      return (x<y?-1:x>y?1:0)*(dir==="ascending"?1:-1);
    });
    rows.forEach(function(r){tbody.appendChild(r);});
    headers.forEach(function(h,i){h.setAttribute("aria-sort",i===col?dir:"none");});
    cap.textContent="Team members, sorted by "+headers[col].textContent.trim().toLowerCase()+" ("+dir+")";
  }
  document.querySelectorAll(".sort").forEach(function(btn){
    btn.addEventListener("click",function(){
      var col=Number(btn.dataset.col);
      var cur=headers[col].getAttribute("aria-sort");
      sortBy(col,cur==="ascending"?"descending":"ascending");
    });
  });

  af.addEventListener("submit",function(e){
    e.preventDefault();
    if(!validate(af,document.getElementById("add-summary"))){return;}
    var d=new FormData(af),tr=tbody.insertRow();
    var th=document.createElement("th");th.scope="row";th.textContent=d.get("name");tr.appendChild(th);
    tr.insertCell().textContent=d.get("role");
    var b=document.createElement("span");b.className="badge warn";b.textContent="Invited";
    tr.insertCell().appendChild(b);
    var t=document.createElement("time");t.setAttribute("datetime",d.get("start"));
    var dt=new Date(d.get("start")+"T00:00:00");
    t.textContent=dt.toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"});
    tr.insertCell().appendChild(t);
    document.getElementById("users-live").textContent=d.get("name")+" was added to the team.";
    dlg.close();
  });
  }
})();
