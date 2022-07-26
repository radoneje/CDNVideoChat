let express = require('express');
let router = express.Router();
const path = require('path');
const fsPromises = require('fs').promises;
const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })
var xl = require('excel4node');

async function checkAdmin(req, res, next) {
  let check=await req.knex.select("*").from("t_rooms").where({uuid:req.body.uuid, isDeleted:null});
  if(check.length==0)
    return res.sendStatus(404)
  next();
}
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
  for(let item of votes){
    item.answers=await( req.knex.select("*").from("t_voteanswers").where({voteid:item.id, isDeleted:false}).orderBy("id"));
    let total=0;
    item.answers.forEach(a=>{total+=a.count});
    item.total=total;
  }

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

  res.type(r[0].fileType)


  res.set("Content-Disposition", "attachment; filename=file"+path.extname(r[0].fileName));
  res.sendFile(p)

})

async function getVotes(req,roomPublicUUID, id){

  let r=await req.knex.select("*").from("t_vote").where({isDeleted:false,roomPublicUUID:roomPublicUUID}).orderBy("createDate");

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
  let rrr=await await getVotes(req, r[0].publicUUID, rr[0].id)
  return  res.json(rrr[0]);
});
router.post("/voteTitleChange", async (req, res, next) => {
  let r=await req.knex.select("*").from("t_rooms").where({uuid:req.body.uuid, isDeleted:null});
  if(r.length==0)
    return res.sendStatus(404)

  r=await req.knex("t_vote").update({title:req.body.item.title}, "*").where({id:req.body.item.id});
  res.json(r[0]);
});

router.post("/multyVote", checkAdmin,async (req, res, next) => {


  let r=await req.knex("t_vote").update({multy:req.body.multy},"*").where({id:req.body.id});
  res.json(r[0]);
});

router.post("/deleteVote", checkAdmin, async (req, res, next) => {
  let r=await req.knex("t_vote").update({isDeleted:true},"*").where({id:req.body.id});
  res.json({id:r[0].id});
});

router.post("/startVote", checkAdmin, async (req, res, next) => {
  let r=await req.knex("t_vote").update({isactive:req.body.isactive},"*").where({id:req.body.id});
  res.json(r[0]);
});

router.post("/resultVote", checkAdmin, async (req, res, next) => {
  let r=await req.knex("t_vote").update({iscompl:req.body.iscompl},"*").where({id:req.body.id});
  res.json(r[0]);
});
router.post("/clearVote", checkAdmin, async (req, res, next) => {
  let r=await req.knex("t_voteanswers").update({count:0}).where({voteid:req.body.id});
  res.json(0);
});
router.post("/addAnswer", checkAdmin, async (req, res, next) => {
  let r = await req.knex("t_voteanswers").insert({voteid:req.body.id}, "*");
  res.json(r[0])
})


router.post("/aVote", checkAdmin, async (req, res, next) => {
  let r = await req.knex.select("*").from("t_voteanswers").where({id:req.body.id});

  r= await req.knex("t_voteanswers").update({count:(r[0].count+1)}, "*").where({id:req.body.id});
  res.json(r[0])
})

router.post("/changeAnswer", checkAdmin, async (req, res, next) => {
  let r = await req.knex("t_voteanswers").update({title:req.body.title}, "*").where({id:req.body.id});
  res.json(r[0])
})
router.post("/deleteAnswer", checkAdmin, async (req, res, next) => {
  let r = await req.knex("t_voteanswers").update({isDeleted:true}, "*").where({id:req.body.id});
  res.json(r[0])
})

router.post("/reVote", /*checkLogin,*/ async (req, res)=>{
  try {
    let r = await req.knex.select("*").from("t_voteanswers").where({id: req.body.id});
    let count=r[0].count - 1;

    if(count<0)
      count =0;
    r = await req.knex("t_voteanswers").update({count:count }, "*").where({id: req.body.id});
    res.json(r[0])
  }
  catch (e){
    console.warn(e);
    res.json("error");
  }
})
router.post("/vote", /*checkLogin,*/ async (req, res)=>{
  try {
    let r = await req.knex.select("*").from("t_voteanswers").where({id: req.body.id});
    let count=r[0].count + 1;
    r = await req.knex("t_voteanswers").update({count:count }, "*").where({id: req.body.id});
    res.json(r[0])
  }
  catch (e){
    console.warn(e);
    res.json("error");
  }
})

router.get("/roomToExcel/:id", async (req, res, next) => {
  let rooms=await req.knex.select("*").from("t_rooms").where({uuid:req.params.id, isDeleted:null});
  if(rooms.length==0)
    return res.sendStatus(404)
  let room=rooms[0];

  let wb = new xl.Workbook({dateFormat: 'DD.MM.yyyy HH:mm:ss'});
  let myStyle = wb.createStyle({
    font: {
      bold: true,
    },
    border:{
      bottom:{
        style:'medium'
      }
    }
  });
  let cellStyle = wb.createStyle({
    alignment:{wrapText:true}
  });


  let chatSheet = wb.addWorksheet('Чат')
  let qSheet = wb.addWorksheet('Вопросы');
  let voteSheet = wb.addWorksheet('Голосования');


  let chat=await req.knex.select("*").from("v_chat").where({roomPublicUUID:room.publicUUID}).orderBy("createDate")
  chatSheet.cell(1,1).string('Время').style(myStyle);
  chatSheet.cell(1,2).string('Пользователь').style(myStyle);
  chatSheet.cell(1,3).string('Лайков').style(myStyle);
  chatSheet.cell(1,4).string('Дислайков').style(myStyle);
  chatSheet.cell(1,5).string('Прошел модерацию').style(myStyle);
  chatSheet.cell(1,6).string('Сообщение').style(myStyle);
  chatSheet.cell(1,7).string('Имя файла').style(myStyle);
  chatSheet.cell(1,8).string('Ссылка').style(myStyle);

  chatSheet.column(1).setWidth(30);
  chatSheet.column(2).setWidth(40);
  chatSheet.column(6).setWidth(40);
  chatSheet.column(7).setWidth(40);
  chatSheet.column(8).setWidth(40);

  let row=1;
  for(let item of chat){
    row++;
    chatSheet.cell(row,1).date(new Date(item.createDate)).style(cellStyle);
    chatSheet.cell(row,2).string(item.name).style(cellStyle);
    chatSheet.cell(row,3).number(item.likes || 0).style(cellStyle);
    chatSheet.cell(row,4).number(item.dilikes || 0).style(cellStyle);
    chatSheet.cell(row,5).string(item.isMod?'Да':"Нет").style(cellStyle);
    chatSheet.cell(row,6).string(item.text).style(cellStyle);
    if(item.file) {
      chatSheet.cell(row, 7).string(item.fileName).style(cellStyle);
      chatSheet.cell(row, 8).link('https://in.onevent.online/in/api/downloadFile/'+ item.id).style(cellStyle);
    }
  }
  ////
  let q=await req.knex.select("*").from("v_q").where({roomPublicUUID:room.publicUUID}).orderBy("createDate")
  qSheet.cell(1,1).string('Время').style(myStyle);
  qSheet.cell(1,2).string('Пользователь').style(myStyle);
  qSheet.cell(1,3).string('Лайков').style(myStyle);
  qSheet.cell(1,4).string('Дислайков').style(myStyle);
  qSheet.cell(1,5).string('Прошел модерацию').style(myStyle);
  qSheet.cell(1,6).string('Сообщение').style(myStyle);
  qSheet.cell(1,7).string('Имя файла').style(myStyle);
  qSheet.cell(1,8).string('Ссылка').style(myStyle);

  qSheet.column(1).setWidth(30);
  qSheet.column(2).setWidth(40);
  qSheet.column(6).setWidth(40);
  qSheet.column(7).setWidth(40);
  qSheet.column(8).setWidth(40);

   row=1;
  for(let item of q){
    row++;
    qSheet.cell(row,1).date(new Date(item.createDate)).style(cellStyle);
    qSheet.cell(row,2).string(item.name).style(cellStyle);
    qSheet.cell(row,3).number(item.likes || 0).style(cellStyle);
    qSheet.cell(row,4).number(item.dilikes || 0).style(cellStyle);
    qSheet.cell(row,5).string(item.isMod?'Да':"Нет").style(cellStyle);
    qSheet.cell(row,6).string(item.text).style(cellStyle);
    if(item.file) {
      qSheet.cell(row, 7).string(item.fileName).style(cellStyle);
      qSheet.cell(row, 8).link('https://in.onevent.online/in/api/downloadFile/'+ item.id).style(cellStyle);
    }
  }
  ////

  voteSheet.cell(1,1).string('Вопрос').style(myStyle);
  voteSheet.cell(1,2).string('Тип').style(myStyle);
  voteSheet.cell(1,3).string('Ответ').style(myStyle);
  voteSheet.cell(1,4).string('Число голосов').style(myStyle);

  voteSheet.column(1).setWidth(40);
  voteSheet.column(2).setWidth(40);
  voteSheet.column(3).setWidth(40);
  voteSheet.column(4).setWidth(20);


  let vote=await req.knex.select("*").from("t_vote").where({roomPublicUUID:room.publicUUID, isDeleted:false}).orderBy("createDate")
  row=1;
  for(let item of vote){
    row++;
    voteSheet.cell(row,1).string(item.title).style(cellStyle);
    voteSheet.cell(row,2).string(item.multy?"Несколько ответов":"Один ответ").style(cellStyle);
    let answers=await req.knex.select("*").from("t_voteanswers").where({voteid:item.id,isDeleted:false}).orderBy("createDate")
    for(let a of answers){
      row++;
      voteSheet.cell(row,3).string(a.title).style(cellStyle);
      voteSheet.cell(row,4).number(a.count || 0).style(cellStyle);
    }
  }

  wb.write('Excel.xlsx', res);
})




module.exports = router;
