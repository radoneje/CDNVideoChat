
let dislikeChat=async function(item){
    if(!localStorage.getItem("chatdislike"+item.id)) {
        item.dislikes++;
        await axios.post("/api/chatdislike", {id: item.id})
        localStorage.setItem("chatdislike"+item.id, true);
    }
    else {
        item.dislikes--;
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
        localStorage.removeItem("chatlike"+item.id)
        await axios.post("/api/chatlike", {id: item.id, undo:1})

    }

}
let addSmileToChat=async function(){
    this.chatText+=" \u{1F600} ";
    document.getElementById("chatText").focus();
}
let reqUser=async function(callBack){

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
        callBack();
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
let chatSend=async function(){
    this.chatText=this.chatText.trim();
    if(this.chatText.length==0)
        return;
    if(!this.user.id)
        return await this.reqUser(this.chatSend);
    let r=await axios.post("/api/chat",{id:this.id,text:this.chatText,userid:this.user.id})
    this.chatText="";
    this.chat.push(r.data);
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
        if(!find)
            oldChat.push(n)
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
        localStorage.removeItem("qlike"+item.id)
        await axios.post("/api/qlike", {id: item.id, undo:1})

    }

}
let addSmileToQ=async function(){
    this.chatText+=" \u{1F600} ";
    document.getElementById("qText").focus();
}

let qSend=async function(){
    console.log(this,this.qText)
    this.qText=this.qText.trim();
    if(this.qText.length==0)
        return;
    if(!this.user.id)
        return await this.reqUser(this.qSend);
    let r=await axios.post("/api/q",{id:this.id,text:this.chatText,userid:this.user.id})
    this.qText="";
    this.q.push(r.data);
    setTimeout(function () {
        var objDiv = document.getElementById("qBox");
        objDiv.scrollTop = objDiv.scrollHeight;
    },0)

}
