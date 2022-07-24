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
            chatText:"ss",
            user:{id:null, name:null},
            reqUserShow:false,
        },
        methods:{
            register:async function(e){
                if(this.user.name || this.user.name.length==0)
                    return;
                console.log(this.user);
            },
            registerOnChange:async function(e){
                console.log(e.keyCode);
                if(e.keyCode==13)
                    return await register();
            },
            reqUser:async function(){
                this.reqUserShow=true;
                setTimeout(()=>{
                    document.getElementById("register").focus();
                },0)
            },
            chatSend:async function(){
                if(this.chatText.length==0)
                    return;
                if(!this.user.id)
                    return await this.reqUser();

            },
            updateStatus:async function(){
                try {
                    let s = await axios.get("/api/status/" + this.id)
                    this.status = s.data;
                }
                catch (e){console.warn(e)}
                setTimeout(this.updateStatus, 2000);
            }
        },
        mounted:async function(){
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


