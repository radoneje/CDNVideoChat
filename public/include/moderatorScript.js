(()=>{
    const vue =new Vue({
        el:"#app",
        data:{
            chatConfigShow:false,
            chat:[],
            chatText:"",
            userError:null,
            user:{id:null, name:null},
            reqUserShow:false,
        },
        methods:{
            changeStatus:async function (){
                await axios.post("/api/status",{id:this.status.id, isChat:this.status.isChat, isChatLikes:this.status.isChatLikes,isChatPreMod:this.status.isChatPreMod,isQ:this.status.isQ,isQLikes:this.status.isQLikes,isQPreMod:this.status.isQPreMod});
            },
            updateStatus:async function(){
                try {
                    let s = await axios.get("/api/status/" + ROOM.publicUUID)
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
        }
    })
})();
