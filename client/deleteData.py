import requests
import json
import statsd
from time import sleep

# Configure statsd client
c = statsd.StatsClient('mohamey.me', 8125)

studentID = 1

while True:
    payload = {
        'id': studentID
    }

    headers = {
        'Content-Type': 'application/json'
    }

    res = requests.delete('http://mohamey.me/api', data=json.dumps(payload), headers=headers)
    print(res.text)
    c.timing('api.delete', res.elapsed.microseconds / 1000)
    studentID += 1
    sleep(1)
