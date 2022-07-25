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
            dislikeChat:dislikeChat,
            likeChat:likeChat,
            addSmileToChat:addSmileToChat,
            reqUser:reqUser(callBack),
            chatSend:chatSend,
            updateStatus:async function(){
                try {
                    let s = await axios.get("/api/status/" + this.id)
                    this.status = s.data.status;
                    if(!status.isChat)
                        this.section=1;
                    if(!status.isQ)
                        this.section=0;
                    let len=this.chat.length;
                    this.chat=updateChat(this.chat,s.data.chat);
                    console.log( this.chat)
                    this.chat=this.chat.filter(c=>{
                        let ret=false;
                        if( this.status.isChatPreMod )
                            ret= c.isMod || c.userid==this.user.id;
                        else ret=true;
                        console.log(ret)
                        return ret;
                    })
                    if(len<this.chat.length)
                        setTimeout(function () {
                            var objDiv = document.getElementById("chatBox");
                            objDiv.scrollTop = objDiv.scrollHeight;
                        },0)
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
    if(typeof dislikeChat == 'undefined')
    {
        console.log("dislikeChat undef")
        let a=document.createElement("script");
        a.src="/include/ulils.js"
        await loadResource(a, document.head);

    }
    else
        console.log(typeof dislikeChat)
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


