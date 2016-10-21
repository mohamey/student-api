var express = require('express')
var app = express();

const world = {
  responseFormats: ["json"]
}

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
          // TODO: Actually send back student information
          payload = `Hannah Archbold - ${studentId}`
          break;
        case "all":
          // TODO: Retrieve all students from the database send it back
          payload = "Heres all the students back buddy"
          break;
      }
      break;
  }

  // Send the response back
  res.send(payload)
})

app.post('/', (req, res) => {
  res.send("Hello World")
  // TODO: Create a new student entry
})

app.put('/', (req, res) => {
  res.send("Hello World!")
  // TODO: Update a students information
})

app.delete('/', (req, res) => {
  res.send("Hello World!")
  // TODO: Delete a student from the databas
})

app.listen(3000, () => {
  console.log("Example app listening on port 3000")
})
