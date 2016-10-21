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
const db = new loki(databasePath)
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
    db.saveDatabase()
    res.status(200).send("Database updated")
  }else {
    res.status(403).send("Duplicate Student")
  }
})

app.put('/', (req, res) => {
  // Get the put contents
  const sessionID = req.body.sessionID
  const payload = req.body.payload
  const stringPayload = JSON.stringify(payload)
  // TODO: Update a students information
  res.send(stringPayload)
})

app.delete('/', (req, res) => {
  // Get the id of the student to be deleted
  const sessionID = req.body.sessionID
  const studentID = req.body.id
  // TODO: Actually delete a record from the database
  res.send(studentID)
})

app.listen(3000, () => {
  console.log("Example app listening on port 3000")
})
