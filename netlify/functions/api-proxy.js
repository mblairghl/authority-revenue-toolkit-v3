// API Integration Handler

// HighLevel API Functions
async function fetchContactFromHighLevel(email) {
try {
const response = await fetch(`/.netlify/functions/highlevel-proxy?email=${encodeURIComponent(email)}`, {
method: 'GET',
headers: {
'Content-Type': 'application/json'
}
});

if (!response.ok) {
throw new Error(`HighLevel proxy error: ${response.status}`);
}

const result = await response.json();

if (result.success) {
console.log(`Survey data loaded from: ${result.source}`);
return result.data;
} else {
throw new Error(result.error || 'Failed to fetch contact data');
}
} catch (error) {
console.error('HighLevel API Error:', error);
throw error;
}
}

// OpenAI Integration
async function getAIRecommendation(context, step, userData) {
try {
const response = await fetch('/.netlify/functions/api-proxy', {
method: 'POST',
headers: {
'Content-Type': 'application/json'
},
body: JSON.stringify({
context: context,
step: step,
userData: userData
})
});

if (!response.ok) {
throw new Error('Failed to get AI recommendation');
}

const data = await response.json();
return data.recommendation;
} catch (error) {
console.error('AI Error:', error);
throw error;
}
}

// Demo Data Generator
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

// Data Processing
function processUserData(data) {
return {
context: `Based on your assessment: You're a ${data.businessType} working with ${data.clientType}, with your main challenge being ${data.mainChallenge}. Your goal is to ${data.goal}.`,
recommendations: {
step1: `Focus on ${data.clientType} who are specifically looking to ${data.goal}.`,
step2: `Leverage your expertise in ${data.expertise} to create content that addresses ${data.mainChallenge}.`,
step3: `Build a lead generation system focusing on ${data.marketingChannels.join(", ")}.`,
step4: `Design a funnel that converts through ${data.salesProcess}.`,
step5: `Optimize your ${data.salesProcess} to reach ${data.desiredRevenue}.`,
step6: `Structure your ${data.deliveryMethod} for scalability.`,
step7: `Track progress from ${data.currentRevenue} to ${data.desiredRevenue}.`,
step8: `Improve conversion rates in your ${data.salesProcess}.`,
step9: `Expand your authority presence on ${data.marketingChannels.join(", ")}.`
}
};
}

// Export functions
window.fetchContactFromHighLevel = fetchContactFromHighLevel;
window.getAIRecommendation = getAIRecommendation;
window.getDemoData = getDemoData;
window.processUserData = processUserData;
