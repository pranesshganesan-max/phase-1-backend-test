const cors = require("cors")
const path = require("path")
const express = require("express")
const bcrypt = require("bcryptjs")
const cookieParser = require("cookie-parser")
const fs = require('fs')
const databasePath = path.join(__dirname,"expense.json")
const userDatabasePath = path.join(__dirname,"users.json")

const app = express()
app.use(express.json())  
app.use(cookieParser())
const salt = bcrypt.genSaltSync(10)
app.get('/', function(req, res) {
    var username = req.cookies.username
    var password = req.cookies.password  
      var userDatabaseFile = fs.readFileSync(userDatabasePath, "utf-8")
     var userDatabaseArray = JSON.parse(userDatabaseFile)
    var item = false
    for(var i = 0; i < userDatabaseArray.length; i = i + 1){        
       if(username === userDatabaseArray[i].username && password === userDatabaseArray[i].password){
            item = true
            break 
        }       
    }
     if(item === true){
        res.redirect("/Expensetracker")
    }
    else{
        res.sendFile(path.join(__dirname, "index.html"))
    }
})

app.get("/Expensetracker",function(req, res, next){
    var username = req.cookies.username
    var password = req.cookies.password
var userDatabaseFile = fs.readFileSync(userDatabasePath,"utf-8")
    var userDatabaseArray = JSON.parse(userDatabaseFile)
var item = false
    var passwordMatch = false
for(i=0;i<userDatabaseArray.length;i=i+1){

        if(username === userDatabaseArray[i].username){

      item = true
 if(password == userDatabaseArray[i].password){
                passwordMatch = true
            }

            break
        }
    }

    if(item == true && passwordMatch == true){
        next()
    }
    else{
        res.redirect("/")
    }
},
function(req,res){
    res.sendFile(path.join(__dirname,"expensetracker.html"))
})
app.get("/viewexpenses", function(req,res){
    console.log(__dirname)
     res.sendFile(path.join(__dirname,"view.html")) 
})
 
app.post("/receiveSignup",function(req,res){
    var username = req.body.username
    var password = req.body.password
    const passwordhash = bcrypt.hashSync(password, salt);
       // const usernamehash = bcrypt.hashSync(username, salt);
        var userDatabaseFile = fs.readFileSync(userDatabasePath,"utf-8")
        var userDatabaseArray = JSON.parse(userDatabaseFile)
      
    
         var item = false
        for(i=0;i<userDatabaseArray.length;i=i+1){        
            if( username === userDatabaseArray[i].username ){  
                          
                 item = true 
                 break
            }       
        }
        if(item == true){
            res.send("Username already exists")
        }
        else if(item == false){
            var x = []
            var obj = {
                "username" : username,
                "password" : passwordhash 
                
            }
            userDatabaseArray.push(obj)
            fs.writeFileSync(userDatabasePath, JSON.stringify(userDatabaseArray))
            res.send("Account created")
        }
    })    
    app.post('/receiveSignin', function(req,res){
        var username = req.body.username
        var password = req.body.password
        var userDatabaseFile = fs.readFileSync(userDatabasePath,"utf-8")
        var userDatabaseArray = JSON.parse(userDatabaseFile)
        var item = false
        var passwordMatch = false
        var stored_password=""
        for(i=0;i<userDatabaseArray.length;i=i+1){        
            if(username === userDatabaseArray[i].username ){             
                 item = true 
                 
                 if(bcrypt.compareSync(password, userDatabaseArray[i].password) == true){
                    passwordMatch = true 
                    stored_password=userDatabaseArray[i].password
                   
                 }
                 
                 break
                 
            }       
        }
        if(item == true && passwordMatch == true){ 
            const password = stored_password
            console.log(password)
            res.cookie("username", username)
           res.cookie("password", password)       
            res.send("Success")
           
        }
        else if(item == false){
            res.send("Username does not exist go sign up")
        }
        else if(item == true && passwordMatch == false)[
            res.send("The password is wrong")
        ] 
    })
    app.post("/logExpenses", function(req,res){
 var date = req.body.date
 console.log(date)
    var expenses = req.body.expenses
    console.log(expenses)
    var username = req.cookies.username
 var expenseDatabaseFile = fs.readFileSync(databasePath,"utf-8")
    var expenseDatabaseArray = JSON.parse(expenseDatabaseFile)
var item = false
for(var i = 0; i < expenseDatabaseArray.length; i = i + 1){ 
    if(username === expenseDatabaseArray[i].username && date === expenseDatabaseArray[i].date){ 
 expenseDatabaseArray[i].expenses.push(expenses)
        item = true
        break
    }
}
if(item == false){ 
    var expenseObject = { 
        "username": username, 
        "date": date, 
        "expenses": [expenses]
    }
 expenseDatabaseArray.push(expenseObject)
    }
console.log(expenseDatabaseArray)
    fs.writeFileSync( databasePath, JSON.stringify(expenseDatabaseArray) )

    res.send("Expenses saved")

})
app.post("/sendExpenses", function(req,res){

    var username = req.body.username
    var date = req.body.date 
    
 var expenseDatabaseFile = fs.readFileSync(databasePath,"utf-8")
 var expenseDatabaseArray = JSON.parse(expenseDatabaseFile)
     for(var i = 0; i < expenseDatabaseArray.length; i = i + 1){

        if(
            username === expenseDatabaseArray[i].username &&   date === expenseDatabaseArray[i].date
        ){

            res.json(expenseDatabaseArray[i])

            break
        }
    }

})

app.post("/deleteExpense", function(req, res){
    var username = req.cookies.username
    var date = req.body.date
    var title = req.body.title
    var amount = req.body.amount

    var expenseDatabaseFile = fs.readFileSync(databasePath, "utf-8")
    var expenseDatabaseArray = JSON.parse(expenseDatabaseFile)

    for(var i = 0; i < expenseDatabaseArray.length; i = i + 1){
        if(username === expenseDatabaseArray[i].username &&
           date === expenseDatabaseArray[i].date){

            var expensesArray = expenseDatabaseArray[i].expenses

            for(var x = 0; x< expensesArray.length; x = x + 1){
                if(expensesArray[x].title === title &&
                   parseFloat(expensesArray[x].amount) === parseFloat(amount)){
             expensesArray.splice(x, 1)
                    break
                }
            }
 fs.writeFileSync(databasePath, JSON.stringify(expenseDatabaseArray))
            res.send("deleted")
            return
        }
    }

    
})


app.post("/editExpense", function(req, res){
    var username = req.cookies.username
    var date = req.body.date
    var oldTitle = req.body.oldTitle
    var oldAmount = req.body.oldAmount
    var title = req.body.title
    var amount = req.body.amount

    var expenseDatabaseFile = fs.readFileSync(databasePath, "utf-8")
    var expenseDatabaseArray = JSON.parse(expenseDatabaseFile)

    for( i = 0; i < expenseDatabaseArray.length; i = i + 1){
        if(username === expenseDatabaseArray[i].username && date === expenseDatabaseArray[i].date){
   var expensesArray = expenseDatabaseArray[i].expenses

            for( x = 0; x < expensesArray.length; x= x + 1){
                if(expensesArray[x].title === oldTitle &&  parseFloat(expensesArray[x].amount) === parseFloat(oldAmount)){
                 expensesArray[x].title = title
                    expensesArray[x].amount = amount
                    break
                }
            }

     fs.writeFileSync(databasePath, JSON.stringify(expenseDatabaseArray))
            res.send("edited")
            return
        }
    }

    res.send("Expense record not found")
})


app.listen(2534, function(){
    console.log("Server has started")
})