const express = require("express");
const bodyParser = require("body-parser");
require('dotenv').load();
const aws = require('aws-sdk');
const jsonParser = express.json();

const s3 = new aws.S3({
    accessKeyId: process.env.USER_ID,
    secretAccessKey: process.env.USER_SECRET_KEY,
});

const app = express();
app.use(express.static('public'));

  
const fibonacci = (n) => n > 2 ? (fibonacci(n - 1) + fibonacci(n - 2)) : 1;

const fibonacciWithCache = (n, S3) => {
    return new Promise(resolve => {
    const params = {
        Bucket: process.env.BUCKET_NAME,
        Key: 'cache.json',
    }

    S3.getObject(params)
        .promise()
        .then((data) => {
            const fileData = JSON.parse(data.Body.toString('utf8'));
            if (fileData[n]) {
                resolve(fileData[n]);
            } else {
                const {res, cachedItem} = fibonacciWithCachedResult(n);

                S3.upload(Object.assign(params, {Body: JSON.stringify(cachedItem)}), (err, data) => {});
                
                resolve(res);
            }
        })
        .catch((err) => {               
            console.log(err);
            const {res, cachedItem} = fibonacciWithCachedResult(n);

            S3.upload(Object.assign(params, {Body: JSON.stringify(cachedItem)}), (err, data) => {});
        
            resolve(res);});
        })
}

const fibonacciWithCachedResult = (n) => {
    let arr = [0, 1];
    let cachedItem = {'1': 1}
    for (let i = 2; i < Number(n) + 1; i++) {
        let num = arr[i - 2] + arr[i - 1];
        cachedItem = Object.assign(cachedItem, {[i]: num});
        arr.push(num);
    }
   return {res: arr[n], cachedItem}
}
 
app.get("/fibonacci", jsonParser, function (request, response) {
    response.sendFile(__dirname + "/public/index.html");
});

app.post("/fibonacci", jsonParser, function (request, response) {
    fibonacciWithCache(request.body.number, s3)
        .then(data => response.json(data));
});
  
app.get("/", function(request, response){
    response.send("Main, go to the /fibonacci");
});
  
app.listen(3000);
