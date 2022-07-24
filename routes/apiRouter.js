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
  let r= await req.knex.select('*').from("t_rooms").where({isDelete:false, publicUUID:req.params.id});
  if(r.length==0)
    return res.sendStatus(404);
  delete r[0].uuid;

  res.json(r[0])
})
module.exports = router;
