var express = require('express');
var router = express.Router();

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
  let chat=await req.knex("v_chat").where({roomPublicUUID:req.params.id}).orderBy("createDate", ).limit(100);

  res.json({status:r[0], chat})
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



module.exports = router;
