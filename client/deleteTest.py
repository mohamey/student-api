import requests
import json

# Create a dummy payload to send
payload = {
    'id': 2
    }

# Convert the payload to json
jsonPayload = json.dumps(payload)
# Set the requests headers
headers = {'Content-Type': 'application/json'}

# Send the request, print the result
res = requests.delete('http://127.0.0.1:3000', headers = headers, data=jsonPayload)
print(res.text)
