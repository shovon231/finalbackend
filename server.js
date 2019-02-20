let express = require("express")
let cors = require("cors")
let bodyParser = require("body-parser")
var fs = require("fs")
let multer = require("multer")
let upload = multer({ dest: __dirname + "/images/" })
let app = express()

app.use(cors())
app.use(express.static("images"))

const MongoClient = require("mongodb").MongoClient
const url = "mongodb://admin:admin123@ds225375.mlab.com:25375/mydb"
let genarateId = function() {
  return "" + Math.floor(Math.random() * 100000000)
}

app.post("/upload", upload.array("pictures[]", 10), (req, res) => {
  console.log("**** inside in the upload endpoint")
  console.log("body", req.body)
  console.log("files", req.files)
  let newName = ""
  let filesName = []
  if (req.files === undefined) {
    console.log("no pic uploaded")
  } else {
    for (i = 0; i < req.files.length; i++) {
      let extension = req.files[i].originalname.split(".").pop()
      //console.log("extension", extension)

      fs.renameSync(req.files[i].path, req.files[i].path + "." + extension)
      //for (j = 0; j <= i; j++) {
      newName = req.files[i].filename + "." + extension
      filesName.push(req.files[i].filename + "." + extension)
      //}
      console.log("new name", newName, extension)
    }
    console.log("fileNams", filesName)
  }
  MongoClient.connect(url, (err, db) => {
    console.log("****inside the mongoclient db")
    if (err) {
      console.log("1")
      throw err
    }
    let dbo = db.db("mydb")
    dbo
      .collection("sellerinfo")
      .insertOne({ ...req.body, image: filesName }, (err, result) => {
        //
        if (err) {
          console.log("2")
          throw err
        }
        console.log("success")
        let responseBody = {
          status: true,
          message: "successfuly insert data"
        }
        db.close()
        res.send(JSON.stringify(responseBody))
      })
  })
})

app.get("/getitem", (req, res) => {
  console.log("***** in the getitems")
  //let body = JSON.parse(req.body)
  let body = req.body
  console.log("req.query", body)
  //console.log("category", category)
  MongoClient.connect(url, function(err, db) {
    console.log("connected")
    if (err) throw err
    console.log("after error")
    var dbo = db.db("mydb")
    console.log("after dbo")
    dbo
      .collection("category")
      .find({})
      .toArray(function(err, result) {
        if (err) throw err
        console.log("result", result)
        db.close()
        res.send(JSON.stringify(result))
      })
  })
})

app.get("/searchitem", (req, res) => {
  console.log("***** in the getitems")
  //let body = JSON.parse(req.body)
  console.log("req.query", req.query)
  let category = req.query.category

  if (category === "") {
    MongoClient.connect(url, function(err, db) {
      console.log("connected")
      if (err) throw err
      console.log("after error")
      var dbo = db.db("mydb")
      console.log("after dbo")
      dbo
        .collection("category")
        .find({})
        .toArray(function(err, result) {
          if (err) throw err
          console.log("result", result)
          db.close()
          res.send(JSON.stringify(result))
        })
    })
  } else {
    MongoClient.connect(url, function(err, db) {
      console.log("connected")
      if (err) throw err
      console.log("after error")
      var dbo = db.db("mydb")
      console.log("after dbo")
      dbo
        .collection("category")
        .find({ category })
        .toArray(function(err, result) {
          if (err) throw err
          console.log("result", result)
          db.close()
          res.send(JSON.stringify(result))
        })
    })
  }
})

app.use(bodyParser.raw({ type: "*/*" }))

// app.post("/getitem", (req, res) => {
//   console.log("***** in the get Item by category")
//   console.log("body", req.body.toString())
//   let body = JSON.parse(req.body)
//   //let review = JSON.parse(req.body)
//   // let body = req.body
//   // console.log(body)
//   // let category = body.category.toString()
//   // console.log("category", category)

//   console.log("body", body.toString())
//   MongoClient.connect(url, function(err, db) {
//     console.log("connected")
//     if (err) throw err
//     console.log("after error")
//     var dbo = db.db("mydb")
//     console.log("after dbo")
//     dbo
//       .collection("category")
//       .find({ category: body.category })
//       .toArray(function(err, result) {
//         if (err) throw err
//         console.log(result)
//         // let y = function(x) {
//         //   return x.review
//         // }
//         // let x = result.map(y)
//         let response = {
//           status: true,
//           reviews: "result"
//         }

//         db.close()
//         res.send(JSON.stringify(result))
//       })
//   })
// })

app.post("/signup", function(req, res) {
  console.log("**** inside in the signup endpoint")
  let body = JSON.parse(req.body)
  console.log("user", body)
  MongoClient.connect(url, (err, db) => {
    if (err) throw err
    let dbo = db.db("mydb")
    dbo.collection("user").insertOne(body, (err, result) => {
      if (err) throw err
      console.log("success")
      let response = {
        status: true,
        message: "successfuly insert data"
      }
      db.close()
      res.send(JSON.stringify(response))
    })
  })
})

app.post("/login", function(req, res) {
  console.log("**** inside in the login endpoint")
  let body = JSON.parse(req.body)
  console.log("search", body)
  let userEmail = body.email
  let enteredPassword = body.password
  console.log("userEmail: ", userEmail)
  console.log("password: ", enteredPassword)
  MongoClient.connect(url, (err, db) => {
    if (err) throw err
    let dbo = db.db("mydb")
    let query = {
      email: userEmail,
      password: enteredPassword
    }
    console.log("query", query)
    dbo
      .collection("user")
      .find(query)
      .toArray((err, result) => {
        if (err) throw err
        console.log("result", result)
        if (result.length === 0) {
          console.log("password didn't match!!")
          res.send(JSON.stringify({ success: false }))
          return
        }
        let response = {
          status: true,
          sid: genarateId()
        }
        console.log("response: ", response)
        db.close()
        res.send(JSON.stringify(response))
      })
  })
})

app.listen(80, function() {
  console.log("Server started on port 80")
})
