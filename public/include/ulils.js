
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
let addImageToChat= async function(){
   var elem=document.createElement("input");
   elem.type="file"
    elem.style.display="none";
   elem.onchange=(e)=>{
       alert("elem.change")
       elem.parentNode.removeChild(elem)
   };
   document.body.appendChild(elem)
   elem.click();
}
let addImageToQ= async function(){}

