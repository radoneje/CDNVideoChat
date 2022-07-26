var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.get('/test/:id/:lang?', function(req, res, next) {
  if(req.params.lang!="ru" || req.params.lang!="en")
    req.params.lang="ru"
  res.render('test', { id: req.params.id, lang:req.params.lang });
});
router.get('/admin', function(req, res, next) {
  if(!req.session.admin)
    return res.render('adminLogin', { title: 'login' });
  return res.render('admin', );
});
router.post('/adminLogin', function(req, res, next) {
  if(req.body.l=="editor" && req.body.p=="dfczgegrby") {
    req.session.admin = true;
    return res.json({status: 200});
  }
  req.session.admin = false;
  return res.json({status: 404});
});

router.get('/room/box/:id/:lang?', async (req, res, next)=> {
  if(req.params.lang!="ru" || req.params.lang!="en")
    req.params.lang="ru"
  res.render('roomBox', { id: req.params.id, lang:req.params.lang });
});

router.get('/moderator/:id', async (req, res, next)=> {
  try {
    let r = await req.knex.select("*").from("t_rooms").where({isDeleted: null, uuid: req.params.id});
    if (r.length == 0)
      return res.sendStatus(404);
    res.render('moderator', {room: r, isModerator:true});
  }catch (e){
    console.trace(e);
    res.sendStatus(500)
  }
});



module.exports = router;
