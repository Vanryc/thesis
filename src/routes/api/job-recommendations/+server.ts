import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { OPENROUTER_API_KEY } from '$env/static/private';

// Rate limiting setup
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 5; // Reduced to prevent API rate limiting

// Pre-compiled regex patterns for better performance
const SALARY_PATTERNS = {
    monthly: /(?:₱|php|pesos?)\s*([\d,]+)(?:\s*-\s*([\d,]+))?\s*(?:per\s*month|monthly)/i,
    annual: /(?:₱|php|pesos?)\s*([\d,]+)(?:\s*-\s*([\d,]+))?\s*(?:per\s*year|annually)/i
};

// Categorized job lists with pre-lowered strings for faster matching
const JOB_CATEGORIES = {
    nonDegree: [
        'customer service representative', 'retail sales associate', 'administrative assistant',
        'food service worker', 'security guard', 'delivery driver', 'warehouse worker',
        'housekeeper', 'cashier', 'receptionist', 'data entry clerk', 'caregiver',
        'construction worker', 'electrician', 'plumber', 'automotive technician',
        'hair stylist', 'beautician', 'medical assistant', 'pharmacy technician',
        'dental assistant', 'hvac technician', 'welder', 'machinist', 'carpenenter',
        'painter', 'landscaper', 'janitor', 'cook', 'bartender', 'barista',
        'bank teller', 'call center agent', 'freelance writer', 'graphic designer',
        'web designer', 'social media manager', 'photographer', 'fitness trainer',
        'massage therapist', 'nanny', 'personal care aide', 'home health aide',
        'truck driver', 'forklift operator', 'shipping clerk', 'stock clerk',
        'tailor', 'jeweler', 'baker', 'butcher', 'florist', 'farm worker',
        'fishery worker', 'tour guide', 'event planner', 'dog trainer'
    ],
    degreeRequired: [
        'software engineer', 'data scientist', 'financial analyst', 'accountant',
        'registered nurse', 'teacher', 'architect', 'civil engineer',
        'mechanical engineer', 'electrical engineer', 'marketing manager',
        'human resources manager', 'project manager', 'business analyst',
        'pharmacist', 'physician', 'dentist', 'psychologist', 'lawyer',
        'professor', 'research scientist', 'it manager', 'systems analyst',
        'database administrator', 'network engineer', 'biomedical engineer',
        'environmental scientist', 'urban planner', 'economist', 'social worker'
    ],
    advancedDegree: [
        'senior software engineer', 'data architect', 'chief financial officer',
        'clinical psychologist', 'surgeon', 'university professor', 'research director',
        'principal engineer', 'senior research scientist', 'executive director',
        'medical director', 'dean of faculty', 'policy advisor', 'senior economist',
        'chief technology officer', 'chief medical officer', 'judge', 'patent attorney'
    ]
};

// Salary validation constants
const SALARY_CONSTANTS = {
    minMonthly: 10000,
    maxMonthly: 500000,
    rangeThreshold: 0.5
};

// Education level categorization
const EDUCATION_LEVELS = {
    belowBachelors: new Set(['high school', 'vocational', 'associate', 'some college', 'secondary', 'other', 'highschool']),
    bachelors: new Set(['bachelor', 'bachelor\'s', 'bachelors']),
    advanced: new Set(['master', 'master\'s', 'masters', 'doctorate', 'phd', 'doctoral'])
};

// Valid work types
const VALID_WORK_TYPES = new Set([
    'full-time', 'part-time', 'contract', 'freelance', 'remote', 'hybrid', 'onsite', 'creative'
]);

// Valid experience levels
const VALID_EXPERIENCE_LEVELS = new Set([
    'entry', 'junior', 'mid', 'senior', 'lead', 'executive'
]);

// Valid collaboration preferences
const VALID_COLLABORATION_PREFS = new Set([
    'team', 'individual', 'mixed', 'both'
]);

// Valid work settings
const VALID_WORK_SETTINGS = new Set([
    'office', 'remote', 'hybrid', 'outdoor', 'field'
]);

// Valid stress handling levels
const VALID_STRESS_LEVELS = new Set([
    'low', 'medium', 'high', 'very high'
]);

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

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
    const clientIp = getClientAddress();
    
    // Check rate limiting
    if (!checkRateLimit(clientIp)) {
        return json(
            { 
                success: false, 
                error: 'Too many requests. Please try again in a minute.',
                recommendations: generateMockRecommendations({} as UserData),
                note: 'Using sample data due to rate limiting'
            },
            { status: 429 }
        );
    }
    
    try {
        const userData: UserData = await request.json();
        
        // Clean workTypes to ensure only valid values
        if (userData.workTypes && Array.isArray(userData.workTypes)) {
            userData.workTypes = userData.workTypes.filter(workType => 
                VALID_WORK_TYPES.has(workType.toLowerCase())
            );
            
            // If no valid work types remain, set a default
            if (userData.workTypes.length === 0) {
                userData.workTypes = ['full-time'];
            }
        }
        
        // Validate user data structure
        const validationError = validateUserData(userData);
        if (validationError) {
            return json(
                { success: false, error: validationError },
                { status: 400 }
            );
        }
        
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
        
        // Validate salary expectation if provided
        if (userData.salaryExpectation) {
            const salaryError = validateSalaryInput(userData.salaryExpectation);
            if (salaryError) {
                return json(
                    { success: false, error: salaryError },
                    { status: 400 }
                );
            }
        }
        
        // Determine education level
        const educationLevel = (userData.educationLevel || '').toLowerCase();
        const isBelowBachelors = EDUCATION_LEVELS.belowBachelors.has(educationLevel);
        const hasBachelors = EDUCATION_LEVELS.bachelors.has(educationLevel);
        const hasAdvancedDegree = EDUCATION_LEVELS.advanced.has(educationLevel);
        
        // Process in parallel where possible
        const [analysis, recommendations] = await Promise.allSettled([
            analyzeWithDeepSeek(userData, educationLevel),
            generateCareerRecommendations(userData, educationLevel)
        ]);
        
        // Handle API responses
        const analysisResult = analysis.status === 'fulfilled' ? analysis.value : 'Analysis temporarily unavailable. Please try again later.';
        let recommendationsResult = recommendations.status === 'fulfilled' ? recommendations.value : generateMockRecommendations(userData);
        
        // Filter recommendations based on education level
        let filteredRecommendations = recommendationsResult;
        if (isBelowBachelors) {
            filteredRecommendations = filterJobsByCategory(recommendationsResult, 'nonDegree');
        } else if (hasBachelors) {
            filteredRecommendations = filterJobsByCategory(recommendationsResult, 'degreeRequired');
        } else if (hasAdvancedDegree) {
            filteredRecommendations = filterJobsByCategory(recommendationsResult, 'advancedDegree');
        }
        
        // Validate and clean job salaries
        const validatedRecommendations = filteredRecommendations.map(validateAndCleanJobSalary);
        
        // Generate job links
        const jobLinks = generateJobLinks(validatedRecommendations);
        
        // Prepare response
        const response = {
            success: true,
            recommendations: validatedRecommendations,
            analysis: analysisResult,
            jobLinks,
            educationLevel,
            isBelowBachelors
        };
        
        // Cache the response for 5 minutes
        recommendationCache.set(cacheKey, response);
        setTimeout(() => recommendationCache.delete(cacheKey), 5 * 60 * 1000);
        
        return json(response);
        
    } catch (error) {
        console.error('Recommendation error:', error);
        
        // Fallback to mock data
        try {
            const userData = await request.json();
            const educationLevel = (userData.educationLevel || '').toLowerCase();
            const isBelowBachelors = EDUCATION_LEVELS.belowBachelors.has(educationLevel);
            const hasBachelors = EDUCATION_LEVELS.bachelors.has(educationLevel);
            const hasAdvancedDegree = EDUCATION_LEVELS.advanced.has(educationLevel);
            
            let mockRecommendations = generateMockRecommendations(userData);
            
            if (isBelowBachelors) {
                mockRecommendations = filterJobsByCategory(mockRecommendations, 'nonDegree');
            } else if (hasBachelors) {
                mockRecommendations = filterJobsByCategory(mockRecommendations, 'degreeRequired');
            } else if (hasAdvancedDegree) {
                mockRecommendations = filterJobsByCategory(mockRecommendations, 'advancedDegree');
            }
            
            const validatedMockRecommendations = mockRecommendations.map(validateAndCleanJobSalary);
            const mockJobLinks = generateJobLinks(validatedMockRecommendations);
            
            return json({
                success: true,
                recommendations: validatedMockRecommendations,
                jobLinks: mockJobLinks,
                note: 'Using sample data due to API issues'
            });
        } catch (fallbackError) {
            console.error('Fallback error:', fallbackError);
            return json(
                { success: false, error: 'Failed to process request' },
                { status: 500 }
            );
        }
    }
};

function validateUserData(userData: UserData): string | null {
    // Check if userData is an object
    if (typeof userData !== 'object' || userData === null) {
        return 'Invalid user data format. Expected an object.';
    }
    
    // Validate and filter workTypes if provided
    if (userData.workTypes && Array.isArray(userData.workTypes)) {
        const invalidWorkTypes: string[] = [];
        
        // Filter out invalid work types
        userData.workTypes = userData.workTypes.filter(workType => {
            if (typeof workType !== 'string') {
                invalidWorkTypes.push(workType);
                return false;
            }
            
            const lowerWorkType = workType.toLowerCase();
            if (!VALID_WORK_TYPES.has(lowerWorkType)) {
                invalidWorkTypes.push(workType);
                return false;
            }
            return true;
        });
        
        // If we filtered out all work types, provide a helpful error
        if (userData.workTypes.length === 0 && invalidWorkTypes.length > 0) {
            return `No valid work types provided. Valid options are: ${Array.from(VALID_WORK_TYPES).join(', ')}`;
        }
    }
    
    // Validate experience level if provided
    if (userData.experienceLevel && typeof userData.experienceLevel === 'string') {
        if (!VALID_EXPERIENCE_LEVELS.has(userData.experienceLevel.toLowerCase())) {
            return `Invalid experience level: ${userData.experienceLevel}. Valid options are: ${Array.from(VALID_EXPERIENCE_LEVELS).join(', ')}`;
        }
    }
    
    // Validate collaboration preference if provided
    if (userData.collaborationPreference && typeof userData.collaborationPreference === 'string') {
        if (!VALID_COLLABORATION_PREFS.has(userData.collaborationPreference.toLowerCase())) {
            return `Invalid collaboration preference: ${userData.collaborationPreference}. Valid options are: ${Array.from(VALID_COLLABORATION_PREFS).join(', ')}`;
        }
    }
    
    // Validate work setting if provided
    if (userData.workSetting && typeof userData.workSetting === 'string') {
        if (!VALID_WORK_SETTINGS.has(userData.workSetting.toLowerCase())) {
            return `Invalid work setting: ${userData.workSetting}. Valid options are: ${Array.from(VALID_WORK_SETTINGS).join(', ')}`;
        }
    }
    
    // Validate stress handling if provided - map "adaptable" to a valid value
    if (userData.stressHandling && typeof userData.stressHandling === 'string') {
        const stressLevel = userData.stressHandling.toLowerCase();
        
        // Handle the case where "adaptable" is provided
        if (stressLevel === 'adaptable') {
            // Map "adaptable" to "medium" as a reasonable default
            userData.stressHandling = 'medium';
        } 
        else if (!VALID_STRESS_LEVELS.has(stressLevel)) {
            return `Invalid stress handling level: ${userData.stressHandling}. Valid options are: ${Array.from(VALID_STRESS_LEVELS).join(', ')}`;
        }
    }
    
    // Validate arrays (strengths, technicalSkills, certifications)
    const arrayFields = ['strengths', 'technicalSkills', 'certifications'];
    for (const field of arrayFields) {
        if (userData[field as keyof UserData] && Array.isArray(userData[field as keyof UserData])) {
            for (const item of userData[field as keyof UserData] as string[]) {
                if (typeof item !== 'string') {
                    return `Invalid ${field}. All items must be strings.`;
                }
            }
        }
    }
    
    return null;
}

function filterJobsByCategory(recommendations: any[], category: keyof typeof JOB_CATEGORIES): any[] {
    const targetJobs = JOB_CATEGORIES[category];
    return recommendations.filter(job => 
        targetJobs.some(targetJob => 
            job.title.toLowerCase().includes(targetJob) ||
            targetJob.includes(job.title.toLowerCase())
        )
    );
}

async function analyzeWithDeepSeek(userData: UserData, educationLevel: string): Promise<string> {
    // If no API key is provided, return a default analysis
    if (!OPENROUTER_API_KEY) {
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
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://your-site.com',
                'X-Title': 'CareerGenie'
            },
            body: JSON.stringify({
                model: 'deepseek/deepseek-r1-0528:free',
                messages: [
                    {
                        role: 'system',
                        content: `You are a career guidance expert that helps users find ideal career paths based on their education, skills, and preferences. 
                        ${EDUCATION_LEVELS.belowBachelors.has(educationLevel) ? 
                        'IMPORTANT: The user has education below bachelor degree. Only recommend jobs that typically do not require a bachelor degree.' : ''}
                        ${EDUCATION_LEVELS.bachelors.has(educationLevel) ? 
                        'IMPORTANT: The user has a bachelor degree. Only recommend jobs that typically require at least a bachelor degree.' : ''}
                        ${EDUCATION_LEVELS.advanced.has(educationLevel) ? 
                        'IMPORTANT: The user has an advanced degree. Only recommend jobs that typically require master or doctorate degrees.' : ''}
                        Provide detailed, personalized analysis and recommendations.`
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 1500
            })
        });

        if (!response.ok) {
            if (response.status === 429) {
                throw new Error('API rate limit exceeded. Please try again later.');
            }
            throw new Error(`API request failed with status ${response.status}`);
        }

        const result = await response.json();
        return result.choices[0]?.message?.content || 'No analysis available';
    } catch (error) {
        console.error('DeepSeek analysis error:', error);
        return 'Analysis temporarily unavailable. Please try again later.';
    }
}

async function generateCareerRecommendations(userData: UserData, educationLevel: string): Promise<any[]> {
    // If no API key is provided, return mock recommendations
    if (!OPENROUTER_API_KEY) {
        return generateMockRecommendations(userData);
    }

    // First try to get recommendations from AI
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
        
        Return only raw JSON format (no markdown) with this structure:
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
        
        IMPORTANT: ${EDUCATION_LEVELS.belowBachelors.has(educationLevel) ? 
        'Only include jobs that typically do not require a bachelor degree.' : ''}
        ${EDUCATION_LEVELS.bachelors.has(educationLevel) ? 
        'Only include jobs that typically require at least a bachelor degree.' : ''}
        ${EDUCATION_LEVELS.advanced.has(educationLevel) ? 
        'Only include jobs that typically require master or doctorate degrees.' : ''}`;

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://your-site.com',
                'X-Title': 'CareerGenie'
            },
            body: JSON.stringify({
                model: 'deepseek/deepseek-r1-0528:free',
                messages: [
                    {
                        role: 'system',
                        content: `You generate specific career recommendations based on user profiles. 
                        ${EDUCATION_LEVELS.belowBachelors.has(educationLevel) ? 
                        'ONLY recommend jobs that don\'t require a bachelor degree.' : ''}
                        ${EDUCATION_LEVELS.bachelors.has(educationLevel) ? 
                        'ONLY recommend jobs that require at least a bachelor degree.' : ''}
                        ${EDUCATION_LEVELS.advanced.has(educationLevel) ? 
                        'ONLY recommend jobs that require master or doctorate degrees.' : ''}
                        Provide ONLY raw JSON output without any markdown formatting or additional text. 
                        All salary ranges must be in Philippine Peso (₱). 
                        Include a matchPercentage (85-95 for top matches, 70-84 for good matches, below 70 for alternate paths).`
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.5,
                response_format: { type: "json_object" }
            })
        });

        if (!response.ok) {
            if (response.status === 429) {
                throw new Error('API rate limit exceeded. Please try again later.');
            }
            throw new Error(`API request failed with status ${response.status}`);
        }

        const result = await response.json();
        const content = result.choices[0]?.message?.content;
        
        if (!content) {
            return generateMockRecommendations(userData);
        }
        
        // Handle both direct JSON and markdown-wrapped JSON
        let jsonString = content;
        const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch) jsonString = jsonMatch[1];
        
        const parsed = JSON.parse(jsonString);
        return parsed.recommendations || parsed.jobs || [];
        
    } catch (e) {
        console.error('Failed to get AI recommendations:', e);
        return generateMockRecommendations(userData);
    }
}

function generateJobLinks(recommendations: any[]): string[] {
    const jobSites = [
        (title: string, location: string) => `https://www.linkedin.com/jobs/search/?keywords=${title}&location=${location}&geoId=103121230&f_TPR=r86400`,
        (title: string, location: string) => `https://ph.indeed.com/jobs?q=${title}&l=${location}&fromage=7`,
        (title: string, location: string) => `https://www.jobstreet.com.ph/jobs?keywords=${title}&location=${location}&sortBy=createdAt`,
        (title: string, location: string) => `https://www.kalibrr.com/job-board/te/1/job-search?query=${title}`,
        (title: string, location: string) => `https://www.monster.com.ph/jobs/search?q=${title}&where=${location}&tm=r`
    ];
    
    return recommendations.map((job, index) => {
        const cleanTitle = job.title
            .replace(/[^\w\s]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
        
        const encodedTitle = encodeURIComponent(cleanTitle);
        const location = encodeURIComponent('Philippines');
        
        const siteIndex = index % jobSites.length;
        return jobSites[siteIndex](encodedTitle, location);
    });
}

function generateMockRecommendations(userData: UserData) {
    const educationLevel = (userData.educationLevel || '').toLowerCase();
    const isBelowBachelors = EDUCATION_LEVELS.belowBachelors.has(educationLevel);
    const hasBachelors = EDUCATION_LEVELS.bachelors.has(educationLevel);
    const hasAdvancedDegree = EDUCATION_LEVELS.advanced.has(educationLevel);
    
    if (isBelowBachelors) {
        return [
            {
                title: 'Customer Service Representative',
                industry: 'Retail/Banking/Call Centers',
                responsibilities: 'Assist customers with inquiries, resolve complaints, provide product information',
                requiredSkills: ['Communication', 'Patience', 'Problem Solving'],
                salaryRange: '₱15,000 - ₱25,000 per month',
                growthPotential: 'Opportunity to move into supervisory roles or specialize in technical support',
                matchReason: 'Matches your communication skills and ability to handle stress',
                matchPercentage: 88
            },
            {
                title: 'Administrative Assistant',
                industry: 'Various Industries',
                responsibilities: 'Handle office tasks, manage schedules, organize files, assist with correspondence',
                requiredSkills: ['Organization', 'Computer Literacy', 'Time Management'],
                salaryRange: '₱15,000 - ₱25,000 per month',
                growthPotential: 'Can lead to office manager or executive assistant roles',
                matchReason: 'Aligns with your organizational skills and work setting preferences',
                matchPercentage: 85
            }
        ];
    } else if (hasBachelors) {
        const workTypes = userData.workTypes || ['Software Development'];
        const experience = userData.experienceLevel || 'junior';
        const isEntryLevel = experience === 'junior' || experience === 'entry';
        
        return [
            {
                title: `${workTypes[0] || 'Software'} Developer`,
                industry: 'Technology',
                responsibilities: 'Develop and maintain software applications, collaborate with team members, write clean and efficient code',
                requiredSkills: ['Programming', 'Problem Solving', 'Teamwork'],
                salaryRange: isEntryLevel ? '₱25,000 - ₱40,000 per month' : '₱60,000 - ₱120,000 per month',
                growthPotential: 'High demand field with opportunities to specialize or move into leadership',
                matchReason: 'Aligns with your technical skills and interest in software development',
                matchPercentage: 92
            },
            {
                title: 'Data Analyst',
                industry: 'Technology/Finance',
                responsibilities: 'Analyze data trends, create reports, provide business insights',
                requiredSkills: ['Data Analysis', 'Statistics', 'SQL'],
                salaryRange: isEntryLevel ? '₱25,000 - ₱40,000 per month' : '₱50,000 - ₱100,000 per month',
                growthPotential: 'High demand across industries with opportunities in AI/ML',
                matchReason: 'Matches your analytical skills and technical background',
                matchPercentage: 85
            }
        ];
    } else if (hasAdvancedDegree) {
        return [
            {
                title: 'Senior Software Engineer',
                industry: 'Technology',
                responsibilities: 'Design and implement complex software systems, mentor junior engineers, lead technical decisions',
                requiredSkills: ['Advanced Programming', 'System Design', 'Leadership'],
                salaryRange: '₱120,000 - ₱250,000 per month',
                growthPotential: 'Opportunity to move into architecture or CTO roles',
                matchReason: 'Matches your advanced technical skills and education',
                matchPercentage: 92
            },
            {
                title: 'Data Scientist',
                industry: 'Technology/Finance',
                responsibilities: 'Develop machine learning models, analyze complex datasets, provide strategic insights',
                requiredSkills: ['Machine Learning', 'Statistics', 'Python/R'],
                salaryRange: '₱100,000 - ₱200,000 per month',
                growthPotential: 'High demand with opportunities in AI research',
                matchReason: 'Aligns with your advanced analytical skills',
                matchPercentage: 90
            }
        ];
    }
    
    return [];
}

// Salary Validation Functions
function validateSalaryInput(salaryInput: string): string | null {
    if (!salaryInput) return null;
    
    const monthlyMatch = salaryInput.match(SALARY_PATTERNS.monthly);
    const annualMatch = salaryInput.match(SALARY_PATTERNS.annual);
    
    if (!monthlyMatch && !annualMatch) {
        return 'Please specify salary in format like "₱20,000-₱30,000 per month" or "₱500,000 annually"';
    }
    
    try {
        if (monthlyMatch) {
            const min = parseNumber(monthlyMatch[1]);
            const max = monthlyMatch[2] ? parseNumber(monthlyMatch[2]) : min;
            
            if (min < SALARY_CONSTANTS.minMonthly) {
                return `Salary seems too low (minimum expected is ₱${SALARY_CONSTANTS.minMonthly.toLocaleString()} monthly)`;
            }
            if (max > SALARY_CONSTANTS.maxMonthly) {
                return `Salary seems unrealistically high (maximum expected is ₱${SALARY_CONSTANTS.maxMonthly.toLocaleString()} monthly)`;
            }
            if (max < min * (1 + SALARY_CONSTANTS.rangeThreshold)) {
                return 'Salary range should show meaningful progression (e.g., ₱20,000-₱30,000)';
            }
        }
        
        if (annualMatch) {
            const min = parseNumber(annualMatch[1]);
            const max = annualMatch[2] ? parseNumber(annualMatch[2]) : min;
            const minMonthly = min / 12;
            const maxMonthly = max / 12;
            
            if (minMonthly < SALARY_CONSTANTS.minMonthly) {
                return `Annual salary translates to ₱${minMonthly.toLocaleString(undefined, {maximumFractionDigits: 0})} monthly, which is below minimum expected`;
            }
            if (maxMonthly > SALARY_CONSTANTS.maxMonthly) {
                return `Annual salary translates to ₱${maxMonthly.toLocaleString(undefined, {maximumFractionDigits: 0})} monthly, which is unrealistically high`;
            }
            if (max < min * (1 + SALARY_CONSTANTS.rangeThreshold)) {
                return 'Annual salary range should show meaningful progression (e.g., ₱300,000-₱400,000)';
            }
        }
    } catch (e) {
        return 'Invalid salary format. Please use numbers like "₱20,000" or "₱500,000"';
    }
    
    return null;
}

function validateAndCleanJobSalary(job: any): any {
    if (!job.salaryRange) {
        job.salaryRange = generateRealisticSalary(job.title, job.industry);
        return job;
    }
    
    try {
        const standardized = standardizeSalaryFormat(job.salaryRange);
        const parsed = parseSalaryRange(standardized);
        
        if (parsed.min < SALARY_CONSTANTS.minMonthly / (parsed.isAnnual ? 12 : 1)) {
            parsed.min = SALARY_CONSTANTS.minMonthly * (parsed.isAnnual ? 12 : 1);
            if (parsed.max < parsed.min) parsed.max = parsed.min * 1.5;
        }
        
        if (parsed.max > SALARY_CONSTANTS.maxMonthly * (parsed.isAnnual ? 12 : 1)) {
            parsed.max = SALARY_CONSTANTS.maxMonthly * (parsed.isAnnual ? 12 : 1);
            if (parsed.min > parsed.max) parsed.min = parsed.max * 0.7;
        }
        
        job.salaryRange = formatSalaryRange(parsed.min, parsed.max, parsed.isAnnual);
        job.salaryData = parsed;
        
        return job;
    } catch (e) {
        job.salaryRange = generateRealisticSalary(job.title, job.industry);
        return job;
    }
}

function standardizeSalaryFormat(salaryStr: string): string {
    return salaryStr.toLowerCase()
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/(php|pesos?|p)/g, '₱')
        .replace(/(?:per\s*)?(month|mo|monthly)/g, 'per month')
        .replace(/(?:per\s*)?(year|yr|annually)/g, 'per year')
        .replace(/(₱[\d,]+)\s*(?:to|-|–|—)\s*(₱[\d,]+)/g, '$1-$2');
}

function parseSalaryRange(salaryStr: string): {
    min: number;
    max: number;
    isAnnual: boolean;
    currency: string;
} {
    const isAnnual = salaryStr.includes('per year');
    const currency = salaryStr.includes('₱') ? '₱' : '';
    
    const numbers = salaryStr.match(/[\d,]+/g);
    if (!numbers || numbers.length === 0) {
        throw new Error('No numbers found in salary range');
    }
    
    const min = parseNumber(numbers[0]);
    const max = numbers.length > 1 ? parseNumber(numbers[1]) : min;
    
    return { min, max, isAnnual, currency };
}

function parseNumber(numStr: string): number {
    return parseInt(numStr.replace(/,/g, ''), 10);
}

function formatSalaryRange(min: number, max: number, isAnnual: boolean): string {
    const period = isAnnual ? 'per year' : 'per month';
    if (min === max) {
        return `₱${min.toLocaleString('en-PH')} ${period}`;
    }
    return `₱${min.toLocaleString('en-PH')}-₱${max.toLocaleString('en-PH')} ${period}`;
}

function generateRealisticSalary(title: string, industry: string): string {
    const salaryData: Record<string, {min: number, max: number}> = {
        'Customer Service Representative': { min: 15000, max: 25000 },
        'Administrative Assistant': { min: 15000, max: 25000 },
        'Software Developer': { min: 25000, max: 40000 },
        'Senior Software Developer': { min: 60000, max: 120000 },
        'Data Analyst': { min: 25000, max: 40000 },
        'Senior Data Scientist': { min: 100000, max: 200000 },
        'Retail Sales Associate': { min: 12000, max: 20000 },
        'Food Service Worker': { min: 12000, max: 18000 },
        'Warehouse Associate': { min: 15000, max: 22000 },
        'Technical Project Manager': { min: 80000, max: 150000 },
        'Digital Marketing Specialist': { min: 20000, max: 30000 },
        'Cloud Engineer': { min: 40000, max: 60000 },
        'University Professor': { min: 80000, max: 150000 },
        'Medical Director': { min: 150000, max: 300000 },
        'Senior Research Scientist': { min: 90000, max: 180000 }
    };
    
    const entryLevel = /assistant|junior|entry/i.test(title);
    const seniorLevel = /senior|lead|manager|director|professor|scientist/i.test(title);
    
    for (const [role, range] of Object.entries(salaryData)) {
        if (title.toLowerCase().includes(role.toLowerCase())) {
            if (seniorLevel) return formatSalaryRange(range.max * 1.5, range.max * 2.5, false);
            if (entryLevel) return formatSalaryRange(range.min * 0.8, range.min * 1.2, false);
            return formatSalaryRange(range.min, range.max, false);
        }
    }
    
    switch (industry.toLowerCase()) {
        case 'technology':
            return entryLevel 
                ? '₱25,000-₱40,000 per month' 
                : seniorLevel 
                    ? '₱80,000-₱150,000 per month' 
                    : '₱40,000-₱80,000 per month';
        case 'retail':
            return '₱12,000-₱20,000 per month';
        case 'hospitality':
            return '₱12,000-₱18,000 per month';
        case 'marketing':
            return entryLevel ? '₱20,000-₱30,000 per month' : '₱40,000-₱80,000 per month';
        case 'education':
            return seniorLevel ? '₱80,000-₱150,000 per month' : '₱25,000-₱50,000 per month';
        case 'healthcare':
            return seniorLevel ? '₱150,000-₱300,000 per month' : '₱30,000-₱60,000 per month';
        case 'science':
            return seniorLevel ? '₱90,000-₱180,000 per month' : '₱30,000-₱60,000 per month';
        default:
            return '₱15,000-₱25,000 per month';
    }
}
