const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const connection = require("./database/database");
const Ask = require("./database/Ask");
const Answer = require("./database/Answer");
//DataBase
connection
    .authenticate()
    .then(() => {
        console.log("Conexão feita com o banco de dados");
    })
    .catch((msgErro) => {
        console.log(msgErro);
    });
//Use EJS how View Engine
app.set('view engine', 'ejs');
//Use static files
app.use(express.static('public'));
//body parser
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//rotas
app.get("/", (req, res) => {//home
    Ask.findAll({raw: true, order: [
        ['id', 'desc'] //ASC = Crescente; DESC = Decrescente
    ]}).then(questions => {
        res.render("index", {
                questions: questions
        });
    });
});

app.get("/ask", (req, res) => {//ask
    res.render("ask");
});

app.post("/ask/save", (req, res) => {//save ask
    var title = req.body.title;
    var description = req.body.description;
    Ask.create({
        title: title,
        description: description
    }).then(() => {
        res.redirect("/");
    });
});

app.get("/question/:id", (req, res) => {
    var id = req.params.id;
    Ask.findOne({
        where: {id: id}
    }).then(question => {
        if(question != undefined){ //The question is real

            Answer.findAll({
                order: [['id', 'desc']],
                where: {questionId: question.id}
            }).then(answers => {
                res.render("question", {
                    question: question,
                    answers: answers
                });
            });
            
        }else{//The question is not real
            res.redirect("/");
        }
    });

});

app.post("/answer", (req, res) => {
    var body = req.body.body;
    var questionId = req.body.questionId;
    Answer.create({
        body: body,
        questionId: questionId
    }).then(() => {
        res.redirect("/question/" + questionId);
    });
});

app.listen(8080, ()=>{console.log("App rodando");});