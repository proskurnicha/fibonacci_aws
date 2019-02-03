const express = require("express");
const bodyParser = require("body-parser");
  
const app = express();
  
function fib(n) {
	let fibonachi = [0, 1];
	for (i = 2; i <= n; i ++) {
		fibonachi[i] = fibonachi[i-1] + fibonachi[i-2];
	}
	return fibonachi[n];
}

const urlencodedParser = bodyParser.urlencoded({extended: false});
 
app.get("/fibonachi", urlencodedParser, function (request, response) {
    response.sendFile(__dirname + "/public/index.html");
});
app.post("/fibonachi", urlencodedParser, function (request, response) {
    if(!request.body) return response.sendStatus(400);
    const number = request.body.number;
    let result = fib(number);
    response.send(`${result}`);
});
  
app.get("/", function(request, response){
    response.send("Главная страница");
});
  
app.listen(3000);
