import requests
import json

# Create a dummy payload to send
payload = {
    'id': 8,
    'forename': 'ShoeHorn',
    'surname': 'Doe',
    'DOB': '01/01/1970',
    'course': 'CASE',
    'year': 2
}

# Convert the payload to json
jsonPayload = json.dumps(payload)
# Set the requests headers
headers = {'Content-Type': 'application/json'}

# Send the request, print the result
res = requests.put('http://mohamey.me/api', headers = headers, data=jsonPayload)
print(res.text)
