const express = require('express')
const bodyParser = require('body-parser')
const loki = require('lokijs')
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
  const responseFormat = req.query.format
  const version = parseInt(req.query.version)
  const request = req.query.get

  let format
  if (responseFormat) {
    format = responseFormat.toLowerCase()
  }

  // ensure the url parameters are valid
  if ( ((format && world.responseFormats.indexOf(format) === -1)) || !version || !request ){
    const response = {
      successful: false,
      message: "Malformed or Incorrect URL Parameters"
    }
    res.status(400).send(JSON.stringify(response))
    return
  }

  // Result that will be sent
  let response

  // Switch statement to handle different API versions
  switch (version) {
    case 1.0 :
      // Switch to handle request type
      switch (request) {
        case "single":
          // Get the student ID from the url
          const studentId = req.query.id;

          if (!studentId) {
            const response = {
              successful: false,
              message: "No Student ID Given"
            }
            res.status(400).send(JSON.stringify(response))
            return
          }

          // Query the database for the id
          let studentInfo = students.findOne({id: parseInt(studentId)})
          if (studentInfo) {
            delete studentInfo['meta']
            delete studentInfo['$loki']

            const response = {
              successful: true,
              data: studentInfo,
              message: "Student Details Retrieved"
            }

            res.status(200).send(JSON.stringify(response))
          }else{
            const response = {
              successful: false,
              message: "Student doesn't exist"
            }

            res.status(404).send(JSON.stringify(response))
          }
          break

        case "all":
          // Get all the items in the collection
          let results = students.data

          // If its not empty, remove lokijs metadata
          if ( results[0] ){
            for (let result of results){
              delete result['meta']
              delete result['$loki']
            }

            const response = {
              successful: true,
              data: results,
              message: "Students retrieved"
            }

            res.status(200).send(JSON.stringify(response))
          } else {
            const response = {
              successful: false,
              message: "No Students found in Collection"
            }

            res.status(404).send(JSON.stringify(response))
          }
          break

        default:
          const response = {
            successful: false,
            message: "Unrecognized request type"
          }

          res.status(400).send(JSON.stringify(response))
      }
      break
  }
})

app.post('/', (req, res) => {
  // Get post contents
  const payload = req.body

  // Ensure the necessary attributes was submitted
  if(!req.body.id || !req.body.forename || !req.body.surname || !req.body.DOB || !req.body.course || !req.body.year){
    const response = {
      successful: false,
      message: "Missing values"
    }
    res.status(400).send(JSON.stringify(response))
    return
  }

  // Copy the desired attributes, leave out any undesired attributes
  let student = {
    id: req.body.id,
    forename: req.body.forename,
    surname: req.body.surname,
    DOB: req.body.DOB,
    course: req.body.course,
    year: req.body.year
  }

  // Check to make sure there's no repeat of student IDs
  const queryResult = students.findOne({id: parseInt(student.id)})
  if (!queryResult) {
    const result = students.insert(student)
    if(result){
      const response = {
        successful: true,
        message: "Database updated"
      }
      res.status(200).send(JSON.stringify(response))
    }else{
      const response = {
        successful: false,
        message: "Error updating database"
      }
      res.status(501).send(JSON.stringify(response))
    }
  }else {
    const response = {
      successful: false,
      message: "Duplicated Student"
    }
    res.status(200).send(JSON.stringify(response))
  }
})

app.put('/', (req, res) => {
  const payload = req.body
  // Only the id attribute is necessary for this request
  if(!payload.id){
    const response = {
      successful: false,
      message: "Malformed request"
    }

    res.status(400).send(JSON.stringify(response))
    return
  }

  // Retrieve the students details from the database
  let queryResult = students.findOne({id: parseInt(payload.id)})

  if (queryResult) {
    // Update the values of the object in the database with
    // those of the PUT request
    for (let key in payload) {
      queryResult[key] = payload[key];
    }

    const result = students.update(queryResult)

    if (result) {
      const response = {
        successful: true,
        message: "Update Successful"
      }
      res.status(200).send(JSON.stringify(response))
    } else {
      const response = {
        successful: false,
        message: "Error updating database"
      }
      res.status(501).send(JSON.stringify(response))
    }
  }else{
    const result = {
      successful: false,
      message: "Student record not found"
    }
    res.status(404).send(JSON.stringify(result))
  }
})

app.delete('/', (req, res) => {
  // Get the id of the student to be deleted
  const studentID = req.body.id

  // If studentID is undefined, send back an error
  if (!studentID) {
    const response = {
      successful: false,
      message: "Malformed request"
    }
    res.status(400).send(JSON.stringify(response))
    return
  }

  // Find the students document in the collection to be deleted by ID
  const studentDocument = students.findOne({id: parseInt(studentID)})
  if (studentDocument){
    const result = students.remove(studentDocument)

    if (result) {
      const response = {
        successful: true,
        message: "Delete Successful"
      }
      res.status(200).send(JSON.stringify(response))
    } else {
      const response = {
        successful: false,
        message: "Internal error deleting student"
      }
      res.status(501).send(JSON.stringify(response))
    }
  } else{
    const response = {
      successful: false,
      message: "Student not found"
    }
    res.status(404).send(JSON.stringify(response))
  }

})

app.listen(3000, () => {
  console.log("Example app listening on port 3000")
})
