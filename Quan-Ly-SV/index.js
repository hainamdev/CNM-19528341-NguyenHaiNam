const express = require("express");
const app = express();
const multer = require("multer");
const load = multer();


app.use(express.static("./templates"));
app.set("view engine", "ejs");
app.set("views","./templates");

const AWS  = require("aws-sdk");
const config = new AWS.Config({
    accessKeyId: "AKIA6BB4UOZQV33OZ2R4",
    secretAccessKey:"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",
    region:"ap-southeast-1"
});

AWS.config = config;

const docClient = new AWS.DynamoDB.DocumentClient();
const tableName = "DS_Sinh_Vien";

app.get("/" , (req,res) => {
    const params = {
        TableName : tableName
    }
    docClient.scan(params , (err,data) =>{
        if(err)
            console.log(err);
        else
            return res.render("table", {data:data.Items});
    });
});
app.get("/form-add" , (req,res) => {
     return res.render("form",{error:""});
});

app.post("/delete" , load.fields([]) , (req,res) =>{
    const {maSinhVien} = req.body;
    const params = {
        TableName : tableName,
        Key :{
            "maSinhVien" : maSinhVien
        }
    } 
    docClient.delete(params,(err,data) =>{
        if(err)
        console.log(err);
        else
            return res.redirect("/");
    });

});

app.post("/" , load.fields([]) , (req,res) =>{
    const {maSinhVien,tenSinhVien, ngaySinh} = req.body;
    const params = {
        TableName : tableName,
        Item :{
            "maSinhVien" : maSinhVien,
            "tenSinhVien" : tenSinhVien,
            "ngaySinh":String(ngaySinh)
        },
        ConditionExpression: "attribute_not_exists(maSinhVien)"
    } 
    docClient.put(params,(err,data) =>{
        if(err){
            if(err.code == "ConditionalCheckFailedException"){
                return res.render("form", {error:"Mã sinh viên đã tồn tại"});
            }else
                console.log(err);
        }
        else
            return res.redirect("/");
    });

});

app.listen(7979,()=>{
    console.log("running in port 7979");
});