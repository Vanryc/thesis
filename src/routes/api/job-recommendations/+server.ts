import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { OPENROUTER_API_KEY } from '$env/static/private';

// Rate limiting setup
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 5;

// Pre-compiled regex patterns
const SALARY_PATTERNS = {
    monthly: /(?:₱|php|pesos?)\s*([\d,]+)(?:\s*-\s*([\d,]+))?\s*(?:per\s*month|monthly)/i,
    annual: /(?:₱|php|pesos?)\s*([\d,]+)(?:\s*-\s*([\d,]+))?\s*(?:per\s*year|annually)/i
};

// Comprehensive job database with realistic salary data
const JOB_DATABASE = {
    nonDegree: [
        {
            title: 'Customer Service Representative',
            industry: 'Retail/Banking/Call Centers',
            responsibilities: 'Assist customers with inquiries, resolve complaints, provide product information',
            requiredSkills: ['Communication', 'Patience', 'Problem Solving'],
            salaryRange: '₱15,000 - ₱25,000 per month',
            minSalary: 15000,
            maxSalary: 25000,
            isAnnual: false,
            growthPotential: 'Opportunity to move into supervisory roles or specialize in technical support',
            educationRequirements: 'High school diploma or equivalent',
            experienceLevel: 'entry'
        },
        {
            title: 'Administrative Assistant',
            industry: 'Various Industries',
            responsibilities: 'Handle office tasks, manage schedules, organize files, assist with correspondence',
            requiredSkills: ['Organization', 'Computer Literacy', 'Time Management'],
            salaryRange: '₱15,000 - ₱25,000 per month',
            minSalary: 15000,
            maxSalary: 25000,
            isAnnual: false,
            growthPotential: 'Can lead to office manager or executive assistant roles',
            educationRequirements: 'High school diploma, vocational training preferred',
            experienceLevel: 'entry'
        },
        {
            title: 'Retail Sales Associate',
            industry: 'Retail',
            responsibilities: 'Assist customers, process transactions, maintain store appearance',
            requiredSkills: ['Customer Service', 'Sales', 'Communication'],
            salaryRange: '₱12,000 - ₱20,000 per month',
            minSalary: 12000,
            maxSalary: 20000,
            isAnnual: false,
            growthPotential: 'Opportunity to become store supervisor or manager',
            educationRequirements: 'High school diploma',
            experienceLevel: 'entry'
        },
        {
            title: 'Food Service Worker',
            industry: 'Hospitality',
            responsibilities: 'Prepare food, serve customers, maintain cleanliness',
            requiredSkills: ['Food Safety', 'Customer Service', 'Teamwork'],
            salaryRange: '₱12,000 - ₱18,000 per month',
            minSalary: 12000,
            maxSalary: 18000,
            isAnnual: false,
            growthPotential: 'Can advance to shift supervisor or restaurant manager',
            educationRequirements: 'High school diploma or equivalent',
            experienceLevel: 'entry'
        },
        {
            title: 'Warehouse Associate',
            industry: 'Logistics',
            responsibilities: 'Receive and process inventory, fulfill orders, maintain warehouse organization',
            requiredSkills: ['Physical Stamina', 'Organization', 'Attention to Detail'],
            salaryRange: '₱15,000 - ₱22,000 per month',
            minSalary: 15000,
            maxSalary: 22000,
            isAnnual: false,
            growthPotential: 'Can advance to warehouse supervisor or logistics coordinator',
            educationRequirements: 'High school diploma',
            experienceLevel: 'entry'
        }
    ],
    degreeRequired: [
        {
            title: 'Software Developer',
            industry: 'Technology',
            responsibilities: 'Develop and maintain software applications, collaborate with team members, write clean and efficient code',
            requiredSkills: ['Programming', 'Problem Solving', 'Teamwork'],
            salaryRange: '₱25,000 - ₱40,000 per month',
            minSalary: 25000,
            maxSalary: 40000,
            isAnnual: false,
            growthPotential: 'High demand field with opportunities to specialize or move into leadership',
            educationRequirements: "Bachelor's degree in Computer Science or related field",
            experienceLevel: 'junior'
        },
        {
            title: 'Data Analyst',
            industry: 'Technology/Finance',
            responsibilities: 'Analyze data trends, create reports, provide business insights',
            requiredSkills: ['Data Analysis', 'Statistics', 'SQL'],
            salaryRange: '₱25,000 - ₱40,000 per month',
            minSalary: 25000,
            maxSalary: 40000,
            isAnnual: false,
            growthPotential: 'High demand across industries with opportunities in AI/ML',
            educationRequirements: "Bachelor's degree in Statistics, Mathematics, or related field",
            experienceLevel: 'junior'
        },
        {
            title: 'Marketing Specialist',
            industry: 'Marketing',
            responsibilities: 'Develop marketing campaigns, analyze market trends, manage social media',
            requiredSkills: ['Creativity', 'Analytics', 'Communication'],
            salaryRange: '₱20,000 - ₱30,000 per month',
            minSalary: 20000,
            maxSalary: 30000,
            isAnnual: false,
            growthPotential: 'Can advance to marketing manager or director roles',
            educationRequirements: "Bachelor's degree in Marketing, Communications, or related field",
            experienceLevel: 'junior'
        },
        {
            title: 'Financial Analyst',
            industry: 'Finance',
            responsibilities: 'Analyze financial data, prepare reports, provide investment recommendations',
            requiredSkills: ['Financial Analysis', 'Excel', 'Attention to Detail'],
            salaryRange: '₱30,000 - ₱50,000 per month',
            minSalary: 30000,
            maxSalary: 50000,
            isAnnual: false,
            growthPotential: 'Opportunity to become senior analyst or finance manager',
            educationRequirements: "Bachelor's degree in Finance, Accounting, or related field",
            experienceLevel: 'junior'
        },
        {
            title: 'HR Coordinator',
            industry: 'Human Resources',
            responsibilities: 'Assist with recruitment, maintain employee records, support HR initiatives',
            requiredSkills: ['Communication', 'Organization', 'Confidentiality'],
            salaryRange: '₱20,000 - ₱30,000 per month',
            minSalary: 20000,
            maxSalary: 30000,
            isAnnual: false,
            growthPotential: 'Can advance to HR manager or specialist roles',
            educationRequirements: "Bachelor's degree in Human Resources, Psychology, or related field",
            experienceLevel: 'junior'
        }
    ],
    advancedDegree: [
        {
            title: 'Senior Software Engineer',
            industry: 'Technology',
            responsibilities: 'Design and implement complex software systems, mentor junior engineers, lead technical decisions',
            requiredSkills: ['Advanced Programming', 'System Design', 'Leadership'],
            salaryRange: '₱80,000 - ₱150,000 per month',
            minSalary: 80000,
            maxSalary: 150000,
            isAnnual: false,
            growthPotential: 'Opportunity to move into architecture or CTO roles',
            educationRequirements: "Bachelor's degree in Computer Science (Master's preferred) + 5+ years experience",
            experienceLevel: 'senior'
        },
        {
            title: 'Data Scientist',
            industry: 'Technology/Finance',
            responsibilities: 'Develop machine learning models, analyze complex datasets, provide strategic insights',
            requiredSkills: ['Machine Learning', 'Statistics', 'Python/R'],
            salaryRange: '₱70,000 - ₱120,000 per month',
            minSalary: 70000,
            maxSalary: 120000,
            isAnnual: false,
            growthPotential: 'High demand with opportunities in AI research',
            educationRequirements: "Master's or PhD in Data Science, Statistics, or related field",
            experienceLevel: 'senior'
        },
        {
            title: 'Technical Project Manager',
            industry: 'Technology',
            responsibilities: 'Lead technical projects, coordinate teams, manage budgets and timelines',
            requiredSkills: ['Project Management', 'Technical Knowledge', 'Leadership'],
            salaryRange: '₱80,000 - ₱150,000 per month',
            minSalary: 80000,
            maxSalary: 150000,
            isAnnual: false,
            growthPotential: 'Can advance to director of project management or CTO',
            educationRequirements: "Bachelor's degree in relevant field (Master's preferred) + PMP certification",
            experienceLevel: 'senior'
        },
        {
            title: 'University Professor',
            industry: 'Education',
            responsibilities: 'Teach courses, conduct research, publish academic papers, mentor students',
            requiredSkills: ['Subject Expertise', 'Research', 'Teaching'],
            salaryRange: '₱80,000 - ₱150,000 per month',
            minSalary: 80000,
            maxSalary: 150000,
            isAnnual: false,
            growthPotential: 'Opportunity for tenure, department chair, or research director roles',
            educationRequirements: 'PhD in relevant field',
            experienceLevel: 'senior'
        },
        {
            title: 'Medical Director',
            industry: 'Healthcare',
            responsibilities: 'Oversee medical operations, develop policies, ensure quality patient care',
            requiredSkills: ['Medical Expertise', 'Leadership', 'Administration'],
            salaryRange: '₱150,000 - ₱300,000 per month',
            minSalary: 150000,
            maxSalary: 300000,
            isAnnual: false,
            growthPotential: 'Can advance to executive roles in healthcare organizations',
            educationRequirements: 'Medical degree (MD) + relevant specialization and administrative experience',
            experienceLevel: 'executive'
        }
    ]
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

// Stress handling level mappings for common alternative inputs
const STRESS_LEVEL_MAPPINGS: Record<string, string> = {
    'thrive': 'high',
    'calm': 'low',
    'adaptable': 'medium',
    'flexible': 'medium',
    'resilient': 'high',
    'anxious': 'low',
    'stressed': 'high'
};

// Work setting mappings for common alternative inputs
const WORK_SETTING_MAPPINGS: Record<string, string> = {
    'flexible': 'hybrid',
    'work from home': 'remote',
    'wfh': 'remote',
    'onsite': 'office',
    'in-person': 'office',
    'corporate': 'office',
    'construction': 'field',
    'manufacturing': 'field',
    'retail': 'office',
    'store': 'office'
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
                recommendations: generateRealisticRecommendations({} as UserData),
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
        let recommendationsResult = recommendations.status === 'fulfilled' ? recommendations.value : generateRealisticRecommendations(userData);
        
        // Filter recommendations based on education level
        let filteredRecommendations = recommendationsResult;
        if (isBelowBachelors) {
            filteredRecommendations = filterJobsByCategory(recommendationsResult, 'nonDegree');
        } else if (hasBachelors) {
            filteredRecommendations = filterJobsByCategory(recommendationsResult, 'degreeRequired');
        } else if (hasAdvancedDegree) {
            filteredRecommendations = filterJobsByCategory(recommendationsResult, 'advancedDegree');
        }
        
        // Personalize recommendations based on user profile
        const personalizedRecommendations = personalizeRecommendations(filteredRecommendations, userData);
        
        // Generate job links
        const jobLinks = generateJobLinks(personalizedRecommendations);
        
        // Prepare response
        const response = {
            success: true,
            recommendations: personalizedRecommendations,
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
        
        // Fallback to realistic data
        try {
            const userData = await request.json();
            const educationLevel = (userData.educationLevel || '').toLowerCase();
            const isBelowBachelors = EDUCATION_LEVELS.belowBachelors.has(educationLevel);
            const hasBachelors = EDUCATION_LEVELS.bachelors.has(educationLevel);
            const hasAdvancedDegree = EDUCATION_LEVELS.advanced.has(educationLevel);
            
            let realisticRecommendations = generateRealisticRecommendations(userData);
            
            if (isBelowBachelors) {
                realisticRecommendations = filterJobsByCategory(realisticRecommendations, 'nonDegree');
            } else if (hasBachelors) {
                realisticRecommendations = filterJobsByCategory(realisticRecommendations, 'degreeRequired');
            } else if (hasAdvancedDegree) {
                realisticRecommendations = filterJobsByCategory(realisticRecommendations, 'advancedDegree');
            }
            
            const personalizedRecommendations = personalizeRecommendations(realisticRecommendations, userData);
            const jobLinks = generateJobLinks(personalizedRecommendations);
            
            return json({
                success: true,
                recommendations: personalizedRecommendations,
                jobLinks,
                note: 'Using realistic data due to API issues'
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
    
    // Validate work setting if provided - map common alternatives to valid values
    if (userData.workSetting && typeof userData.workSetting === 'string') {
        const workSetting = userData.workSetting.toLowerCase();
        
        // Check if we need to map to a valid value
        if (WORK_SETTING_MAPPINGS[workSetting]) {
            userData.workSetting = WORK_SETTING_MAPPINGS[workSetting];
        } 
        else if (!VALID_WORK_SETTINGS.has(workSetting)) {
            return `Invalid work setting: ${userData.workSetting}. Valid options are: ${Array.from(VALID_WORK_SETTINGS).join(', ')}`;
        }
    }
    
    // Validate stress handling if provided - map common alternatives to valid values
    if (userData.stressHandling && typeof userData.stressHandling === 'string') {
        const stressLevel = userData.stressHandling.toLowerCase();
        
        // Check if we need to map to a valid value
        if (STRESS_LEVEL_MAPPINGS[stressLevel]) {
            userData.stressHandling = STRESS_LEVEL_MAPPINGS[stressLevel];
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

function filterJobsByCategory(recommendations: any[], category: keyof typeof JOB_DATABASE): any[] {
    // If we have AI-generated recommendations, return them directly
    if (recommendations.length > 0 && !recommendations[0].hasOwnProperty('minSalary')) {
        return recommendations;
    }
    
    // Otherwise, use our database
    return [...JOB_DATABASE[category]];
}

function personalizeRecommendations(recommendations: any[], userData: UserData): any[] {
    return recommendations.map(job => {
        // Calculate match percentage based on user profile
        let matchPercentage = calculateMatchPercentage(job, userData);
        
        // Generate personalized match reason
        const matchReason = generateMatchReason(job, userData, matchPercentage);
        
        // Adjust salary based on experience if needed
        let adjustedJob = adjustSalaryBasedOnExperience(job, userData.experienceLevel);
        
        return {
            ...adjustedJob,
            matchPercentage,
            matchReason
        };
    }).sort((a, b) => b.matchPercentage - a.matchPercentage); // Sort by best match first
}

function calculateMatchPercentage(job: any, userData: UserData): number {
    let score = 70; // Base score
    
    // Experience level matching
    if (userData.experienceLevel && job.experienceLevel) {
        const experienceMap: Record<string, number> = {
            'entry': 0, 'junior': 1, 'mid': 2, 'senior': 3, 'lead': 4, 'executive': 5
        };
        
        const userExp = experienceMap[userData.experienceLevel.toLowerCase()] || 0;
        const jobExp = experienceMap[job.experienceLevel.toLowerCase()] || 0;
        
        if (userExp >= jobExp) {
            score += 10; // User has sufficient experience
        } else if (userExp + 1 >= jobExp) {
            score += 5; // User is close to required experience
        } else {
            score -= 10; // User doesn't have enough experience
        }
    }
    
    // Work type preferences
    if (userData.workTypes && job.workTypes) {
        const commonWorkTypes = userData.workTypes.filter(type => 
            job.workTypes.includes(type)
        );
        if (commonWorkTypes.length > 0) {
            score += 5 * commonWorkTypes.length;
        }
    }
    
    // Skills matching
    if (userData.technicalSkills && job.requiredSkills) {
        const userSkills = userData.technicalSkills.map(s => s.toLowerCase());
        const jobSkills = job.requiredSkills.map((s: string) => s.toLowerCase());
        
        const matchingSkills = jobSkills.filter((skill: string) => 
            userSkills.some(userSkill => userSkill.includes(skill) || skill.includes(userSkill))
        );
        
        score += 3 * matchingSkills.length;
    }
    
    // Strengths matching
    if (userData.strengths && job.requiredSkills) {
        const userStrengths = userData.strengths.map(s => s.toLowerCase());
        const jobSkills = job.requiredSkills.map((s: string) => s.toLowerCase());
        
        const matchingStrengths = jobSkills.filter((skill: string) => 
            userStrengths.some(strength => strength.includes(skill) || skill.includes(strength))
        );
        
        score += 2 * matchingStrengths.length;
    }
    
    // Ensure score is within 0-100 range
    return Math.max(0, Math.min(100, Math.round(score)));
}

function generateMatchReason(job: any, userData: UserData, matchPercentage: number): string {
    const reasons = [];
    
    // Education match
    if (userData.educationLevel) {
        reasons.push(`matches your ${userData.educationLevel} education level`);
    }
    
    // Experience match
    if (userData.experienceLevel && job.experienceLevel) {
        if (userData.experienceLevel.toLowerCase() === job.experienceLevel.toLowerCase()) {
            reasons.push(`aligns with your ${userData.experienceLevel} experience level`);
        } else if (['senior', 'lead', 'executive'].includes(userData.experienceLevel.toLowerCase()) &&
                   ['entry', 'junior', 'mid'].includes(job.experienceLevel.toLowerCase())) {
            reasons.push(`could be a good fit given your ${userData.experienceLevel} experience`);
        }
    }
    
    // Skills match
    if (userData.technicalSkills && job.requiredSkills) {
        const userSkills = userData.technicalSkills.map(s => s.toLowerCase());
        const jobSkills = job.requiredSkills.map((s: string) => s.toLowerCase());
        
        const matchingSkills = jobSkills.filter((skill: string) => 
            userSkills.some(userSkill => userSkill.includes(skill) || skill.includes(userSkill))
        );
        
        if (matchingSkills.length > 0) {
            reasons.push(`matches your skills in ${matchingSkills.slice(0, 2).join(' and ')}`);
        }
    }
    
    // Work type preferences
    if (userData.workTypes && job.workTypes) {
        const commonWorkTypes = userData.workTypes.filter(type => 
            job.workTypes.includes(type)
        );
        if (commonWorkTypes.length > 0) {
            reasons.push(`aligns with your preference for ${commonWorkTypes.join(' and ')} work`);
        }
    }
    
    // If no specific reasons found, use a generic one based on match percentage
    if (reasons.length === 0) {
        if (matchPercentage >= 85) {
            return "Excellent match based on your overall profile";
        } else if (matchPercentage >= 70) {
            return "Good match considering your skills and preferences";
        } else {
            return "Potential alternative career path to consider";
        }
    }
    
    return `This role ${reasons.join(', ')}`;
}

function adjustSalaryBasedOnExperience(job: any, experienceLevel?: string): any {
    if (!experienceLevel || !job.minSalary || !job.maxSalary) return job;
    
    const level = experienceLevel.toLowerCase();
    let minMultiplier = 1;
    let maxMultiplier = 1;
    
    if (level === 'entry' || level === 'junior') {
        minMultiplier = 0.8;
        maxMultiplier = 0.9;
    } else if (level === 'senior' || level === 'lead' || level === 'executive') {
        minMultiplier = 1.2;
        maxMultiplier = 1.5;
    }
    
    const adjustedMin = Math.round(job.minSalary * minMultiplier);
    const adjustedMax = Math.round(job.maxSalary * maxMultiplier);
    
    return {
        ...job,
        minSalary: adjustedMin,
        maxSalary: adjustedMax,
        salaryRange: formatSalaryRange(adjustedMin, adjustedMax, job.isAnnual || false)
    };
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
    // If no API key is provided, return realistic recommendations
    if (!OPENROUTER_API_KEY) {
        return generateRealisticRecommendations(userData);
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
            return generateRealisticRecommendations(userData);
        }
        
        // Handle both direct JSON and markdown-wrapped JSON
        let jsonString = content;
        const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch) jsonString = jsonMatch[1];
        
        const parsed = JSON.parse(jsonString);
        return parsed.recommendations || parsed.jobs || [];
        
    } catch (e) {
        console.error('Failed to get AI recommendations:', e);
        return generateRealisticRecommendations(userData);
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

function generateRealisticRecommendations(userData: UserData) {
    const educationLevel = (userData.educationLevel || '').toLowerCase();
    const isBelowBachelors = EDUCATION_LEVELS.belowBachelors.has(educationLevel);
    const hasBachelors = EDUCATION_LEVELS.bachelors.has(educationLevel);
    const hasAdvancedDegree = EDUCATION_LEVELS.advanced.has(educationLevel);
    
    if (isBelowBachelors) {
        return [...JOB_DATABASE.nonDegree];
    } else if (hasBachelors) {
        return [...JOB_DATABASE.degreeRequired];
    } else if (hasAdvancedDegree) {
        return [...JOB_DATABASE.advancedDegree];
    }
    
    // Default return if education level not recognized
    return [...JOB_DATABASE.nonDegree];
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
        // Salary validation constants
        const SALARY_CONSTANTS = {
            minMonthly: 10000,
            maxMonthly: 500000,
            rangeThreshold: 0.5
        };
        
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
