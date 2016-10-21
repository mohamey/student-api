import requests
import json

# Create a dummy payload to send
payload = {
    'sessionID' : 13318246,
    'payload': {
        'id': 14445678,
        'forename': 'John',
        'surname': 'Doe',
        'DOB': '01/01/1970',
        'course': 'CASE',
        'year': 2
        }
    }

# Convert the payload to json
jsonPayload = json.dumps(payload)
# Set the requests headers
headers = {'Content-Type': 'application/json'}

# Send the request, print the result
res = requests.post('http://127.0.0.1:3000', headers = headers, data=jsonPayload)
print(res.text)
