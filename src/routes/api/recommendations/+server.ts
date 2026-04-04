// src/routes/api/recommendations/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { Groq } from 'groq-sdk';

// Define TypeScript interfaces (same as before)
interface UserPreferences {
  workTypes: string[];
  salaryExpectation: string;
  workMotivation: string;
  educationLevel: string;
  educationField: string;
  workExperience: string;
  strengths?: string[];
  technicalSkills?: string[];
  learningStyle?: string;
  collaborationPreference?: string;
  timePreference?: string;
  guidancePreference?: string;
  workPace?: string;
  sessionId?: string;
  timestamp?: string;
}

interface CareerMatch {
  id: string;
  title: string;
  matchPercentage: number;
  description: string;
  requiredSkills: string[];
  salaryRange: string;
  growthPotential: string;
  strengths: string[];
  matchReason?: string;
  icon?: string;
  gradient?: string;
  educationRequired?: string;
  experienceLevel?: string;
  skillsToDevelop?: string[];
  certificationPaths?: string[];
  localCompanies?: string[];
  industry?: string;
  responsibilities?: string[];
}

interface AlternatePath {
  id: string;
  title: string;
  description: string;
  timeline: string;
  matchPercentage: number;
  requiredSkills?: string[];
  resources?: string[];
  icon?: string;
  gradient?: string;
}

interface RecommendationResponse {
  recommendations: CareerMatch[];
  alternatePaths: AlternatePath[];
  jobLinks: string[];
  summary: {
    topMatch: number;
    averageMatch: number;
    totalRecommendations: number;
    suggestedNextSteps: string[];
    timelineSuggestions: string[];
    userProfileSummary: string;
  };
}

// Rate limiter implementation
class RateLimiter {
  private tokens: number;
  private lastRefill: number;
  private readonly maxTokens: number;
  private readonly refillRate: number; // tokens per millisecond

  constructor(maxTokens: number, refillRatePerMinute: number) {
    this.maxTokens = maxTokens;
    this.tokens = maxTokens;
    this.lastRefill = Date.now();
    this.refillRate = refillRatePerMinute / 60000; // Convert to tokens per ms
  }

  private refill() {
    const now = Date.now();
    const timePassed = now - this.lastRefill;
    const refillAmount = timePassed * this.refillRate;
    
    this.tokens = Math.min(this.maxTokens, this.tokens + refillAmount);
    this.lastRefill = now;
  }

  async acquire(): Promise<void> {
    this.refill();
    
    if (this.tokens < 1) {
      const waitTime = (1 - this.tokens) / this.refillRate;
      await new Promise(resolve => setTimeout(resolve, waitTime));
      return this.acquire();
    }
    
    this.tokens -= 1;
  }
}

// Cache implementation
class ResponseCache {
  private cache: Map<string, { response: RecommendationResponse; timestamp: number }>;
  private readonly ttl: number; // Time to live in milliseconds

  constructor(ttlMinutes: number = 60) {
    this.cache = new Map();
    this.ttl = ttlMinutes * 60 * 1000;
  }

  generateKey(userData: UserPreferences): string {
    // Create a unique key based on user preferences
    const keyData = {
      workTypes: userData.workTypes.sort(),
      salaryExpectation: userData.salaryExpectation,
      workMotivation: userData.workMotivation,
      educationLevel: userData.educationLevel,
      educationField: userData.educationField,
      workExperience: userData.workExperience,
      learningStyle: userData.learningStyle,
      collaborationPreference: userData.collaborationPreference
    };
    return JSON.stringify(keyData);
  }

  get(key: string): RecommendationResponse | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.ttl) {
      console.log('Cache hit for key:', key.substring(0, 50));
      return cached.response;
    }
    if (cached) {
      this.cache.delete(key);
    }
    return null;
  }

  set(key: string, response: RecommendationResponse): void {
    this.cache.set(key, { response, timestamp: Date.now() });
    console.log('Cached response for key:', key.substring(0, 50));
  }

  clear(): void {
    this.cache.clear();
  }
}

// Initialize Groq with retry logic
const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true
});

// Rate limiter - 8000 TPM limit, using 7000 as safe margin
const rateLimiter = new RateLimiter(7000, 7000);
const responseCache = new ResponseCache(60); // Cache for 1 hour

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

async function retryRequest<T>(
  fn: () => Promise<T>,
  retries: number = MAX_RETRIES
): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    if (retries > 0 && (error.message?.includes('rate limit') || error.message?.includes('quota'))) {
      console.log(`Rate limit hit, retrying in ${RETRY_DELAY_MS}ms... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
      return retryRequest(fn, retries - 1);
    }
    throw error;
  }
}

// Chunked analysis function
async function analyzeWithGroqChunked(userData: UserPreferences): Promise<any> {
  console.log('Starting chunked analysis to respect 8000 TPM limit...');
  
  try {
    // First, get recommendations in chunks
    const recommendationsChunk = await getRecommendationsChunk(userData);
    
    // Then get alternate paths
    const alternatePathsChunk = await getAlternatePathsChunk(userData);
    
    // Finally get summary
    const summaryChunk = await getSummaryChunk(userData, recommendationsChunk);
    
    // Combine all chunks
    return {
      recommendations: recommendationsChunk,
      alternatePaths: alternatePathsChunk,
      summary: summaryChunk
    };
  } catch (error) {
    console.error('Error in chunked analysis:', error);
    throw error;
  }
}

// Chunk 1: Get career recommendations
async function getRecommendationsChunk(userData: UserPreferences): Promise<CareerMatch[]> {
  const prompt = `
    You are a career guidance expert for Filipino students. Provide 3-5 entry-level career recommendations.
    
    USER PROFILE:
    - Education: ${userData.educationLevel} year in ${userData.educationField}
    - Experience: ${userData.workExperience}
    - Strengths: ${userData.strengths?.join(', ') || 'Not specified'}
    - Technical Skills: ${userData.technicalSkills?.join(', ') || 'Not specified'}
    - Work Types: ${userData.workTypes.join(', ')}
    - Salary Expectation: ${userData.salaryExpectation}
    - Work Motivation: ${userData.workMotivation}

    Return ONLY a JSON array of career recommendations with this structure:
    [
      {
        "id": "1",
        "title": "Job Title",
        "matchPercentage": 85,
        "description": "Brief description",
        "requiredSkills": ["skill1", "skill2"],
        "salaryRange": "₱20,000 - ₱35,000 monthly",
        "growthPotential": "High/Medium/Low",
        "strengths": ["strength1", "strength2"],
        "matchReason": "Why this matches",
        "industry": "Industry name",
        "responsibilities": ["Responsibility 1", "Responsibility 2"]
      }
    ]
  `;

  await rateLimiter.acquire();
  
  const response = await retryRequest(async () => {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: "You are a career expert. Return only valid JSON arrays." },
        { role: "user", content: prompt }
      ],
      model: "openai/gpt-oss-120b",
      temperature: 0.7,
      max_completion_tokens: 4000, // Reduced token usage
      top_p: 0.8,
      stream: false
    });
    return completion;
  });

  const text = cleanResponseText(response.choices[0]?.message?.content || '');
  return JSON.parse(text);
}

// Chunk 2: Get alternate career paths
async function getAlternatePathsChunk(userData: UserPreferences): Promise<AlternatePath[]> {
  const prompt = `
    Based on this user profile, provide 2-3 alternative career paths:
    - Education: ${userData.educationField}
    - Skills: ${userData.technicalSkills?.slice(0, 3).join(', ')}
    - Strengths: ${userData.strengths?.slice(0, 3).join(', ')}

    Return ONLY a JSON array of alternative paths:
    [
      {
        "id": "1",
        "title": "Alternative Career",
        "description": "Brief description",
        "timeline": "6-12 months",
        "matchPercentage": 70,
        "requiredSkills": ["skill1", "skill2"],
        "resources": ["resource1", "resource2"]
      }
    ]
  `;

  await rateLimiter.acquire();
  
  const response = await retryRequest(async () => {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: "Return only valid JSON arrays." },
        { role: "user", content: prompt }
      ],
      model: "openai/gpt-oss-120b",
      temperature: 0.7,
      max_completion_tokens: 2000, // Smaller token usage
      top_p: 0.8,
      stream: false
    });
    return completion;
  });

  const text = cleanResponseText(response.choices[0]?.message?.content || '');
  return JSON.parse(text);
}

// Chunk 3: Get summary and next steps
async function getSummaryChunk(userData: UserPreferences, recommendations: CareerMatch[]): Promise<any> {
  const prompt = `
    Based on these ${recommendations.length} career recommendations for a ${userData.educationField} student,
    provide a summary with:
    1. Top match percentage
    2. Average match percentage
    3. 5 suggested next steps
    4. 5 timeline suggestions
    5. A brief user profile summary

    Return ONLY JSON:
    {
      "topMatch": 85,
      "averageMatch": 75,
      "suggestedNextSteps": ["step1", "step2", "step3", "step4", "step5"],
      "timelineSuggestions": ["suggestion1", "suggestion2", "suggestion3", "suggestion4", "suggestion5"],
      "userProfileSummary": "Brief summary"
    }
  `;

  await rateLimiter.acquire();
  
  const response = await retryRequest(async () => {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: "Return only valid JSON." },
        { role: "user", content: prompt }
      ],
      model: "openai/gpt-oss-120b",
      temperature: 0.7,
      max_completion_tokens: 1500, // Smaller token usage
      top_p: 0.8,
      stream: false
    });
    return completion;
  });

  const text = cleanResponseText(response.choices[0]?.message?.content || '');
  const summary = JSON.parse(text);
  
  // Calculate average if not provided
  if (!summary.averageMatch && recommendations.length > 0) {
    summary.averageMatch = Math.round(
      recommendations.reduce((sum, r) => sum + r.matchPercentage, 0) / recommendations.length
    );
  }
  
  return summary;
}

// Helper function to clean response text
function cleanResponseText(text: string): string {
  text = text.trim();
  text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '');
  
  const jsonMatch = text.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
  if (jsonMatch) {
    text = jsonMatch[0];
  }
  
  // Fix common JSON issues
  text = text.replace(/'/g, '"');
  text = text.replace(/,\s*}/g, '}');
  text = text.replace(/,\s*\]/g, ']');
  text = text.replace(/True/g, 'true').replace(/False/g, 'false');
  text = text.replace(/None/g, 'null');
  
  return text;
}

// Function to validate API key (same as before)
function validateApiKey(): boolean {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  console.log('API Key check:', {
    hasKey: !!apiKey,
    keyLength: apiKey?.length,
    firstChars: apiKey?.substring(0, 10) + '...'
  });
  
  if (!apiKey) {
    console.error('API key is missing');
    return false;
  }
  
  if (apiKey.includes('placeholder') || apiKey === 'your_groq_api_key_here') {
    console.error('Using placeholder API key');
    return false;
  }
  
  return true;
}

// Generate job search links (same as before)
function generateJobLinks(recommendations: CareerMatch[]): string[] {
  const links: string[] = [];
  
  recommendations.forEach(career => {
    const encodedTitle = encodeURIComponent(career.title + ' entry level Philippines');
    
    const platforms = [
      `https://ph.indeed.com/jobs?q=${encodedTitle}&l=Philippines&jt=fulltime&fromage=3`,
      `https://www.linkedin.com/jobs/search/?keywords=${encodedTitle}&location=Philippines&f_TPR=r2592000&position=1&pageNum=0`,
      `https://www.jobstreet.com.ph/${career.title.toLowerCase().replace(/ /g, '-')}-jobs`,
      `https://www.kalibrr.com/home/te/${encodedTitle}/philippines`
    ];
    
    platforms.slice(0, 3).forEach(platform => {
      links.push(platform);
    });
  });
  
  return [...new Set(links)]; // Remove duplicates
}

// Enhance recommendations with additional data (same as before)
function enhanceRecommendations(recommendations: CareerMatch[]): CareerMatch[] {
  const icons = [
    'fa-solid fa-code',
    'fa-solid fa-chart-line',
    'fa-solid fa-users',
    'fa-solid fa-briefcase',
    'fa-solid fa-graduation-cap',
    'fa-solid fa-paintbrush',
    'fa-solid fa-headset',
    'fa-solid fa-calculator',
    'fa-solid fa-pencil-alt',
    'fa-solid fa-wrench'
  ];
  
  const gradients = [
    'from-blue-500 to-cyan-500',
    'from-purple-500 to-indigo-500',
    'from-green-500 to-emerald-500',
    'from-orange-500 to-red-500',
    'from-pink-500 to-rose-500',
    'from-yellow-500 to-amber-500',
    'from-teal-500 to-green-500',
    'from-indigo-500 to-purple-500'
  ];
  
  return recommendations.map((rec, index) => ({
    ...rec,
    icon: icons[index % icons.length],
    gradient: gradients[index % gradients.length],
    skillsToDevelop: rec.requiredSkills?.slice(0, 3) || [],
    certificationPaths: getCertificationPaths(rec.industry || 'General'),
    localCompanies: getLocalCompanies(rec.industry || 'General'),
    educationRequired: rec.educationRequired || getEducationRequired(rec.industry || 'General'),
    experienceLevel: rec.experienceLevel || 'Entry-level'
  }));
}

function enhanceAlternatePaths(alternatePaths: AlternatePath[]): AlternatePath[] {
  const icons = [
    'fa-solid fa-palette',
    'fa-solid fa-keyboard',
    'fa-solid fa-bullhorn',
    'fa-solid fa-hashtag',
    'fa-solid fa-headset',
    'fa-solid fa-chart-bar'
  ];
  
  const gradients = [
    'from-pink-500 to-rose-500',
    'from-gray-500 to-slate-500',
    'from-blue-500 to-cyan-500',
    'from-purple-500 to-indigo-500',
    'from-green-500 to-emerald-500',
    'from-amber-500 to-yellow-500'
  ];
  
  return alternatePaths.map((path, index) => ({
    ...path,
    icon: icons[index % icons.length],
    gradient: gradients[index % gradients.length]
  }));
}

// Helper functions for enhancement (same as before)
function getCertificationPaths(industry: string): string[] {
  const certifications: Record<string, string[]> = {
    'Technology': ['Google IT Support', 'AWS Cloud Practitioner', 'CompTIA A+'],
    'Business': ['Google Project Management', 'HubSpot Marketing', 'Six Sigma Yellow Belt'],
    'Creative': ['Adobe Certified Professional', 'Google UX Design', 'Meta Social Media Marketing'],
    'Healthcare': ['Basic Life Support (BLS)', 'Medical Coding', 'Pharmacy Assistant Certification'],
    'Engineering': ['Autodesk Certified Professional', 'SolidWorks Certification', 'Six Sigma Yellow Belt'],
    'Education': ['Licensure Examination for Teachers (LET)', 'TESDA Trainers Methodology'],
    'Finance': ['Securities and Exchange Commission (SEC) registration', 'Insurance Commission license'],
    'Marketing': ['Google Digital Marketing & E-commerce', 'Meta Blueprint', 'HubSpot Content Marketing']
  };
  
  return certifications[industry] || ['Industry-specific certifications', 'Professional development courses'];
}

function getLocalCompanies(industry: string): string[] {
  const companies: Record<string, string[]> = {
    'Technology': ['Accenture', 'Pointwest', 'IBM Philippines', 'DXC Technology', 'Collabera Digital'],
    'Business': ['BPI', 'SM Group', 'Ayala Corporation', 'Jollibee Foods Corporation', 'San Miguel Corporation'],
    'Creative': ['Advertising Agencies', 'Media Companies', 'Digital Marketing Firms', 'Publishing Houses'],
    'Healthcare': ['St. Luke\'s Medical Center', 'Makati Medical Center', 'Philippine General Hospital', 'Private Clinics'],
    'Engineering': ['Construction firms', 'Engineering consultancies', 'Manufacturing companies', 'Infrastructure companies'],
    'Finance': ['Banks', 'Insurance companies', 'Investment firms', 'Accounting firms'],
    'Marketing': ['Advertising agencies', 'PR firms', 'Digital marketing agencies', 'Market research companies']
  };
  
  return companies[industry] || ['Various local companies', 'International corporations in PH'];
}

function getEducationRequired(industry: string): string {
  const educationMap: Record<string, string> = {
    'Technology': 'Bachelor\'s in Computer Science, IT, or related field',
    'Business': 'Bachelor\'s in Business Administration, Management, or related field',
    'Creative': 'Bachelor\'s in Fine Arts, Multimedia Arts, or related field',
    'Healthcare': 'Relevant diploma or Bachelor\'s degree in health sciences',
    'Engineering': 'Bachelor\'s in Engineering or related technical field',
    'Education': 'Bachelor\'s in Education or related field',
    'Finance': 'Bachelor\'s in Finance, Accounting, or Business',
    'Marketing': 'Bachelor\'s in Marketing, Communications, or Business'
  };
  
  return educationMap[industry] || 'Bachelor\'s degree in relevant field';
}

function validateUserData(userData: UserPreferences): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!userData.workTypes || userData.workTypes.length === 0) {
    errors.push('Work types are required');
  }
  if (!userData.salaryExpectation) errors.push('Salary expectation is required');
  if (!userData.workMotivation) errors.push('Work motivation is required');
  if (!userData.educationLevel) errors.push('Education level is required');
  if (!userData.educationField) errors.push('Education field is required');
  if (!userData.workExperience) errors.push('Work experience level is required');
  if (!userData.strengths || userData.strengths.length === 0) errors.push('At least one strength is required');
  if (!userData.technicalSkills || userData.technicalSkills.length === 0) errors.push('At least one technical skill is required');
  if (!userData.learningStyle) errors.push('Learning style is required');
  if (!userData.collaborationPreference) errors.push('Collaboration preference is required');
  if (!userData.timePreference) errors.push('Time preference is required');
  if (!userData.guidancePreference) errors.push('Guidance preference is required');
  if (!userData.workPace) errors.push('Work pace is required');

  return { isValid: errors.length === 0, errors };
}

// Main POST handler
export const POST: RequestHandler = async ({ request }) => {
  console.log('=== API CALL STARTED ===');
  
  try {
    // Validate API key
    if (!validateApiKey()) {
      return json(getFallbackRecommendations('API key missing'), { status: 200 });
    }

    const userData: UserPreferences = await request.json();
    console.log('Received user data');

    // Validate user data
    const validation = validateUserData(userData);
    if (!validation.isValid) {
      return json({
        error: 'Validation failed',
        message: 'Please complete all sections',
        details: validation.errors,
        ...getFallbackRecommendations('Validation failed')
      }, { status: 400 });
    }

    // Check cache
    const cacheKey = responseCache.generateKey(userData);
    const cachedResponse = responseCache.get(cacheKey);
    if (cachedResponse) {
      console.log('Returning cached response');
      return json(cachedResponse);
    }

    console.log('Calling Groq AI with chunked analysis...');
    
    // Get AI-powered recommendations using chunked approach
    const aiResponse = await analyzeWithGroqChunked(userData);
    
    if (!aiResponse || !aiResponse.recommendations) {
      throw new Error('Invalid response from AI service');
    }
    
    console.log('AI Response received:', {
      recommendationsCount: aiResponse.recommendations?.length,
      alternatePathsCount: aiResponse.alternatePaths?.length
    });
    
    // Enhance recommendations
    const enhancedRecommendations = enhanceRecommendations(aiResponse.recommendations);
    const enhancedAlternatePaths = enhanceAlternatePaths(aiResponse.alternatePaths || []);
    
    // Generate job links
    const jobLinks = generateJobLinks(enhancedRecommendations);
    
    // Prepare response
    const response: RecommendationResponse = {
      recommendations: enhancedRecommendations,
      alternatePaths: enhancedAlternatePaths,
      jobLinks,
      summary: {
        topMatch: aiResponse.summary?.topMatch || enhancedRecommendations[0]?.matchPercentage || 0,
        averageMatch: aiResponse.summary?.averageMatch || 
          Math.round(enhancedRecommendations.reduce((sum, r) => sum + r.matchPercentage, 0) / enhancedRecommendations.length),
        totalRecommendations: (enhancedRecommendations.length + enhancedAlternatePaths.length),
        suggestedNextSteps: aiResponse.summary?.suggestedNextSteps || [
          "Update your LinkedIn profile to highlight relevant skills",
          "Start building a portfolio of projects or work samples",
          "Network with professionals in your target industry",
          "Consider relevant certifications to enhance your qualifications",
          "Practice interview skills and prepare your resume"
        ],
        timelineSuggestions: aiResponse.summary?.timelineSuggestions || [
          "Complete 1-2 relevant online courses in the next 3 months",
          "Apply for internships or part-time positions this semester",
          "Attend at least 2 career fairs or networking events",
          "Prepare and finalize your resume and cover letter",
          "Schedule informational interviews with professionals in your field"
        ],
        userProfileSummary: aiResponse.summary?.userProfileSummary || 
          `${userData.educationField} student with interests in ${userData.workTypes.slice(0, 2).join(' and ')} seeking entry-level opportunities`
      }
    };

    // Cache the response
    responseCache.set(cacheKey, response);

    console.log('Successfully generated recommendations');
    return json(response);

  } catch (err: any) {
    console.error('Error generating career recommendations:', err.message);
    
    // Return fallback recommendations
    return json(getFallbackRecommendations(err.message), { status: 200 });
  }
};

// Updated fallback function with parameter
function getFallbackRecommendations(errorMessage?: string): RecommendationResponse {
  console.log('Using fallback recommendations due to:', errorMessage || 'Unknown error');
  
  return {
    recommendations: [
      {
        id: '1',
        title: 'Junior Software Developer',
        matchPercentage: 85,
        description: 'Entry-level position developing software applications. Perfect for recent graduates with coding skills. High demand in the Philippine IT sector with many opportunities in BPO and tech companies.',
        requiredSkills: ['JavaScript', 'Python', 'HTML/CSS', 'Git', 'Problem Solving', 'Team Collaboration'],
        salaryRange: '₱25,000 - ₱45,000 monthly',
        growthPotential: 'High',
        strengths: ['Analytical Thinking', 'Attention to Detail', 'Problem Solving', 'Adaptability'],
        matchReason: 'Your technical skills and structured work preference align well with software development roles that are in high demand in the Philippines.',
        industry: 'Technology',
        responsibilities: ['Develop and maintain software applications', 'Write clean and efficient code', 'Debug and troubleshoot issues', 'Collaborate with cross-functional teams', 'Participate in code reviews'],
        icon: 'fa-solid fa-code',
        gradient: 'from-blue-500 to-cyan-500',
        educationRequired: "Bachelor's in Computer Science, Information Technology, or related field",
        experienceLevel: 'Entry-level (0-2 years)',
        skillsToDevelop: ['TypeScript', 'React/Next.js', 'Cloud Computing (AWS/Azure)', 'REST APIs'],
        certificationPaths: ['AWS Cloud Practitioner', 'Google IT Automation with Python', 'Microsoft Certified: Azure Fundamentals'],
        localCompanies: ['Accenture Philippines', 'Pointwest Technologies', 'IBM Philippines', 'DXC Technology', 'Collabera Digital']
      },
      {
        id: '2',
        title: 'Data Analyst Trainee',
        matchPercentage: 78,
        description: 'Beginner role focused on analyzing data, creating reports, and providing insights. Growing field in the Philippines with applications across various industries including finance, retail, and technology.',
        requiredSkills: ['Microsoft Excel', 'SQL', 'Data Analysis', 'Statistical Analysis', 'Communication Skills', 'Attention to Detail'],
        salaryRange: '₱20,000 - ₱35,000 monthly',
        growthPotential: 'High',
        strengths: ['Analytical Thinking', 'Attention to Detail', 'Communication', 'Problem Solving'],
        matchReason: 'Your analytical mindset and interest in data-driven work make you suitable for data analysis roles that are increasingly important in today\'s business environment.',
        industry: 'Technology & Business',
        responsibilities: ['Collect and analyze datasets', 'Create reports and dashboards', 'Identify trends and patterns', 'Present findings to stakeholders', 'Ensure data accuracy and quality'],
        icon: 'fa-solid fa-chart-line',
        gradient: 'from-purple-500 to-indigo-500',
        educationRequired: "Bachelor's in Statistics, Mathematics, Computer Science, Business Analytics, or related field",
        experienceLevel: 'Entry-level (0-1 year)',
        skillsToDevelop: ['Python/R for data analysis', 'Power BI/Tableau', 'Data Visualization', 'Machine Learning Basics'],
        certificationPaths: ['Google Data Analytics Professional Certificate', 'Microsoft Power BI Data Analyst', 'Tableau Desktop Specialist'],
        localCompanies: ['Concentrix Philippines', 'Telus International Philippines', 'JP Morgan Chase Philippines', 'Wells Fargo Philippines', 'Shopee Philippines']
      },
      {
        id: '3',
        title: 'Digital Marketing Assistant',
        matchPercentage: 72,
        description: 'Entry-level role in online marketing, social media management, and content creation. Perfect for creative individuals interested in the digital space with opportunities in various industries.',
        requiredSkills: ['Social Media Management', 'Content Creation', 'Basic Analytics', 'Communication Skills', 'Creativity', 'Adaptability'],
        salaryRange: '₱18,000 - ₱30,000 monthly',
        growthPotential: 'Medium to High',
        strengths: ['Creativity', 'Communication', 'Adaptability', 'Teamwork'],
        matchReason: 'Your creative interests and communication skills align well with digital marketing roles that are essential for modern businesses.',
        industry: 'Marketing & Communications',
        responsibilities: ['Assist with digital marketing campaigns', 'Manage social media accounts', 'Create engaging content', 'Monitor campaign performance', 'Conduct market research'],
        icon: 'fa-solid fa-bullhorn',
        gradient: 'from-pink-500 to-rose-500',
        educationRequired: "Bachelor's in Marketing, Communications, Multimedia Arts, or related field",
        experienceLevel: 'Entry-level (0-1 year)',
        skillsToDevelop: ['SEO/SEM', 'Google Analytics', 'Content Marketing Strategy', 'Email Marketing'],
        certificationPaths: ['Google Digital Marketing & E-commerce Certificate', 'Meta Blueprint Certification', 'HubSpot Content Marketing Certification'],
        localCompanies: ['Advertising Agencies', 'E-commerce Companies', 'Media Companies', 'Startups', 'Corporate Marketing Departments']
      }
    ],
    alternatePaths: [
      {
        id: '1',
        title: 'Project Coordinator',
        description: 'Support role in project management, team coordination, and documentation. Good entry point for those interested in business and management careers.',
        timeline: '6-12 months of experience or training',
        matchPercentage: 70,
        requiredSkills: ['Organization', 'Communication', 'Time Management', 'Microsoft Office'],
        resources: ['Google Project Management Certificate', 'CAPM (Certified Associate in Project Management) preparation'],
        icon: 'fa-solid fa-calendar-check',
        gradient: 'from-green-500 to-emerald-500'
      },
      {
        id: '2',
        title: 'Technical Support Specialist',
        description: 'Customer-facing technical role helping users with hardware and software issues. Develops both technical and communication skills.',
        timeline: '3-6 months of training',
        matchPercentage: 65,
        requiredSkills: ['Troubleshooting', 'Customer Service', 'Technical Knowledge', 'Patience'],
        resources: ['Google IT Support Certificate', 'CompTIA A+ Certification', 'Microsoft Technology Associate'],
        icon: 'fa-solid fa-headset',
        gradient: 'from-orange-500 to-red-500'
      }
    ],
    jobLinks: [
      'https://ph.indeed.com/jobs?q=Junior+Software+Developer+entry+level&l=Philippines&jt=fulltime&fromage=3',
      'https://ph.indeed.com/jobs?q=Data+Analyst+trainee&l=Philippines&jt=fulltime',
      'https://www.linkedin.com/jobs/search/?keywords=entry%20level%20developer&location=Philippines&f_TPR=r2592000'
    ],
    summary: {
      topMatch: 85,
      averageMatch: 78,
      totalRecommendations: 5,
      suggestedNextSteps: [
        'Update your LinkedIn profile with relevant skills and projects',
        'Create a portfolio showcasing your work',
        'Network with professionals in your target industry',
        'Research and apply for relevant certifications',
        'Practice common interview questions'
      ],
      timelineSuggestions: [
        'Complete 1-2 relevant online courses in the next 3 months',
        'Apply for at least 5 internships or entry-level positions this semester',
        'Attend 2-3 career fairs or networking events in the next month',
        'Prepare and get feedback on your resume',
        'Schedule informational interviews with professionals'
      ],
      userProfileSummary: 'Career-focused student seeking entry-level opportunities with a mix of technical and creative interests'
    }
  };
}

// GET handler for API status
export const GET: RequestHandler = async () => {
  const apiKeyValid = validateApiKey();
  
  return json({
    message: 'CareerGeenie AI Recommendation API (Optimized for 8000 TPM)',
    status: apiKeyValid ? 'Operational' : 'API Key Required',
    features: [
      'Rate limiting to respect 8000 TPM',
      'Response caching for 1 hour',
      'Chunked API calls to reduce token usage',
      'Automatic retry on rate limits',
      'Fallback recommendations when API fails'
    ],
    version: '3.0.0',
    timestamp: new Date().toISOString()
  });
};
