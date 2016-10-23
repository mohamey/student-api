import names
import statsd
import requests
import datetime
import json
from random import random
from time import sleep

# Configure statsd client
c = statsd.StatsClient('mohamey.me', 8125)

studentNo = 1
while True:
    # URL Parameters
    params = {
        'id': studentNo,
        'format': "JSON",
        'version': "1.0",
        'get': 'single'
    }

    # The request headers
    headers = {
        'Content-Type': 'application/json'
    }

    # Convert student data to JSON
    response = requests.get("http://mohamey.me/api", headers=headers, params=params)
    c.timing('api.get', response.elapsed.microseconds / 1000)
    print(response.text)
    student = response.json()['data']
    student['year'] = int(student['year']) + 1


    # The request headers
    headers = {
        'Content-Type': 'application/json'
    }

    # Convert student data to JSON
    res = requests.put("http://mohamey.me/api", headers=headers, data=json.dumps(student))
    print(res.text)
    print(str(res.elapsed.microseconds / 1000))
    c.timing('api.put', res.elapsed.microseconds / 1000)
    studentNo += 1

    # This is purely for data visualisation purposes
    sleep(1)
