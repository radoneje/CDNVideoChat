"use strict";
const sRoom=class{
    constructor(id, elem, lang){
        this.id=id;
        this.roomApp=loadRoom(id, elem, lang).then(()=>{
            this.room.data.id=id;
            this.room.el=elem;
            console.log("loadRoom method", this.room)
            this.app=new Vue(this.room)
        });

        return this.roomApp;
    }
    room={
        data:{
            isLoaded:false,
            section:0,
            status:{},
            chat:[],
            chatText:"",
            userError:null,
            user:{id:null, name:null},
            reqUserShow:false,
        },
        methods:{
            dislikeChat:async function(item){
                item.dislikes++;
            },
            likeChat:async function(item){
                item.likes++;
                console.log("like")
                chat.forEach(c=>{
                    if(c.id==item.id)
                        c.likes++;
                })
            },
            addSmileToChat:async function(){
                this.chatText+=" \u{1F600} ";
                document.getElementById("chatText").focus();
            },
            reqUser:async function(callBack){
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

            },
            chatSend:async function(){
                this.chatText=this.chatText.trim();
                if(this.chatText.length==0)
                    return;
                if(!this.user.id)
                    return await this.reqUser(this.chatSend);
                let r=await axios.post("/api/chat",{id:this.id,text:this.chatText,userid:this.user.id})
                this.chatText="";
                this.chat.push(r.data);

            },
            updateStatus:async function(){
                try {
                    let s = await axios.get("/api/status/" + this.id)
                    this.status = s.data.status;
                    this.chat=s.data.chat;
                }
                catch (e){console.warn(e)}
                setTimeout(this.updateStatus, 2000);
            }
        },
        mounted:async function(){
            let u=localStorage.getItem("user_"+this.id);
            if(u)
                this.user=JSON.parse(u);
            this.isLoaded=true;
            this.updateStatus();

        },
    }

}
function initRoom(chatid, elem, lang) {

    return new sRoom(chatid, elem, lang)
}
async function loadRoom(chatid, elem, lang){

    if(typeof axios == 'undefined')
    {
        let a=document.createElement("script");
        a.src="/include/axios.js"
        await loadResource(a, document.head);

    }
    if(typeof Vue == 'undefined')
    {
        let a=document.createElement("script");
        a.src="/include/vue.min.js"
        await loadResource(a, document.head);

    }
    if(typeof moment == 'undefined')
    {
        let a=document.createElement("script");
        a.src="/include/moment.min.js"
        await loadResource(a, document.head);

    }
    let html=await axios.get("/room/box/"+chatid+"/"+lang);
    elem.innerHTML=html.data;
    console.log("loadRoom", lang)
}

function loadResource(elem, parent){
    return new Promise((resolve, reject) => {
        elem.onload=()=>{resolve(elem)};
        parent.appendChild(elem)
    })
}


