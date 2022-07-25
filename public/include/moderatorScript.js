(()=>{
    const vue =new Vue({
        el:"#app",
        data:{
            chatConfigShow:false,
            qConfigShow:false,
            chat:[],
            chatText:"",
            chatNewItems:0,
            q:[],
            qText:"",
            qNewItems:0,
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

            changeSection:function (sect){
                this.section=sect;

            },
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
            modQ:async function(item){
                item.isMod=!item.isMod
                await axios.post("/api/modQ",{item, uuid:ROOM.uuid});
            },
            delQ:async function(item){
                if(confirm("Удалить сообщение?")) {
                    await axios.post("/api/delQ", {item, uuid: ROOM.uuid});
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

                    this.chat=updateChat(this.chat,s.data.chat);
                    this.q=updateChat(this.q,s.data.q);

                }
                catch (e){console.warn(e)}
                setTimeout(this.updateStatus, 2000);
            }
        },
        watch: {
            chat:async function(){
                setTimeout(()=> {
                    this.chat.forEach(c => {
                        if (c.new && this.section==0) {
                            delete c.new;
                            this.chatNewItems++;
                            let elem=document.getElementById("chat" + c.id);
                            if(elem) {
                                let observer = new IntersectionObserver((entries, observer) => {
                                    //TODO: add remove
                                    if(entries[0].isIntersecting) {
                                        this.chatNewItems--;
                                        if(this.chatNewItems<0)
                                            this.chatNewItems=1;
                                        observer.unobserve(elem)
                                        console.log(entries[0].isIntersecting)
                                    }
                                }, this.options);

                                observer.observe(elem);
                            }
                        }
                    });
                },100);

            },
            q:async function(){
                setTimeout(()=> {
                    this.q.forEach(q => {
                        if (q.new && this.section==1) {
                            delete q.new;
                            this.qNewItems++;
                            let elem=document.getElementById("q" + q.id);
                            if(elem) {
                                let observer = new IntersectionObserver((entries, observer) => {
                                    //TODO: add remove
                                    if(entries[0].isIntersecting) {
                                        this.qNewItems--;
                                        if(this.qNewItems<0)
                                            this.qNewItems=1;
                                        observer.unobserve(elem)
                                        console.log(entries[0].isIntersecting)
                                    }
                                }, this.options);

                                observer.observe(elem);
                            }
                        }
                    });
                },100);

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
