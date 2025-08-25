// src/routes/api/job-recommendations/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { OPENROUTER_API_KEY } from '$env/static/private';

// List of jobs that don't require bachelor's degrees
const NON_DEGREE_JOBS = [
    'Customer Service Representative', 'Retail Sales Associate', 'Administrative Assistant',
    'Food Service Worker', 'Security Guard', 'Delivery Driver', 'Warehouse Worker',
    'Housekeeper', 'Cashier', 'Receptionist', 'Data Entry Clerk', 'Caregiver',
    'Construction Worker', 'Electrician', 'Plumber', 'Automotive Technician',
    'Hair Stylist', 'Beautician', 'Medical Assistant', 'Pharmacy Technician',
    'Dental Assistant', 'HVAC Technician', 'Welder', 'Machinist', 'Carpenter',
    'Painter', 'Landscaper', 'Janitor', 'Cook', 'Bartender', 'Barista',
    'Bank Teller', 'Call Center Agent', 'Freelance Writer', 'Graphic Designer',
    'Web Designer', 'Social Media Manager', 'Photographer', 'Fitness Trainer',
    'Massage Therapist', 'Nanny', 'Personal Care Aide', 'Home Health Aide',
    'Truck Driver', 'Forklift Operator', 'Shipping Clerk', 'Stock Clerk',
    'Tailor', 'Jeweler', 'Baker', 'Butcher', 'Florist', 'Farm Worker',
    'Fishery Worker', 'Tour Guide', 'Event Planner', 'Dog Trainer'
];

// List of jobs that require at least a bachelor's degree
const DEGREE_REQUIRED_JOBS = [
    'Software Engineer', 'Data Scientist', 'Financial Analyst', 'Accountant',
    'Registered Nurse', 'Teacher', 'Architect', 'Civil Engineer',
    'Mechanical Engineer', 'Electrical Engineer', 'Marketing Manager',
    'Human Resources Manager', 'Project Manager', 'Business Analyst',
    'Pharmacist', 'Physician', 'Dentist', 'Psychologist', 'Lawyer',
    'Professor', 'Research Scientist', 'IT Manager', 'Systems Analyst',
    'Database Administrator', 'Network Engineer', 'Biomedical Engineer',
    'Environmental Scientist', 'Urban Planner', 'Economist', 'Social Worker'
];

// List of jobs that typically require advanced degrees (Master's or Doctorate)
const ADVANCED_DEGREE_JOBS = [
    'Senior Software Engineer', 'Data Architect', 'Chief Financial Officer',
    'Clinical Psychologist', 'Surgeon', 'University Professor', 'Research Director',
    'Principal Engineer', 'Senior Research Scientist', 'Executive Director',
    'Medical Director', 'Dean of Faculty', 'Policy Advisor', 'Senior Economist',
    'Chief Technology Officer', 'Chief Medical Officer', 'Judge', 'Patent Attorney'
];

// Salary validation constants
const MIN_MONTHLY_SALARY_PHP = 10000; // Minimum wage in Philippines is ~₱12,000
const MAX_MONTHLY_SALARY_PHP = 500000; // Realistic upper bound for executive positions
const SALARY_RANGE_THRESHOLD = 0.5; // Max difference between min and max should be at least 50%

export const POST: RequestHandler = async ({ request }) => {
    try {
        const userData = await request.json();
        console.log('Received user data:', userData);
        
        if (!userData || Object.keys(userData).length === 0) {
            return json(
                { success: false, error: 'No user data provided' },
                { status: 400 }
            );
        }
        
        // Validate user's salary expectation if provided
        if (userData.salaryExpectation) {
            const salaryError = validateSalaryInput(userData.salaryExpectation);
            if (salaryError) {
                return json(
                    { success: false, error: salaryError },
                    { status: 400 }
                );
            }
        }
        
        // Check education level and filter recommendations accordingly
        const educationLevel = userData.educationLevel?.toLowerCase() || '';
        const isBelowBachelors = ['high school', 'vocational', 'associate', 'some college', 'secondary', 'other'].includes(educationLevel);
        const hasBachelors = educationLevel === 'bachelor';
        const hasAdvancedDegree = ['master', 'doctorate'].includes(educationLevel);
        
        const analysis = await analyzeWithDeepSeek(userData);
        console.log('DeepSeek analysis:', analysis);
        
        let recommendations = await generateCareerRecommendations(analysis);
        console.log('Generated recommendations:', recommendations);
        
        // Validate and clean recommendation salaries
        recommendations = recommendations.map(job => {
            const validatedJob = validateAndCleanJobSalary(job);
            // Ensure salary is included in the response
            return {
                ...validatedJob,
                salary: validatedJob.salaryRange // Make sure salary is included
            };
        });
        
        // Filter recommendations based on education level
        if (isBelowBachelors) {
            recommendations = filterNonDegreeJobs(recommendations);
            console.log('Filtered recommendations for non-degree holder:', recommendations);
        } else if (hasBachelors) {
            recommendations = filterDegreeRequiredJobs(recommendations);
            console.log('Filtered recommendations for bachelor degree holder:', recommendations);
        } else if (hasAdvancedDegree) {
            recommendations = filterAdvancedDegreeJobs(recommendations);
            console.log('Filtered recommendations for advanced degree holder:', recommendations);
        }
        
        // Get job links for all recommendations
        const jobLinks = generateJobLinks(recommendations);
        
        return json({
            success: true,
            recommendations,
            analysis,
            jobLinks,
            educationLevel,
            isBelowBachelors
        });
    } catch (error) {
        console.error('Recommendation error:', error);
        const userData = await request.json();
        const educationLevel = userData.educationLevel?.toLowerCase() || '';
        const isBelowBachelors = ['high school', 'vocational', 'associate', 'some college', 'secondary', 'other'].includes(educationLevel);
        const hasBachelors = educationLevel === 'bachelor';
        const hasAdvancedDegree = ['master', 'doctorate'].includes(educationLevel);

        // Ensure validateAndCleanJobSalary is declared before this usage
        let mockRecommendations = generateMockRecommendations(userData);
        mockRecommendations = mockRecommendations.map(job => {
            const validatedJob = validateAndCleanJobSalary(job);
            return {
                ...validatedJob,
                salary: validatedJob.salaryRange // Make sure salary is included
            };
        });

        // Filter mock recommendations based on education level
        if (isBelowBachelors) {
            mockRecommendations = filterNonDegreeJobs(mockRecommendations);
        } else if (hasBachelors) {
            mockRecommendations = filterDegreeRequiredJobs(mockRecommendations);
        } else if (hasAdvancedDegree) {
            mockRecommendations = filterAdvancedDegreeJobs(mockRecommendations);
        }

        const mockJobLinks = generateJobLinks(mockRecommendations);

        return json({
            success: true,
            recommendations: mockRecommendations,
            jobLinks: mockJobLinks,
            note: 'Using sample data due to API issues'
        });
    }
};

function filterNonDegreeJobs(recommendations: any[]): any[] {
    return recommendations.filter(job => 
        NON_DEGREE_JOBS.some(nonDegreeJob => 
            job.title.toLowerCase().includes(nonDegreeJob.toLowerCase()) ||
            nonDegreeJob.toLowerCase().includes(job.title.toLowerCase())
        )
    );
}

function filterDegreeRequiredJobs(recommendations: any[]): any[] {
    return recommendations.filter(job => 
        DEGREE_REQUIRED_JOBS.some(degreeJob => 
            job.title.toLowerCase().includes(degreeJob.toLowerCase()) ||
            degreeJob.toLowerCase().includes(job.title.toLowerCase())
        )
    );
}

function filterAdvancedDegreeJobs(recommendations: any[]): any[] {
    return recommendations.filter(job => 
        ADVANCED_DEGREE_JOBS.some(advancedJob => 
            job.title.toLowerCase().includes(advancedJob.toLowerCase()) ||
            advancedJob.toLowerCase().includes(job.title.toLowerCase())
        )
    );
}

async function analyzeWithDeepSeek(userData: any): Promise<string> {
    const educationLevel = userData.educationLevel || 'Not specified';
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
    - Collaboration Preference: ${userData.collaboration || 'Not specified'}
    
    Provide your analysis in clear, structured markdown format. 
    ${['highschool', 'associate', 'vocational', 'other'].includes(educationLevel.toLowerCase()) ? 
      'NOTE: User has education below bachelor degree - recommend only jobs that typically do not require a bachelor degree.' : ''}
    ${educationLevel.toLowerCase() === 'bachelor' ? 
      'NOTE: User has a bachelor degree - recommend jobs that typically require at least a bachelor degree.' : ''}
    ${['master', 'doctorate'].includes(educationLevel.toLowerCase()) ? 
      'NOTE: User has an advanced degree - recommend jobs that typically require master or doctorate degrees.' : ''}`;

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
                    ${['highschool', 'associate', 'vocational', 'other'].includes(educationLevel.toLowerCase()) ? 
                    'IMPORTANT: The user has education below bachelor degree. Only recommend jobs that typically do not require a bachelor degree.' : ''}
                    ${educationLevel.toLowerCase() === 'bachelor' ? 
                    'IMPORTANT: The user has a bachelor degree. Only recommend jobs that typically require at least a bachelor degree.' : ''}
                    ${['master', 'doctorate'].includes(educationLevel.toLowerCase()) ? 
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
        throw new Error(`API request failed with status ${response.status}`);
    }

    const result = await response.json();
    return result.choices[0]?.message?.content || 'No analysis available';
}

async function generateCareerRecommendations(analysis: string): Promise<any[]> {
    // Extract education level from analysis to ensure proper filtering
    const educationLevelMatch = analysis.match(/Education Level: ([^\n]+)/i);
    const educationLevel = educationLevelMatch ? educationLevelMatch[1].toLowerCase() : '';
    
    const prompt = `Based on this career analysis, generate 5-10 specific job recommendations with details:
    
    Career Analysis:
    ${analysis}
    
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
    
    IMPORTANT: ${['highschool', 'associate', 'vocational', 'other'].includes(educationLevel) ? 
    'Only include jobs that typically do not require a bachelor degree.' : ''}
    ${educationLevel === 'bachelor' ? 
    'Only include jobs that typically require at least a bachelor degree.' : ''}
    ${['master', 'doctorate'].includes(educationLevel) ? 
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
                    content: `You generate specific career recommendations based on analysis. 
                    ${['highschool', 'associate', 'vocational', 'other'].includes(educationLevel) ? 
                    'ONLY recommend jobs that don\'t require a bachelor degree.' : ''}
                    ${educationLevel === 'bachelor' ? 
                    'ONLY recommend jobs that require at least a bachelor degree.' : ''}
                    ${['master', 'doctorate'].includes(educationLevel) ? 
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
        throw new Error(`API request failed with status ${response.status}`);
    }

    const result = await response.json();
    let content: string | undefined;
    try {
        content = result.choices[0]?.message?.content;
        if (!content) return generateMockRecommendations({ educationLevel });
        
        // Handle both direct JSON and markdown-wrapped JSON
        let jsonString = content;
        const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch) jsonString = jsonMatch[1];
        
        const parsed = JSON.parse(jsonString);
        return parsed.recommendations || parsed.jobs || [];
    } catch (e) {
        console.error('Failed to parse recommendations:', e);
        console.error('Original content:', content);
        return generateMockRecommendations({ educationLevel });
    }
}

function generateJobLinks(recommendations: any[]): string[] {
    return recommendations.map((job, index) => {
        const cleanTitle = job.title
            .replace(/[^\w\s]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
        
        const encodedTitle = encodeURIComponent(cleanTitle);
        const location = encodeURIComponent('Philippines');
        
        const sites = [
            () => `https://www.linkedin.com/jobs/search/?keywords=${encodedTitle}&location=${location}&geoId=103121230&f_TPR=r86400`,
            () => `https://ph.indeed.com/jobs?q=${encodedTitle}&l=Philippines&fromage=7`,
            () => `https://www.jobstreet.com.ph/jobs?keywords=${encodedTitle}&location=Philippines&sortBy=createdAt`,
            () => `https://www.kalibrr.com/job-board/te/1/job-search?query=${encodedTitle}`,
            () => `https://www.monster.com.ph/jobs/search?q=${encodedTitle}&where=Philippines&tm=r`
        ];
        
        const siteIndex = index % sites.length;
        return sites[siteIndex]();
    });
}

function generateMockRecommendations(userData: any) {
    const educationLevel = userData.educationLevel?.toLowerCase() || '';
    const isBelowBachelors = ['highschool', 'vocational', 'associate', 'other'].includes(educationLevel);
    const hasBachelors = educationLevel === 'bachelor';
    const hasAdvancedDegree = ['master', 'doctorate'].includes(educationLevel);
    
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
            },
            {
                title: 'Retail Sales Associate',
                industry: 'Retail',
                responsibilities: 'Assist customers, process transactions, maintain store appearance',
                requiredSkills: ['Customer Service', 'Basic Math', 'Product Knowledge'],
                salaryRange: '₱12,000 - ₱20,000 per month',
                growthPotential: 'Opportunity to become store supervisor or manager',
                matchReason: 'Matches your interpersonal skills and work motivation',
                matchPercentage: 82
            },
            {
                title: 'Food Service Worker',
                industry: 'Hospitality',
                responsibilities: 'Prepare food, serve customers, maintain cleanliness',
                requiredSkills: ['Teamwork', 'Hygiene Standards', 'Customer Service'],
                salaryRange: '₱12,000 - ₱18,000 per month',
                growthPotential: 'Can progress to chef or restaurant manager positions',
                matchReason: 'Aligns with your ability to work in fast-paced environments',
                matchPercentage: 78
            },
            {
                title: 'Warehouse Associate',
                industry: 'Logistics',
                responsibilities: 'Receive and process inventory, prepare orders, maintain storage areas',
                requiredSkills: ['Physical Stamina', 'Attention to Detail', 'Teamwork'],
                salaryRange: '₱15,000 - ₱22,000 per month',
                growthPotential: 'Can move into supervisory or logistics coordinator roles',
                matchReason: 'Matches your preference for hands-on work and collaboration style',
                matchPercentage: 80
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
            },
            {
                title: 'Marketing Specialist',
                industry: 'Marketing',
                responsibilities: 'Develop marketing strategies, analyze market trends, coordinate campaigns',
                requiredSkills: ['Communication', 'Creativity', 'Analytics'],
                salaryRange: isEntryLevel ? '₱20,000 - ₱30,000 per month' : '₱40,000 - ₱80,000 per month',
                growthPotential: 'Growing field with opportunities to become marketing manager',
                matchReason: 'Aligns with your creative and analytical skills',
                matchPercentage: 82
            },
            {
                title: 'Human Resources Associate',
                industry: 'HR',
                responsibilities: 'Assist with recruitment, employee relations, benefits administration',
                requiredSkills: ['Communication', 'Organization', 'Conflict Resolution'],
                salaryRange: isEntryLevel ? '₱20,000 - ₱30,000 per month' : '₱40,000 - ₱70,000 per month',
                growthPotential: 'Opportunity to move into HR management roles',
                matchReason: 'Matches your interpersonal skills and work motivation',
                matchPercentage: 80
            },
            {
                title: 'Financial Analyst',
                industry: 'Finance',
                responsibilities: 'Analyze financial data, prepare reports, provide investment recommendations',
                requiredSkills: ['Financial Analysis', 'Excel', 'Attention to Detail'],
                salaryRange: isEntryLevel ? '₱25,000 - ₱35,000 per month' : '₱50,000 - ₱90,000 per month',
                growthPotential: 'Opportunity to move into senior financial roles',
                matchReason: 'Aligns with your analytical skills and education background',
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
            },
            {
                title: 'University Professor',
                industry: 'Education',
                responsibilities: 'Teach courses, conduct research, publish academic papers, mentor students',
                requiredSkills: ['Subject Expertise', 'Research', 'Teaching'],
                salaryRange: '₱80,000 - ₱150,000 per month',
                growthPotential: 'Opportunity to become department head or dean',
                matchReason: 'Matches your advanced education and subject knowledge',
                matchPercentage: 88
            },
            {
                title: 'Senior Research Scientist',
                industry: 'Science/Technology',
                responsibilities: 'Lead research projects, secure funding, publish findings, mentor junior researchers',
                requiredSkills: ['Research Methodology', 'Data Analysis', 'Grant Writing'],
                salaryRange: '₱90,000 - ₱180,000 per month',
                growthPotential: 'Opportunity to become research director',
                matchReason: 'Aligns with your research skills and advanced education',
                matchPercentage: 85
            },
            {
                title: 'Medical Director',
                industry: 'Healthcare',
                responsibilities: 'Oversee clinical operations, develop policies, ensure quality care, lead medical staff',
                requiredSkills: ['Medical Expertise', 'Leadership', 'Healthcare Administration'],
                salaryRange: '₱150,000 - ₱300,000 per month',
                growthPotential: 'Opportunity to move into executive healthcare roles',
                matchReason: 'Matches your advanced medical training and leadership potential',
                matchPercentage: 90
            }
        ];
    }
    
    // Default return (shouldn't reach here with proper education level)
    return [];
}

// Salary Validation Functions
function validateSalaryInput(salaryInput: string): string | null {
    if (!salaryInput) return null;
    
    const monthlyPattern = /(?:₱|php|pesos?)\s*([\d,]+)(?:\s*-\s*([\d,]+))?\s*(?:per\s*month|monthly)/i;
    const annualPattern = /(?:₱|php|pesos?)\s*([\d,]+)(?:\s*-\s*([\d,]+))?\s*(?:per\s*year|annually)/i;
    
    const monthlyMatch = salaryInput.match(monthlyPattern);
    const annualMatch = salaryInput.match(annualPattern);
    
    if (!monthlyMatch && !annualMatch) {
        return 'Please specify salary in format like "₱20,000-₱30,000 per month" or "₱500,000 annually"';
    }
    
    try {
        if (monthlyMatch) {
            const min = parseNumber(monthlyMatch[1]);
            const max = monthlyMatch[2] ? parseNumber(monthlyMatch[2]) : min;
            
            if (min < MIN_MONTHLY_SALARY_PHP) {
                return `Salary seems too low (minimum expected is ₱${MIN_MONTHLY_SALARY_PHP.toLocaleString()} monthly)`;
            }
            if (max > MAX_MONTHLY_SALARY_PHP) {
                return `Salary seems unrealistically high (maximum expected is ₱${MAX_MONTHLY_SALARY_PHP.toLocaleString()} monthly)`;
            }
            if (max < min * (1 + SALARY_RANGE_THRESHOLD)) {
                return 'Salary range should show meaningful progression (e.g., ₱20,000-₱30,000)';
            }
        }
        
        if (annualMatch) {
            const min = parseNumber(annualMatch[1]);
            const max = annualMatch[2] ? parseNumber(annualMatch[2]) : min;
            const minMonthly = min / 12;
            const maxMonthly = max / 12;
            
            if (minMonthly < MIN_MONTHLY_SALARY_PHP) {
                return `Annual salary translates to ₱${minMonthly.toLocaleString(undefined, {maximumFractionDigits: 0})} monthly, which is below minimum expected`;
            }
            if (maxMonthly > MAX_MONTHLY_SALARY_PHP) {
                return `Annual salary translates to ₱${maxMonthly.toLocaleString(undefined, {maximumFractionDigits: 0})} monthly, which is unrealistically high`;
            }
            if (max < min * (1 + SALARY_RANGE_THRESHOLD)) {
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
        
        if (parsed.min < MIN_MONTHLY_SALARY_PHP / (parsed.isAnnual ? 12 : 1)) {
            console.warn(`Salary for ${job.title} seems too low: ${job.salaryRange}`);
            parsed.min = MIN_MONTHLY_SALARY_PHP * (parsed.isAnnual ? 12 : 1);
            if (parsed.max < parsed.min) parsed.max = parsed.min * 1.5;
        }
        
        if (parsed.max > MAX_MONTHLY_SALARY_PHP * (parsed.isAnnual ? 12 : 1)) {
            console.warn(`Salary for ${job.title} seems too high: ${job.salaryRange}`);
            parsed.max = MAX_MONTHLY_SALARY_PHP * (parsed.isAnnual ? 12 : 1);
            if (parsed.min > parsed.max) parsed.min = parsed.max * 0.7;
        }
        
        job.salaryRange = formatSalaryRange(parsed.min, parsed.max, parsed.isAnnual);
        job.salaryData = parsed;
        
        return job;
    } catch (e) {
        console.error(`Failed to parse salary for ${job.title}: ${job.salaryRange}`, e);
        job.salaryRange = generateRealisticSalary(job.title, job.industry);
        return job;
    }
}

function standardizeSalaryFormat(salaryStr: string): string {
    let standardized = salaryStr.toLowerCase().replace(/\s+/g, ' ').trim();
    standardized = standardized.replace(/(php|pesos?|p)/g, '₱');
    standardized = standardized.replace(/(?:per\s*)?(month|mo|monthly)/g, 'per month');
    standardized = standardized.replace(/(?:per\s*)?(year|yr|annually)/g, 'per year');
    standardized = standardized.replace(/(₱[\d,]+)\s*(?:to|-|–|—)\s*(₱[\d,]+)/g, '$1-$2');
    return standardized;
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
    const salaryData = {
        'Customer Service Representative': { min: 15000, max: 25000 },
        'Administrative Assistant': { min: 15000, max: 25000 },
        'Software Developer': { min: 25000, max: 40000 },
        'Senior Software Developer': { min: 60000, max: 120000 },
        'Data Analyst': { min: 25000, max: 40000 },
        'Senior Data Scientist': {min: 100000, max: 200000 },
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
                    ? '极狐 80,000-₱150,000 per month' 
                    : '₱40,000-₱80,000 per month';
        case 'retail':
            return '₱12,000-₱20,000 per month';
        case 'hospitality':
            return '₱12,000-₱18,000 per month';
        case 'marketing':
            return entryLevel ? '₱20,000-极狐 30,000 per month' : '₱40,000-₱80,000 per month';
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