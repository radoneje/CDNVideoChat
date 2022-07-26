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
            voteConfigShow:false
        },
        methods: {
            deleteVote: async function (item) {
                if (!confirm("Удалить голосование?"))
                    return;
                var r = await axios.post("/api/deleteVote", {id: item.id,uuid: ROOM.uuid});
                this.votes = this.votes.filter(v => v.id != r.data.id);
            },
            clearVote: async function (item) {
                if (!confirm("Очистить результаты голосования?"))
                    return;
                var r = await axios.post("/api/clearVote", {id: item.id,uuid: ROOM.uuid});

            },
            addAnswer: async function (item) {
                var r = await axios.post("/api/addAnswer", {id: item.id ,uuid: ROOM.uuid});
                item.answers.push(r.data);
            },
            resultVote: async function (item) {
                var r = await axios.post("/api/resultVote", {iscompl: !item.iscompl, id: item.id,uuid: ROOM.uuid});
                item.iscompl = r.data.iscompl;
            },
            startVote: async function (item) {
                var r = await axios.post("/api/startVote", {isactive: !item.isactive, id: item.id,uuid: ROOM.uuid});
                item.isactive = r.data.isactive;
            },
            multyVote: async function (item) {
                var r = await axios.post("/api/multyVote", {multy: !item.multy, id: item.id ,uuid: ROOM.uuid});
                item.multy = r.data.multy;
            },
            voteTitleChange: async function (item) {
                var r = await axios.post("/api/voteTitleChange", {item,uuid: ROOM.uuid});
            },
            addVote: async function () {
                var r = await axios.post("/api/addVote",{uuid: ROOM.uuid});
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
                await axios.post("/api/modChat", {item, uuid: ROOM.uuid});
            },
            delChat: async function (item) {
                if (confirm("Удалить сообщение?")) {
                    await axios.post("/api/delChat", {item, uuid: ROOM.uuid});
                    this.chat = this.chat.filter(c => {
                        return c.id != item.id
                    })
                }
            },
            modQ: async function (item) {
                item.isMod = !item.isMod
                await axios.post("/api/modQ", {item, uuid: ROOM.uuid});
            },
            delQ: async function (item) {
                if (confirm("Удалить сообщение?")) {
                    await axios.post("/api/delQ", {item, uuid: ROOM.uuid});
                    this.chat = this.chat.filter(c => {
                        return c.id != item.id
                    })
                }
            },
            ///
            changeStatus: async function (val) {
                this.status[val] = !this.status[val]
                await axios.post("/api/status", {
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
                    let s = await axios.get("/api/status/" + ROOM.publicUUID)

                    this.status = s.data.status;
                    this.timeout = Number.parseInt(s.data.timeout);
                    if (this.timeout < 2 || this.timeout > 120)
                        this.timeout == 20;
                    this.chat = updateChat(this.chat, s.data.chat);
                    this.q = updateChat(this.q, s.data.q);
                    this.votes =  s.data.votes;

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
