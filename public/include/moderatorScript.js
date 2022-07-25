(()=>{
    const vue =new Vue({
        el:"#app",
        data:{
            chatConfigShow:false,
            qConfigShow:false,
            chat:[],
            chatText:"",
            q:[],
            qText:"",
            userError:null,
            user:{id:null, name:null},
            reqUserShow:false,
            status:{},
            id:null
        },
        methods:{
            dislikeChat:dislikeChat,
            likeChat:likeChat,
            addSmileToChat:addSmileToChat,
            reqUser:reqUser,
            chatSend:chatSend,

            dislikeQ:dislikeQ,
            likeQ:likeQ,
            addSmileToQ:addSmileToQ,
            qSend:qSend,


            modChat:async function(item){
                item.isMod=!item.isMod
                await axios.post("/api/modChat",{item, uuid:ROOM.uuid});
            },
            delChat:async function(item){
                if(confirm("Удалить сообщение?")) {
                    await axios.post("/api/delChat", {item, uuid: ROOM.uuid});
                    this.chat = this.chat.filter(c => {
                        return c.id != item.id
                    })
                }
            },
            ///
            changeStatus:async function (val){
                this.status[val]=!this.status[val]
                console.log("status.isChatPreMod", this.status.isChatPreMod)
                await axios.post("/api/status",{id:this.status.id, isChat:this.status.isChat, isChatLikes:this.status.isChatLikes,isChatPreMod:this.status.isChatPreMod,isQ:this.status.isQ,isQLikes:this.status.isQLikes,isQPreMod:this.status.isQPreMod});
            },
            updateStatus:async function(){
                try {
                    let s = await axios.get("/api/status/" + ROOM.publicUUID)

                    this.status = s.data.status;
                    let len=this.chat.length;
                    this.chat=updateChat(this.chat,s.data.chat);
                    if(len<this.chat.length)
                        setTimeout(function () {
                            var objDiv = document.getElementById("chatBox");
                            objDiv.scrollTop = objDiv.scrollHeight;
                        },0)

                    len=this.q.length;
                    this.q=updateChat(this.q,s.data.q);
                    if(len<this.q.length)
                        setTimeout(function () {
                            var objDiv = document.getElementById("qBox");
                            objDiv.scrollTop = objDiv.scrollHeight;
                        },0)

                }
                catch (e){console.warn(e)}
                setTimeout(this.updateStatus, 2000);
            }
        },
        mounted:async function(){
            this.id=ROOM.publicUUID;
            let u=localStorage.getItem("user_"+this.id);
            if(u)
                this.user=JSON.parse(u);
            this.isLoaded=true;
            this.updateStatus();
        }
    })
})();
