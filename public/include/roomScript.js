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
            userError:null,
            user:{id:null, name:null},
            reqUserShow:false,
        },
        methods:{
            reqUser:async function(callBack){
                let register=async ()=>{
                    if(this.user.name.length==0)
                        return;
                    this.user.name=this.user.name.trim().substring(0, 255);
                    this.userError=null;
                    let r=await axios.post("/api/regUser", {id:this.id, name:this.user.name});
                    if(r.data.status!=200) {
                        document.getElementById("register").focus()
                        this.userError = "This Name already used."
                        return;
                    }
                    this.user=r.data.user;
                    this.reqUserShow=false;
                    callBack();
                }
                this.reqUserShow=true;
                setTimeout(()=>{
                    document.getElementById("register").focus();
                    let elem=document.getElementById("registerBtn")
                    elem.addEventListener("click", register)
                    elem.addEventListener("keydown", async(e)=>{
                        console.log("keyCode", e)
                        if(e.keyCode==13)
                            await register();

                    })
                },0)

            },
            chatSend:async function(){
                if(this.chatText.length==0)
                    return;
                if(!this.user.id)
                    return await this.reqUser(this.chatSend);

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


