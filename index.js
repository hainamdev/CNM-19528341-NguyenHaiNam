const express = require("express");
const app = express();
const multer = require('multer');
const load = multer();
require('dotenv').config();

app.use(express.static('./templates'));
app.set('view engine', "ejs");
app.set("views", "./templates")


const AWS = require("aws-sdk");
const config = new AWS.Config({
    accessKeyId: process.env.AWS_AccessKey,
    secretAccessKey: process.env.AWS_SecretKey,
    region: process.env.AWS_region
});
AWS.config = config;

const docClient = new AWS.DynamoDB.DocumentClient();
const tableName = 'paper';

app.get("/", (req, res) => {
    // res.send("hello world");
    const params = {
        TableName: tableName
    };
    docClient.scan(params, (err, data) => {
        if (err)
            console.log("error reder table.ejs");
        else
            return res.render("table", { data: data.Items });
    });

});

app.get("/them-bai-bao", (req, res) => {
    res.render("form");
});

app.post("/", load.fields([]), (req, res) => {
    var id = 1;
    const { name, authors, ISBN, page, year } = req.body;
    const params = {
        TableName: tableName
    };
    docClient.scan(params, (err, data) => {
        data.Items.forEach(function(o) {
            id = (o.id * 1) + 1 > id ? ((o.id * 1) + 1) : id;
        });
        const params_2 = {
            TableName: tableName,
            Item: {
                "id": String(id),
                "name": name,
                "authors": authors,
                "ISBN": ISBN,
                "page": Number(page),
                "year": Number(year)
            }
        };
        docClient.put(params_2, (err, data) => {
            if (err)
                return res.send('loi tiep roi m ' + err);
            else
                return res.redirect('/');
        });
    });
});

app.post("/delete", load.fields([]) , (req,res) => {
    const {id} = req.body;
    const params = {
        TableName : tableName,
        Key:{
            "id" : id
        }
    }
    docClient.delete(params, (err,data) =>{
        if(err)
            console.log("error delete item");
        else
            return res.redirect('/');
    });
});


app.listen(7979, () => {
    console.log("server is running in port 7979");
});