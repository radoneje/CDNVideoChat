let express = require('express');
let router = express.Router();
const path = require('path');
const fsPromises = require('fs').promises;
const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
router.post('/room', async (req, res, next) =>{
  if(!req.session.admin)
    return res.status(401)
  if(!req.body.id)
  {
    let r=await req.knex("t_rooms").insert(req.body,"*");
    return res.json(r);
  }
    res.json([]);//TODO: add UPDATE
});
router.get('/room/:skip?', async (req, res, next) =>{
  if(!req.session.admin)
    return res.status(401)

  if(!req.params.skip)
    req.params.skip=0;
  let r= await req.knex.select("*").from("t_rooms").where({isDeleted:null}).orderBy("dateCreate","desc").limit(50).offset(Number(req.params.skip)|| 0)
  let total= await req.knex.count('id as CNT').from("t_rooms").where({isDeleted:null})
  res.json({total:total[0].CNT, skip:req.params.skip, rooms:r});
});
router.delete('/room/:id', async (req, res, next) =>{
  if(!req.session.admin)
    return res.status(401)
  let r= await req.knex("t_rooms").update({isDeleted: new Date()},"*").where({id:req.params.id})
  res.json(r);
});
router.get("/status/:id", async (req, res)=>{
  let r= await req.knex.select('*').from("t_rooms").where({isDeleted:null, publicUUID:req.params.id});
  if(r.length==0)
    return res.sendStatus(404);
  delete r[0].uuid;
  let chat=await req.knex("v_chat").where({roomPublicUUID:req.params.id}).orderBy("createDate", ).limit(300);
  let q=await req.knex("v_q").where({roomPublicUUID:req.params.id}).orderBy("createDate", ).limit(300);
  let votes=await getVotes(req, r[0].publicUUID)
  let timeout=0;
  timeout=Number.parseInt( await fsPromises.readFile("./timeout.txt"));
  res.json({status:r[0], chat,q,votes, timeout})
})
router.post("/status", async (req, res)=>{
  let id=req.body.id;
  delete req.body.id;
  let r= await req.knex("t_rooms").update(req.body, "*").where({id:id});

  res.json(r[0])
})

router.post("/regUser", async (req, res)=>{
  let r= await req.knex.select('*').from("t_users").where({ roomPublicUUID:req.body.id, name:req.body.name});
  if(r.length>0)
    return res.json({status:409});
  r= await req.knex("t_users").insert({ roomPublicUUID:req.body.id, name:req.body.name},"*");

  res.json({status:200, user:{id:r[0].id, name:r[0].name}})
})
router.post("/chat", async (req, res)=>{
  let room=await  req.knex.select("*").from("t_rooms").where({ publicUUID:req.body.id});
  if(room.length==0)
    return res.sendStatus(404);
  let r= await req.knex("t_chat").insert({ roomPublicUUID:req.body.id, text:req.body.text, userid:req.body.userid},"*");
  let rr=await req.knex("v_chat").where({id:r[0].id});
  res.json(rr[0]);
})
router.get("/chat/:id", async (req, res)=>{

  let rr=await req.knex("v_chat").where({roomPublicUUID:req.params.id}).orderBy("createDate");
  res.json(rr);
})
router.post("/chatlike", async (req, res)=>{

  let r= await req.knex.select("*").from("t_chat").where({id:req.body.id});
  if(r.length==0)
    return res.sendStatus(404)
  if(req.body.undo)
  {
    r[0].likes--;
    if(r[0].likes<0) r[0].likes=0;
  }
  else
    r[0].likes++;
  console.log(r[0].likes);
  let rr=await req.knex("t_chat").update({likes:r[0].likes},"*").where({id:req.body.id});
  res.json(rr[0]);
})
router.post("/chatdislike", async (req, res)=>{

  let r= await req.knex.select("*").from("t_chat").where({id:req.body.id});
  if(r.length==0)
    return res.sendStatus(404)


  if(req.body.undo)
  {
    r[0].dislikes--;
    if(r[0].dislikes<0) r[0].dislikes=0;
  }
  else
    r[0].dislikes++;

  let rr=await req.knex("t_chat").update({dislikes:r[0].dislikes},"*").where({id:req.body.id});
  res.json(rr[0]);
})


router.post("/modChat", async (req, res)=>{

  let r= await req.knex.select("*").from("t_rooms").where({uuid:req.body.uuid});
  if(r.length==0)
    return res.sendStatus(404)

  let rr=await req.knex("t_chat").update({isMod:req.body.item.isMod},"*").where({id:req.body.item.id});
  res.json(rr[0]);
})
router.post("/delChat", async (req, res)=>{

  let r= await req.knex.select("*").from("t_rooms").where({uuid:req.body.uuid});
  if(r.length==0)
    return res.sendStatus(404)

  let rr=await req.knex("t_chat").update({isDeleted:new Date()},"*").where({id:req.body.item.id});
  res.json(rr[0]);
})

router.post("/modQ", async (req, res)=>{

  let r= await req.knex.select("*").from("t_rooms").where({uuid:req.body.uuid});
  if(r.length==0)
    return res.sendStatus(404)

  let rr=await req.knex("t_q").update({isMod:req.body.item.isMod},"*").where({id:req.body.item.id});
  res.json(rr[0]);
})
router.post("/delQ", async (req, res)=>{

  let r= await req.knex.select("*").from("t_rooms").where({uuid:req.body.uuid});
  if(r.length==0)
    return res.sendStatus(404)

  let rr=await req.knex("t_q").update({isDeleted:new Date()},"*").where({id:req.body.item.id});
  res.json(rr[0]);
})

router.post("/qlike", async (req, res)=>{

  let r= await req.knex.select("*").from("t_q").where({id:req.body.id});
  if(r.length==0)
    return res.sendStatus(404)
  if(req.body.undo)
  {
    r[0].likes--;
    if(r[0].likes<0) r[0].likes=0;
  }
  else
    r[0].likes++;
  console.log(r[0].likes);
  let rr=await req.knex("t_q").update({likes:r[0].likes},"*").where({id:req.body.id});
  res.json(rr[0]);
})
router.post("/qdislike", async (req, res)=>{

  let r= await req.knex.select("*").from("t_q").where({id:req.body.id});
  if(r.length==0)
    return res.sendStatus(404)


  if(req.body.undo)
  {
    r[0].dislikes--;
    if(r[0].dislikes<0) r[0].dislikes=0;
  }
  else
    r[0].dislikes++;

  let rr=await req.knex("t_q").update({dislikes:r[0].dislikes},"*").where({id:req.body.id});
  res.json(rr[0]);
})

router.post("/q", async (req, res)=>{

  let room=await  req.knex.select("*").from("t_rooms").where({ publicUUID:req.body.id});
  if(room.length==0)
    return res.sendStatus(404);
  let r= await req.knex("t_q").insert({ roomPublicUUID:req.body.id, text:req.body.text, userid:req.body.userid},"*");
  let rr=await req.knex("v_q").where({id:r[0].id});
  res.json(rr[0]);
})
router.get("/q/:id", async (req, res)=>{

  let rr=await req.knex("v_q").where({roomPublicUUID:req.params.id}).orderBy("createDate");
  res.json(rr);
})


router.post("/chatFile", upload.single('file'), async (req, res)=>{

  let room=await  req.knex.select("*").from("t_rooms").where({ publicUUID:req.body.id});
  if(room.length==0)
    return res.sendStatus(404);
  let r= await req.knex("t_chat").insert({ roomPublicUUID:req.body.id,  userid:req.body.userid, file:req.file.path, fileName:Buffer.from(req.file.originalname, 'latin1').toString('utf8') , fileType:req.file.mimetype, fileSize:req.file.size},"*");
  let rr=await req.knex("v_chat").where({id:r[0].id});
  res.json(rr[0]);
})
router.post("/qFile", upload.single('file'), async (req, res)=>{

  let room=await  req.knex.select("*").from("t_rooms").where({ publicUUID:req.body.id});
  if(room.length==0)
    return res.sendStatus(404);
  let r= await req.knex("t_q").insert({ roomPublicUUID:req.body.id,  userid:req.body.userid, file:req.file.path, fileName:Buffer.from(req.file.originalname, 'latin1').toString('utf8') , fileType:req.file.mimetype, fileSize:req.file.size},"*");
  console.log(r)
  let rr=await req.knex("v_q").where({id:r[0].id});
  res.json(rr[0]);
})
router.get("/downloadFile/:id", async (req, res)=>{

  let r=await req.knex("t_chat").where({id:req.params.id});
  if(r.length==0){
     r=await req.knex("t_q").where({id:req.params.id});
    if(r.length==0)
      return res.sendStatus(404);
  }


  let p=path.join(__dirname,"../",r[0].file);
  console.log(p)
  res.type(r[0].fileType)
  res.sendFile(p)

})

async function getVotes(req,roomPublicUUID, id){

  let r=await req.knex.select("*").from("t_vote").where({isDeleted:false,roomPublicUUID:roomPublicUUID}).orderBy("createDate");
  console.log("r", r)
  if(id)
    r=r.filter(v=>{return v.id==id});
  for(let item of r){
    item.answers=await( req.knex.select("*").from("t_voteanswers").where({voteid:item.id, isDeleted:false}).orderBy("createDate"));
  }
  return r;
}

router.post("/addVote", async (req, res, next) => {
  let r=await req.knex.select("*").from("t_rooms").where({uuid:req.body.uuid, isDeleted:null});

  if(r.length==0)
    return res.sendStatus(404)

  let rr=await req.knex("t_vote").insert({roomPublicUUID:r[0].publicUUID}, "*");

  return  res.json(await getVotes(req, r[0].publicUUID, rr[0].id));
});
router.post("/voteTitleChange", async (req, res, next) => {
  let r=await req.knex.select("*").from("t_rooms").where({uuid:req.body.uuid, isDeleted:null});
  if(r.length==0)
    return res.sendStatus(404)
  console.log(req.body)
  r=await req.knex("t_vote").update({title:req.body.item.title}, "*").where({id:req.body.item.id});
  res.json(r[0]);
});




module.exports = router;
