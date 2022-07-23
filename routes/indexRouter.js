var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.get('/test', function(req, res, next) {
  res.render('test', { title: 'Express' });
});
router.get('/roomBox/:id/:lang?', async (req, res, next)=> {
  if(req.params.lang!="ru" || req.params.lang!="en")
    req.params.lang="ru"
  res.render('roomBox', { id: req.params.id, lang:req.params.lang });
});



module.exports = router;