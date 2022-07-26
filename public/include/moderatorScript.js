(() => {
    const vue = new Vue({
        el: "#app",
        data: {
            chatConfigShow: false,
            qConfigShow: false,
            chat: [],
            chatText: "",
            chatNewItems: 0,
            q: [],
            qText: "",
            votes:[],
            qNewItems: 0,
            userError: null,
            user: {id: null, name: null},
            reqUserShow: false,
            status: {},
            id: null,
            timeout: 20,
            voteConfigShow:false,
            section:0,
            mainConfigShow:false
        },
        methods: {
            downloadStat:function(){
                var a=document.createElement("a");
                a.download="data.xlsx"
                a.href="/in/api/roomToExcel/"+ROOM.uuid;
                document.body.appendChild(a)
                a.click();
                a.parentNode.removeChild(a);
                this.mainConfigShow=false;
            },
            getClientLink:function(){
                let full = location.protocol + '//' + location.host;
                if(location.port.length>0)
                    full+=":"+location.port;
                full+="/in/mobile/"+ROOM.publicUUID;
                return full;
            },
            copyLink:async function (){
                await navigator.clipboard.writeText(this.getClientLink())
                alert("Ссылка скопирована в буфер обмена")
                this.mainConfigShow=false;

            },
            downloadQr:function (){
                let elem=document.getElementById("qrcode");
                if(!elem){
                    elem=document.createElement("div");
                    elem.id="qrcode";
                    document.body.appendChild(elem)
                }
                elem.innerHTML="";
                var qrcode = new QRCode("qrcode", {
                    text: this.getClientLink(),
                    width: 300,
                    height: 300,
                    colorDark : "#000000",
                    colorLight : "#ffffff",
                    correctLevel : QRCode.CorrectLevel.H
                });
                setTimeout(()=>{
                    let img=elem.querySelector("img");

                    var a=document.createElement("a");
                    a.download="QRcode.png"
                    a.href=img.src;
                    document.body.appendChild(a)
                    a.click();
                    elem.parentNode.removeChild(elem);
                    a.parentNode.removeChild(a);
                    this.mainConfigShow=false;
                },100)


            },
            aVote: async function (item) {
                var r = await axios.post("/in/api/aVote", {id: item.id,uuid: ROOM.uuid});
                this.votes.forEach(v => {
                    if (v.id == r.data.voteid)
                        v.answers.forEach(a => {
                            if (a.id == r.data.id)
                                a.count = r.data.count;
                        })
                })
            },
            deleteAnswer: async function (item) {
                var r = await axios.post("/in/api/deleteAnswer", {id: item.id,uuid: ROOM.uuid});
                this.votes.forEach(v => {
                    if (v.id == r.data.voteid)
                        v.answers = v.answers.filter(a => a.id != r.data.id);
                })
            },
            answChange: async function (item,) {
                await axios.post("/in/api/changeAnswer", {id: item.id, title: item.title,uuid: ROOM.uuid});

            },
            deleteVote: async function (item) {
                if (!confirm("Удалить голосование?"))
                    return;
                var r = await axios.post("/in/api/deleteVote", {id: item.id,uuid: ROOM.uuid});
                this.votes = this.votes.filter(v => v.id != r.data.id);
            },
            clearVote: async function (item) {
                if (!confirm("Очистить результаты голосования?"))
                    return;
                var r = await axios.post("/in/api/clearVote", {id: item.id,uuid: ROOM.uuid});

            },
            addAnswer: async function (item) {
                var r = await axios.post("/in/api/addAnswer", {id: item.id ,uuid: ROOM.uuid});
                item.answers.push(r.data);
            },
            resultVote: async function (item) {
                var r = await axios.post("/in/api/resultVote", {iscompl: !item.iscompl, id: item.id,uuid: ROOM.uuid});
                item.iscompl = r.data.iscompl;
            },
            startVote: async function (item) {
                var r = await axios.post("/in/api/startVote", {isactive: !item.isactive, id: item.id,uuid: ROOM.uuid});
                item.isactive = r.data.isactive;
            },
            multyVote: async function (item) {
                var r = await axios.post("/in/api/multyVote", {multy: !item.multy, id: item.id ,uuid: ROOM.uuid});
                item.multy = r.data.multy;
            },
            voteTitleChange: async function (item) {
                var r = await axios.post("/in/api/voteTitleChange", {item,uuid: ROOM.uuid});
            },
            addVote: async function () {
                var r = await axios.post("/in/api/addVote",{uuid: ROOM.uuid});
                this.votes.push(r.data);
                setTimeout(() => {
                    var elem = document.getElementById("vote" + r.data.id);
                    elem.parentNode.scrollTop = elem.offsetTop - 60 - elem.clientHeight;
                    this.voteTitle = "";
                    elem.querySelector(".aanswTitle").focus();
                }, 0)
            },
            humanFileSize: function (bytes, si = false, dp = 1) {
                const thresh = si ? 1000 : 1024;

                if (Math.abs(bytes) < thresh) {
                    return bytes + ' B';
                }

                const units = si
                    ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
                    : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
                let u = -1;
                const r = 10 ** dp;

                do {
                    bytes /= thresh;
                    ++u;
                } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);


                return bytes.toFixed(dp) + ' ' + units[u];
            },
            chatNewItemClick: function (sect) {
                this.chat.forEach(c => {
                    delete c.new
                });
                this.chatNewItems = 1;
                let objDiv = document.getElementById("chatBox");
                if (objDiv)
                    objDiv.scrollTop = objDiv.scrollHeight;
            },
            qNewItemClick: function (sect) {
                this.q.forEach(c => {
                    delete c.new
                });
                this.qNewItems = 1;
                let objDiv = document.getElementById("qBox");
                if (objDiv)
                    objDiv.scrollTop = objDiv.scrollHeight;
            },

            dislikeChat: dislikeChat,
            likeChat: likeChat,
            addSmileToChat: addSmileToChat,
            reqUser: reqUser,
            chatSend: chatSend,
            getText: getText,
            dislikeQ: dislikeQ,
            likeQ: likeQ,
            addSmileToQ: addSmileToQ,
            qSend: qSend,
            addImageToChat: addImageToChat,
            addImageToQ: addImageToQ,
            getAnswProc:getAnswProc,


            changeSection: function (sect) {


            },
            modChat: async function (item) {
                item.isMod = !item.isMod
                await axios.post("/in/api/modChat", {item, uuid: ROOM.uuid});
            },
            delChat: async function (item) {
                if (confirm("Удалить сообщение?")) {
                    await axios.post("/in/api/delChat", {item, uuid: ROOM.uuid});
                    this.chat = this.chat.filter(c => {
                        return c.id != item.id
                    })
                }
            },
            modQ: async function (item) {
                item.isMod = !item.isMod
                await axios.post("/in/api/modQ", {item, uuid: ROOM.uuid});
            },
            delQ: async function (item) {
                if (confirm("Удалить сообщение?")) {
                    await axios.post("/in/api/delQ", {item, uuid: ROOM.uuid});
                    this.chat = this.chat.filter(c => {
                        return c.id != item.id
                    })
                }
            },
            ///
            changeStatus: async function (val) {
                this.status[val] = !this.status[val]
                await axios.post("/in/api/status", {
                    id: this.status.id,
                    isChat: this.status.isChat,
                    isChatLikes: this.status.isChatLikes,
                    isChatPreMod: this.status.isChatPreMod,
                    isQ: this.status.isQ,
                    isQLikes: this.status.isQLikes,
                    isQPreMod: this.status.isQPreMod
                });
            },
            updateStatus: async function () {
                try {
                    let s = await axios.get("/in/api/status/" + ROOM.publicUUID)

                    this.status = s.data.status;
                    this.timeout = Number.parseInt(s.data.timeout);
                    if (this.timeout < 2 || this.timeout > 120)
                        this.timeout == 20;
                    this.chat = updateChat(this.chat, s.data.chat);
                    this.q = updateChat(this.q, s.data.q);
                   // this.votes =  s.data.votes;

                    s.data.votes.forEach(n=>{
                      let find=false;
                      this.votes.forEach(old=>{
                          if(old.id==n.id){
                              find=true;
                              let elem=document.getElementById("vote"+old.id);
                              if(elem.contains(document.activeElement)){
                                  console.log("not copy element")
                                  let keys=Object.keys(n)
                                  for(let key in keys){
                                      if(keys[key]!="title" && keys[key]!="answers")
                                      old[keys[key]]=n[keys[key]];
                                  }
                                  old.answers.forEach(oa=>{
                                    n.answers.forEach(na=>{
                                        if(oa.id==na.id){
                                            let keys=Object.keys(oa)
                                            for(let key in keys){
                                                if(keys[key]!="title" )
                                                    oa[keys[key]]=na[keys[key]];
                                            }
                                        }
                                    })

                                })
                              }
                              else{
                                  let keys=Object.keys(n)
                                  for(let key in keys){
                                      old[keys[key]]=n[keys[key]];
                                  }
                              }

                          }

                      });
                      if(!find)
                          this.votes.push(n);
                  });
                    /*
                 s.data.votes.forEach(v=>{
                       let find=false;
                       this.votes.forEach(old=>{
                           if(old.id==v.id){
                               find=true;
                               var elem=document.getElementById("vote"+old.id)
                               if(!elem){
                                   v=old;
                               }
                           else
                               {
                                   var isFocus=false;
                                   let inputs=elem.querySelectorAll("input");
                                   inputs.forEach(i=>{
                                       if(i==document.activeElement)
                                           isFocus=true;
                                   })
                                   if(isFocus)
                                   {
                                       old.isactive=v.isactive;
                                       old.iscompl=v.iscompl;
                                       old.multy=v.multy;
                                   }
                                   else
                                       v=old;
                               }
                           }
                       })
                       if(!find)
                           this.votes.push(v);
                   })*/


                } catch (e) {
                    console.warn(e)
                }
                setTimeout(this.updateStatus, this.timeout * 1000);
            }
        },
        watch: {
            chat: async function () {
                setTimeout(() => {
                    this.chat.forEach(c => {
                        if (c.new) {
                            delete c.new;
                            this.chatNewItems++;
                            let elem = document.getElementById("chat" + c.id);
                            if (elem) {
                                let observer = new IntersectionObserver((entries, observer) => {
                                    //TODO: add remove
                                    if (entries[0].isIntersecting) {
                                        this.chatNewItems--;
                                        if (this.chatNewItems < 0)
                                            this.chatNewItems = 1;
                                        observer.unobserve(elem)

                                    }
                                }, this.options);

                                observer.observe(elem);
                            }
                        }
                    });
                }, 100);

            },
            q: async function () {
                setTimeout(() => {
                    this.q.forEach(q => {
                        if (q.new) {
                            delete q.new;
                            this.qNewItems++;
                            let elem = document.getElementById("q" + q.id);
                            if (elem) {
                                let observer = new IntersectionObserver((entries, observer) => {
                                    //TODO: add remove
                                    if (entries[0].isIntersecting) {
                                        this.qNewItems--;
                                        if (this.qNewItems < 0)
                                            this.qNewItems = 1;
                                        observer.unobserve(elem)

                                    }
                                }, this.options);

                                observer.observe(elem);
                            }
                        }
                    });
                }, 100);

            }
        },
        mounted: async function () {
            this.id = ROOM.publicUUID;
            let u = localStorage.getItem("user_" + this.id);
            if (u)
                this.user = JSON.parse(u);
            this.isLoaded = true;
            this.updateStatus();
        }
    })
})();
