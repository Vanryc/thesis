import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { GOOGLE_AI_API_KEY } from '$env/static/private';

// Rate limiting setup
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 5;

// Education level categorization
const EDUCATION_LEVELS = {
    belowBachelors: new Set(['high school', 'vocational', 'associate', 'some college', 'secondary', 'other', 'highschool']),
    bachelors: new Set(['bachelor', 'bachelor\'s', 'bachelors']),
    advanced: new Set(['master', 'master\'s', 'masters', 'doctorate', 'phd', 'doctoral'])
};

// Cache for job recommendations to avoid redundant API calls
const recommendationCache = new Map();

// User data interface for better type safety
interface UserData {
    workTypes?: string[];
    salaryExpectation?: string;
    workMotivation?: string;
    educationLevel?: string;
    educationField?: string;
    workExperience?: string;
    preferredCompanySize?: string;
    strengths?: string[];
    experienceLevel?: string;
    technicalSkills?: string[];
    certifications?: string[];
    workSetting?: string;
    stressHandling?: string;
    collaborationPreference?: string;
    workSchedule?: string;
    managementPreference?: string;
    workPace?: string;
}

// API Configuration
const GEMINI_CONFIG = {
    baseUrl: 'https://generativelanguage.googleapis.com',
    model: 'gemini-2.0-flash',
    endpoint: 'generateContent',
    apiVersion: 'v1beta'
};

// Rate limiting function
function checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const windowStart = now - RATE_LIMIT_WINDOW;
    
    // Clean up old entries
    for (const [key, timestamps] of rateLimitMap.entries()) {
        const filtered = timestamps.filter((timestamp: number) => timestamp > windowStart);
        if (filtered.length === 0) {
            rateLimitMap.delete(key);
        } else {
            rateLimitMap.set(key, filtered);
        }
    }

    // Check current IP
    const userTimestamps = rateLimitMap.get(ip) || [];
    const recentRequests = userTimestamps.filter((timestamp: number) => timestamp > windowStart);
    
    if (recentRequests.length >= MAX_REQUESTS_PER_WINDOW) {
        return false;
    }

    rateLimitMap.set(ip, [...recentRequests, now]);
    return true;
}

// Helper function to call Gemini API
async function callGeminiAPI(prompt: string, temperature: number = 0.7, maxOutputTokens: number = 1500): Promise<any> {
    if (!GOOGLE_AI_API_KEY) {
        throw new Error('Google AI API key not configured');
    }

    const apiUrl = `${GEMINI_CONFIG.baseUrl}/${GEMINI_CONFIG.apiVersion}/models/${GEMINI_CONFIG.model}:${GEMINI_CONFIG.endpoint}`;
    
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-goog-api-key': GOOGLE_AI_API_KEY
        },
        body: JSON.stringify({
            contents: [{
                parts: [{
                    text: prompt
                }]
            }],
            generationConfig: {
                temperature,
                maxOutputTokens,
                topP: 0.8,
                topK: 40
            }
        })
    });

    if (!response.ok) {
        if (response.status === 429) {
            throw new Error('API rate limit exceeded. Please try again later.');
        }
        throw new Error(`API request failed with status ${response.status}`);
    }

    return await response.json();
}

// Function to extract JSON from markdown code blocks
function extractJsonFromMarkdown(text: string): string {
    // Try to find JSON in markdown code blocks
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
        return jsonMatch[1].trim();
    }
    
    // If no code blocks found, try to find JSON object/array directly
    const jsonObjectMatch = text.match(/(\{[\s\S]*\})/);
    if (jsonObjectMatch && jsonObjectMatch[1]) {
        return jsonObjectMatch[1].trim();
    }
    
    const jsonArrayMatch = text.match(/(\[[\s\S]*\])/);
    if (jsonArrayMatch && jsonArrayMatch[1]) {
        return jsonArrayMatch[1].trim();
    }
    
    // If nothing found, return the original text
    return text.trim();
}

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
    const clientIp = getClientAddress();
    
    // Check rate limiting
    if (!checkRateLimit(clientIp)) {
        return json(
            { 
                success: false, 
                error: 'Too many requests. Please try again in a minute.',
                recommendations: [],
                note: 'Rate limit exceeded'
            },
            { status: 429 }
        );
    }
    
    try {
        const userData: UserData = await request.json();
        
        if (!userData || Object.keys(userData).length === 0) {
            return json(
                { success: false, error: 'No user data provided' },
                { status: 400 }
            );
        }
        
        // Create cache key from user data
        const cacheKey = JSON.stringify(userData);
        
        // Check cache first
        if (recommendationCache.has(cacheKey)) {
            const cached = recommendationCache.get(cacheKey);
            return json(cached);
        }
        
        // Determine education level
        const educationLevel = (userData.educationLevel || '').toLowerCase();
        const isBelowBachelors = EDUCATION_LEVELS.belowBachelors.has(educationLevel);
        const hasBachelors = EDUCATION_LEVELS.bachelors.has(educationLevel);
        const hasAdvancedDegree = EDUCATION_LEVELS.advanced.has(educationLevel);
        
        // Process in parallel where possible
        const [analysis, recommendations] = await Promise.allSettled([
            analyzeWithGoogleAI(userData, educationLevel),
            generateCareerRecommendations(userData, educationLevel)
        ]);
        
        // Handle API responses
        const analysisResult = analysis.status === 'fulfilled' ? analysis.value : 'Analysis temporarily unavailable. Please try again later.';
        let recommendationsResult = recommendations.status === 'fulfilled' ? recommendations.value : [];
        
        // Prepare response
        const response = {
            success: true,
            recommendations: recommendationsResult,
            analysis: analysisResult,
            educationLevel,
            isBelowBachelors
        };
        
        // Cache the response for 5 minutes
        recommendationCache.set(cacheKey, response);
        setTimeout(() => recommendationCache.delete(cacheKey), 5 * 60 * 1000);
        
        return json(response);
        
    } catch (error) {
        console.error('Recommendation error:', error);
        
        return json(
            { 
                success: false, 
                error: 'Failed to process request',
                recommendations: []
            },
            { status: 500 }
        );
    }
};

async function analyzeWithGoogleAI(userData: UserData, educationLevel: string): Promise<string> {
    // If no API key is provided, return a default analysis
    if (!GOOGLE_AI_API_KEY) {
        return `Based on your profile:
- Education Level: ${educationLevel}
- Work Preferences: ${userData.workTypes?.join(', ') || 'Not specified'}
- Strengths: ${userData.strengths?.join(', ') || 'Not specified'}

I recommend exploring careers that match your skills and interests. Consider roles that align with your preferred work environment and schedule.`;
    }

    const prompt = `Analyze this user profile for career recommendations:
    
    User Profile:
    - Education Level: ${educationLevel}
    - Work Types: ${userData.workTypes?.join(', ') || 'Not specified'}
    - Salary Expectation: ${userData.salaryExpectation || 'Not specified'}
    - Work Motivation: ${userData.workMotivation || 'Not specified'}
    - Strengths: ${userData.strengths?.join(', ') || 'Not specified'}
    - Experience Level: ${userData.experienceLevel || 'Not specified'}
    - Technical Skills: ${userData.technicalSkills?.join(', ') || 'Not specified'}
    - Work Setting Preference: ${userData.workSetting || 'Not specified'}
    - Stress Handling: ${userData.stressHandling || 'Not specified'}
    - Collaboration Preference: ${userData.collaborationPreference || 'Not specified'}
    
    Provide your analysis in clear, structured markdown format. 
    ${EDUCATION_LEVELS.belowBachelors.has(educationLevel) ? 
      'NOTE: User has education below bachelor degree - recommend only jobs that typically do not require a bachelor degree.' : ''}
    ${EDUCATION_LEVELS.bachelors.has(educationLevel) ? 
      'NOTE: User has a bachelor degree - recommend jobs that typically require at least a bachelor degree.' : ''}
    ${EDUCATION_LEVELS.advanced.has(educationLevel) ? 
      'NOTE: User has an advanced degree - recommend jobs that typically require master or doctorate degrees.' : ''}`;

    try {
        const result = await callGeminiAPI(prompt, 0.7, 1500);
        return result.candidates[0]?.content?.parts[0]?.text || 'No analysis available';
    } catch (error) {
        console.error('Google AI analysis error:', error);
        return 'Analysis temporarily unavailable. Please try again later.';
    }
}

async function generateCareerRecommendations(userData: UserData, educationLevel: string): Promise<any[]> {
    // If no API key is provided, return empty recommendations
    if (!GOOGLE_AI_API_KEY) {
        return [];
    }

    // Get recommendations from Google AI
    try {
        const prompt = `Based on the user profile, generate 5-10 specific job recommendations with details:
        
        User Profile:
        - Education Level: ${educationLevel}
        - Work Types: ${userData.workTypes?.join(', ') || 'Not specified'}
        - Salary Expectation: ${userData.salaryExpectation || 'Not specified'}
        - Strengths: ${userData.strengths?.join(', ') || 'Not specified'}
        - Experience Level: ${userData.experienceLevel || 'Not specified'}
        - Technical Skills: ${userData.technicalSkills?.join(', ') || 'Not specified'}
        
        For each recommendation, provide:
        - Job Title (must be realistic based on education level)
        - Industry/Sector
        - Typical Responsibilities
        - Required Skills
        - Expected Salary Range (in Philippine Peso)
        - Growth Potential
        - Why it matches the user's profile
        
        Return ONLY valid JSON format with this exact structure (no additional text, no markdown code blocks):
        {
            "recommendations": [
                {
                    "title": "",
                    "industry": "",
                    "responsibilities": "",
                    "requiredSkills": [],
                    "salaryRange": "",
                    "growthPotential": "",
                    "matchReason": "",
                    "matchPercentage": 0
                }
            ]
        }
        
        IMPORTANT: 
        1. Return ONLY JSON, no additional text or markdown formatting
        2. ${EDUCATION_LEVELS.belowBachelors.has(educationLevel) ? 
        'Only include jobs that typically do not require a bachelor degree.' : ''}
        ${EDUCATION_LEVELS.bachelors.has(educationLevel) ? 
        'Only include jobs that typically require at least a bachelor degree.' : ''}
        ${EDUCATION_LEVELS.advanced.has(educationLevel) ? 
        'Only include jobs that typically require master or doctorate degrees.' : ''}`;

        const result = await callGeminiAPI(prompt, 0.5, 2000);
        const content = result.candidates[0]?.content?.parts[0]?.text;
        
        if (!content) {
            console.warn('No content received from Gemini API');
            return [];
        }
        
        // Extract JSON from potential markdown formatting
        const jsonString = extractJsonFromMarkdown(content);
        
        // Parse the JSON response
        try {
            const parsed = JSON.parse(jsonString);
            return parsed.recommendations || [];
        } catch (e) {
            console.error('Failed to parse AI recommendations:', e);
            console.error('Raw content that failed to parse:', content);
            console.error('Extracted JSON string:', jsonString);
            return [];
        }
        
    } catch (e) {
        console.error('Failed to get AI recommendations:', e);
        return [];
    }
}