"use strict";
const sRoom = class {
    constructor(id, elem, lang) {
        this.id = id;
        this.roomApp = loadRoom(id, elem, lang).then(() => {
            this.room.data.id = id;
            this.room.el = elem;
            console.log("loadRoom method", this.room)
            this.app = new Vue(this.room)

        });

        return this.roomApp;
    }

    room = {
        data: {
            isLoaded: false,
            section: 0,
            status: {},
            chat: [],
            chatText: "",
            chatNewItems: 0,
            q: [],
            qText: "",
            votes: [],
            qNewItems: 0,
            userError: null,
            user: {id: null, name: null},
            reqUserShow: false,
            options: {root: null, rootMargin: '0px', threshold: 1.0},
            timeout: 20
        },
        methods: {
            getCalcPercent:function(total, count){

                var perc = getPercent(total, count);
                return  'calc(100% - '+perc+')';
            },
            getPercent:function(total, count){

                if (total == 0)
                    return "0%"
                var perc = (parseFloat(count) / parseFloat(total) * 100);

                let Precision=4;
                if(perc<10 ||perc==100 )
                    Precision=3;
                return perc.toPrecision(Precision) + "%"
            },
            voiting: async function (item, v) {

                var store = [];
                var json = localStorage.getItem("vote" + item.voteid);
                if (json)
                    store = JSON.parse(json)

                let oldVote = store.filter(s => {
                    return s == item.id
                });

                if (!v.multy) {
                    for (let o of store) {
                        if (o == item.id)
                            return
                        await axios.post("/in/api/reVote", {id: o});
                        store = store.filter(s => {
                            return s != o
                        });
                        localStorage.setItem("vote" + v.id, JSON.stringify(store));
                        this.votes = this.votes.filter(ff => {
                            return true
                        })
                    }
                } else {
                    for (let o of store) {
                        if (o == item.id) {
                            store = store.filter(s => {
                                return s != o
                            });
                            localStorage.setItem("vote" + v.id, JSON.stringify(store));
                            this.votes = this.votes.filter(ff => {
                                return true
                            })
                            await axios.post("/in/api/reVote", {id: o});
                            return
                        }
                    }
                }
                await axios.post("/in/api/Vote", {id: item.id});
                if (!v.multy) {
                    showNotify();
                } else {
                    var elem = document.getElementById('votebtn' + v.id);
                    if (elem)
                        elem.classList.remove('hidden')
                }
                store.push(item.id)
                console.log("store", store)
                localStorage.setItem("vote" + item.voteid, JSON.stringify(store));
                this.votes = this.votes.filter(v => {
                    return true
                });

            },
            multyVote: function (item, e) {
                e.target.classList.add('hidden');
                showNotify();
            },

            checkVote: function (item, v) {
                var json = localStorage.getItem("vote" + item.voteid);
                if (!json)
                    return false;
                // if(!v.multy )
                //    return true;
                let store = JSON.parse(json)
                return store.filter(s => {
                    return s == item.id
                }).length > 0;
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
                console.log("qNewItemClick")
                this.q.forEach(c => {
                    delete c.new
                });
                this.qNewItems = 1;
                let objDiv = document.getElementById("qBox");
                if (objDiv)
                    objDiv.scrollTop = objDiv.scrollHeight;
            },
            changeSection: function (sect) {
                this.section = sect;
                document.getElementById("sFooterEnd").scrollIntoView();


                if (sect == 0) {
                    this.chatNewItems = 0;
                    setTimeout(() => {
                        let objDiv = document.getElementById("chatBox");
                        if (objDiv)
                            objDiv.scrollTop = objDiv.scrollHeight;
                    }, 200)
                    setTimeout(() => {
                        this.chatNewItems = 0;
                        this.chat.forEach(c => {
                            delete c.new
                        })
                    }, 1000)
                }
                if (sect == 1) {
                    this.qNewItems = 0;
                    this.chat.forEach(c => {
                        delete c.new
                    })
                    setTimeout(() => {

                        let objDiv = document.getElementById("qBox");
                        if (objDiv)
                            objDiv.scrollTop = objDiv.scrollHeight;
                    }, 200)
                    setTimeout(() => {
                        this.qNewItems = 0;
                        this.q.forEach(c => {
                            delete c.new
                        })
                    }, 1000)
                }
            },
            dislikeChat: () => {
            },//room.dislikeChat,
            likeChat: () => {
            },//likeChat,
            addSmileToChat: () => {
            },//addSmileToChat,
            reqUser: () => {
            },//reqUser(callBack),
            chatSend: () => {
            },//chatSend,
            addImageToChat: () => {
            },

            dislikeQ: () => {
            },//room.dislikeChat,
            likeQ: () => {
            },//likeChat,
            addSmileToQ: () => {
            },//addSmileToChat,
            qSend: () => {
            },//chatSend,
            getText: () => {
            },
            addImageToQ: () => {
            },


            updateStatus: async function () {
                try {
                    let s = await axios.get("/in/api/status/" + this.id)

                    this.status = s.data.status;
                    this.timeout = Number.parseInt(s.data.timeout);

                    //this.votes = s.data.votes.filter(v => v.isactive)

                    s.data.votes=s.data.votes.filter(v => v.isactive);
                    this.votes=s.data.votes
                    /* s.data.votes.forEach(v=>{
                       let find=false;
                       this.votes.forEach(old=>{
                           if(old.id==v.id){
                               find=true;
                           }
                       });
                       if(!find)
                           this.votes.push(v);
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

                    if (this.timeout < 2 || this.timeout > 120)
                        this.timeout == 20;
                    if (!this.status.isChat && this.status.isQ)
                        this.section = 1;

                    if (!this.status.isQ && this.status.isChat)
                        this.section = 0;
///
                    let len = this.chat.length;
                    this.chat = updateChat(this.chat, s.data.chat);

                    this.chat = this.chat.filter(c => {
                        if (this.status.isChatPreMod) {
                            if (!c.isMod && c.userid == this.user.id)
                                return true
                            return c.isMod
                        }
                        return true;
                    })

                    len = this.q.length;
                    this.q = updateChat(this.q, s.data.q);

                    this.q = this.q.filter(c => {
                        if (this.status.isChatPreMod) {
                            if (!c.isMod && c.userid == this.user.id)
                                return true
                            return c.isMod
                        }
                        return true;
                    })
                    setTimeout(() => {

                    }, 100);


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
                        if (c.new && this.section == 0) {
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
                                        console.log(entries[0].isIntersecting)
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
                        if (q.new && this.section == 1) {
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
                                        console.log(entries[0].isIntersecting)
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
            let u = localStorage.getItem("user_" + this.id);
            if (u)
                this.user = JSON.parse(u);
            this.isLoaded = true;
            this.updateStatus();

            this.dislikeChat = dislikeChat;
            this.likeChat = likeChat;
            this.addSmileToChat = addSmileToChat;
            this.reqUser = reqUser;
            this.chatSend = chatSend;
            this.onPasteChat = onPasteChat;
            this.addImageToChat = addImageToChat;

            this.dislikeQ = dislikeQ;
            this.likeQ = likeQ;
            this.addSmileToQ = addSmileToQ;
            this.qSend = qSend;
            this.getText = getText;
            this.addImageToQ = addImageToQ;


            let callback = function (entries, observer) {
                /* Content excerpted, show below */
            };
            let observer = new IntersectionObserver((entries, observer) => {
                let elem = document.getElementById("UpBtn")
                if (!entries[0].isIntersecting)
                    elem.classList.add("hidden")
                else
                    elem.classList.remove("hidden")

            }, this.options);
            setTimeout(() => {
                observer.observe(document.getElementById("sFooterEnd"));
            }, 100)
            setTimeout(() => {
                completeWr = document.querySelector(".completeWr")
                completeWr.addEventListener("click", (e) => {
                    hideElem(completeWr);
                })
            }, 100)
        },
    }

}

function initRoom(chatid, elem, lang) {

    return new sRoom(chatid, elem, lang)
}

async function loadRoom(chatid, elem, lang) {

    console.log("loadRoom")
    if (typeof axios == 'undefined') {
        let a = document.createElement("script");
        a.src = "/in/include/axios.js"
        await loadResource(a, document.head);

    }
    if (typeof Vue == 'undefined') {
        let a = document.createElement("script");
        a.src = "/in/include/vue.min.js"
        await loadResource(a, document.head);

    }
    if (typeof moment == 'undefined') {
        let a = document.createElement("script");
        a.src = "/in/include/moment.min.js"
        await loadResource(a, document.head);

    }
    if (typeof dislikeChat == 'undefined') {
        console.log("dislikeChat undef")
        let a = document.createElement("script");
        a.src = "/in/include/ulils.js"
        await loadResource(a, document.head);

    } else
        console.log(typeof dislikeChat)
    let html = await axios.get("/in/room/box/" + chatid + "/" + lang);
    elem.innerHTML = html.data;
    console.log("loadRoom", lang)
}

function loadResource(elem, parent) {
    return new Promise((resolve, reject) => {
        elem.onload = () => {
            resolve(elem)
        };
        parent.appendChild(elem)
    })
}


