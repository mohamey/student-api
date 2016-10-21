const express = require('express')
const bodyParser = require('body-parser')
const loki = require('lokijs')
const Promise = require('bluebird')
const fs = require('fs')
const app = express()

// Configure middleware for the express application
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: true
}))

// Global Constants
const world = {
  responseFormats: ["json"]
}

// Initialise lokijs database variables
var students
const databasePath = 'students.json'
const collection = 'students'

// Load existing database if available, then load students collection
const db = new loki(databasePath, {
  autosave: true,
  autosaveInterval: 1000
})

db.loadDatabase({}, () => {
  students = db.getCollection(collection)
  if (!students){
    students = db.addCollection(collection)
  }
})

// Handle API Get requests
app.get('/', (req, res) => {
  // Get the request parameters
  const format = req.query.format.toLowerCase()
  const version = parseInt(req.query.version)
  const request = req.query.get

  // ensure the url parameters are valid
  if ( ((format && world.responseFormats.indexOf(format) === -1)) || !version || !request ){
    res.send("Invalid API Request")
    return
  }

  // Result that will be sent
  let payload

  // Switch statement to handle different API versions
  switch (version) {
    case 1.0 :
      // Switch to handle request type
      switch (request) {
        case "single":
          // Get the student ID from the url
          const studentId = req.query.id;

          // Query the database for the id
          let studentInfo = students.findOne({id: parseInt(studentId)})
          if (studentInfo) {
            delete studentInfo['meta']
            delete studentInfo['$loki']
            payload = studentInfo
          }else{
            payload = {}
          }
          break;

        case "all":
          // TODO: Retrieve all students from the database send it back
          // Get all the items in the collection
          let results = students.data

          // If its not empty, remove lokijs metadata
          if ( results !== [] ){
            for (let result of results){
              delete result['meta']
              delete result['$loki']
            }
            payload = results
          } else {
            payload = []
          }
          break;
      }
      break;
  }

  // Send the response back
  res.send(payload)
})

app.post('/', (req, res) => {
  // Get post contents
  const sessionID = req.body.sessionID
  const payload = req.body.payload

  // Check to make sure there's no repeat of student IDs
  const queryResult = students.findOne({id: parseInt(payload.id)})
  if (!queryResult) {
    students.insert(payload)
    res.status(200).send("Database updated")
  }else {
    res.status(403).send("Duplicate Student")
  }
})

app.put('/', (req, res) => {
  // Get the put contents
  const sessionID = req.body.sessionID
  const payload = req.body.payload

  // Retrieve the students details from the database
  let queryResult = students.findOne({id: parseInt(payload.id)})

  if (queryResult) {
    // Update the values of the object in the database with
    // those of the PUT request
    for (let key in payload) {
      queryResult[key] = payload[key];
    }

    students.update(queryResult)

    res.status(200).send("Update Successful")
  }else{
    res.status(404).send("Record not found")
  }
})

app.delete('/', (req, res) => {
  // Get the id of the student to be deleted
  const sessionID = req.body.sessionID
  const studentID = req.body.id

  // Find the students document in the collection to be deleted by ID
  const studentDocument = students.findOne({id: parseInt(studentID)})
  if (studentDocument){
    const result = students.remove(studentDocument)

    if (result) {
      res.status(200).send("Delete successful")
    } else {
      res.status(403).send("An error occurred deleting the document")
    }
  } else{
    res.status(404).send("Document not found")
  }

})

app.listen(3000, () => {
  console.log("Example app listening on port 3000")
})
