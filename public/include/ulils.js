
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
                for(let key in Object.keys(n)){
                    o[key]=n[key];
                }
                find=true
            }
        })
        if(!find)
            oldChat.push(n)
    })
    return oldChat;

}
