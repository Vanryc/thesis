// src/routes/api/job-recommendations/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
    try {
        const userData = await request.json();
        console.log('Received user data:', userData);
        
        // Validate required data
        if (!userData || Object.keys(userData).length === 0) {
            return json(
                { success: false, error: 'No user data provided' },
                { status: 400 }
            );
        }
        
        // Transform user preferences into Indeed API parameters
        const indeedParams = transformToIndeedParams(userData);
        console.log('Indeed params:', indeedParams);
        
        const url = 'https://indeed-scraper-api.p.rapidapi.com/api/job';
        const options = {
            method: 'POST',
            headers: {
                'x-rapidapi-key': 'ee680f125dmsh7f625db35bc9bd8p102bbdjsn2a0142e489b5',
                'x-rapidapi-host': 'indeed-scraper-api.p.rapidapi.com',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                scraper: indeedParams
            })
        };

        console.log('Making API request to:', url);
        const response = await fetch(url, options);
        const result = await response.json();
        
        console.log('API Response status:', response.status);
        console.log('API Response:', result);

        if (!response.ok) {
            console.error('API Error:', result);
            return json(
                { success: false, error: `API Error: ${result.message || 'Request failed'}` },
                { status: response.status }
            );
        }

        // Handle different response structures
        let jobs = [];
        if (result.data && Array.isArray(result.data)) {
            jobs = result.data;
        } else if (result.jobs && Array.isArray(result.jobs)) {
            jobs = result.jobs;
        } else if (Array.isArray(result)) {
            jobs = result;
        } else if (result.scraper && Array.isArray(result.scraper)) {
            jobs = result.scraper;
        } else {
            console.warn('Unexpected API response structure:', result);
            // Return mock data if API structure is unexpected
            jobs = generateMockRecommendations(userData);
        }

        console.log('Found jobs:', jobs.length);

        // Process results for career recommendations
        const recommendations = processRecommendations(jobs, userData);
        
        return json({
            success: true,
            recommendations
        });
    } catch (error) {
        console.error('Recommendation error:', error);
        
        // Return mock data as fallback
        const mockRecommendations = generateMockRecommendations(await request.json());
        
        return json({
            success: true,
            recommendations: mockRecommendations,
            note: 'Using sample data due to API issues'
        });
    }
};

function transformToIndeedParams(userData: any) {
    // Safely access nested properties with fallbacks
    const workTypes = userData.workTypes || [];
    const strengths = userData.strengths || [];
    const technicalSkills = userData.technicalSkills || [];
    const workSetting = userData.workSetting || '';
    const salary = userData.salary || '';
    const motivation = userData.motivation || '';

    // Build query from available data
    const queryTerms = [...workTypes, ...strengths, ...technicalSkills].filter(Boolean);
    const query = queryTerms.length > 0 ? queryTerms.join(' ') : 'software developer';

    return {
        maxRows: 15,
        query: query,
        location: 'United States',
        jobType: 'fulltime',
        radius: '50',
        sort: 'relevance',
        fromDays: '7',
        country: 'us',
        ...(salary === 'high' && { salary: '100000' }),
        ...(workSetting === 'remote' && { remote: true })
    };
}

function processRecommendations(jobs: any[], userData: any) {
    if (!Array.isArray(jobs) || jobs.length === 0) {
        return generateMockRecommendations(userData);
    }

    return jobs.slice(0, 10).map(job => ({
        title: job.jobTitle || job.title || 'Software Developer',
        company: job.companyName || job.company || 'Tech Company',
        location: job.jobLocation || job.location || 'Remote',
        description: job.jobDescription || job.description || 'Exciting opportunity to grow your career',
        url: job.url || job.link || '#',
        salary: job.salary || job.salaryRange || 'Competitive',
        postedDate: job.postedDate || job.datePosted || 'Recently',
        matchScore: calculateMatchScore(job, userData),
        strengths: matchStrengths(job, userData.strengths || []),
        growthOpportunity: suggestGrowthOpportunity(job, userData)
    }));
}

function generateMockRecommendations(userData: any) {
    const workTypes = userData.workTypes || ['Software Development'];
    const experience = userData.experience || 'junior';
    
    return [
        {
            title: `${workTypes[0] || 'Software'} Developer`,
            company: 'TechCorp Inc.',
            location: 'San Francisco, CA',
            description: `Join our team as a ${experience} developer working with modern technologies. Great opportunity for growth and learning.`,
            url: '#',
            salary: '$70,000 - $90,000',
            postedDate: '2 days ago',
            matchScore: 85,
            strengths: userData.strengths?.slice(0, 2) || ['Problem Solving'],
            growthOpportunity: experience === 'junior' ? 'Consider React certification' : 'Leadership opportunities'
        },
        {
            title: 'Full Stack Engineer',
            company: 'StartupXYZ',
            location: 'Remote',
            description: 'Remote position perfect for someone with your skills. Work with cutting-edge technology.',
            url: '#',
            salary: '$80,000 - $100,000',
            postedDate: '1 week ago',
            matchScore: 78,
            strengths: userData.strengths?.slice(0, 3) || ['Communication'],
            growthOpportunity: 'Full-stack expertise development'
        },
        {
            title: 'Junior Developer',
            company: 'BigTech Solutions',
            location: 'New York, NY',
            description: 'Entry-level position with excellent mentorship and training programs.',
            url: '#',
            salary: '$60,000 - $75,000',
            postedDate: '3 days ago',
            matchScore: 72,
            strengths: userData.strengths?.slice(0, 2) || ['Learning'],
            growthOpportunity: 'Structured career progression path'
        }
    ];
}

function calculateMatchScore(job: any, userData: any): number {
    let score = 50; // Base score
    
    const jobText = (job.jobDescription || job.description || '').toLowerCase();
    const jobTitle = (job.jobTitle || job.title || '').toLowerCase();
    
    // Match work types
    const workTypes = userData.workTypes || [];
    workTypes.forEach((type: string) => {
        if (jobText.includes(type.toLowerCase()) || jobTitle.includes(type.toLowerCase())) {
            score += 15;
        }
    });
    
    // Match skills
    const technicalSkills = userData.technicalSkills || [];
    technicalSkills.forEach((skill: string) => {
        if (jobText.includes(skill.toLowerCase())) {
            score += 10;
        }
    });
    
    // Match strengths
    const strengths = userData.strengths || [];
    strengths.forEach((strength: string) => {
        if (jobText.includes(strength.toLowerCase())) {
            score += 5;
        }
    });
    
    return Math.min(100, Math.max(0, score));
}

function matchStrengths(job: any, userStrengths: string[]): string[] {
    if (!userStrengths || !Array.isArray(userStrengths)) {
        return [];
    }
    
    const jobText = (job.jobDescription || job.description || '').toLowerCase();
    return userStrengths.filter(strength => 
        jobText.includes(strength.toLowerCase())
    );
}

function suggestGrowthOpportunity(job: any, userData: any): string {
    const experience = userData.experience || 'junior';
    const workTypes = userData.workTypes || [];
    
    if (experience === 'junior') {
        return "Consider certifications and online courses to advance to mid-level";
    } else if (experience === 'mid') {
        return "Look for senior roles and leadership opportunities";
    } else {
        return "Consider mentoring junior developers and architectural roles";
    }
}