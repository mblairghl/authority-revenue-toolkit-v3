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

// Prepare prompt for OpenAI API
const prompt = generatePrompt(context, step, userData);

// Check if API key is configured
if (!process.env.OPENAI_API_KEY) {
console.log('OpenAI API key not configured');
return {
statusCode: 200,
headers,
body: JSON.stringify({
success: true,
recommendation: 'OpenAI API key not configured. Please add your API key to enable AI recommendations.',
source: 'fallback'
})
};
}

// Call OpenAI API
console.log('Calling OpenAI API...');
const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
method: 'POST',
headers: {
'Content-Type': 'application/json',
'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
},
body: JSON.stringify({
model: 'gpt-4',
max_tokens: 500,
messages: [{
role: 'user',
content: prompt
}],
temperature: 0.7
})
});

if (!openaiResponse.ok) {
const errorText = await openaiResponse.text();
console.error(`OpenAI API error: ${openaiResponse.status} - ${errorText}`);
throw new Error(`OpenAI API error: ${openaiResponse.status}`);
}

const openaiData = await openaiResponse.json();

// Process and return the recommendation
return {
statusCode: 200,
headers,
body: JSON.stringify({
recommendation: processOpenAIResponse(openaiData)
})
};

} catch (error) {
console.error('OpenAI proxy error:', error);
return {
statusCode: 200,
headers,
body: JSON.stringify({
success: true,
recommendation: `Unable to generate AI recommendation at this time. Error: ${error.message}. Please try again later or contact support.`,
source: 'error_fallback'
})
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

// Helper function to process OpenAI's response
function processOpenAIResponse(openaiData) {
// Extract the relevant part of OpenAI's response
const response = openaiData.choices[0].message.content;

// Clean and format the response
return response
.replace(/\n\n/g, ' ')
.replace(/\s+/g, ' ')
.trim();
}
