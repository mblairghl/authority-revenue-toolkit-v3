// Global state
let isDataLoaded = false;
let surveyData = null;
let currentStep = 1;

// DOM Elements
const surveySection = document.getElementById('surveySection');
const contextSummary = document.getElementById('contextSummary');
const stepsNav = document.getElementById('stepsNav');
const contentArea = document.getElementById('contentArea');

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
setupEventListeners();
checkEnvironment();
});

// Check if we're running in production
function checkEnvironment() {
const isProd = window.location.hostname !== 'localhost';
console.log(`Running in ${isProd ? 'production' : 'development'} mode - API integrations ${isProd ? 'active' : 'inactive'}`);
}

// Setup Event Listeners
function setupEventListeners() {
// Step navigation
const stepButtons = document.querySelectorAll('.step-button');
stepButtons.forEach(button => {
button.addEventListener('click', () => {
const step = parseInt(button.dataset.step);
showStep(step);
});
});
}

// Load Survey Data
async function loadSurveyData() {
try {
showSurveyLoader(true);

// For demo purposes, use demo data
// In production, this would fetch real survey data
const email = 'melissa@cultivatingsales.com'; // This would normally come from user input
let data;

try {
data = await fetchContactFromHighLevel(email);
} catch (error) {
console.log('Survey data loading error:', error);
// Fall back to demo data if API fails
console.log('User chose demo data');
data = getDemoData();
}

// Process the data
console.log('Demo data set:', data);
surveyData = data;
isDataLoaded = true;
console.log('isDataLoaded set to:', isDataLoaded);

// Update UI with survey data
console.log('Calling updateContextSummaries...');
await updateContextSummaries();

// Show main interface
showMainInterface();

console.log('Demo setup complete');

} catch (error) {
showError('Failed to load survey data. Please try again.');
} finally {
showSurveyLoader(false);
}
}

// Update Context Summaries
async function updateContextSummaries() {
console.log('updateContextSummaries called');
console.log('isDataLoaded:', isDataLoaded);
console.log('surveyData:', surveyData);

if (!isDataLoaded || !surveyData) return;

// Generate context from survey data
const context = `Based on your assessment: You're a ${surveyData.businessType} working with ${surveyData.clientType}, with your main challenge being ${surveyData.mainChallenge}. Your goal is to ${surveyData.goal}.`;

console.log('Generated context:', context);

// Update context summary
const contextElement = document.getElementById('surveyContext1');
console.log('Context element found:', contextElement);

if (contextElement) {
contextElement.textContent = context;
console.log('Context element updated successfully');
}

// Get AI recommendations for current step
try {
const recommendation = await getAIRecommendation(context, currentStep, surveyData);
updateStepRecommendation(currentStep, recommendation);
} catch (error) {
console.error('Failed to get AI recommendation:', error);
}

console.log('updateContextSummaries complete');
}

// Show Main Interface
function showMainInterface() {
surveySection.style.display = 'none';
contextSummary.style.display = 'block';
stepsNav.style.display = 'flex';
contentArea.style.display = 'block';
showStep(1);
}

// Show Step
function showStep(step) {
currentStep = step;

// Hide all step content
document.querySelectorAll('.step-content').forEach(el => {
el.style.display = 'none';
});

// Show selected step
const stepContent = document.getElementById(`step${step}`);
if (stepContent) {
stepContent.style.display = 'block';
}

// Update active state in navigation
document.querySelectorAll('.step-button').forEach(button => {
button.classList.remove('active');
if (parseInt(button.dataset.step) === step) {
button.classList.add('active');
}
});
}

// Update Step Recommendation
function updateStepRecommendation(step, recommendation) {
const recommendationElement = document.getElementById(`step${step}Recommendation`);
if (recommendationElement) {
recommendationElement.textContent = recommendation;
}
}

// UI Helpers
function showSurveyLoader(show) {
const loader = document.getElementById('surveyLoader');
if (loader) {
loader.style.display = show ? 'flex' : 'none';
}
}

function showError(message) {
const error = document.getElementById('surveyError');
if (error) {
error.textContent = message;
error.style.display = 'block';
}
}

// Export functions
window.loadSurveyData = loadSurveyData;
