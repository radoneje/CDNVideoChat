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
            chatNewItems:0,
            q:[],
            qText:"",
            userError:null,
            user:{id:null, name:null},
            reqUserShow:false,
        },
        methods:{

            changeSection:function (sect){
                this.section=sect;
                document.getElementById("sFooterEnd").scrollIntoView();
            },
            dislikeChat:()=>{},//room.dislikeChat,
            likeChat:()=>{},//likeChat,
            addSmileToChat:()=>{},//addSmileToChat,
            reqUser:()=>{},//reqUser(callBack),
            chatSend:()=>{},//chatSend,

            dislikeQ:()=>{},//room.dislikeChat,
            likeQ:()=>{},//likeChat,
            addSmileToQ:()=>{},//addSmileToChat,
            qSend:()=>{},//chatSend,

            updateStatus:async function(){
                try {
                    let s = await axios.get("/api/status/" + this.id)

                    this.status = s.data.status;
                    if(!this.status.isChat && this.status.isQ)
                        this.section=1;

                    if(!this.status.isQ && this.status.isChat)
                        this.section=0;
///
                    let len=this.chat.length;
                    this.chat=updateChat(this.chat,s.data.chat);

                    this.chat=this.chat.filter(c=>{
                        if( this.status.isChatPreMod ){
                            if(!c.isMod && c.userid==this.user.id)
                                return true
                            return c.isMod
                        }
                        return  true;
                    })
                    if(len<this.chat.length)
                        setTimeout(function () {
                            var objDiv = document.getElementById("chatBox");
                            objDiv.scrollTop = objDiv.scrollHeight;
                        },0)
////
                    len=this.q.length;
                    this.q=updateChat(this.q,s.data.q);

                    this.q=this.q.filter(c=>{
                        if( this.status.isChatPreMod ){
                            if(!c.isMod && c.userid==this.user.id)
                                return true
                            return c.isMod
                        }
                        return  true;
                    })
                    setTimeout(()=>{

                    },100);
                   /* if(len<this.q.length)
                        setTimeout(function () {
                            var objDiv = document.getElementById("qBox");
                            objDiv.scrollTop = objDiv.scrollHeight;
                        },0)*/

                }
                catch (e){console.warn(e)}
                setTimeout(this.updateStatus, 2000);
            }
        },
        watch: {
            chat:async function(){
                console.log("chat change")
            }
        },
        mounted:async function(){
            let u=localStorage.getItem("user_"+this.id);
            if(u)
                this.user=JSON.parse(u);
            this.isLoaded=true;
            this.updateStatus();

            this.dislikeChat=dislikeChat;
                this.likeChat=likeChat;
                this.addSmileToChat=addSmileToChat;
                this.reqUser=reqUser;
                this.chatSend=chatSend;

            this.dislikeQ=dislikeQ;
            this.likeQ=likeQ;
            this.addSmileToQ=addSmileToQ;
            this.qSend=qSend;

            let options = {
                root: null,
                rootMargin: '0px',
                threshold: 1.0
            }
            let callback = function(entries, observer) {
                /* Content excerpted, show below */
            };
            let  observer = new IntersectionObserver((entries, observer)=>{
                let elem=document.getElementById("UpBtn")
                if(!entries[0].isIntersecting)
                    elem.classList.add( "hidden")
                else
                    elem.classList.remove( "hidden")

            }, options);
            setTimeout(()=>{observer.observe(document.getElementById("sFooterEnd"));},100)


        },
    }

}
function initRoom(chatid, elem, lang) {

    return new sRoom(chatid, elem, lang)
}
async function loadRoom(chatid, elem, lang){

    console.log("loadRoom")
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


