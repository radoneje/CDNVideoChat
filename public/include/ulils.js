
let dislikeChat=async function(item){
    if(!localStorage.getItem("chatdislike"+item.id)) {
        item.dislikes++;
        await axios.post("/api/chatdislike", {id: item.id})
        localStorage.setItem("chatdislike"+item.id, true);
    }
    else {
        item.dislikes--;
        if(item.dislikes<0)
            item.dislikes=0;
        localStorage.removeItem("chatdislike"+item.id)
        await axios.post("/api/chatdislike", {id: item.id, undo:1})
    }

}
let likeChat=async function(item){
    if(!localStorage.getItem("chatlike"+item.id)) {
        item.likes++;
        await axios.post("/api/chatlike", {id: item.id})
        localStorage.setItem("chatlike" + item.id, true);
    }
    else {
        item.likes--;
        if(item.likes<0)
            item.likes=0;
        localStorage.removeItem("chatlike"+item.id)
        await axios.post("/api/chatlike", {id: item.id, undo:1})

    }

}
let addSmileToChat=async function(){
    this.chatText+=" \u{1F600} ";
    document.getElementById("chatText").focus();
}
let reqUser=async function (callBack){
    let _this=this;
    let register=async ()=>{
        if(this.user.name.length==0)
            return;
        this.user.name=this.user.name.trim().substring(0, 255);
        this.userError=null;
        let r=await axios.post("/api/regUser", {id:this.id, name:this.user.name});
        if(r.data.status!=200) {
            document.getElementById("register").focus()
            this.userError = "This name is already used."
            return;
        }
        this.user=r.data.user;
        localStorage.setItem("user_"+this.id, JSON.stringify(this.user));
        this.reqUserShow=false;

        callBack(_this);
    }
    this.reqUserShow=true;
    setTimeout(()=>{
        let inp=document.getElementById("register");
        inp.focus();
        let elem=document.getElementById("registerBtn")
        elem.addEventListener("click", register)
        inp.addEventListener("keydown", async(e)=>{
            if(e.keyCode==13)
                await register();
        })
    },0)

}
let chatSend=async function(prm){
    let _this=prm?prm:this;

    _this.chatText=_this.chatText.trim();
    if(_this.chatText.length==0)
        return;
    if(!_this.user.id)
        return await _this.reqUser(_this.chatSend);
    let r=await axios.post("/api/chat",{id:_this.id,text:_this.chatText,userid:_this.user.id})
    _this.chatText="";
    _this.chat.push(r.data);
    setTimeout(function () {
        var objDiv = document.getElementById("chatBox");
        objDiv.scrollTop = objDiv.scrollHeight;
    },0)

}
let updateChat=function (oldChat,newChat){
    newChat.forEach(n=>{
        let find=false;
        oldChat.forEach(o=>{
            if(o.id==n.id){
                let keys=Object.keys(n)
                for(let key in keys){
                    o[keys[key]]=n[keys[key]];
                }
                find=true
            }
        })
        if(!find) {
            n.new=true;
            oldChat.push(n)
        }
    })
    oldChat=oldChat.sort((a,b)=>{return moment(a.createDate).unix()-moment(b.createDate).unix()})
    return oldChat;

}
////

let dislikeQ=async function(item){
    if(!localStorage.getItem("qdislike"+item.id)) {
        item.dislikes++;
        await axios.post("/api/qlike", {id: item.id})
        localStorage.setItem("qdislike"+item.id, true);
    }
    else {
        item.dislikes--;
        if(item.dislikes<0)
            item.dislikes=0;
        localStorage.removeItem("qdislike"+item.id)
        await axios.post("/api/qdislike", {id: item.id, undo:1})
    }

}
let likeQ=async function(item){
    if(!localStorage.getItem("qlike"+item.id)) {
        item.likes++;
        await axios.post("/api/qlike", {id: item.id})
        localStorage.setItem("qlike" + item.id, true);
    }
    else {
        item.likes--;
        if(item.likes<0)
            item.likes=0;
        localStorage.removeItem("qlike"+item.id)
        await axios.post("/api/qlike", {id: item.id, undo:1})

    }

}
let addSmileToQ=async function(){
    this.chatText+=" \u{1F600} ";
    document.getElementById("qText").focus();
}

let qSend=async function(prm){
    let _this=prm?prm:this;

    _this.qText=_this.qText.trim();
    if(_this.qText.length==0)
        return;
    if(!_this.user.id)
        return await _this.reqUser(this.qSend);
    let r=await axios.post("/api/q",{id:_this.id,text:_this.qText,userid:_this.user.id})
    _this.qText="";
    _this.q.push(r.data);
    setTimeout(function () {
        var objDiv = document.getElementById("qBox");
        objDiv.scrollTop = objDiv.scrollHeight;
    },0)

}
let urlify=(text)=> {
    var urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, function(url) {
        return '<a href="' + url + '" target="_blank">' + url + '</a>';
    })
}
let getText= function(html){
    let elem=document.createElement("div");
    elem.innerHTML=html;
    return urlify(elem.innerText)
}
let onPasteChat= async function(e){

}

window.addEventListener('paste', e => {
    console.log("onPasteChat",e )
});
let addImage= async function(sect, _this){
   var elem=document.createElement("input");
   elem.type="file"
    elem.style.display="none";
   elem.onchange=(e)=>{
       let formData=new FormData();
       formData.append("file", elem.files[0]);
       formData.append("id", _this.id);
       formData.append("userid", _this.user.id);
       let xhr = new XMLHttpRequest();
       xhr.open("POST", "/api/"+sect.toLowerCase()+"File")
        let uploader=document.getElementById("s"+sect+"Uploader")
       xhr.onload = xhr.onerror = (event)=>{
           if (xhr.status == 200) {

           } else {
               alert( 'Произошла ошибка при загрузке данных на сервер!' );
           }
          setTimeout(()=>{uploader.style.width=0},2000)
       }
       xhr.onreadystatechange = () =>{//Call a function when the state changes.
           if(xhr.readyState == 4 && xhr.status == 200) {
               let c=JSON.parse(xhr.responseText);
               _this[sect.toLowerCase()].push(c);
               setTimeout(function () {
                   var objDiv = document.getElementById(sect.toLowerCase()+"Box");
                   objDiv.scrollTop = objDiv.scrollHeight;
               },0)
           }
       }
       xhr.upload.onprogress = function(event) {
           console.log( 'Загружено на сервер ' + event.loaded + ' байт из ' + event.total );
           uploader.style.width=(parseFloat(event.loaded) /parseFloat( event.total)*100)+"%"
       }
       xhr.send(formData);

       elem.parentNode.removeChild(elem)

   };
   document.body.appendChild(elem)
   elem.click();
}
let addImageToChat= async function(){
    await addImage("Chat", this)
}
let addImageToQ= async function(){

    await addImage("Q",this)
}
let getAnswProc=function (item, count) {

    var total = 0;
    item.answers.forEach(a => {
        total += a.count
    });
    if (total == 0)
        return "0%"
    var perc = (parseFloat(count) / parseFloat(total) * 100);
    return perc.toPrecision(4) + "%"

}
function showNotify(){
    var elem = document.querySelector(".completeWr");
    elem.classList.remove("hidden")
    elem.querySelector(".completeSubText").classList.remove("hidden")
    document.querySelector("#app").classList.add("blur")
    if (completeWrTimeout)
        clearTimeout(completeWrTimeout);
    completeWrTimeout = setTimeout(() => {
        hideElem(elem)
    }, 6000);
}

