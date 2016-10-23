import names
import statsd
import requests
import datetime
import json
from random import random
from time import sleep

# Configure statsd client
c = statsd.StatsClient('mohamey.me', 8125)

# List of courses students could be enrolled in
courses = ["Computer Science", "Media and Literature", "Historic Studies", "Dentistry", "Medicine", "Pharmacy"]
# Create random people and send them to the api
# for studentNo in range(0,100):
studentNo = 1
while True:
    # Get a random course and year of study
    course_index = int(random() * len(courses))
    year_number = int(random() * 5) + 1

    # Get a random date of birth after unix epoch, before 01/01/2000
    millisecond_of_birth = int(random() * 946684800000)
    date_of_birth = datetime.datetime.fromtimestamp(millisecond_of_birth/1000.0)
    birth_string = date_of_birth.strftime("%d/%m/%y")

    # Build the actual student information
    student = {
        'id': studentNo,
        'forename': names.get_first_name(),
        'surname': names.get_last_name(),
        'DOB': birth_string,
        'course': courses[course_index],
        'year': year_number
    }

    # The request headers
    headers = {
        'Content-Type': 'application/json'
    }

    # Convert student data to JSON
    jsonPayload = json.dumps(student)
    res = requests.post("http://mohamey.me/api", headers=headers, data=jsonPayload)
    print(res.text)
    print(str(res.elapsed.microseconds / 1000))

    # Push timing to graphite
    c.timing('api.post', res.elapsed.microseconds / 1000)

    studentNo += 1

    # This is purely for data visualisation purposes
    sleep(1)
