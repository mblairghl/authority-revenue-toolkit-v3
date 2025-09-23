// Netlify Function for HighLevel API Proxy
const fetch = require('node-fetch');

exports.handler = async function(event, context) {
// Enable CORS
const headers = {
'Access-Control-Allow-Origin': '*',
'Access-Control-Allow-Headers': 'Content-Type',
'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
};

// Handle OPTIONS request for CORS
if (event.httpMethod === 'OPTIONS') {
return {
statusCode: 200,
headers,
body: ''
};
}

try {
// Parse the incoming request
const { email } = event.queryStringParameters || {};

// Validate required fields
if (!email) {
return {
statusCode: 400,
headers,
body: JSON.stringify({ error: 'Email parameter is required' })
};
}

// Check if API key is configured
if (!process.env.HIGHLEVEL_API_KEY) {
console.log('HighLevel API key not configured, using demo data');
return {
statusCode: 200,
headers,
body: JSON.stringify({
success: true,
data: getDemoData(),
source: 'demo'
})
};
}

// Call HighLevel API
const response = await fetch(`https://rest.gohighlevel.com/v1/contacts/lookup?email=${email}`, {
method: 'GET',
headers: {
'Authorization': `Bearer ${process.env.HIGHLEVEL_API_KEY}`,
'Content-Type': 'application/json'
}
});

if (!response.ok) {
throw new Error(`HighLevel API error: ${response.status}`);
}

const data = await response.json();

// Return the contact data
return {
statusCode: 200,
headers,
body: JSON.stringify({
success: true,
data: data,
source: 'highlevel'
})
};

} catch (error) {
console.error('HighLevel proxy error:', error);

// Return demo data as fallback
return {
statusCode: 200,
headers,
body: JSON.stringify({
success: true,
data: getDemoData(),
source: 'demo_fallback',
error: error.message
})
};
}
};

// Demo data function
function getDemoData() {
return {
businessType: "Business Coach",
clientType: "Service-based business owners",
mainChallenge: "Inconsistent lead generation",
goal: "Scale to predictable revenue systems",
expertise: "Business strategy and systems optimization",
currentRevenue: "$150,000-$300,000",
desiredRevenue: "$500,000+",
marketingChannels: ["LinkedIn", "Referrals", "Content Marketing"],
salesProcess: "Discovery calls to strategy sessions",
deliveryMethod: "1:1 coaching and group programs"
};
}
