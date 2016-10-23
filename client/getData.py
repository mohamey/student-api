import names
import statsd
import requests
import datetime
import json
from time import sleep
from random import random

# Configure statsd client
c = statsd.StatsClient('mohamey.me', 8125)

# Request types
requestTypes = ["single", "all"]

studentNo = 1
while True:
    # Pick a random request type
    requestIndex = int(random() * len(requestTypes))

    # URL Parameters
    params = {
        'id': studentNo,
        'format': "JSON",
        'version': "1.0",
        'get': requestTypes[requestIndex]
    }

    # The request headers
    headers = {
        'Content-Type': 'application/json'
    }

    # Convert student data to JSON
    jsonPayload = json.dumps(params)
    res = requests.get("http://mohamey.me/api", headers=headers, params=params)
    print(res.text)
    print(str(res.elapsed.microseconds / 1000))
    c.timing('stats.timer.api.get', res.elapsed.microseconds / 1000)
    studentNo += 1

    # This is purely for data visualisation purposes
    sleep(1)
