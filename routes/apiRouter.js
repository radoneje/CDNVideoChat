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
    let r=await req.knex("t_rooms").insert({},"*");
    return res.json(r);
  }

    res.json([]);//TODO: add UPDATE
});
router.get('/room/:skip?', async (req, res, next) =>{
  if(!req.session.admin)
    return res.status(401)

  let r= await req.knex.select("*").from("t_rooms").where({isDeleted:null}).orderBy("dateCreated","desc").limit(50).offset(Number(r.params.skip)|| 0)
  let total= await req.knex.count('id as CNT').from("t_rooms").where({isDeleted:null})
  res.json({total:total[0].CNT, skip:r.params.skip, rooms:r});
});

module.exports = router;
