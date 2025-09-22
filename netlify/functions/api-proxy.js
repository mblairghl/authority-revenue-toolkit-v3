// Netlify Function for API Proxying
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
const body = JSON.parse(event.body);
const { context, step, userData } = body;

// Validate required fields
if (!context || !step || !userData) {
return {
statusCode: 400,
headers,
body: JSON.stringify({ error: 'Missing required fields' })
};
}

// Prepare prompt for Claude API
const prompt = generatePrompt(context, step, userData);

// Call Claude API
const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
method: 'POST',
headers: {
'Content-Type': 'application/json',
'x-api-key': process.env.CLAUDE_API_KEY
},
body: JSON.stringify({
model: 'claude-2',
max_tokens: 500,
messages: [{
role: 'user',
content: prompt
}]
})
});

if (!claudeResponse.ok) {
throw new Error(`Claude API error: ${claudeResponse.status}`);
}

const claudeData = await claudeResponse.json();

// Process and return the recommendation
return {
statusCode: 200,
headers,
body: JSON.stringify({
recommendation: processClaudeResponse(claudeData)
})
};

} catch (error) {
console.error('Function error:', error);
return {
statusCode: 500,
headers,
body: JSON.stringify({ error: 'Internal server error' })
};
}
};

// Helper function to generate appropriate prompt based on step
function generatePrompt(context, step, userData) {
const basePrompt = `Given this business context: ${context}\n\n`;

const stepPrompts = {
1: "Provide specific recommendations for refining the ideal client profile. Focus on demographic and psychographic characteristics that align with the business goals.",
2: "Suggest content topics and formats that would resonate with the ideal client profile. Consider the business challenges and goals.",
3: "Recommend lead generation and qualification strategies that align with the business type and target market.",
4: "Propose a funnel structure that would effectively convert leads for this specific business model.",
5: "Suggest automation points in the sales pipeline that would improve efficiency while maintaining relationship quality.",
6: "Recommend a delivery system structure that balances scalability with quality service delivery.",
7: "Identify the key metrics that should be tracked for this specific business model and growth goals.",
8: "Provide specific suggestions for optimizing conversion rates at each stage of the customer journey.",
9: "Recommend authority-building activities that align with the business goals and target market."
};

return basePrompt + stepPrompts[step] + `\n\nIncorporate these specific details about the business: ${JSON.stringify(userData)}`;
}

// Helper function to process Claude's response
function processClaudeResponse(claudeData) {
// Extract the relevant part of Claude's response
const response = claudeData.messages[0].content;

// Clean and format the response
return response
.replace(/\n\n/g, ' ')
.replace(/\s+/g, ' ')
.trim();
}
