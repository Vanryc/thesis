<!-- Dashboard.svelte -->
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { fade, scale } from 'svelte/transition';
  import { supabase } from '../lib/supabase';
  import { loadUserAssessments, deleteAssessment as deleteAssessmentUtil, type SavedAssessment } from '../lib/assessmentUtils';
  import { getSalaryData, formatSalary, getSalaryRange, enhanceCareerWithSalary, type SalaryData } from '../lib/salaryData';
 
  // Types
  interface CareerMatch {
    title: string;
    matchPercentage: number;
    strengths: string[];
    growthOpportunity?: string;
    salary?: string;
    salaryData?: {
        min: number;
        max: number;
        average: number;
        currency: string;
        experienceLevel: string;
        lastUpdated: string;
        source: string;
    };
    salaryMin?: number;
    salaryMax?: number;
    salaryAverage?: number;
    salaryCurrency?: string;
    industry?: string;
    responsibilities?: string;
    requiredSkills?: string[];
    matchReason?: string;
    icon?: string;
    gradient?: string;
    educationRequired?: string;
    experienceLevel?: string;
    skillsToDevelop?: string[];
    certificationPaths?: string[];
    localCompanies?: string[];
    description?: string;
    dailyTasks?: string[];
    workEnvironment?: string;
    careerPath?: string[];
    typicalDay?: string;
    challenges?: string[];
    benefits?: string[];
  }

  interface Assessment extends SavedAssessment {
    full_results: {
      recommendations: CareerMatch[];
      alternatePaths?: any[];
      jobLinks?: string[];
      summaryData?: {
        topMatch: number;
        averageMatch: number;
        totalRecommendations: number;
        suggestedNextSteps: string[];
        timelineSuggestions: string[];
      };
      userName?: string;
    };
  }

  interface UserProfile {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    profile_picture?: string;
    created_at: string;
    updated_at: string;
  }

  export let userName = '';
  export let onLogout: () => void;

  // Light theme color palette
  const colors = {
    primary: '#6366f1',
    primaryLight: '#818cf8',
    primaryDark: '#4f46e5',
    secondary: '#f59e0b',
    secondaryLight: '#fbbf24',
    accent: '#ec4899',
    accentLight: '#f472b6',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    background: '#ffffff',
    surface: '#f8fafc',
    surfaceLight: '#f1f5f9',
    text: '#0f172a',
    textSecondary: '#475569',
    textMuted: '#94a3b8'
  };

  // Reactive state
  let sidebarOpen = true;
  let showSettingsMenu = false;
  let showDeleteConfirm = false;
  let assessmentToDelete: string | null = null;
  let showProfileUpload = false;
  let showEditProfile = false;
  let isLoading = false;
  let error = '';
  let success = '';
  let showResumeModal = false;
  let isGeneratingPDF = false;
  
  // NEW: Career Details Modal State
  let showCareerDetails = false;
  let selectedCareer: CareerMatch | null = null;
  let careerDetailsLoading = false;

  // User data
  let userProfile: UserProfile | null = null;
  let assessments: Assessment[] = [];
  let latestAssessment: Assessment | null = null;

  // Pagination for assessment history
  let currentAssessmentPage = 1;
  let assessmentsPerPage = 5;
  let totalAssessmentPages = 1;

  // Form state
  let editProfileData = {
    first_name: '',
    last_name: '',
    phone: '',
    profile_picture: ''
  };

  // Resume data - all fields start empty for manual input only
  let resumeData: {
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    portfolio: string;
    summary: string;
    skills: string[];
    experiences: Array<{
      title: string;
      company: string;
      location: string;
      startDate: string;
      endDate: string;
      current: boolean;
      description: string;
    }>;
    education: Array<{
      degree: string;
      institution: string;
      location: string;
      graduationDate: string;
      gpa: string;
    }>;
    certifications: Array<{
      name: string;
      issuer: string;
      date: string;
    }>;
  } | null = null;

  let newSkill = '';
  let newExperience = {
    title: '',
    company: '',
    location: '',
    startDate: '',
    endDate: '',
    current: false,
    description: ''
  };
  let newEducation = {
    degree: '',
    institution: '',
    location: '',
    graduationDate: '',
    gpa: ''
  };
  let newCertification = {
    name: '',
    issuer: '',
    date: ''
  };

  // Store current career for resume generation (for display purposes only)
  let currentResumeCareer: CareerMatch | null = null;

  // Function to validate phone number input
  function validatePhoneNumber(value: string): string {
    return value.replace(/[^0-9+\-\s()]/g, '');
  }

  // Career descriptions database
  const careerDescriptions: Record<string, any> = {
    'Software Developer': {
      description: 'Software developers design, build, and maintain computer programs and applications. They solve problems through code and create solutions that power businesses, entertainment, and daily life.',
      dailyTasks: [
        'Writing and testing code for new applications',
        'Debugging and fixing issues in existing software',
        'Collaborating with designers and product managers',
        'Reviewing code from other developers',
        'Documenting software functionality',
        'Participating in planning meetings'
      ],
      workEnvironment: 'Typically office-based or remote, working in teams using Agile methodologies. Regular collaboration with cross-functional teams.',
      careerPath: ['Junior Developer', 'Mid-level Developer', 'Senior Developer', 'Tech Lead', 'Engineering Manager', 'CTO'],
      typicalDay: 'Start with stand-up meeting, work on coding tasks, attend planning sessions, review pull requests, test features, and document work.',
      challenges: [
        'Keeping up with rapidly changing technologies',
        'Managing complex codebases',
        'Debugging difficult issues',
        'Balancing speed with code quality'
      ],
      benefits: [
        'High demand and competitive salaries',
        'Creative problem-solving opportunities',
        'Remote work flexibility',
        'Continuous learning environment'
      ]
    },
    'Data Scientist': {
      description: 'Data scientists analyze and interpret complex data to help organizations make better decisions. They use statistics, machine learning, and programming to extract insights from data.',
      dailyTasks: [
        'Cleaning and preparing data for analysis',
        'Building predictive models',
        'Creating data visualizations',
        'Writing reports on findings',
        'Collaborating with business teams',
        'Researching new analytical methods'
      ],
      workEnvironment: 'Office or remote settings, often in tech companies, finance, healthcare, or consulting firms. Work involves both independent analysis and team collaboration.',
      careerPath: ['Data Analyst', 'Junior Data Scientist', 'Data Scientist', 'Senior Data Scientist', 'Lead Data Scientist', 'Director of Data Science'],
      typicalDay: 'Analyze datasets, build models, create visualizations, meet with stakeholders, present findings, and research new techniques.',
      challenges: [
        'Dealing with messy or incomplete data',
        'Explaining technical concepts to non-technical stakeholders',
        'Keeping up with rapidly evolving AI/ML field'
      ],
      benefits: [
        'High earning potential',
        'Impact on business decisions',
        'Varied and interesting problems',
        'Strong job market demand'
      ]
    },
    'UX Designer': {
      description: 'UX (User Experience) designers create meaningful and relevant experiences for users of digital products. They focus on the overall feel of the product and user satisfaction.',
      dailyTasks: [
        'Conducting user research and interviews',
        'Creating wireframes and prototypes',
        'Testing designs with real users',
        'Collaborating with developers and product managers',
        'Analyzing user feedback',
        'Designing user flows and interfaces'
      ],
      workEnvironment: 'Creative office spaces or remote work, often in tech companies, agencies, or product teams. Collaborative environment with regular user testing.',
      careerPath: ['UX Designer', 'Senior UX Designer', 'UX Lead', 'Head of UX', 'Director of Product Design'],
      typicalDay: 'User research sessions, design workshops, creating prototypes, usability testing, and team sync meetings.',
      challenges: [
        'Balancing user needs with business goals',
        'Proving design value with metrics',
        'Keeping up with design trends and tools'
      ],
      benefits: [
        'Creative and user-focused work',
        'Seeing real impact on products',
        'Collaborative team environment',
        'Good work-life balance'
      ]
    },
    'Project Manager': {
      description: 'Project managers plan, execute, and oversee projects to ensure they are completed on time, within budget, and meet objectives. They coordinate teams and resources.',
      dailyTasks: [
        'Creating project plans and timelines',
        'Managing project budgets',
        'Coordinating team members',
        'Tracking project progress',
        'Communicating with stakeholders',
        'Risk management and problem-solving'
      ],
      workEnvironment: 'Varied environments including offices, construction sites, or remote settings across industries like tech, construction, healthcare, and consulting.',
      careerPath: ['Project Coordinator', 'Project Manager', 'Senior Project Manager', 'Program Manager', 'Director of Project Management'],
      typicalDay: 'Team meetings, progress tracking, stakeholder updates, risk assessment, budget review, and planning sessions.',
      challenges: [
        'Managing scope creep',
        'Dealing with conflicting priorities',
        'Keeping teams motivated and on track'
      ],
      benefits: [
        'Variety of projects and industries',
        'Leadership opportunities',
        'Visible impact on organization success'
      ]
    },
    'Marketing Manager': {
      description: 'Marketing managers develop and implement strategies to promote products or services. They analyze market trends, oversee campaigns, and manage marketing teams.',
      dailyTasks: [
        'Developing marketing strategies',
        'Managing advertising campaigns',
        'Analyzing market research',
        'Budget planning and management',
        'Overseeing content creation',
        'Measuring campaign performance'
      ],
      workEnvironment: 'Office-based or remote, often in corporate settings, agencies, or tech companies. Fast-paced environment with regular campaign launches.',
      careerPath: ['Marketing Coordinator', 'Marketing Specialist', 'Marketing Manager', 'Senior Marketing Manager', 'Marketing Director', 'CMO'],
      typicalDay: 'Campaign planning, team meetings, performance analysis, budget reviews, and strategy sessions.',
      challenges: [
        'Proving ROI on marketing spend',
        'Keeping up with digital marketing trends',
        'Managing multiple campaigns simultaneously'
      ],
      benefits: [
        'Creative and strategic work',
        'Direct impact on business growth',
        'Diverse career opportunities',
        'Fast-paced environment'
      ]
    },
    'Medical Laboratory Technician': {
      description: 'Medical laboratory technicians perform tests on blood, tissue, and other bodily fluids to help doctors diagnose and treat diseases. They work in clinical laboratories using sophisticated equipment.',
      dailyTasks: [
        'Collecting and preparing patient samples',
        'Operating laboratory equipment',
        'Performing routine tests and analyses',
        'Recording and reporting test results',
        'Maintaining laboratory equipment',
        'Following safety protocols and procedures'
      ],
      workEnvironment: 'Clinical laboratories in hospitals, diagnostic labs, or research facilities. Requires attention to detail and adherence to strict protocols.',
      careerPath: ['Lab Assistant', 'Medical Lab Technician', 'Senior Lab Technician', 'Lab Supervisor', 'Laboratory Manager'],
      typicalDay: 'Receive samples, perform scheduled tests, calibrate equipment, record results, maintain cleanliness, and follow safety procedures.',
      challenges: [
        'Working with potentially infectious materials',
        'Maintaining strict quality control',
        'Keeping up with new testing methods',
        'Working in a fast-paced environment'
      ],
      benefits: [
        'Essential role in healthcare',
        'Stable career with regular hours',
        'Opportunities for specialization',
        'Direct impact on patient care'
      ]
    }
  };

  // Initialize dashboard
  onMount(async () => {
    await loadUserData();
    await loadAssessments();
    
    // Load from localStorage as fallback
    if (!latestAssessment) {
      await loadLatestAssessmentFromLocalStorage();
    }
    
    // Set initial sidebar state based on screen size
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
  });

  onDestroy(() => {
    window.removeEventListener('resize', checkScreenSize);
  });

  // Check screen size for responsive sidebar
  function checkScreenSize() {
    if (window.innerWidth < 1024) {
      sidebarOpen = false;
    } else {
      sidebarOpen = true;
    }
  }

  // Enhanced logout function
  async function handleLogout() {
    try {
      isLoading = true;
      
      // Clear any ongoing states
      showSettingsMenu = false;
      
      // Sign out from Supabase
      const { error: logoutError } = await supabase.auth.signOut();
      
      if (logoutError) {
        throw logoutError;
      }
      
      // Clear all local storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Show success message
      success = 'Logging out...';
      
      // If parent provided a logout handler, use it
      if (onLogout && typeof onLogout === 'function') {
        // Small delay to show success message
        setTimeout(() => {
          onLogout();
        }, 500);
      } else {
        // Fallback: redirect to home page
        setTimeout(() => {
          window.location.href = '/';
        }, 500);
      }
      
    } catch (err: any) {
      console.error('Logout error:', err);
      error = 'Logout failed: ' + (err.message || 'Unknown error');
      isLoading = false;
      
      // Try fallback redirect anyway
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    }
  }

  // Load latest assessment from localStorage as fallback
  async function loadLatestAssessmentFromLocalStorage() {
    try {
      const stored = localStorage.getItem('latestAssessment');
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log('Loading from localStorage:', parsed);
        
        if (!parsed) return;
        
        const topCareers = parsed.top_careers || parsed.full_results?.recommendations || [];
        // Enhance careers with salary data
        const enhancedCareers = topCareers.map((career: any) => enhanceCareerWithSalary(career));
        
        const fullResults = parsed.full_results || {};
        const matchScore = parsed.match_score || 0;
        
        latestAssessment = {
          id: parsed.id || 'local-' + Date.now(),
          user_id: parsed.user_id || 'local-user',
          date: parsed.date || new Date().toISOString().split('T')[0],
          time: parsed.time || new Date().toLocaleTimeString(),
          match_score: matchScore,
          top_careers: enhancedCareers,
          full_results: {
            recommendations: enhancedCareers,
            summaryData: fullResults.summaryData || {
              topMatch: matchScore,
              averageMatch: 0,
              totalRecommendations: enhancedCareers.length,
              suggestedNextSteps: [
                'Update your resume with relevant skills',
                'Network with professionals in your field',
                'Consider relevant certifications'
              ],
              timelineSuggestions: [
                'Focus on developing relevant skills (1-3 months)',
                'Build a professional network (3-6 months)',
                'Gain practical experience (6-12 months)'
              ]
            },
            userName: fullResults.userName || userName || 'User'
          },
          created_at: parsed.created_at || new Date().toISOString()
        };
        
        // Add to assessments array if not already there
        const exists = assessments.some(a => a.id === latestAssessment?.id);
        if (!exists && latestAssessment) {
          assessments = [latestAssessment, ...assessments];
          updateAssessmentPagination();
        }
        
        // Clear localStorage after loading
        localStorage.removeItem('latestAssessment');
      }
    } catch (err) {
      console.error('Error loading from localStorage:', err);
    }
  }

  // Load user profile from Supabase
  async function loadUserData() {
    try {
      isLoading = true;
      error = '';

      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) throw authError;
      if (!user) {
        throw new Error('No user logged in');
      }

      // Try to get existing profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code === 'PGRST116') {
        console.log('Profile not found, creating new one...');
        
        // If profile doesn't exist, create one
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert([
            {
              id: user.id,
              first_name: user.user_metadata?.full_name?.split(' ')[0] || 'User',
              last_name: user.user_metadata?.full_name?.split(' ')[1] || '',
              email: user.email || '',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ])
          .select()
          .single();

        if (insertError) {
          console.error('Error creating profile:', insertError);
          // Still set userProfile with basic info even if insert fails
          userProfile = {
            id: user.id,
            first_name: user.user_metadata?.full_name?.split(' ')[0] || 'User',
            last_name: user.user_metadata?.full_name?.split(' ')[1] || '',
            email: user.email || '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
        } else {
          userProfile = newProfile;
        }
      } else if (profileError) {
        throw profileError;
      } else {
        userProfile = profile;
      }

      if (userProfile) {
        editProfileData = {
          first_name: userProfile.first_name || '',
          last_name: userProfile.last_name || '',
          phone: userProfile.phone || '',
          profile_picture: userProfile.profile_picture || ''
        };
      }

    } catch (err: any) {
      console.error('Error loading user data:', err);
      error = 'Failed to load user profile: ' + err.message;
      
      // Set basic user info even if there's an error
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        userProfile = {
          id: user.id,
          first_name: user.user_metadata?.full_name?.split(' ')[0] || 'User',
          last_name: user.user_metadata?.full_name?.split(' ')[1] || '',
          email: user.email || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }
    } finally {
      isLoading = false;
    }
  }

  // Generate professional summary based on assessment results (no salary information)
  function generateDynamicProfessionalSummary(
    career: CareerMatch | null, 
    assessment: Assessment | null,
    userName: string
  ): string {
    if (!career) {
      return 'Experienced professional seeking new career opportunities. Skilled in various domains with a proven track record of success.';
    }

    const careerTitle = career.title;
    const strengths = career.strengths || [];
    const industry = career.industry || '';
    const experienceLevel = career.experienceLevel || '';
    const requiredSkills = career.requiredSkills || [];
    const matchReason = career.matchReason || '';
    
    // Build a complete, well-structured professional summary without salary information
    let summaryParts: string[] = [];
    
    // Professional opening
    summaryParts.push(`Exceptional ${careerTitle} professional with proven expertise and strong alignment with role requirements.`);
    
    // Add experience level context
    if (experienceLevel) {
      const levelText = experienceLevel.toLowerCase();
      if (levelText.includes('senior') || levelText.includes('lead')) {
        if (industry) {
          summaryParts.push(`Senior-level expertise with a proven track record in the ${industry} sector.`);
        } else {
          summaryParts.push(`Senior-level expertise with a proven track record in the field.`);
        }
      } else if (levelText.includes('mid')) {
        if (industry) {
          summaryParts.push(`Mid-level practitioner with solid experience and growing expertise in the ${industry} industry.`);
        } else {
          summaryParts.push(`Mid-level practitioner with solid experience and growing expertise.`);
        }
      } else if (levelText.includes('junior') || levelText.includes('entry')) {
        summaryParts.push(`Early-career professional with strong foundational knowledge and demonstrated rapid learning ability.`);
      }
    } else if (industry) {
      summaryParts.push(`Specialized expertise in the ${industry} sector with a focus on delivering measurable results.`);
    }
    
    // Add strengths from assessment
    if (strengths.length > 0) {
      const topStrengths = strengths.slice(0, 3);
      if (topStrengths.length === 1) {
        summaryParts.push(`A key strength is ${topStrengths[0]}.`);
      } else {
        const strengthsList = topStrengths.slice(0, -1).join(', ');
        const lastStrength = topStrengths[topStrengths.length - 1];
        summaryParts.push(`Core strengths include ${strengthsList}${topStrengths.length > 1 ? ' and ' : ''}${lastStrength}.`);
      }
    }
    
    // Add match reason if available and not already covered
    if (matchReason && matchReason.length > 0 && matchReason.length < 200) {
      summaryParts.push(matchReason);
    }
    
    // Add skills focus
    if (requiredSkills.length > 0) {
      const keySkills = requiredSkills.slice(0, 2);
      if (keySkills.length === 1) {
        summaryParts.push(`Proficient in ${keySkills[0]}.`);
      } else {
        summaryParts.push(`Proficient in ${keySkills[0]} and ${keySkills[1]}${requiredSkills.length > 2 ? ' among other technical competencies' : ''}.`);
      }
    }
    
    // Add career aspiration with strong professional ending
    summaryParts.push(`Committed to delivering measurable impact and driving sustained success in the ${careerTitle} role.`);
    
    // Join all parts with spaces
    let summary = summaryParts.join(' ');
    
    // Ensure summary doesn't exceed reasonable length but keep it complete
    if (summary.length > 600) {
      // Instead of cutting mid-sentence, we'll take complete sentences
      const sentences = summary.match(/[^.!?]+[.!?]+/g) || [];
      let truncatedSummary = '';
      for (const sentence of sentences) {
        if ((truncatedSummary + sentence).length <= 580) {
          truncatedSummary += sentence;
        } else {
          break;
        }
      }
      // If we have at least one complete sentence, use that
      if (truncatedSummary.length > 0) {
        summary = truncatedSummary;
      } else {
        // Fallback to a clean, complete professional statement
        summary = `Exceptional ${careerTitle} professional with proven expertise and strong alignment with role requirements. Committed to delivering measurable impact and driving sustained success.`;
      }
    }
    
    return summary;
  }

  // Initialize resume data with empty fields - MANUAL INPUT ONLY
  function initializeResumeDataForCareer(career: CareerMatch | null = null) {
    if (!userProfile) return;
    
    const newResumeData = {
      email: userProfile.email || '',
      phone: userProfile.phone || '',
      location: '',
      linkedin: '',
      portfolio: '',
      summary: '',
      skills: [] as string[],
      experiences: [] as Array<{
        title: string;
        company: string;
        location: string;
        startDate: string;
        endDate: string;
        current: boolean;
        description: string;
      }>,
      education: [] as Array<{
        degree: string;
        institution: string;
        location: string;
        graduationDate: string;
        gpa: string;
      }>,
      certifications: [] as Array<{
        name: string;
        issuer: string;
        date: string;
      }>
    };
    
    // Generate dynamic professional summary based on assessment results (without salary information)
    if (career) {
      newResumeData.summary = generateDynamicProfessionalSummary(
        career, 
        latestAssessment, 
        userProfile.first_name || 'Professional'
      );
    } else {
      newResumeData.summary = 'Experienced professional seeking new career opportunities. Skilled in various domains with a proven track record of success.';
    }
    
    return newResumeData;
  }

  // Load assessments from Supabase with proper history
  async function loadAssessments() {
    try {
      isLoading = true;
      error = '';

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('No user logged in');
      }

      const { assessments: assessmentData, latestAssessment: latest, error: assessmentError } = 
        await loadUserAssessments(supabase, user.id);

      if (assessmentError) {
        console.error('Assessment load error:', assessmentError);
        assessments = [];
        latestAssessment = null;
        updateAssessmentPagination();
        return;
      }

      // Type assertion to handle the mapping correctly
      const loadedAssessments = (assessmentData as any[] || []) as Assessment[];
      
      // Enhance assessments with salary data
      assessments = loadedAssessments.map(assessment => ({
        ...assessment,
        top_careers: (assessment.top_careers || []).map((career: any) => enhanceCareerWithSalary(career)),
        full_results: assessment.full_results
          ? {
              ...assessment.full_results,
              recommendations: (assessment.full_results.recommendations || []).map((career: any) => enhanceCareerWithSalary(career)),
              alternatePaths: assessment.full_results.alternatePaths ?? [],
              jobLinks: assessment.full_results.jobLinks ?? [],
              summaryData: assessment.full_results.summaryData ?? {
                topMatch: assessment.match_score || 0,
                averageMatch: 0,
                totalRecommendations: (assessment.top_careers || []).length,
                suggestedNextSteps: [],
                timelineSuggestions: []
              },
              userName: assessment.full_results.userName ?? userName ?? 'User'
            }
          : {
              recommendations: (assessment.top_careers || []).map((career: any) => enhanceCareerWithSalary(career)),
              alternatePaths: [],
              jobLinks: [],
              summaryData: {
                topMatch: assessment.match_score || 0,
                averageMatch: 0,
                totalRecommendations: (assessment.top_careers || []).length,
                suggestedNextSteps: [],
                timelineSuggestions: []
              },
              userName: userName ?? 'User'
            }
      }));
      
      // Enhance latest assessment
      if (latest) {
        latestAssessment = {
          ...latest,
          top_careers: (latest.top_careers || []).map((career: any) => enhanceCareerWithSalary(career)),
          full_results: latest.full_results ? {
            ...latest.full_results,
            recommendations: (latest.full_results.recommendations || []).map((career: any) => enhanceCareerWithSalary(career))
          } : undefined
        } as Assessment;
      } else {
        latestAssessment = null;
      }
      
      updateAssessmentPagination();
      
    } catch (err: any) {
      console.error('Error loading assessments:', err);
      error = 'Failed to load assessments: ' + err.message;
      assessments = [];
      latestAssessment = null;
      updateAssessmentPagination();
    } finally {
      isLoading = false;
    }
  }

  // Update assessment pagination
  function updateAssessmentPagination() {
    totalAssessmentPages = Math.ceil(assessments.length / assessmentsPerPage);
    if (currentAssessmentPage > totalAssessmentPages && totalAssessmentPages > 0) {
      currentAssessmentPage = totalAssessmentPages;
    }
  }

  // Get paginated assessments for history
  function getPaginatedAssessments() {
    const startIndex = (currentAssessmentPage - 1) * assessmentsPerPage;
    const endIndex = startIndex + assessmentsPerPage;
    return assessments.slice(startIndex, endIndex);
  }

  // Delete specific assessment
  async function deleteAssessment(assessmentId: string) {
    try {
      isLoading = true;
      error = '';

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('No user logged in');
      }

      const result = await deleteAssessmentUtil(supabase, assessmentId, user.id);
      
      if (!result.success) {
        throw new Error(result.error);
      }

      await loadAssessments();
      
      success = 'Assessment deleted successfully!';

      setTimeout(() => {
        success = '';
      }, 3000);

    } catch (err: any) {
      console.error('Error deleting assessment:', err);
      error = 'Failed to delete assessment: ' + err.message;
    } finally {
      isLoading = false;
      showDeleteConfirm = false;
      assessmentToDelete = null;
    }
  }

  // Confirm delete assessment
  function confirmDeleteAssessment(assessmentId: string) {
    assessmentToDelete = assessmentId;
    showDeleteConfirm = true;
  }

  // Cancel delete
  function cancelDelete() {
    showDeleteConfirm = false;
    assessmentToDelete = null;
  }

  async function startNewAssessment() {
    try {
      isLoading = true;
      success = 'Starting new assessment...';
      
      // Clear any existing assessment data
      localStorage.removeItem('latestAssessment');
      localStorage.removeItem('latestAssessmentResults');
      
      // Add a small delay to show the success message
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Set a flag to indicate we're starting a new assessment
      localStorage.setItem('startNewAssessment', 'true');
      
      // Redirect to home page - App.svelte will detect the flag and redirect to preferences
      window.location.href = '/';
      
    } catch (err: any) {
      console.error('Error starting new assessment:', err);
      error = 'Failed to start new assessment: ' + err.message;
      isLoading = false;
    }
  }

  // Toggle sidebar
  function toggleSidebar() {
    sidebarOpen = !sidebarOpen;
  }

  function handleSidebarKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleSidebar();
    }
  }

  // Toggle settings menu
  function toggleSettingsMenu() {
    showSettingsMenu = !showSettingsMenu;
  }

  function handleSettingsKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleSettingsMenu();
    }
  }

  // Generate Resume function - creates fresh data for selected assessment with EMPTY fields
  function openResumeGeneratorForAssessment(assessment: Assessment | null = null) {
    const targetAssessment = assessment || latestAssessment;
    
    if (!targetAssessment) {
      error = 'Please complete an assessment first to generate a resume';
      setTimeout(() => error = '', 3000);
      return;
    }
    
    // Get the top career from the selected assessment
    const topCareer = targetAssessment.top_careers?.[0] || targetAssessment.full_results?.recommendations?.[0];
    
    if (!topCareer) {
      error = 'No career data found in this assessment';
      setTimeout(() => error = '', 3000);
      return;
    }
    
    // Store the current career for this resume session (for display only)
    currentResumeCareer = topCareer;
    
    // Create fresh resume data based on this career - with DYNAMIC summary based on assessment
    resumeData = initializeResumeDataForCareer(topCareer);
    
    // Reset all the form fields
    newSkill = '';
    newExperience = {
      title: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: ''
    };
    newEducation = {
      degree: '',
      institution: '',
      location: '',
      graduationDate: '',
      gpa: ''
    };
    newCertification = {
      name: '',
      issuer: '',
      date: ''
    };
    
    showResumeModal = true;
  }

  // Original openResumeGenerator for backward compatibility
  function openResumeGenerator() {
    openResumeGeneratorForAssessment(latestAssessment);
  }

  // Add skill to resume - MANUAL INPUT ONLY
  function addSkill() {
    if (!resumeData) return;
    if (newSkill.trim() && !resumeData.skills.includes(newSkill.trim())) {
      resumeData.skills = [...resumeData.skills, newSkill.trim()];
      newSkill = '';
    }
  }

  function removeSkill(index: number) {
    if (!resumeData) return;
    resumeData.skills = resumeData.skills.filter((_, i) => i !== index);
  }

  // Add experience to resume
  function addExperience() {
    if (!resumeData) return;
    if (newExperience.title.trim() && newExperience.company.trim()) {
      resumeData.experiences = [...resumeData.experiences, { ...newExperience }];
      // Reset the form after adding
      newExperience = {
        title: '',
        company: '',
        location: '',
        startDate: '',
        endDate: '',
        current: false,
        description: ''
      };
    }
  }

  function removeExperience(index: number) {
    if (!resumeData) return;
    resumeData.experiences = resumeData.experiences.filter((_, i) => i !== index);
  }

  // Add education to resume
  function addEducation() {
    if (!resumeData) return;
    if (newEducation.degree.trim() && newEducation.institution.trim()) {
      resumeData.education = [...resumeData.education, { ...newEducation }];
      // Reset the form after adding
      newEducation = {
        degree: '',
        institution: '',
        location: '',
        graduationDate: '',
        gpa: ''
      };
    }
  }

  function removeEducation(index: number) {
    if (!resumeData) return;
    resumeData.education = resumeData.education.filter((_, i) => i !== index);
  }

  // Add certification to resume
  function addCertification() {
    if (!resumeData) return;
    if (newCertification.name.trim() && newCertification.issuer.trim()) {
      resumeData.certifications = [...resumeData.certifications, { ...newCertification }];
      // Reset the form after adding
      newCertification = {
        name: '',
        issuer: '',
        date: ''
      };
    }
  }

  function removeCertification(index: number) {
    if (!resumeData) return;
    resumeData.certifications = resumeData.certifications.filter((_, i) => i !== index);
  }

  // Generate PDF Resume using browser's print functionality
  async function generatePDFResume() {
    try {
      isGeneratingPDF = true;
      error = '';

      const resumeElement = document.getElementById('printable-resume');
      if (!resumeElement) {
        throw new Error('Resume content not found');
      }

      // Create a print-friendly version
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('Failed to open print window. Please allow popups for this site.');
      }

      // Build conditional section HTML only for sections that have data
      const hasSkills = resumeData && resumeData.skills.length > 0;
      const hasExperiences = resumeData && resumeData.experiences.length > 0;
      const hasEducation = resumeData && resumeData.education.length > 0;
      const hasCertifications = resumeData && resumeData.certifications.length > 0;

      const skillsHTML = hasSkills ? `
        <div class="resume-section-print">
          <div class="section-title-print">Skills</div>
          <div class="skills-grid-print">
            ${resumeData!.skills.map(skill => `<span class="skill-item-print">${escapeHtml(skill)}</span>`).join('')}
          </div>
        </div>` : '';

      const experiencesHTML = hasExperiences ? `
        <div class="resume-section-print">
          <div class="section-title-print">Experience</div>
          ${resumeData!.experiences.map(exp => `
            <div class="experience-item-print">
              <div class="experience-header-print">
                <span class="experience-title-print">${escapeHtml(exp.title)}</span>
                <span class="experience-date-print">${escapeHtml(exp.startDate)} – ${exp.current ? 'Present' : escapeHtml(exp.endDate)}</span>
              </div>
              <div class="experience-company-print">${escapeHtml(exp.company)}${exp.location ? ' | ' + escapeHtml(exp.location) : ''}</div>
              ${exp.description ? `<div class="experience-description-print">${exp.description.split('\n').filter((l: string) => l.trim()).map((l: string) => `<p>• ${escapeHtml(l)}</p>`).join('')}</div>` : ''}
            </div>`).join('')}
        </div>` : '';

      const educationHTML = hasEducation ? `
        <div class="resume-section-print">
          <div class="section-title-print">Education</div>
          ${resumeData!.education.map(edu => `
            <div class="education-item-print">
              <div class="education-header-print">
                <span class="education-degree-print">${escapeHtml(edu.degree)}</span>
                <span class="education-date-print">${escapeHtml(edu.graduationDate)}</span>
              </div>
              <div class="education-institution-print">${escapeHtml(edu.institution)}${edu.location ? ' | ' + escapeHtml(edu.location) : ''}</div>
              ${edu.gpa ? `<div class="education-details-print">GPA: ${escapeHtml(edu.gpa)}</div>` : ''}
            </div>`).join('')}
        </div>` : '';

      const certificationsHTML = hasCertifications ? `
        <div class="resume-section-print">
          <div class="section-title-print">Certifications</div>
          <div class="certifications-list-print">
            ${resumeData!.certifications.map(cert => `
              <div class="certification-item-print"><strong>${escapeHtml(cert.name)}</strong> – ${escapeHtml(cert.issuer)} (${escapeHtml(cert.date)})</div>`).join('')}
          </div>
        </div>` : '';

      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Resume - ${escapeHtml(userProfile?.first_name || 'User')} ${escapeHtml(userProfile?.last_name || '')}</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap');

                @page {
                  size: A4;
                  margin: 1in;
                }

                * { margin: 0; padding: 0; box-sizing: border-box; }

                body {
                  font-family: 'Inter', sans-serif;
                  font-size: 11pt;
                  color: #1e293b;
                  line-height: 1;
                }

                .resume-print {
                  width: 100%;
                }

                .resume-header-section {
                  text-align: center;
                  margin-bottom: 14pt;
                  padding-bottom: 10pt;
                  border-bottom: 2pt solid #6366f1;
                }

                .resume-name {
                  font-size: 22pt;
                  font-weight: 700;
                  color: #1e293b;
                  margin-bottom: 6pt;
                  font-family: 'Poppins', sans-serif;
                }

                .resume-contact {
                  display: flex;
                  flex-wrap: wrap;
                  justify-content: center;
                  gap: 10pt;
                  font-size: 9pt;
                  color: #475569;
                }

                .resume-contact span {
                  display: flex;
                  align-items: center;
                  gap: 3pt;
                }

                .resume-section-print {
                  margin-top: 12pt;
                  page-break-inside: avoid;
                }

                .section-title-print {
                  font-size: 12pt;
                  font-weight: 600;
                  color: #4f46e5;
                  padding-bottom: 4pt;
                  border-bottom: 1pt solid #e2e8f0;
                  margin-bottom: 6pt;
                }

                .skills-grid-print {
                  display: flex;
                  flex-wrap: wrap;
                  gap: 6pt;
                  line-height: 1.5;
                }

                .skill-item-print {
                  background: #f1f5f9;
                  color: #475569;
                  padding: 3pt 8pt;
                  border-radius: 10pt;
                  font-size: 9pt;
                  line-height: 1.5;
                }

                .experience-item-print {
                  margin-bottom: 8pt;
                  page-break-inside: avoid;
                  line-height: 1.5;
                }

                .experience-item-print:last-child { margin-bottom: 0; }

                .experience-header-print {
                  display: flex;
                  justify-content: space-between;
                  align-items: flex-start;
                  margin-bottom: 2pt;
                }

                .experience-title-print {
                  font-size: 11pt;
                  font-weight: 600;
                  color: #1e293b;
                }

                .experience-date-print {
                  font-size: 9pt;
                  color: #64748b;
                  white-space: nowrap;
                }

                .experience-company-print {
                  font-size: 10pt;
                  color: #475569;
                  font-style: italic;
                  margin-bottom: 4pt;
                }

                .experience-description-print {
                  font-size: 10pt;
                  color: #475569;
                  line-height: 1.5;
                }

                .experience-description-print p {
                  margin-bottom: 2pt;
                }

                .education-item-print {
                  margin-bottom: 8pt;
                  page-break-inside: avoid;
                  line-height: 1.5;
                }

                .education-item-print:last-child { margin-bottom: 0; }

                .education-header-print {
                  display: flex;
                  justify-content: space-between;
                  align-items: flex-start;
                  margin-bottom: 2pt;
                }

                .education-degree-print {
                  font-size: 11pt;
                  font-weight: 600;
                  color: #1e293b;
                }

                .education-date-print {
                  font-size: 9pt;
                  color: #64748b;
                  white-space: nowrap;
                }

                .education-institution-print {
                  font-size: 10pt;
                  color: #475569;
                  margin-bottom: 2pt;
                }

                .education-details-print {
                  font-size: 9pt;
                  color: #64748b;
                }

                .certifications-list-print {
                  display: flex;
                  flex-direction: column;
                  gap: 6pt;
                  line-height: 1.5;
                }

                .certification-item-print {
                  font-size: 10pt;
                  color: #475569;
                  line-height: 1.5;
                }

                .generated-footer-print {
                  margin-top: 16pt;
                  padding-top: 8pt;
                  border-top: 1pt dashed #e2e8f0;
                  font-size: 8pt;
                  color: #94a3b8;
                  text-align: center;
                }

                @media print {
                  body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                  .no-print { display: none !important; }
                  .resume-section-print { page-break-inside: avoid; }
                  .section-title-print  { page-break-after: avoid; }
                  .experience-item-print,
                  .education-item-print { page-break-inside: avoid; }
                }
            </style>
        </head>
        <body>
            <div class="resume-print">
                <div class="resume-header-section">
                  <div class="resume-name">${escapeHtml(userProfile?.first_name || '')} ${escapeHtml(userProfile?.last_name || '')}</div>
                  <div class="resume-contact">
                    ${resumeData?.email    ? `<span>✉ ${escapeHtml(resumeData.email)}</span>` : ''}
                    ${resumeData?.phone    ? `<span>📞 ${escapeHtml(resumeData.phone)}</span>` : ''}
                    ${resumeData?.location ? `<span>📍 ${escapeHtml(resumeData.location)}</span>` : ''}
                    ${resumeData?.linkedin ? `<span>🔗 ${escapeHtml(resumeData.linkedin)}</span>` : ''}
                    ${resumeData?.portfolio? `<span>🌐 ${escapeHtml(resumeData.portfolio)}</span>` : ''}
                  </div>
                </div>

                <div class="resume-section-print">
                  <div class="section-title-print">Professional Summary</div>
                  <div style="font-size:10pt;color:#475569;line-height:1.5;">
                    ${resumeData?.summary ? escapeHtml(resumeData.summary) : '[Awaiting user input]'}
                  </div>
                </div>

                ${skillsHTML}
                ${experiencesHTML}
                ${educationHTML}
                ${certificationsHTML}

                <div class="generated-footer-print">
                  Generated on ${new Date().toLocaleDateString()} by CareerGeenie
                </div>
            </div>
            <script>
                window.onload = function() {
                    window.print();
                    setTimeout(function() { window.close(); }, 1000);
                };
            <\/script>
        </body>
        </html>
      `;

      printWindow.document.write(printContent);
      printWindow.document.close();

      success = 'Opening print dialog for resume...';
      setTimeout(() => success = '', 3000);

    } catch (err: any) {
      console.error('Error generating PDF:', err);
      error = 'Failed to generate PDF: ' + err.message;
      setTimeout(() => error = '', 3000);
    } finally {
      isGeneratingPDF = false;
    }
  }

  // Helper function to escape HTML
  function escapeHtml(str: string | undefined | null): string {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // View career details with comprehensive information including real salary data
  async function viewCareerDetails(career: CareerMatch) {
    try {
      careerDetailsLoading = true;
      
      // Enhance career with real Philippine salary data
      let enhancedCareer = enhanceCareerWithSalary(career);
      selectedCareer = enhancedCareer;
      
      // Enhance career data with detailed descriptions if available
      const careerKey = career.title as keyof typeof careerDescriptions;
      if (careerDescriptions[careerKey]) {
        selectedCareer = {
          ...enhancedCareer,
          ...careerDescriptions[careerKey]
        };
      } else {
        // Generate generic description based on career title
        selectedCareer = {
          ...enhancedCareer,
          description: `${career.title} is a professional role that ${generateGenericDescription(career.title)}`,
          dailyTasks: generateGenericDailyTasks(career.title),
          workEnvironment: generateGenericWorkEnvironment(career.title),
          careerPath: generateGenericCareerPath(career.title)
        };
      }
      
      showCareerDetails = true;
    } catch (err) {
      console.error('Error loading career details:', err);
      error = 'Failed to load career details';
      setTimeout(() => error = '', 3000);
    } finally {
      careerDetailsLoading = false;
    }
  }

  // Helper function to generate generic descriptions
  function generateGenericDescription(title: string): string {
    if (title.toLowerCase().includes('developer') || title.toLowerCase().includes('engineer')) {
      return 'involves designing, building, and maintaining software solutions. Professionals in this field use programming skills to create applications and systems that solve problems and improve efficiency.';
    } else if (title.toLowerCase().includes('manager')) {
      return 'involves leading teams, overseeing projects, and ensuring organizational goals are met. This role requires strong leadership, communication, and strategic planning skills.';
    } else if (title.toLowerCase().includes('analyst')) {
      return 'involves examining data, identifying patterns, and providing insights to support decision-making. Professionals in this field help organizations understand trends and make data-driven choices.';
    } else if (title.toLowerCase().includes('designer')) {
      return 'focuses on creating visually appealing and functional designs. This role combines creativity with technical skills to develop products, interfaces, or experiences that meet user needs.';
    } else if (title.toLowerCase().includes('marketing')) {
      return 'involves promoting products or services, analyzing market trends, and developing strategies to reach target audiences. This role combines creativity with analytical thinking.';
    } else if (title.toLowerCase().includes('medical') || title.toLowerCase().includes('lab') || title.toLowerCase().includes('technician')) {
      return 'involves performing diagnostic tests and analyses to support medical diagnosis and treatment. This role requires precision, attention to detail, and adherence to strict protocols.';
    } else {
      return 'is a professional position that requires specific skills and expertise. Success in this role depends on a combination of technical knowledge, soft skills, and industry experience.';
    }
  }

  function generateGenericDailyTasks(title: string): string[] {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('developer') || titleLower.includes('engineer')) {
      return [
        'Writing and testing code',
        'Debugging software issues',
        'Collaborating with team members',
        'Attending planning meetings',
        'Documenting code and processes'
      ];
    } else if (titleLower.includes('manager')) {
      return [
        'Leading team meetings',
        'Planning and organizing projects',
        'Monitoring progress and performance',
        'Communicating with stakeholders',
        'Problem-solving and decision-making'
      ];
    } else if (titleLower.includes('medical') || titleLower.includes('lab') || titleLower.includes('technician')) {
      return [
        'Performing laboratory tests',
        'Maintaining equipment',
        'Recording test results',
        'Following safety protocols',
        'Quality control procedures'
      ];
    } else {
      return [
        'Completing assigned tasks',
        'Collaborating with colleagues',
        'Attending meetings',
        'Reporting on progress',
        'Continuing professional development'
      ];
    }
  }

  function generateGenericWorkEnvironment(title: string): string {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('developer') || titleLower.includes('engineer')) {
      return 'Office-based or remote work, often in tech companies or organizations with digital products. Collaborative environment with regular team interactions.';
    } else if (titleLower.includes('manager')) {
      return 'Office environment with team leadership responsibilities. May involve travel and regular meetings with different departments or clients.';
    } else if (titleLower.includes('medical') || titleLower.includes('lab') || titleLower.includes('technician')) {
      return 'Clinical laboratory environment with strict safety protocols. Typically works in hospitals, diagnostic labs, or research facilities.';
    } else {
      return 'Professional office environment with standard business hours. May involve hybrid or remote work options depending on the organization.';
    }
  }

  function generateGenericCareerPath(title: string): string[] {
    return [
      'Entry-level position',
      'Mid-level specialist',
      'Senior professional',
      'Team lead or supervisor',
      'Management or director role'
    ];
  }

  // Generate resume for a specific career from career details modal
  function generateResumeForCareer(career: CareerMatch) {
    // Close the career details modal
    showCareerDetails = false;
    
    // Create fresh resume data based on this career - with DYNAMIC summary
    currentResumeCareer = career;
    resumeData = initializeResumeDataForCareer(career);
    
    // Reset all the form fields
    newSkill = '';
    newExperience = {
      title: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: ''
    };
    newEducation = {
      degree: '',
      institution: '',
      location: '',
      graduationDate: '',
      gpa: ''
    };
    newCertification = {
      name: '',
      issuer: '',
      date: ''
    };
    
    showResumeModal = true;
    
    success = `Resume template generated for ${career.title} career path`;
    setTimeout(() => success = '', 3000);
  }

  // Close career details modal
  function closeCareerDetails() {
    showCareerDetails = false;
    selectedCareer = null;
  }

  // Update user profile
  async function updateProfile() {
    try {
      if (!userProfile) return;

      isLoading = true;
      error = '';

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          first_name: editProfileData.first_name,
          last_name: editProfileData.last_name,
          phone: editProfileData.phone,
          updated_at: new Date().toISOString()
        })
        .eq('id', userProfile.id);

      if (updateError) throw updateError;

      userProfile.first_name = editProfileData.first_name;
      userProfile.last_name = editProfileData.last_name;
      userProfile.phone = editProfileData.phone;
      
      success = 'Profile updated successfully!';
      showEditProfile = false;

      setTimeout(() => {
        success = '';
      }, 3000);

    } catch (err: any) {
      console.error('Error updating profile:', err);
      error = 'Failed to update profile: ' + err.message;
      setTimeout(() => error = '', 3000);
    } finally {
      isLoading = false;
    }
  }

  // Format date for display
  function formatDate(dateString: string) {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (err) {
      return 'Unknown date';
    }
  }

  // Format time for display
  function formatTime(dateString: string) {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (err) {
      return 'Unknown time';
    }
  }

  // Format short date
  function formatShortDate(dateString: string) {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (err) {
      return '--';
    }
  }

  // Close settings menu when clicking outside
  function handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.settings-menu') && !target.closest('.settings-trigger')) {
      showSettingsMenu = false;
    }
    if (!target.closest('.career-details-modal') && !target.closest('.career-card-trigger')) {
      showCareerDetails = false;
    }
  }

  // Add click outside listener
  onMount(() => {
    document.addEventListener('click', handleClickOutside);
  });

  onDestroy(() => {
    document.removeEventListener('click', handleClickOutside);
  });
</script>

<!-- ========== TEMPLATE SECTION - SAME AS YOUR ORIGINAL, KEPT INTACT ========== -->

<div class="dashboard-page">
  <!-- Background Elements -->
  <div class="background-elements">
    <div class="bg-gradient"></div>
    <div class="bg-particle"></div>
    <div class="bg-particle"></div>
    <div class="bg-particle"></div>
  </div>

  <!-- Toast Notifications -->
  {#if error}
    <div class="toast error" transition:fade>
      <div class="toast-icon">
        <i class="fa-solid fa-exclamation-circle"></i>
      </div>
      <span class="toast-message">{error}</span>
      <button 
        class="toast-close" 
        on:click={() => error = ''} 
        on:keydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { error = ''; } }} 
        aria-label="Dismiss error message"
      >
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>
  {/if}

  {#if success}
    <div class="toast success" transition:fade>
      <div class="toast-icon">
        <i class="fa-solid fa-check-circle"></i>
      </div>
      <span class="toast-message">{success}</span>
      <button 
        class="toast-close" 
        on:click={() => success = ''} 
        on:keydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { success = ''; } }} 
        aria-label="Dismiss success message"
      >
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>
  {/if}

  <!-- Delete Confirmation Modal -->
  {#if showDeleteConfirm && assessmentToDelete}
    <div class="modal-overlay" transition:fade>
      <div class="modal delete-confirm-modal" transition:scale>
        <div class="modal-header">
          <h3>Delete Assessment</h3>
          <button 
            class="modal-close" 
            on:click={cancelDelete}
            aria-label="Close modal"
          >
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="delete-confirm-content">
            <i class="fa-solid fa-trash-can"></i>
            <h4>Are you sure?</h4>
            <p>This assessment will be permanently deleted. This action cannot be undone.</p>
          </div>
          <div class="form-actions">
            <button 
              type="button" 
              class="btn-secondary" 
              on:click={cancelDelete}
              aria-label="Cancel deletion"
            >
              Cancel
            </button>
            <button 
              type="button" 
              class="btn-danger" 
              on:click={() => deleteAssessment(assessmentToDelete!)}
              disabled={isLoading}
              aria-label="{isLoading ? 'Deleting...' : 'Delete assessment'}"
            >
              {isLoading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  {/if}

  <!-- Career Details Modal -->
  {#if showCareerDetails && selectedCareer}
    <div class="modal-overlay career-details-overlay" transition:fade>
      <div class="modal career-details-modal" transition:scale>
        <div class="modal-header">
          <div class="career-modal-title">
            <div class="career-match-badge-small">
              <span class="match-badge-value">{selectedCareer.matchPercentage || selectedCareer.matchPercentage || 'N/A'}% Match</span>
            </div>
            <h3>{selectedCareer.title}</h3>
          </div>
          <button 
            class="modal-close" 
            on:click={closeCareerDetails}
            aria-label="Close career details"
          >
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
        
        <div class="modal-body career-details-body">
          {#if careerDetailsLoading}
            <div class="loading-spinner-small">
              <div class="spinner"></div>
              <p>Loading career details...</p>
            </div>
          {:else}
            <div class="career-details-content">
              <!-- Career Overview -->
              <div class="career-section">
                <h4><i class="fa-solid fa-info-circle"></i> Career Overview</h4>
                <p class="career-description-text">{selectedCareer.description || 'No description available.'}</p>
                
                <div class="career-quick-facts">
                  {#if selectedCareer.industry}
                    <div class="quick-fact">
                      <i class="fa-solid fa-industry"></i>
                      <span class="fact-label">Industry:</span>
                      <span class="fact-value">{selectedCareer.industry}</span>
                    </div>
                  {/if}
                  {#if selectedCareer.experienceLevel}
                    <div class="quick-fact">
                      <i class="fa-solid fa-chart-line"></i>
                      <span class="fact-label">Level:</span>
                      <span class="fact-value">{selectedCareer.experienceLevel}</span>
                    </div>
                  {/if}
                  {#if selectedCareer.salary}
                    <div class="quick-fact salary-highlight">
                      <i class="fa-solid fa-money-bill-wave"></i>
                      <span class="fact-label">Salary Range:</span>
                      <span class="fact-value salary-amount">{selectedCareer.salary}</span>
                    </div>
                  {/if}
                  {#if selectedCareer.salaryData}
                    <div class="quick-fact">
                      <i class="fa-solid fa-chart-pie"></i>
                      <span class="fact-label">Average:</span>
                      <span class="fact-value">{formatSalary(selectedCareer.salaryData.average)}/month</span>
                    </div>
                  {/if}
                  {#if selectedCareer.educationRequired}
                    <div class="quick-fact">
                      <i class="fa-solid fa-graduation-cap"></i>
                      <span class="fact-label">Education:</span>
                      <span class="fact-value">{selectedCareer.educationRequired}</span>
                    </div>
                  {/if}
                </div>
                
                <!-- Salary Details Box -->
                {#if selectedCareer.salaryData}
                  <div class="salary-details-box">
                    <div class="salary-header">
                      <h5><i class="fa-solid fa-peso-sign"></i> Philippine Salary Information</h5>
                      <span class="salary-source">Source: {selectedCareer.salaryData.source || 'Industry Data'}</span>
                    </div>
                    <div class="salary-breakdown">
                      <div class="salary-item">
                        <div class="salary-label">Entry Level</div>
                        <div class="salary-amount">{formatSalary(selectedCareer.salaryData.min)}</div>
                      </div>
                      <div class="salary-item">
                        <div class="salary-label">Average</div>
                        <div class="salary-amount average">{formatSalary(selectedCareer.salaryData.average)}</div>
                      </div>
                      <div class="salary-item">
                        <div class="salary-label">Experienced</div>
                        <div class="salary-amount">{formatSalary(selectedCareer.salaryData.max)}</div>
                      </div>
                    </div>
                    <div class="salary-footer">
                      <div class="salary-experience">
                        <i class="fa-solid fa-briefcase"></i>
                        <span>{selectedCareer.salaryData.experienceLevel} Level</span>
                      </div>
                      <div class="salary-updated">
                        <i class="fa-solid fa-calendar"></i>
                        <span>Updated {selectedCareer.salaryData.lastUpdated}</span>
                      </div>
                    </div>
                  </div>
                {/if}
              </div>

              <!-- Daily Tasks & Responsibilities -->
              <div class="career-section">
                <h4><i class="fa-solid fa-tasks"></i> Daily Tasks & Responsibilities</h4>
                {#if selectedCareer.dailyTasks && selectedCareer.dailyTasks.length > 0}
                  <ul class="tasks-list">
                    {#each selectedCareer.dailyTasks as task}
                      <li><i class="fa-solid fa-check-circle"></i> {task}</li>
                    {/each}
                  </ul>
                {:else if selectedCareer.responsibilities}
                  <p class="responsibilities-text">{selectedCareer.responsibilities}</p>
                {:else}
                  <p class="no-info">No daily tasks information available.</p>
                {/if}
              </div>

              <!-- Required Skills -->
              <div class="career-section">
                <h4><i class="fa-solid fa-tools"></i> Required Skills</h4>
                {#if selectedCareer.requiredSkills && selectedCareer.requiredSkills.length > 0}
                  <div class="skills-container">
                    {#each selectedCareer.requiredSkills as skill}
                      <span class="skill-tag-detail">{skill}</span>
                    {/each}
                  </div>
                {:else if selectedCareer.strengths && selectedCareer.strengths.length > 0}
                  <div class="skills-container">
                    {#each selectedCareer.strengths as strength}
                      <span class="skill-tag-detail">{strength}</span>
                    {/each}
                  </div>
                {:else}
                  <p class="no-info">No skills information available.</p>
                {/if}
              </div>

              <!-- Work Environment -->
              {#if selectedCareer.workEnvironment}
                <div class="career-section">
                  <h4><i class="fa-solid fa-building"></i> Work Environment</h4>
                  <p class="environment-text">{selectedCareer.workEnvironment}</p>
                </div>
              {/if}

              <!-- Career Path -->
              {#if selectedCareer.careerPath && selectedCareer.careerPath.length > 0}
                <div class="career-section">
                  <h4><i class="fa-solid fa-route"></i> Career Path & Progression</h4>
                  <div class="career-path-timeline">
                    {#each selectedCareer.careerPath as step, index}
                      <div class="path-step">
                        <div class="step-number">{index + 1}</div>
                        <div class="step-content">
                          <div class="step-title">{step}</div>
                          {#if index === 0 && selectedCareer.salaryData}
                            <div class="step-duration">Entry-level (0-2 years) • {formatSalary(selectedCareer.salaryData.min)}</div>
                          {:else if index === 1 && selectedCareer.salaryData}
                            <div class="step-duration">Mid-level (2-5 years) • {formatSalary(selectedCareer.salaryData.average)}</div>
                          {:else if index === 2 && selectedCareer.salaryData}
                            <div class="step-duration">Senior (5-8 years) • {formatSalary(Math.round(selectedCareer.salaryData.average * 1.5))}</div>
                          {:else if index === 3 && selectedCareer.salaryData}
                            <div class="step-duration">Lead/Manager (8+ years) • {formatSalary(selectedCareer.salaryData.max)}</div>
                          {:else if index === 0}
                            <div class="step-duration">Entry-level (0-2 years)</div>
                          {:else if index === 1}
                            <div class="step-duration">Mid-level (2-5 years)</div>
                          {:else if index === 2}
                            <div class="step-duration">Senior (5-8 years)</div>
                          {:else if index === 3}
                            <div class="step-duration">Lead/Manager (8+ years)</div>
                          {:else}
                            <div class="step-duration">Executive/Strategic</div>
                          {/if}
                        </div>
                      </div>
                    {/each}
                  </div>
                </div>
              {/if}

              <!-- Skills to Develop -->
              {#if selectedCareer.skillsToDevelop && selectedCareer.skillsToDevelop.length > 0}
                <div class="career-section">
                  <h4><i class="fa-solid fa-lightbulb"></i> Skills to Develop</h4>
                  <div class="skills-container">
                    {#each selectedCareer.skillsToDevelop as skill}
                      <span class="skill-tag-develop">{skill}</span>
                    {/each}
                  </div>
                </div>
              {/if}

              <!-- Certifications -->
              {#if selectedCareer.certificationPaths && selectedCareer.certificationPaths.length > 0}
                <div class="career-section">
                  <h4><i class="fa-solid fa-certificate"></i> Recommended Certifications</h4>
                  <ul class="certifications-list">
                    {#each selectedCareer.certificationPaths as cert}
                      <li><i class="fa-solid fa-award"></i> {cert}</li>
                    {/each}
                  </ul>
                </div>
              {/if}

              <!-- Match Reasons -->
              {#if selectedCareer.matchReason}
                <div class="career-section match-reason-section">
                  <h4><i class="fa-solid fa-thumbs-up"></i> Why This Career Matches You</h4>
                  <div class="match-reason-content">
                    <div class="match-reason-icon">
                      <i class="fa-solid fa-star"></i>
                    </div>
                    <p class="match-reason-text">{selectedCareer.matchReason}</p>
                  </div>
                </div>
              {/if}

              <!-- Action Buttons -->
              <div class="career-action-buttons">
                <button class="btn-primary" on:click={() => generateResumeForCareer(selectedCareer!)}>
                  <i class="fa-solid fa-file-lines"></i> Generate Resume for This Career
                </button>
                <button class="btn-secondary" on:click={closeCareerDetails}>
                  <i class="fa-solid fa-arrow-left"></i> Back to Dashboard
                </button>
              </div>
            </div>
          {/if}
        </div>
      </div>
    </div>
  {/if}

  <!-- Fixed Sidebar -->
  <aside class="sidebar {sidebarOpen ? 'open' : 'closed'}">
    <div class="sidebar-header">
      <div class="logo-container">
        <img src="/logo1-Photoroom.png" alt="CareerGeenie" class="logo-image" />
        {#if sidebarOpen}
          <span class="brand-name">CareerGeenie</span>
        {/if}
      </div>
      <button 
        class="sidebar-toggle" 
        on:click={toggleSidebar}
        on:keydown={handleSidebarKeydown}
        aria-label="{sidebarOpen ? 'Close sidebar' : 'Open sidebar'}"
      >
        <i class="fa-solid {sidebarOpen ? 'fa-chevron-left' : 'fa-chevron-right'}"></i>
      </button>
    </div>

    {#if sidebarOpen}
      <div class="new-assessment-sidebar">
        <button 
          class="new-assessment-btn-sidebar"
          on:click={startNewAssessment}
          aria-label="Create new assessment"
          disabled={isLoading}
        >
          <i class="fa-solid fa-plus"></i>
          <span>{isLoading ? 'Loading...' : 'New Assessment'}</span>
        </button>
      </div>

      <nav class="assessment-history-nav" aria-label="Assessment history navigation">
        <div class="nav-section">
          <div class="nav-section-title">Assessment History</div>
          {#if getPaginatedAssessments().length > 0}
            {#each getPaginatedAssessments() as assessment, index}
              <div class="nav-item-wrapper">
                <button 
                  class="nav-item"
                  on:click={() => {
                    latestAssessment = assessment;
                    // Reset resume data when switching assessments
                    resumeData = null;
                    currentResumeCareer = null;
                  }}
                  aria-label="View {assessment.top_careers[0]?.title || 'Untitled Assessment'} assessment"
                >
                  <div class="nav-icon">
                    <i class="fa-solid {index === 0 && currentAssessmentPage === 1 ? 'fa-star' : 'fa-file-alt'}"></i>
                  </div>
                  <div class="nav-content">
                    <span class="nav-title">
                      {assessment.top_careers[0]?.title || assessment.full_results?.recommendations[0]?.title || 'Untitled Assessment'}
                    </span>
                    <span class="nav-subtitle">
                      {formatShortDate(assessment.date || assessment.created_at)} • {assessment.match_score}%
                    </span>
                  </div>
                </button>
                {#if !(index === 0 && currentAssessmentPage === 1)}
                  <button 
                    class="nav-item-delete"
                    on:click={() => confirmDeleteAssessment(assessment.id)}
                    aria-label="Delete this assessment"
                    title="Delete assessment"
                  >
                    <i class="fa-solid fa-trash-can"></i>
                  </button>
                {/if}
              </div>
            {/each}
            
            {#if totalAssessmentPages > 1}
              <div class="assessment-pagination">
                <button 
                  class="pagination-btn {currentAssessmentPage === 1 ? 'disabled' : ''}"
                  on:click={() => currentAssessmentPage > 1 && currentAssessmentPage--}
                  disabled={currentAssessmentPage === 1}
                  aria-label="Previous page"
                >
                  <i class="fa-solid fa-chevron-left"></i>
                </button>
                
                <span class="pagination-info">
                  Page {currentAssessmentPage} of {totalAssessmentPages}
                </span>
                
                <button 
                  class="pagination-btn {currentAssessmentPage === totalAssessmentPages ? 'disabled' : ''}"
                  on:click={() => currentAssessmentPage < totalAssessmentPages && currentAssessmentPage++}
                  disabled={currentAssessmentPage === totalAssessmentPages}
                  aria-label="Next page"
                >
                  <i class="fa-solid fa-chevron-right"></i>
                </button>
              </div>
            {/if}
          {:else}
            <div class="empty-history">
              <i class="fa-solid fa-clipboard-question"></i>
              <span class="empty-text">No assessments yet</span>
            </div>
          {/if}
        </div>
      </nav>

      <div class="user-section">
        <div class="user-profile-container">
          <div class="user-info">
            <div class="profile-circle">
              {#if userProfile?.profile_picture}
                <img 
                  src={userProfile.profile_picture} 
                  alt="" 
                  class="profile-image"
                />
              {:else}
                <div class="profile-initials">
                  {(userProfile?.first_name?.[0] || 'U')}{(userProfile?.last_name?.[0] || '')}
                </div>
              {/if}
            </div>
            <div class="user-details">
              <span class="user-name">{userProfile?.first_name || 'User'} {userProfile?.last_name || ''}</span>
            </div>
          </div>
          
          <div class="settings-container">
            <button 
              class="settings-trigger" 
              on:click={toggleSettingsMenu}
              on:keydown={handleSettingsKeydown}
              aria-label="Open settings menu"
              aria-expanded={showSettingsMenu}
            >
              <i class="fa-solid fa-ellipsis-vertical"></i>
            </button>

            {#if showSettingsMenu}
              <div class="settings-menu" transition:fade role="menu">
                <button 
                  class="settings-item"
                  on:click={() => { showEditProfile = true; showSettingsMenu = false; }}
                  on:keydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { showEditProfile = true; showSettingsMenu = false; } }}
                  aria-label="Edit profile"
                >
                  <i class="fa-solid fa-user-pen"></i>
                  <span>Edit Profile</span>
                </button>
                <button 
                  class="settings-item"
                  on:click={() => { openResumeGenerator(); showSettingsMenu = false; }}
                  on:keydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { openResumeGenerator(); showSettingsMenu = false; } }}
                  disabled={!latestAssessment}
                  aria-label="Generate professional resume"
                >
                  <i class="fa-solid fa-file-lines"></i>
                  <span>Generate Resume</span>
                </button>
                <div class="settings-divider"></div>
                <button 
                  class="settings-item logout"
                  on:click={handleLogout}
                  on:keydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { handleLogout(); } }}
                  disabled={isLoading}
                  aria-label="{isLoading ? 'Logging out...' : 'Logout'}"
                >
                  <i class="fa-solid fa-sign-out-alt"></i>
                  <span>{isLoading ? 'Logging out...' : 'Logout'}</span>
                </button>
              </div>
            {/if}
          </div>
        </div>
      </div>
    {:else}
      <div class="sidebar-mini-content">
        <button 
          class="new-assessment-mini"
          on:click={startNewAssessment}
          aria-label="Create new assessment"
          title="New Assessment"
          disabled={isLoading}
        >
          <i class="fa-solid fa-plus"></i>
        </button>
        
        <div class="sidebar-nav-mini">
          {#each assessments.slice(0, 5) as assessment, index}
            <button 
              class="nav-item-mini {index === 0 ? 'active' : ''}" 
              on:click={() => {
                latestAssessment = assessment;
                sidebarOpen = true;
                resumeData = null;
                currentResumeCareer = null;
              }}
              title="{assessment.top_careers[0]?.title || 'Assessment'}"
              aria-label="View {assessment.top_careers[0]?.title || 'Assessment'} assessment"
            >
              <i class="fa-solid {index === 0 ? 'fa-star' : 'fa-file-alt'}"></i>
              {#if index === 0}
                <span class="nav-badge-mini">{assessment.match_score}%</span>
              {/if}
            </button>
          {/each}
        </div>
        
        <div class="user-mini">
          <div class="profile-circle-mini">
            {#if userProfile?.profile_picture}
              <img 
                src={userProfile.profile_picture} 
                alt="" 
                class="profile-image-mini"
              />
            {:else}
              <div class="profile-initials-mini">
                {(userProfile?.first_name?.[0] || 'U')}
              </div>
            {/if}
          </div>
        </div>
      </div>
    {/if}
  </aside>

  <!-- Main Content -->
  <main class="main-content {sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}">
    <header class="main-header">
      <div class="header-left">
        <button 
          class="sidebar-toggle-mobile" 
          on:click={toggleSidebar}
          on:keydown={handleSidebarKeydown}
          aria-label="Toggle sidebar"
        >
          <i class="fa-solid {sidebarOpen ? 'fa-times' : 'fa-bars'}"></i>
        </button>
        <div class="header-title">
          <i class="fa-solid fa-chart-line header-icon"></i>
          <h1>Career Dashboard</h1>
        </div>
      </div>
    </header>

    {#if isLoading && !showResumeModal && !showEditProfile && !showDeleteConfirm && !showCareerDetails}
      <div class="loading-overlay">
        <div class="loading-spinner">
          <div class="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    {/if}

    <div class="dashboard-scroll-container">
      <div class="dashboard-content">
        <div class="welcome-section">
          <div class="welcome-content">
            <h2>Welcome back, {userProfile?.first_name || 'User'}!</h2>
            <p class="welcome-subtitle">Your personalized career insights and recommendations</p>
          </div>
          {#if assessments.length > 0}
            <div class="welcome-stats">
              <div class="stat-badge">
                <i class="fa-solid fa-chart-bar"></i>
                <span>{assessments.length} Assessments</span>
              </div>
              <div class="stat-badge">
                <i class="fa-solid fa-percentage"></i>
                <span>
                  {#if assessments.length > 0}
                    {Math.round(assessments.reduce((sum, a) => sum + a.match_score, 0) / assessments.length)}% Avg Match
                  {:else}
                    0% Avg Match
                  {/if}
                </span>
              </div>
            </div>
          {/if}
        </div>

        <div class="latest-results-section">
          <div class="section-header">
            <div class="section-title">
              <i class="fa-solid fa-trophy"></i>
              <h3>Latest Assessment Results</h3>
            </div>
            {#if latestAssessment}
              <button class="new-assessment-btn" on:click={startNewAssessment} disabled={isLoading}>
                <i class="fa-solid fa-plus"></i> New Assessment
              </button>
            {/if}
          </div>
          
          {#if latestAssessment}
            <div class="latest-assessment-card">
              <div class="match-score-display">
                <div class="score-circle">
                  <span class="score-value">{latestAssessment.match_score}%</span>
                  <span class="score-label">Match</span>
                </div>
                <div class="score-details">
                  <h4 class="career-title">
                    {latestAssessment.top_careers[0]?.title || latestAssessment.full_results?.recommendations[0]?.title || 'Career Match'}
                  </h4>
                  <p class="career-description">
                    Based on your skills assessment completed on {formatDate(latestAssessment.date || latestAssessment.created_at)}
                  </p>
                  <div class="assessment-meta">
                    <span class="meta-item">
                      <i class="fa-solid fa-calendar"></i>
                      {formatShortDate(latestAssessment.date || latestAssessment.created_at)}
                    </span>
                    <span class="meta-item">
                      <i class="fa-solid fa-clock"></i>
                      {formatTime(latestAssessment.created_at)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div class="result-actions">
                <button class="action-btn primary" on:click={openResumeGenerator}>
                  <i class="fa-solid fa-file-lines"></i> Generate Resume
                </button>
                <button class="action-btn secondary career-card-trigger" on:click={() => {
                  if (latestAssessment && latestAssessment.top_careers[0]) {
                    viewCareerDetails(latestAssessment.top_careers[0]);
                  }
                }}>
                  <i class="fa-solid fa-eye"></i> View Career Details
                </button>
              </div>
            </div>
          {:else}
            <div class="no-assessment-card">
              <div class="no-assessment-content">
                <i class="fa-solid fa-clipboard-question"></i>
                <h4>No Assessment Results</h4>
                <p>Complete your first assessment to see your career path results</p>
                <button class="start-assessment-btn" on:click={startNewAssessment} disabled={isLoading}>
                  {isLoading ? 'Starting...' : 'Start Your First Assessment'}
                </button>
              </div>
            </div>
          {/if}
        </div>

        {#if latestAssessment && (latestAssessment.top_careers?.length > 0 || latestAssessment.full_results?.recommendations?.length > 0)}
          <div class="career-matches-section">
            <div class="section-header">
              <div class="section-title">
                <i class="fa-solid fa-briefcase"></i>
                <h3>Top Career Matches</h3>
              </div>
              <span class="section-subtitle">Click on any career to learn more about what the job involves</span>
            </div>
            
            <div class="career-matches-grid">
              {#each (latestAssessment.top_careers || latestAssessment.full_results?.recommendations || []).slice(0, 4) as career, index}
                <button type="button"
                        class="career-match-card career-card-trigger"
                        style="--card-gradient: {career.gradient || (index === 0 ? 'linear-gradient(135deg, #6366f1, #818cf8)' : index === 1 ? 'linear-gradient(135deg, #10b981, #34d399)' : index === 2 ? 'linear-gradient(135deg, #f59e0b, #fbbf24)' : 'linear-gradient(135deg, #ec4899, #f472b6)')}"
                        on:click={() => viewCareerDetails(career)}
                        on:keydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); viewCareerDetails(career); } }}
                        aria-label="View details for {career.title}">
                  <div class="match-rank">#{index + 1}</div>
                  <div class="match-content">
                    <div class="match-header">
                      <h4>{career.title}</h4>
                      <span class="match-percentage">{career.matchPercentage || Math.max(0, (latestAssessment?.match_score || 0) - (index * 15))}% Match</span>
                    </div>
                    <div class="match-details">
                      {#if career.industry}
                        <div class="detail-item">
                          <i class="fa-solid fa-industry"></i>
                          <span>{career.industry}</span>
                        </div>
                      {/if}
                      {#if career.salary}
                        <div class="detail-item">
                          <i class="fa-solid fa-money-bill-wave"></i>
                          <span>{career.salary}</span>
                        </div>
                      {/if}
                      {#if career.experienceLevel}
                        <div class="detail-item">
                          <i class="fa-solid fa-chart-line"></i>
                          <span>{career.experienceLevel}</span>
                        </div>
                      {/if}
                    </div>
                    {#if career.strengths && career.strengths.length > 0}
                      <div class="match-strengths">
                        <strong>Strengths:</strong>
                        <div class="strengths-list">
                          {#each career.strengths.slice(0, 2) as strength}
                            <span class="strength-tag">{strength}</span>
                          {/each}
                          {#if career.strengths.length > 2}
                            <span class="strength-tag">+{career.strengths.length - 2} more</span>
                          {/if}
                        </div>
                      </div>
                    {/if}
                  </div>
                  <div class="match-actions">
                    <span 
                      class="view-details-btn" 
                      role="button"
                      tabindex="0"
                      on:click|stopPropagation={() => viewCareerDetails(career)}
                      on:keydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); viewCareerDetails(career); } }}
                      aria-label="View details for {career.title}"
                    >
                      <i class="fa-solid fa-arrow-right"></i>
                    </span>
                  </div>
                </button>
              {/each}
            </div>
          </div>
        {/if}

        <div class="metrics-section">
          <div class="section-header">
            <div class="section-title">
              <i class="fa-solid fa-chart-pie"></i>
              <h3>Your Career Metrics</h3>
            </div>
          </div>
          
          <div class="metrics-grid">
            <div class="metric-card">
              <div class="metric-icon" style="background: linear-gradient(135deg, #6366f1, #818cf8)">
                <i class="fa-solid fa-chart-bar"></i>
              </div>
              <div class="metric-content">
                <div class="metric-value">{assessments.length}</div>
                <div class="metric-label">Total Assessments</div>
              </div>
            </div>

            <div class="metric-card">
              <div class="metric-icon" style="background: linear-gradient(135deg, #10b981, #34d399)">
                <i class="fa-solid fa-percentage"></i>
              </div>
              <div class="metric-content">
                <div class="metric-value">
                  {#if assessments.length > 0}
                    {Math.round(assessments.reduce((sum, a) => sum + a.match_score, 0) / assessments.length)}%
                  {:else}
                    0%
                  {/if}
                </div>
                <div class="metric-label">Average Match</div>
              </div>
            </div>

            <div class="metric-card">
              <div class="metric-icon" style="background: linear-gradient(135deg, #f59e0b, #fbbf24)">
                <i class="fa-solid fa-calendar-check"></i>
              </div>
              <div class="metric-content">
                <div class="metric-value">
                  {#if latestAssessment}
                    {formatShortDate(latestAssessment.date || latestAssessment.created_at)}
                  {:else}
                    --
                  {/if}
                </div>
                <div class="metric-label">Last Assessment</div>
              </div>
            </div>

            <div class="metric-card">
              <div class="metric-icon" style="background: linear-gradient(135deg, #ec4899, #f472b6)">
                <i class="fa-solid fa-briefcase"></i>
              </div>
              <div class="metric-content">
                <div class="metric-value">
                  {#if latestAssessment && (latestAssessment.top_careers?.length > 0 || latestAssessment.full_results?.recommendations?.length > 0)}
                    {(latestAssessment.top_careers[0]?.title || latestAssessment.full_results?.recommendations[0]?.title || '').split(' ')[0]}
                  {:else}
                    --
                  {/if}
                </div>
                <div class="metric-label">Top Career</div>
              </div>
            </div>
          </div>
        </div>

        <div class="stats-section">
          <div class="stats-grid">
            <div class="stats-card">
              <div class="stats-header">
                <h4><i class="fa-solid fa-chart-line"></i> Assessment Overview</h4>
              </div>
              <div class="stats-content">
                <div class="stat-item">
                  <span class="stat-label">Highest Match:</span>
                  <span class="stat-value">
                    {#if assessments.length > 0}
                      {Math.max(...assessments.map(a => a.match_score))}%
                    {:else}
                      --
                    {/if}
                  </span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Lowest Match:</span>
                  <span class="stat-value">
                    {#if assessments.length > 0}
                      {Math.min(...assessments.map(a => a.match_score))}%
                    {:else}
                      --
                    {/if}
                  </span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Assessments This Month:</span>
                  <span class="stat-value">
                    {#if assessments.length > 0}
                      {assessments.filter(a => {
                        const assessmentDate = new Date(a.created_at);
                        const now = new Date();
                        return assessmentDate.getMonth() === now.getMonth() && 
                              assessmentDate.getFullYear() === now.getFullYear();
                      }).length}
                    {:else}
                      0
                    {/if}
                  </span>
                </div>
              </div>
            </div>

            <div class="stats-card">
              <div class="stats-header">
                <h4><i class="fa-solid fa-trend-up"></i> Progress Summary</h4>
              </div>
              <div class="stats-content">
                <div class="stat-item">
                  <span class="stat-label">Career Paths Explored:</span>
                  <span class="stat-value">
                    {#if assessments.length > 0}
                      {new Set(assessments.flatMap(a => [...(a.top_careers || []), ...(a.full_results?.recommendations || [])].map((c: CareerMatch) => c.title))).size}
                    {:else}
                      0
                    {/if}
                  </span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Skills Identified:</span>
                  <span class="stat-value">
                    {#if assessments.length > 0}
                      {new Set(assessments.flatMap(a => 
                        [...(a.top_careers || []), ...(a.full_results?.recommendations || [])].flatMap((c: CareerMatch) => c.requiredSkills || [])
                      )).size}
                    {:else}
                      0
                    {/if}
                  </span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Completion Rate:</span>
                  <span class="stat-value">
                    {#if assessments.length > 0}
                      100%
                    {:else}
                      0%
                    {/if}
                  </span>
                </div>
              </div>
            </div>

            {#if latestAssessment && latestAssessment.full_results?.summaryData}
              <div class="stats-card">
                <div class="stats-header">
                  <h4><i class="fa-solid fa-list-check"></i> Your Action Plan</h4>
                </div>
                <div class="stats-content">
                  <div class="action-items">
                    {#each latestAssessment.full_results.summaryData.suggestedNextSteps.slice(0, 3) as step, index}
                      <div class="action-item">
                        <div class="action-number">{index + 1}</div>
                        <span class="action-text">{step}</span>
                      </div>
                    {/each}
                  </div>
                  <div class="action-plan-footer">
                    <button class="view-full-plan" on:click={openResumeGenerator}>
                      View Full Plan <i class="fa-solid fa-arrow-right"></i>
                    </button>
                  </div>
                </div>
              </div>
            {/if}
          </div>
        </div>
      </div>

      <footer class="dashboard-footer">
        <div class="footer-content">
          <p>© 2026 CareerGeenie. All rights reserved.</p> 
        </div>
      </footer>
    </div>
  </main>

  <!-- Edit Profile Modal -->
  {#if showEditProfile}
    <div class="modal-overlay" transition:fade>
      <div class="modal" transition:scale>
        <div class="modal-header">
          <h3>Edit Profile</h3>
          <button 
            class="modal-close" 
            on:click={() => showEditProfile = false}
            aria-label="Close modal"
          >
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div class="modal-body">
          <form class="profile-form" on:submit|preventDefault={updateProfile}>
            <div class="form-group">
              <label for="first-name">First Name</label>
              <input 
                id="first-name" 
                type="text" 
                bind:value={editProfileData.first_name} 
                required 
                aria-required="true"
              />
            </div>
            <div class="form-group">
              <label for="last-name">Last Name</label>
              <input 
                id="last-name" 
                type="text" 
                bind:value={editProfileData.last_name} 
                required 
                aria-required="true"
              />
            </div>
            <div class="form-group">
              <label for="phone">Phone Number</label>
              <input 
                id="phone" 
                type="tel" 
                bind:value={editProfileData.phone}
                on:input={(e) => {
                  const input = e.target as HTMLInputElement;
                  input.value = validatePhoneNumber(input.value);
                  editProfileData.phone = input.value;
                }}
                pattern="[0-9+\-\s()]+"
                title="Please enter a valid phone number (numbers, +, -, space, parentheses only)"
                placeholder="e.g., +63 912 345 6789"
                aria-label="Phone number (optional)"
              />
              <small class="input-hint">Numbers, +, -, space, and parentheses only</small>
            </div>
            <div class="form-actions">
              <button 
                type="button" 
                class="btn-secondary" 
                on:click={() => showEditProfile = false}
                aria-label="Cancel editing profile"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                class="btn-primary" 
                disabled={isLoading}
                aria-label="{isLoading ? 'Saving profile changes...' : 'Save profile changes'}"
              >
                {isLoading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  {/if}

  <!-- Resume Generator Modal -->
  {#if showResumeModal && resumeData}
    <div class="modal-overlay resume-modal-overlay" transition:fade>
      <div class="resume-modal" transition:scale>
        <div class="resume-modal-header">
          <div class="resume-title">
            <i class="fa-solid fa-file-lines"></i>
            <h2>Generate Professional Resume for {currentResumeCareer?.title || 'Career'}</h2>
          </div>
          <button 
            class="modal-close" 
            on:click={() => {
              showResumeModal = false;
              resumeData = null;
              currentResumeCareer = null;
            }}
            aria-label="Close resume generator"
          >
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
        
        <div class="resume-modal-body">
          <div class="resume-builder-section">
            <h3><i class="fa-solid fa-edit"></i> Customize Your Resume</h3>
            
            <div class="resume-section">
              <h4><i class="fa-solid fa-address-card"></i> Contact Information</h4>
              <div class="form-grid">
                <div class="form-group">
                  <label for="resume-email">Email</label>
                  <input 
                    id="resume-email"
                    type="email" 
                    bind:value={resumeData.email} 
                    placeholder="your.email@example.com" 
                  />
                </div>
                <div class="form-group">
                  <label for="resume-phone">Phone Number</label>
                  <input 
                    id="resume-phone"
                    type="tel" 
                    bind:value={resumeData.phone}
                    on:input={(e) => {
                      const input = e.target as HTMLInputElement;
                      input.value = validatePhoneNumber(input.value);
                      if (resumeData) resumeData.phone = input.value;
                    }}
                    pattern="[0-9+\-\s()]+"
                    title="Please enter a valid phone number (numbers, +, -, space, parentheses only)"
                    placeholder="e.g., +63 912 345 6789"
                    aria-label="Phone number"
                  />
                  <small class="input-hint">Numbers, +, -, space, and parentheses only</small>
                </div>
                <div class="form-group">
                  <label for="resume-location">Location</label>
                  <input 
                    id="resume-location"
                    type="text" 
                    bind:value={resumeData.location} 
                    placeholder="City, State" 
                  />
                </div>
                <div class="form-group">
                  <label for="resume-linkedin">LinkedIn</label>
                  <input 
                    id="resume-linkedin"
                    type="url" 
                    bind:value={resumeData.linkedin} 
                    placeholder="linkedin.com/in/yourprofile" 
                  />
                </div>
                <div class="form-group full-width">
                  <label for="resume-portfolio">Portfolio</label>
                  <input 
                    id="resume-portfolio"
                    type="url" 
                    bind:value={resumeData.portfolio} 
                    placeholder="yourportfolio.com" 
                  />
                </div>
              </div>
            </div>
            
            <div class="resume-section">
              <h4><i class="fa-solid fa-user-tie"></i> Professional Summary</h4>
              <div class="form-group">
                <label for="resume-summary" class="sr-only">Professional Summary</label>
                <p class="summary-generated-note" style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.5rem;">
                  <i class="fa-solid fa-magic"></i> This summary was generated based on your assessment results. You can edit it below.
                </p>
                <textarea 
                  id="resume-summary"
                  bind:value={resumeData.summary} 
                  rows="5" 
                  placeholder="Your professional summary..."
                ></textarea>
              </div>
            </div>

            <div class="resume-section">
              <h4><i class="fa-solid fa-tools"></i> Skills
                <span class="section-optional-badge">Optional - Add your skills manually</span>
              </h4>
              <div class="skills-section-header">
                <div class="skills-info">
                  <p class="skills-subtitle">
                    Add your professional skills manually. These will appear on your resume.
                  </p>
                </div>
              </div>
              <div class="skills-input">
                <label for="new-skill" class="sr-only">Add a skill</label>
                <input 
                  id="new-skill"
                  type="text" 
                  bind:value={newSkill}
                  placeholder="e.g., Project Management, Python, Data Analysis"
                  on:keydown={(e) => { if (e.key === 'Enter') addSkill(); }}
                />
                <button class="btn-small" on:click={addSkill} aria-label="Add skill">
                  <i class="fa-solid fa-plus"></i> Add
                </button>
              </div>
              {#if resumeData.skills.length > 0}
                <div class="skills-list">
                  {#each resumeData.skills as skill, index}
                    <div class="skill-tag">
                      {skill}
                      <button 
                        class="skill-remove" 
                        on:click={() => removeSkill(index)}
                        aria-label="Remove skill: {skill}"
                      >
                        <i class="fa-solid fa-times"></i>
                      </button>
                    </div>
                  {/each}
                </div>
              {:else}
                <p class="section-empty-hint">No skills added yet. Use the input above to add your professional skills.</p>
              {/if}
            </div>
            
            <div class="resume-section">
              <h4><i class="fa-solid fa-briefcase"></i> Experience
                <span class="section-optional-badge">Optional</span>
              </h4>

              {#if resumeData.experiences.length > 0}
                {#each resumeData.experiences as exp, index}
                  <div class="experience-form">
                    <div class="form-grid">
                      <div class="form-group">
                        <label for="exp-title-{index}">Job Title</label>
                        <input id="exp-title-{index}" type="text" bind:value={exp.title} placeholder="e.g., Software Engineer" />
                      </div>
                      <div class="form-group">
                        <label for="exp-company-{index}">Company</label>
                        <input id="exp-company-{index}" type="text" bind:value={exp.company} placeholder="Company Name" />
                      </div>
                      <div class="form-group">
                        <label for="exp-location-{index}">Location</label>
                        <input id="exp-location-{index}" type="text" bind:value={exp.location} placeholder="City, State" />
                      </div>
                      <div class="form-group">
                        <label for="exp-start-{index}">Start Date</label>
                        <input id="exp-start-{index}" type="month" bind:value={exp.startDate} />
                      </div>
                      <div class="form-group">
                        <label for="exp-end-{index}">End Date</label>
                        <input id="exp-end-{index}" type="month" bind:value={exp.endDate} disabled={exp.current} />
                      </div>
                      <div class="form-group checkbox-group">
                        <label class="checkbox-label">
                          <input type="checkbox" bind:checked={exp.current} aria-label="Current position" />
                          Current Position
                        </label>
                      </div>
                    </div>
                    <div class="form-group">
                      <label for="exp-description-{index}">Description</label>
                      <textarea id="exp-description-{index}" bind:value={exp.description} rows="3" placeholder="Describe your responsibilities and achievements..."></textarea>
                    </div>
                    <button class="btn-remove" on:click={() => removeExperience(index)} aria-label="Remove experience">
                      <i class="fa-solid fa-trash"></i> Remove
                    </button>
                  </div>
                {/each}
              {/if}
              
              <div class="experience-form">
                <div class="form-grid">
                  <div class="form-group">
                    <label for="new-exp-title">Job Title</label>
                    <input id="new-exp-title" type="text" bind:value={newExperience.title} placeholder="e.g., Software Engineer" />
                  </div>
                  <div class="form-group">
                    <label for="new-exp-company">Company</label>
                    <input id="new-exp-company" type="text" bind:value={newExperience.company} placeholder="Company Name" />
                  </div>
                  <div class="form-group">
                    <label for="new-exp-location">Location</label>
                    <input id="new-exp-location" type="text" bind:value={newExperience.location} placeholder="City, State" />
                  </div>
                  <div class="form-group">
                    <label for="new-exp-start">Start Date</label>
                    <input id="new-exp-start" type="month" bind:value={newExperience.startDate} />
                  </div>
                  <div class="form-group">
                    <label for="new-exp-end">End Date</label>
                    <input id="new-exp-end" type="month" bind:value={newExperience.endDate} disabled={newExperience.current} />
                  </div>
                  <div class="form-group checkbox-group">
                    <label class="checkbox-label">
                      <input type="checkbox" bind:checked={newExperience.current} aria-label="Current position" />
                      Current Position
                    </label>
                  </div>
                </div>
                <div class="form-group">
                  <label for="new-exp-description">Description</label>
                  <textarea id="new-exp-description" bind:value={newExperience.description} rows="3" placeholder="Describe your responsibilities and achievements..."></textarea>
                </div>
                <button class="btn-add" on:click={addExperience} aria-label="Add new experience">
                  <i class="fa-solid fa-plus"></i> Add Experience
                </button>
              </div>
            </div>
            
            <div class="resume-section">
              <h4><i class="fa-solid fa-graduation-cap"></i> Education
                <span class="section-optional-badge">Optional</span>
              </h4>

              {#if resumeData.education.length > 0}
                {#each resumeData.education as edu, index}
                  <div class="education-form">
                    <div class="form-grid">
                      <div class="form-group">
                        <label for="edu-degree-{index}">Degree</label>
                        <input id="edu-degree-{index}" type="text" bind:value={edu.degree} placeholder="e.g., Bachelor of Science" />
                      </div>
                      <div class="form-group">
                        <label for="edu-institution-{index}">Institution</label>
                        <input id="edu-institution-{index}" type="text" bind:value={edu.institution} placeholder="University Name" />
                      </div>
                      <div class="form-group">
                        <label for="edu-location-{index}">Location</label>
                        <input id="edu-location-{index}" type="text" bind:value={edu.location} placeholder="City, State" />
                      </div>
                      <div class="form-group">
                        <label for="edu-graduation-{index}">Graduation Date</label>
                        <input id="edu-graduation-{index}" type="month" bind:value={edu.graduationDate} />
                      </div>
                      <div class="form-group">
                        <label for="edu-gpa-{index}">GPA</label>
                        <input id="edu-gpa-{index}" type="text" bind:value={edu.gpa} placeholder="3.5" />
                      </div>
                    </div>
                    <button class="btn-remove" on:click={() => removeEducation(index)} aria-label="Remove education">
                      <i class="fa-solid fa-trash"></i> Remove
                    </button>
                  </div>
                {/each}
              {/if}
              
              <div class="education-form">
                <div class="form-grid">
                  <div class="form-group">
                    <label for="new-edu-degree">Degree</label>
                    <input id="new-edu-degree" type="text" bind:value={newEducation.degree} placeholder="e.g., Bachelor of Science" />
                  </div>
                  <div class="form-group">
                    <label for="new-edu-institution">Institution</label>
                    <input id="new-edu-institution" type="text" bind:value={newEducation.institution} placeholder="University Name" />
                  </div>
                  <div class="form-group">
                    <label for="new-edu-location">Location</label>
                    <input id="new-edu-location" type="text" bind:value={newEducation.location} placeholder="City, State" />
                  </div>
                  <div class="form-group">
                    <label for="new-edu-graduation">Graduation Date</label>
                    <input id="new-edu-graduation" type="month" bind:value={newEducation.graduationDate} />
                  </div>
                  <div class="form-group">
                    <label for="new-edu-gpa">GPA</label>
                    <input id="new-edu-gpa" type="text" bind:value={newEducation.gpa} placeholder="3.5" />
                  </div>
                </div>
                <button class="btn-add" on:click={addEducation} aria-label="Add new education">
                  <i class="fa-solid fa-plus"></i> Add Education
                </button>
              </div>
            </div>
            
            <div class="resume-section">
              <h4><i class="fa-solid fa-certificate"></i> Certifications
                <span class="section-optional-badge">Optional</span>
              </h4>

              {#if resumeData.certifications.length > 0}
                {#each resumeData.certifications as cert, index}
                  <div class="certification-form">
                    <div class="form-grid">
                      <div class="form-group">
                        <label for="cert-name-{index}">Certification Name</label>
                        <input id="cert-name-{index}" type="text" bind:value={cert.name} placeholder="e.g., AWS Certified Solutions Architect" />
                      </div>
                      <div class="form-group">
                        <label for="cert-issuer-{index}">Issuer</label>
                        <input id="cert-issuer-{index}" type="text" bind:value={cert.issuer} placeholder="Issuing Organization" />
                      </div>
                      <div class="form-group">
                        <label for="cert-date-{index}">Date Obtained</label>
                        <input id="cert-date-{index}" type="month" bind:value={cert.date} />
                      </div>
                    </div>
                    <button class="btn-remove" on:click={() => removeCertification(index)} aria-label="Remove certification">
                      <i class="fa-solid fa-trash"></i> Remove
                    </button>
                  </div>
                {/each}
              {/if}
              
              <div class="certification-form">
                <div class="form-grid">
                  <div class="form-group">
                    <label for="new-cert-name">Certification Name</label>
                    <input id="new-cert-name" type="text" bind:value={newCertification.name} placeholder="e.g., AWS Certified Solutions Architect" />
                  </div>
                  <div class="form-group">
                    <label for="new-cert-issuer">Issuer</label>
                    <input id="new-cert-issuer" type="text" bind:value={newCertification.issuer} placeholder="Issuing Organization" />
                  </div>
                  <div class="form-group">
                    <label for="new-cert-date">Date Obtained</label>
                    <input id="new-cert-date" type="month" bind:value={newCertification.date} />
                  </div>
                </div>
                <button class="btn-add" on:click={addCertification} aria-label="Add new certification">
                  <i class="fa-solid fa-plus"></i> Add Certification
                </button>
              </div>
            </div>
          </div>
          
          <div class="resume-preview-section">
            <div class="preview-header">
              <h3><i class="fa-solid fa-eye"></i> Resume Preview</h3>
              <button 
                class="btn-small" 
                on:click={generatePDFResume} 
                disabled={isGeneratingPDF}
                aria-label="{isGeneratingPDF ? 'Generating PDF...' : 'Download PDF resume'}"
              >
                {#if isGeneratingPDF}
                  <i class="fa-solid fa-spinner fa-spin"></i> Generating...
                {:else}
                  <i class="fa-solid fa-print"></i> Print/Download PDF
                {/if}
              </button>
            </div>
            
            <div class="resume-preview-content" id="resume-preview-content">
              <div class="resume-template" id="printable-resume">
                <div class="resume-header-section">
                  <h1 class="resume-name">{userProfile?.first_name} {userProfile?.last_name}</h1>
                  <div class="resume-contact">
                    {#if resumeData.email}
                      <span><i class="fa-solid fa-envelope"></i> {resumeData.email}</span>
                    {/if}
                    {#if resumeData.phone}
                      <span><i class="fa-solid fa-phone"></i> {resumeData.phone}</span>
                    {/if}
                    {#if resumeData.location}
                      <span><i class="fa-solid fa-location-dot"></i> {resumeData.location}</span>
                    {/if}
                    {#if resumeData.linkedin}
                      <span><i class="fa-brands fa-linkedin"></i> {resumeData.linkedin}</span>
                    {/if}
                    {#if resumeData.portfolio}
                      <span><i class="fa-solid fa-globe"></i> {resumeData.portfolio}</span>
                    {/if}
                  </div>
                </div>
                
                <div class="resume-section-preview">
                  <h2 class="section-title-preview"><i class="fa-solid fa-user-tie"></i> Professional Summary</h2>
                  <p class="section-content">
                    {resumeData.summary || '[Awaiting user input]'}
                  </p>
                </div>
                
                {#if resumeData.skills.length > 0}
                  <div class="resume-section-preview">
                    <h2 class="section-title-preview"><i class="fa-solid fa-tools"></i> Skills</h2>
                    <div class="skills-grid">
                      {#each resumeData.skills as skill}
                        <span class="skill-item">{skill}</span>
                      {/each}
                    </div>
                  </div>
                {/if}
                
                {#if resumeData.experiences.length > 0}
                  <div class="resume-section-preview">
                    <h2 class="section-title-preview"><i class="fa-solid fa-briefcase"></i> Experience</h2>
                    {#each resumeData.experiences as exp}
                      <div class="experience-item-preview">
                        <div class="experience-header">
                          <h3 class="experience-title">{exp.title}</h3>
                          <span class="experience-date">
                            {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                          </span>
                        </div>
                        <div class="experience-company">{exp.company}{exp.location ? ' | ' + exp.location : ''}</div>
                        {#if exp.description}
                          <div class="experience-description">
                            {#each exp.description.split('\n') as line}
                              {#if line.trim()}
                                <p>• {line}</p>
                              {/if}
                            {/each}
                          </div>
                        {/if}
                      </div>
                    {/each}
                  </div>
                {/if}
                
                {#if resumeData.education.length > 0}
                  <div class="resume-section-preview">
                    <h2 class="section-title-preview"><i class="fa-solid fa-graduation-cap"></i> Education</h2>
                    {#each resumeData.education as edu}
                      <div class="education-item-preview">
                        <div class="education-header">
                          <h3 class="education-degree">{edu.degree}</h3>
                          <span class="education-date">{edu.graduationDate}</span>
                        </div>
                        <div class="education-institution">{edu.institution}{edu.location ? ' | ' + edu.location : ''}</div>
                        {#if edu.gpa}
                          <div class="education-details">GPA: {edu.gpa}</div>
                        {/if}
                      </div>
                    {/each}
                  </div>
                {/if}
                
                {#if resumeData.certifications.length > 0}
                  <div class="resume-section-preview">
                    <h2 class="section-title-preview"><i class="fa-solid fa-certificate"></i> Certifications</h2>
                    <div class="certifications-list">
                      {#each resumeData.certifications as cert}
                        <div class="certification-item">
                          <strong>{cert.name}</strong> – {cert.issuer} ({cert.date})
                        </div>
                      {/each}
                    </div>
                  </div>
                {/if}
                
                <div class="generated-footer">
                  <p class="footer-date">
                    Generated on {new Date().toLocaleDateString()} by CareerGeenie
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
    /* ========== COMPLETE STYLES FROM YOUR ORIGINAL CODE ========== */
    /* All your original styles remain exactly the same */
    
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap');
    @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');

    :root {
      --primary-color: #6366f1;
      --primary-light: #818cf8;
      --primary-dark: #4f46e5;
      --secondary: #f59e0b;
      --secondary-light: #fbbf24;
      --accent: #ec4899;
      --accent-light: #f472b6;
      --success: #10b981;
      --warning: #f59e0b;
      --error: #ef4444;
      --background: #ffffff;
      --surface: #f8fafc;
      --surface-light: #f1f5f9;
      --text: #0f172a;
      --text-secondary: #475569;
      --text-muted: #94a3b8;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    .dashboard-page {
      min-height: 100vh;
      background: var(--background);
      font-family: 'Inter', sans-serif;
      color: var(--text);
      position: relative;
      overflow-x: hidden;
    }

    /* Background Elements */
    .background-elements {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1;
    }

    .bg-gradient {
      position: absolute;
      top: 0;
      right: -200px;
      width: 600px;
      height: 600px;
      background: radial-gradient(circle, rgba(99, 102, 241, 0.05) 0%, rgba(99, 102, 241, 0) 70%);
      filter: blur(60px);
    }

    .bg-particle {
      position: absolute;
      background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
      border-radius: 50%;
      opacity: 0.05;
      animation: float 20s infinite linear;
    }

    .bg-particle:nth-child(2) {
      top: 20%;
      left: 10%;
      width: 300px;
      height: 300px;
      background: linear-gradient(135deg, var(--accent), var(--accent-light));
      animation-delay: -5s;
    }

    .bg-particle:nth-child(3) {
      top: 60%;
      right: 15%;
      width: 200px;
      height: 200px;
      background: linear-gradient(135deg, var(--secondary), var(--secondary-light));
      animation-delay: -10s;
    }

    .bg-particle:nth-child(4) {
      bottom: 10%;
      left: 20%;
      width: 400px;
      height: 400px;
      background: linear-gradient(135deg, var(--success), #34d399);
      animation-delay: -15s;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      50% { transform: translateY(-20px) rotate(180deg); }
    }

    /* Career Details Modal */
    .career-details-modal {
      max-width: 800px;
      max-height: 85vh;
      display: flex;
      flex-direction: column;
    }

    .career-modal-title {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex: 1;
    }

    .career-match-badge-small {
      background: linear-gradient(135deg, var(--success), #34d399);
      color: white;
      padding: 0.375rem 0.75rem;
      border-radius: 1rem;
      font-size: 0.75rem;
      font-weight: 600;
      white-space: nowrap;
    }

    .match-badge-value {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .career-details-body {
      overflow-y: auto;
      padding: 0;
    }

    .loading-spinner-small {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem;
      gap: 1rem;
    }

    .loading-spinner-small .spinner {
      width: 30px;
      height: 30px;
      border-width: 2px;
    }

    .career-details-content {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .career-section {
      background: rgba(0, 0, 0, 0.02);
      border-radius: 0.75rem;
      padding: 1.25rem;
      border: 1px solid rgba(0, 0, 0, 0.1);
    }

    .career-section h4 {
      font-size: 1rem;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    }

    .career-section h4 i { color: var(--primary-color); }

    .career-description-text {
      font-size: 0.875rem;
      line-height: 1.6;
      color: var(--text-secondary);
      margin-bottom: 1rem;
    }

    .career-quick-facts {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .quick-fact {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
    }

    .quick-fact i { color: var(--primary-color); width: 16px; }
    .fact-label { font-weight: 500; color: var(--text); }
    .fact-value { color: var(--text-secondary); }

    .salary-highlight {
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05));
      padding: 0.5rem;
      border-radius: 0.5rem;
      border-left: 3px solid var(--success);
    }

    .salary-amount { font-weight: 700; color: var(--success); }

    .salary-details-box {
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(99, 102, 241, 0.02));
      border-radius: 0.75rem;
      padding: 1.25rem;
      border: 1px solid rgba(99, 102, 241, 0.1);
      margin-top: 1rem;
    }

    .salary-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    }

    .salary-header h5 {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .salary-source { font-size: 0.75rem; color: var(--text-muted); font-style: italic; }

    .salary-breakdown {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .salary-item {
      text-align: center;
      padding: 0.75rem;
      background: rgba(255, 255, 255, 0.8);
      border-radius: 0.5rem;
      border: 1px solid rgba(0, 0, 0, 0.05);
    }

    .salary-label { font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.25rem; }
    .salary-item .salary-amount { font-size: 1rem; font-weight: 700; color: var(--text); }
    .salary-item .salary-amount.average { color: var(--success); font-size: 1.125rem; }

    .salary-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    .salary-experience, .salary-updated {
      display: flex;
      align-items: center;
      gap: 0.375rem;
    }

    .step-duration { font-size: 0.75rem; color: var(--text-muted); }

    .tasks-list { list-style: none; padding: 0; margin: 0; }

    .tasks-list li {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
      color: var(--text-secondary);
    }

    .tasks-list li i { color: var(--success); font-size: 0.75rem; margin-top: 0.125rem; flex-shrink: 0; }

    .responsibilities-text { font-size: 0.875rem; line-height: 1.6; color: var(--text-secondary); }

    .no-info { font-size: 0.875rem; color: var(--text-muted); font-style: italic; text-align: center; padding: 1rem; }

    .skills-container { display: flex; flex-wrap: wrap; gap: 0.5rem; }

    .skill-tag-detail {
      background: rgba(99, 102, 241, 0.1);
      color: var(--primary-dark);
      padding: 0.375rem 0.75rem;
      border-radius: 1rem;
      font-size: 0.75rem;
      font-weight: 500;
      border: 1px solid rgba(99, 102, 241, 0.2);
    }

    .skill-tag-develop {
      background: rgba(245, 158, 11, 0.1);
      color: var(--warning);
      padding: 0.375rem 0.75rem;
      border-radius: 1rem;
      font-size: 0.75rem;
      font-weight: 500;
      border: 1px solid rgba(245, 158, 11, 0.2);
    }

    .environment-text { font-size: 0.875rem; line-height: 1.6; color: var(--text-secondary); }

    .career-path-timeline { display: flex; flex-direction: column; gap: 1rem; }

    .path-step {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      padding: 0.75rem;
      background: rgba(0, 0, 0, 0.02);
      border-radius: 0.5rem;
      border-left: 3px solid var(--primary-color);
    }

    .step-number {
      background: var(--primary-color);
      color: white;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 600;
      flex-shrink: 0;
    }

    .step-content { flex: 1; }

    .step-title { font-size: 0.875rem; font-weight: 500; color: var(--text); margin-bottom: 0.25rem; }

    .certifications-list { list-style: none; padding: 0; margin: 0; }

    .certifications-list li {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
      color: var(--text-secondary);
    }

    .certifications-list li i { color: var(--accent); font-size: 0.75rem; margin-top: 0.125rem; flex-shrink: 0; }

    .match-reason-section {
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05));
      border-color: rgba(16, 185, 129, 0.2);
    }

    .match-reason-content { display: flex; align-items: flex-start; gap: 1rem; }

    .match-reason-icon {
      background: var(--success);
      color: white;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .match-reason-text { flex: 1; font-size: 0.875rem; line-height: 1.6; color: var(--text); font-style: italic; }

    .career-action-buttons {
      display: flex;
      gap: 1rem;
      margin-top: 1rem;
      padding-top: 1.5rem;
      border-top: 1px solid rgba(0, 0, 0, 0.1);
    }

    .career-action-buttons .btn-primary,
    .career-action-buttons .btn-secondary {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .career-match-card { cursor: pointer; transition: all 0.3s ease; }
    .career-match-card:hover { transform: translateY(-4px); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15); }
    .career-card-trigger { cursor: pointer; }

    /* Generated footer in preview */
    .generated-footer {
      margin-top: 2rem;
      padding-top: 1rem;
      border-top: 1px dashed #e2e8f0;
      font-size: 0.75rem;
      color: #94a3b8;
      text-align: center;
    }

    /* Toast */
    .toast {
      position: fixed;
      top: 2rem;
      right: 2rem;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      padding: 1rem 1.5rem;
      border-radius: 1rem;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      gap: 1rem;
      z-index: 1000;
      max-width: 400px;
      border: 1px solid rgba(0, 0, 0, 0.1);
      animation: slideInRight 0.3s ease;
      transform-origin: top right;
      color: var(--text);
    }

    .toast.error  { background: rgba(239, 68, 68, 0.95);  color: white; }
    .toast.success{ background: rgba(16, 185, 129, 0.95); color: white; }
    .toast-icon   { font-size: 1.25rem; }
    .toast-message{ flex: 1; font-weight: 500; }

    .toast-close {
      background: rgba(255, 255, 255, 0.1);
      border: none;
      color: inherit;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 0.5rem;
      transition: all 0.2s;
    }

    .toast-close:hover { background: rgba(255, 255, 255, 0.2); }

    @keyframes slideInRight {
      from { transform: translateX(100%) scale(0.9); opacity: 0; }
      to   { transform: translateX(0) scale(1);      opacity: 1; }
    }

    /* Delete Confirm Modal */
    .delete-confirm-modal .modal-body { text-align: center; }

    .delete-confirm-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .delete-confirm-content i  { font-size: 3rem; color: var(--error); }
    .delete-confirm-content h4 { font-size: 1.25rem; font-weight: 600; color: var(--text); }
    .delete-confirm-content p  { color: var(--text-secondary); font-size: 0.875rem; }

    .btn-danger {
      background: linear-gradient(135deg, var(--error), #f87171);
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 0.75rem;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-danger:hover:not(:disabled) {
      background: linear-gradient(135deg, #f87171, var(--error));
      transform: translateY(-1px);
      box-shadow: 0 4px 20px rgba(239, 68, 68, 0.3);
    }

    .btn-danger:disabled { opacity: 0.5; cursor: not-allowed; }

    /* Sidebar */
    .sidebar {
      width: 280px;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      display: flex;
      flex-direction: column;
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      height: 100vh;
      position: fixed;
      top: 0;
      left: 0;
      z-index: 1000;
      border-right: 1px solid rgba(0, 0, 0, 0.1);
      box-shadow: 5px 0 20px rgba(0, 0, 0, 0.05);
    }

    .sidebar.closed { transform: translateX(-100%); }
    .sidebar.open   { transform: translateX(0); }

    .sidebar-header {
      padding: 1.25rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .logo-container { display: flex; align-items: center; gap: 0.75rem; }
    .logo-image { width: 32px; height: 32px; border-radius: 8px; }

    .brand-name {
      font-weight: 600;
      font-size: 1.125rem;
      color: var(--text);
      font-family: 'Poppins', sans-serif;
    }

    .sidebar-toggle {
      background: rgba(0, 0, 0, 0.05);
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 0.5rem;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .sidebar-toggle:hover { background: rgba(0, 0, 0, 0.1); color: var(--text); }

    .new-assessment-sidebar { padding: 1.25rem; }

    .new-assessment-btn-sidebar {
      width: 100%;
      padding: 0.875rem;
      background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
      color: white;
      border: none;
      border-radius: 0.75rem;
      cursor: pointer;
      font-size: 0.875rem;
      font-weight: 500;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      transition: all 0.3s ease;
    }

    .new-assessment-btn-sidebar:hover {
      background: linear-gradient(135deg, var(--primary-light), var(--primary-color));
      transform: translateY(-1px);
      box-shadow: 0 4px 20px rgba(99, 102, 241, 0.3);
    }

    .assessment-history-nav { flex: 1; padding: 1rem 0; overflow-y: auto; }

    .assessment-history-nav::-webkit-scrollbar { width: 4px; }
    .assessment-history-nav::-webkit-scrollbar-track { background: rgba(0,0,0,0.02); border-radius: 2px; }
    .assessment-history-nav::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 2px; }
    .assessment-history-nav::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.15); }
    .assessment-history-nav { scrollbar-width: thin; scrollbar-color: rgba(0,0,0,0.1) rgba(0,0,0,0.02); }

    .nav-section-title {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 0 1.25rem 0.5rem;
      margin-bottom: 0.5rem;
    }

    .nav-item-wrapper {
      display: flex;
      align-items: center;
      padding: 0.125rem 0.75rem;
      width: calc(100% - 1.5rem);
      margin: 0.125rem auto;
      border-radius: 0.5rem;
      transition: all 0.2s;
    }

    .nav-item-wrapper:hover { background: rgba(0,0,0,0.02); }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex: 1;
      padding: 0.625rem 0;
      background: none;
      border: none;
      text-align: left;
      color: var(--text-secondary);
      cursor: pointer;
      font-size: 0.875rem;
      transition: all 0.2s;
      border-radius: 0.5rem;
    }

    .nav-item:hover { background: none; color: var(--text); }

    .nav-icon { width: 20px; text-align: center; color: var(--text-muted); }

    .nav-content { flex: 1; display: flex; flex-direction: column; gap: 0.125rem; }

    .nav-title {
      font-size: 0.875rem;
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .nav-subtitle { font-size: 0.75rem; color: var(--text-muted); }

    .nav-item-delete {
      background: none;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 0.5rem;
      opacity: 0;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .nav-item-wrapper:hover .nav-item-delete { opacity: 1; }
    .nav-item-delete:hover { color: var(--error); background: rgba(239,68,68,0.1); }

    .assessment-pagination {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      padding: 1rem;
      margin-top: 0.5rem;
    }

    .pagination-btn {
      background: rgba(0,0,0,0.05);
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 0.5rem;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .pagination-btn:hover:not(.disabled) { background: rgba(0,0,0,0.1); color: var(--text); }
    .pagination-btn.disabled { opacity: 0.3; cursor: not-allowed; }

    .pagination-info { font-size: 0.75rem; color: var(--text-muted); min-width: 80px; text-align: center; }

    .empty-history { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 1.5rem; color: var(--text-muted); opacity: 0.6; }
    .empty-history i { font-size: 1.5rem; }
    .empty-text { font-size: 0.875rem; }

    .user-section { padding: 1.25rem; margin-top: auto; }

    .user-profile-container { display: flex; align-items: center; justify-content: space-between; }

    .user-info { display: flex; align-items: center; gap: 0.75rem; flex: 1; }

    .profile-circle {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--primary-light), var(--primary-color));
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      flex-shrink: 0;
    }

    .profile-image { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
    .profile-initials { color: white; font-weight: 600; font-size: 0.875rem; }

    .user-details { display: flex; flex-direction: column; gap: 0.125rem; min-width: 0; flex: 1; }

    .user-name { font-size: 0.875rem; font-weight: 500; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

    .settings-container { position: relative; flex-shrink: 0; }

    .settings-trigger {
      background: rgba(0,0,0,0.05);
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .settings-trigger:hover { background: rgba(0,0,0,0.1); color: var(--text); }

    .settings-menu {
      position: absolute;
      bottom: 100%;
      right: 0;
      background: rgba(255,255,255,0.95);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(0,0,0,0.1);
      border-radius: 0.75rem;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
      min-width: 180px;
      z-index: 1000;
      margin-bottom: 0.5rem;
    }

    .settings-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      width: 100%;
      padding: 0.75rem 1rem;
      background: none;
      border: none;
      text-align: left;
      color: var(--text-secondary);
      cursor: pointer;
      font-size: 0.875rem;
      transition: all 0.2s;
    }

    .settings-item:hover { background: rgba(0,0,0,0.05); color: var(--text); }
    .settings-item.logout { color: var(--error); }
    .settings-divider { height: 1px; background: rgba(0,0,0,0.1); margin: 0.25rem 0; }

    /* Main Content */
    .main-content {
      margin-left: 280px;
      transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      z-index: 2;
      min-height: 100vh;
    }

    .main-content.sidebar-closed { margin-left: 0; }

    .main-header {
      background: rgba(255,255,255,0.8);
      backdrop-filter: blur(20px);
      padding: 1.5rem 2rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid rgba(0,0,0,0.1);
      position: sticky;
      top: 0;
      z-index: 90;
    }

    .header-left { display: flex; align-items: center; gap: 1rem; }

    .sidebar-toggle-mobile {
      background: rgba(0,0,0,0.05);
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 0.5rem;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .sidebar-toggle-mobile:hover { background: rgba(0,0,0,0.1); color: var(--text); }

    .header-title { display: flex; align-items: center; gap: 0.75rem; }

    .header-icon {
      font-size: 1.5rem;
      background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
      background-clip: text;
      -webkit-background-clip: text;
      color: transparent;
    }

    .main-header h1 { font-size: 1.5rem; font-weight: 600; color: var(--text); font-family: 'Poppins', sans-serif; }

    /* Dashboard Scroll Container */
    .dashboard-scroll-container {
      max-height: calc(100vh - 70px);
      overflow-y: auto;
      padding: 2rem;
    }

    .dashboard-scroll-container::-webkit-scrollbar { width: 8px; }
    .dashboard-scroll-container::-webkit-scrollbar-track { background: rgba(0,0,0,0.05); border-radius: 4px; }
    .dashboard-scroll-container::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 4px; }
    .dashboard-scroll-container::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.2); }
    .dashboard-scroll-container { scrollbar-width: thin; scrollbar-color: rgba(0,0,0,0.1) rgba(0,0,0,0.05); }

    .dashboard-content { max-width: 1400px; margin: 0 auto; display: flex; flex-direction: column; gap: 2rem; }

    /* Welcome */
    .welcome-section {
      background: rgba(0,0,0,0.02);
      border-radius: 1.5rem;
      padding: 2rem;
      border: 1px solid rgba(0,0,0,0.05);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .welcome-content h2 {
      font-size: 2rem;
      font-weight: 700;
      background: linear-gradient(135deg, var(--text), var(--text-secondary));
      background-clip: text;
      -webkit-background-clip: text;
      color: transparent;
      font-family: 'Poppins', sans-serif;
      margin-bottom: 0.5rem;
    }

    .welcome-subtitle { font-size: 1rem; color: var(--text-muted); }
    .welcome-stats { display: flex; gap: 1rem; }

    .stat-badge {
      background: rgba(0,0,0,0.05);
      padding: 0.75rem 1.25rem;
      border-radius: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      font-weight: 500;
      border: 1px solid rgba(0,0,0,0.1);
    }

    .stat-badge i { color: var(--primary-color); }

    /* Sections */
    .latest-results-section,
    .career-matches-section,
    .metrics-section,
    .stats-section {
      background: rgba(0,0,0,0.02);
      border-radius: 1.5rem;
      padding: 2rem;
      border: 1px solid rgba(0,0,0,0.05);
    }

    .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; }
    .section-title  { display: flex; align-items: center; gap: 0.75rem; }
    .section-title i { font-size: 1.5rem; color: var(--primary-color); }
    .section-title h3 { font-size: 1.25rem; font-weight: 600; color: var(--text); font-family: 'Poppins', sans-serif; }
    .section-subtitle { font-size: 0.875rem; color: var(--text-muted); }

    .new-assessment-btn {
      background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
      color: white;
      border: none;
      padding: 0.75rem 1.25rem;
      border-radius: 0.75rem;
      cursor: pointer;
      font-size: 0.875rem;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.3s ease;
    }

    .new-assessment-btn:hover {
      background: linear-gradient(135deg, var(--primary-light), var(--primary-color));
      transform: translateY(-1px);
      box-shadow: 0 4px 20px rgba(99,102,241,0.3);
    }

    .latest-assessment-card {
      background: rgba(0,0,0,0.02);
      border-radius: 1rem;
      padding: 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border: 1px solid rgba(0,0,0,0.1);
    }

    .match-score-display { display: flex; align-items: center; gap: 1.5rem; }

    .score-circle {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .score-value { font-size: 2rem; font-weight: 700; line-height: 1; }
    .score-label { font-size: 0.875rem; opacity: 0.9; }

    .score-details { flex: 1; }

    .career-title { font-size: 1.5rem; font-weight: 600; color: var(--text); margin-bottom: 0.5rem; }
    .career-description { font-size: 0.875rem; color: var(--text-muted); margin-bottom: 1rem; }

    .assessment-meta { display: flex; gap: 1.5rem; }

    .meta-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; color: var(--text-secondary); }

    .result-actions { display: flex; gap: 0.75rem; }

    .action-btn {
      padding: 0.75rem 1.25rem;
      border-radius: 0.75rem;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.3s ease;
      border: none;
    }

    .action-btn.primary { background: linear-gradient(135deg, var(--primary-color), var(--primary-light)); color: white; }
    .action-btn.primary:hover { background: linear-gradient(135deg, var(--primary-light), var(--primary-color)); transform: translateY(-1px); box-shadow: 0 4px 20px rgba(99,102,241,0.3); }
    .action-btn.secondary { background: rgba(0,0,0,0.05); color: var(--text); border: 1px solid rgba(0,0,0,0.1); }
    .action-btn.secondary:hover { background: rgba(0,0,0,0.1); transform: translateY(-1px); }

    .no-assessment-card { background: rgba(0,0,0,0.02); border-radius: 1rem; padding: 3rem 2rem; text-align: center; border: 2px dashed rgba(0,0,0,0.1); }
    .no-assessment-content i   { font-size: 3rem; color: var(--text-muted); margin-bottom: 1rem; opacity: 0.5; }
    .no-assessment-content h4  { font-size: 1.25rem; color: var(--text); margin-bottom: 0.5rem; }
    .no-assessment-content p   { color: var(--text-muted); margin-bottom: 1.5rem; }

    .start-assessment-btn {
      background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
      color: white;
      border: none;
      padding: 1rem 2rem;
      border-radius: 0.75rem;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .start-assessment-btn:hover {
      background: linear-gradient(135deg, var(--primary-light), var(--primary-color));
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(99,102,241,0.3);
    }

    /* Career Matches */
    .career-matches-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .career-match-card {
      background: rgba(0,0,0,0.02);
      border-radius: 1rem;
      padding: 1.5rem;
      border: 1px solid rgba(0,0,0,0.1);
      position: relative;
      overflow: hidden;
      transition: all 0.3s ease;
    }

    .career-match-card::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 3px;
      background: var(--card-gradient, linear-gradient(90deg, var(--primary-color), var(--primary-light)));
      opacity: 0.8;
    }

    .career-match-card:hover { transform: translateY(-2px); border-color: rgba(0,0,0,0.2); box-shadow: 0 10px 30px rgba(0,0,0,0.1); }

    .match-rank {
      position: absolute;
      top: 0.75rem;
      right: 0.75rem;
      background: rgba(0,0,0,0.1);
      color: var(--text);
      font-size: 0.875rem;
      font-weight: 600;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .match-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; }
    .match-header h4 { font-size: 1.125rem; font-weight: 600; color: var(--text); margin-right: 1rem; }

    .match-percentage {
      background: linear-gradient(135deg, var(--success), #34d399);
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: 1rem;
      font-size: 0.75rem;
      font-weight: 600;
      white-space: nowrap;
    }

    .match-details { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1rem; }

    .detail-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; color: var(--text-secondary); }
    .detail-item i { width: 16px; color: var(--primary-color); }

    .match-strengths { margin-top: 1rem; padding-top: 1rem; border-top: 1px solid rgba(0,0,0,0.1); }
    .match-strengths strong { font-size: 0.875rem; color: var(--text); display: block; margin-bottom: 0.5rem; }
    .strengths-list { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .strength-tag { background: rgba(0,0,0,0.05); color: var(--text-secondary); padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.75rem; white-space: nowrap; }

    .match-actions { margin-top: 1rem; text-align: right; }

    .view-details-btn {
      background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
      color: white;
      border: none;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
    }

    .view-details-btn:hover { background: linear-gradient(135deg, var(--primary-light), var(--primary-color)); transform: translateY(-1px); box-shadow: 0 4px 10px rgba(99,102,241,0.3); }

    /* Metrics */
    .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; }

    .metric-card {
      background: rgba(0,0,0,0.02);
      border-radius: 1rem;
      padding: 1.5rem;
      border: 1px solid rgba(0,0,0,0.1);
      display: flex;
      align-items: center;
      gap: 1rem;
      transition: all 0.3s ease;
    }

    .metric-card:hover { transform: translateY(-2px); border-color: rgba(0,0,0,0.2); box-shadow: 0 10px 30px rgba(0,0,0,0.1); }

    .metric-icon { width: 56px; height: 56px; border-radius: 1rem; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; color: white; }

    .metric-content { flex: 1; }
    .metric-value { font-size: 2rem; font-weight: 700; color: var(--text); line-height: 1; margin-bottom: 0.25rem; }
    .metric-label { font-size: 0.875rem; color: var(--text-muted); }

    /* Stats */
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; }

    .stats-card { background: rgba(0,0,0,0.02); border-radius: 1rem; padding: 1.5rem; border: 1px solid rgba(0,0,0,0.1); }

    .stats-header { margin-bottom: 1rem; }
    .stats-header h4 { font-size: 1rem; font-weight: 600; color: var(--text); display: flex; align-items: center; gap: 0.5rem; }

    .stats-content { display: flex; flex-direction: column; gap: 0.75rem; }

    .stat-item { display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0; border-bottom: 1px solid rgba(0,0,0,0.1); }
    .stat-item:last-child { border-bottom: none; }
    .stat-label { font-size: 0.875rem; color: var(--text-secondary); }
    .stat-value { font-size: 0.875rem; font-weight: 600; color: var(--text); }

    .action-items { display: flex; flex-direction: column; gap: 1rem; }

    .action-item {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 0.75rem;
      background: rgba(0,0,0,0.02);
      border-radius: 0.75rem;
      border-left: 3px solid var(--primary-color);
    }

    .action-number {
      background: var(--primary-color);
      color: white;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 600;
      flex-shrink: 0;
    }

    .action-text { flex: 1; font-size: 0.875rem; color: var(--text); }

    .action-plan-footer { margin-top: 1rem; text-align: center; }

    .view-full-plan {
      background: none;
      border: none;
      color: var(--primary-color);
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.2s;
    }

    .view-full-plan:hover { color: var(--primary-light); }

    /* Loading */
    .loading-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(255,255,255,0.9);
      backdrop-filter: blur(5px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .loading-spinner { text-align: center; display: flex; flex-direction: column; align-items: center; gap: 1rem; }

    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(0,0,0,0.1);
      border-top-color: var(--primary-color);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    .loading-spinner p { color: var(--text); font-size: 0.875rem; font-weight: 500; }

    @keyframes spin { to { transform: rotate(360deg); } }

    /* Footer */
    .dashboard-footer { margin-top: 2rem; padding-top: 2rem; border-top: 1px solid rgba(0,0,0,0.1); text-align: center; }
    .footer-content { display: flex; flex-direction: column; align-items: center; gap: 1rem; }
    .dashboard-footer p { font-size: 0.875rem; color: var(--text-muted); }

    /* Mini Sidebar */
    .sidebar-mini-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 1rem;
      gap: 1rem;
      height: 100%;
      justify-content: space-between;
      overflow-y: auto;
    }

    .new-assessment-mini {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
      color: white;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
    }

    .new-assessment-mini:hover { background: linear-gradient(135deg, var(--primary-light), var(--primary-color)); transform: scale(1.1); }
    .new-assessment-mini:disabled { opacity: 0.5; cursor: not-allowed; }

    .sidebar-nav-mini { display: flex; flex-direction: column; gap: 0.5rem; flex: 1; overflow-y: auto; padding: 0.5rem 0; }

    .nav-item-mini {
      width: 40px;
      height: 40px;
      border-radius: 0.75rem;
      background: rgba(0,0,0,0.05);
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      transition: all 0.2s;
    }

    .nav-item-mini:hover { background: rgba(0,0,0,0.1); color: var(--text); }
    .nav-item-mini.active { background: linear-gradient(135deg, var(--primary-color), var(--primary-light)); color: white; }

    .nav-badge-mini {
      position: absolute;
      top: -2px;
      right: -2px;
      background: var(--success);
      color: white;
      font-size: 0.625rem;
      padding: 0.125rem 0.25rem;
      border-radius: 0.5rem;
      min-width: 16px;
      text-align: center;
    }

    .user-mini { padding: 0.5rem 0; }

    .profile-circle-mini {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--primary-light), var(--primary-color));
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .profile-image-mini { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
    .profile-initials-mini { color: white; font-weight: 600; font-size: 0.875rem; }

    /* Modals */
    .modal-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.5);
      backdrop-filter: blur(5px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 1rem;
    }

    .modal {
      background: rgba(255,255,255,0.95);
      border-radius: 1.5rem;
      width: 100%;
      max-width: 500px;
      border: 1px solid rgba(0,0,0,0.1);
      box-shadow: 0 20px 60px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    .modal-header {
      padding: 1.5rem;
      border-bottom: 1px solid rgba(0,0,0,0.1);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .modal-header h3 { font-size: 1.25rem; font-weight: 600; color: var(--text); }

    .modal-close {
      background: rgba(0,0,0,0.05);
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      width: 32px;
      height: 32px;
      border-radius: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .modal-close:hover { background: rgba(0,0,0,0.1); color: var(--text); }

    .modal-body { padding: 1.5rem; }

    /* Profile form */
    .profile-form { display: flex; flex-direction: column; gap: 1rem; }

    .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
    .form-group label { font-size: 0.875rem; font-weight: 500; color: var(--text); }

    .form-group input,
    .form-group textarea {
      padding: 0.75rem;
      background: rgba(0,0,0,0.02);
      border: 1px solid rgba(0,0,0,0.1);
      border-radius: 0.75rem;
      color: var(--text);
      font-size: 0.875rem;
      transition: all 0.2s;
    }

    .form-group input:focus,
    .form-group textarea:focus { outline: none; border-color: var(--primary-color); box-shadow: 0 0 0 2px rgba(99,102,241,0.1); }

    .form-group input:invalid { border-color: var(--error); }
    .form-group input:invalid:focus { box-shadow: 0 0 0 2px rgba(239,68,68,0.1); }

    .form-actions { display: flex; gap: 0.75rem; margin-top: 1rem; }

    .btn-primary, .btn-secondary {
      padding: 0.75rem 1.5rem;
      border-radius: 0.75rem;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      border: none;
    }

    .btn-primary { background: linear-gradient(135deg, var(--primary-color), var(--primary-light)); color: white; flex: 1; }
    .btn-primary:hover:not(:disabled) { background: linear-gradient(135deg, var(--primary-light), var(--primary-color)); transform: translateY(-1px); box-shadow: 0 4px 20px rgba(99,102,241,0.3); }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

    .btn-secondary { background: rgba(0,0,0,0.05); color: var(--text); border: 1px solid rgba(0,0,0,0.1); flex: 1; }
    .btn-secondary:hover { background: rgba(0,0,0,0.1); transform: translateY(-1px); }

    .input-hint { display: block; font-size: 0.75rem; color: var(--text-muted); margin-top: 0.25rem; }

    /* Resume Modal */
    .resume-modal {
      background: rgba(255,255,255,0.95);
      border-radius: 1.5rem;
      width: 100%;
      max-width: 1200px;
      height: 90vh;
      border: 1px solid rgba(0,0,0,0.1);
      box-shadow: 0 20px 60px rgba(0,0,0,0.1);
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .resume-modal-header {
      padding: 1.5rem;
      border-bottom: 1px solid rgba(0,0,0,0.1);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .resume-title { display: flex; align-items: center; gap: 0.75rem; }
    .resume-title h2 { font-size: 1.25rem; font-weight: 600; color: var(--text); }
    .resume-title i { color: var(--primary-color); font-size: 1.25rem; }

    .resume-modal-body { display: flex; flex: 1; overflow: hidden; }

    .resume-builder-section { flex: 1; padding: 1.5rem; overflow-y: auto; border-right: 1px solid rgba(0,0,0,0.1); }
    .resume-preview-section { flex: 1; padding: 1.5rem; overflow-y: auto; display: flex; flex-direction: column; }

    .resume-builder-section h3,
    .preview-header h3 { font-size: 1rem; font-weight: 600; color: var(--text); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }

    .resume-section {
      margin-bottom: 1.5rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid rgba(0,0,0,0.1);
    }

    .resume-section:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }

    .resume-section h4 {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 0.75rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .section-optional-badge {
      font-size: 0.65rem;
      font-weight: 500;
      color: var(--text-muted);
      background: rgba(0,0,0,0.06);
      padding: 0.15rem 0.5rem;
      border-radius: 0.5rem;
      margin-left: 0.25rem;
    }

    .section-empty-hint {
      font-size: 0.8rem;
      color: var(--text-muted);
      font-style: italic;
      margin-top: 0.5rem;
    }

    .summary-generated-note {
      font-size: 0.75rem;
      color: var(--text-muted);
      margin-bottom: 0.5rem;
    }

    .form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 0.75rem; }
    .form-grid .form-group.full-width { grid-column: 1 / -1; }
    .form-grid .checkbox-group { grid-column: 1 / -1; display: flex; align-items: center; margin-top: 0.5rem; }

    .form-group textarea { resize: vertical; min-height: 80px; }

    .skills-section-header { margin-bottom: 1rem; }

    .skills-info { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: 0.5rem; }
    .skills-subtitle { font-size: 0.875rem; color: var(--text-muted); flex: 1; }

    .skills-input { display: flex; gap: 0.5rem; margin-bottom: 0.75rem; }
    .skills-input input { flex: 1; }

    .btn-small {
      padding: 0.5rem 1rem;
      background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
      color: white;
      border: none;
      border-radius: 0.75rem;
      font-size: 0.75rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn-small:hover:not(:disabled) { background: linear-gradient(135deg, var(--primary-light), var(--primary-color)); transform: translateY(-1px); }
    .btn-small:disabled { opacity: 0.5; cursor: not-allowed; }

    .skills-list { display: flex; flex-wrap: wrap; gap: 0.5rem; }

    .skill-tag {
      background: rgba(0,0,0,0.05);
      color: var(--text);
      padding: 0.375rem 0.75rem;
      border-radius: 1rem;
      font-size: 0.75rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .skill-remove { background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 0; font-size: 0.75rem; }
    .skill-remove:hover { color: var(--error); }

    .experience-form,
    .education-form,
    .certification-form {
      background: rgba(0,0,0,0.02);
      border-radius: 0.75rem;
      padding: 1rem;
      margin-bottom: 1rem;
      border: 1px solid rgba(0,0,0,0.1);
    }

    .checkbox-label { display: flex; align-items: center; gap: 0.5rem; font-size: 0.75rem; color: var(--text-secondary); cursor: pointer; }
    .checkbox-label input[type="checkbox"] { width: 16px; height: 16px; cursor: pointer; }

    .btn-remove {
      background: rgba(239,68,68,0.1);
      color: var(--error);
      border: 1px solid rgba(239,68,68,0.2);
      padding: 0.5rem 1rem;
      border-radius: 0.75rem;
      font-size: 0.75rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.2s;
      margin-top: 0.75rem;
    }

    .btn-remove:hover { background: rgba(239,68,68,0.2); }

    .btn-add {
      background: rgba(0,0,0,0.02);
      color: var(--text);
      border: 1px dashed rgba(0,0,0,0.2);
      padding: 0.75rem;
      border-radius: 0.75rem;
      font-size: 0.875rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      width: 100%;
      transition: all 0.2s;
    }

    .btn-add:hover { background: rgba(0,0,0,0.05); border-color: var(--primary-color); }

    /* Resume Preview */
    .preview-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; }

    .resume-preview-content {
      flex: 1;
      overflow-y: auto;
      background: white;
      border-radius: 0.75rem;
      padding: 2rem;
    }

    .resume-template {
      color: #1e293b;
      font-family: 'Inter', sans-serif;
      font-size: 11pt;
    }

    .resume-header-section {
      text-align: center;
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid var(--primary-color);
    }

    .resume-name { font-size: 2rem; font-weight: 700; color: #1e293b; margin-bottom: 0.5rem; font-family: 'Poppins', sans-serif; }

    .resume-contact { display: flex; flex-wrap: wrap; justify-content: center; gap: 1rem; font-size: 0.875rem; color: #475569; }
    .resume-contact span { display: flex; align-items: center; gap: 0.5rem; }

    .resume-section-preview {
      margin-top: 0.75rem;
    }

    .section-title-preview {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--primary-dark);
      margin-bottom: 0.375rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding-bottom: 0.375rem;
      border-bottom: 1px solid #e2e8f0;
    }

    .section-content { font-size: 0.875rem; line-height: 1.5; color: #475569; }

    .skills-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 6pt;
      margin-top: 0;
      line-height: 1.5;
    }

    .skill-item {
      background: #f1f5f9;
      color: #475569;
      padding: 0.375rem 0.75rem;
      border-radius: 1rem;
      font-size: 0.75rem;
      line-height: 1.5;
    }

    .experience-item-preview { margin-bottom: 1rem; }
    .experience-item-preview:last-child { margin-bottom: 0; }

    .experience-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.25rem; }
    .experience-title  { font-size: 1rem; font-weight: 600; color: #1e293b; }
    .experience-date   { font-size: 0.75rem; color: #64748b; white-space: nowrap; }
    .experience-company{ font-size: 0.875rem; color: #475569; margin-bottom: 0.5rem; font-style: italic; }

    .experience-description { font-size: 0.875rem; color: #475569; line-height: 1.5; }
    .experience-description p { margin-bottom: 0.25rem; }

    .education-item-preview { margin-bottom: 1rem; }
    .education-item-preview:last-child { margin-bottom: 0; }

    .education-header  { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.25rem; }
    .education-degree  { font-size: 1rem; font-weight: 600; color: #1e293b; }
    .education-date    { font-size: 0.75rem; color: #64748b; white-space: nowrap; }
    .education-institution { font-size: 0.875rem; color: #475569; margin-bottom: 0.25rem; }
    .education-details { font-size: 0.875rem; color: #64748b; }

    .certifications-list { display: flex; flex-direction: column; gap: 0.375rem; }
    .certification-item  { font-size: 0.875rem; color: #475569; line-height: 1.5; }

    .footer-date { color: #cbd5e1; }

    /* Responsive */
    @media (max-width: 1024px) {
      .sidebar { transform: translateX(-100%); z-index: 1000; box-shadow: 10px 0 30px rgba(0,0,0,0.1); }
      .sidebar.open { transform: translateX(0); }
      .main-content { margin-left: 0 !important; }
      .career-matches-grid { grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); }
      .metrics-grid { grid-template-columns: repeat(2, 1fr); }
      .stats-grid   { grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); }
    }

    @media (max-width: 768px) {
      .dashboard-scroll-container { padding: 1rem; }
      .welcome-section { flex-direction: column; gap: 1rem; align-items: flex-start; }
      .welcome-stats { flex-wrap: wrap; }
      .latest-assessment-card { flex-direction: column; gap: 1.5rem; align-items: flex-start; }
      .match-score-display { flex-direction: column; align-items: flex-start; gap: 1rem; }
      .result-actions { width: 100%; justify-content: flex-start; }
      .metrics-grid { grid-template-columns: 1fr; }
      .main-header { padding: 1rem; }
      .main-header h1 { font-size: 1.25rem; }
      .resume-modal { flex-direction: column; height: 95vh; }
      .resume-builder-section, .resume-preview-section { flex: none; border-right: none; border-bottom: 1px solid rgba(0,0,0,0.1); }
      .resume-builder-section { max-height: 50%; }
      .resume-preview-section { max-height: 50%; }
      .form-grid { grid-template-columns: 1fr; }
      .skills-info { flex-direction: column; align-items: flex-start; gap: 0.5rem; }
      .salary-breakdown { grid-template-columns: 1fr; gap: 0.5rem; }
      .salary-header { flex-direction: column; align-items: flex-start; gap: 0.5rem; }
      .salary-footer { flex-direction: column; align-items: flex-start; gap: 0.5rem; }
    }

    @media (max-width: 480px) {
      .dashboard-content { gap: 1rem; }
      .welcome-content h2 { font-size: 1.5rem; }
      .section-header { flex-direction: column; align-items: flex-start; gap: 1rem; }
      .new-assessment-btn { align-self: stretch; justify-content: center; }
      .score-circle { width: 80px; height: 80px; }
      .score-value { font-size: 1.5rem; }
      .action-btn { padding: 0.75rem 1rem; font-size: 0.75rem; }
      .toast { left: 1rem; right: 1rem; top: 1rem; max-width: none; }
      .career-details-content { padding: 1rem; }
      .career-section { padding: 1rem; }
      .path-step { flex-direction: column; gap: 0.5rem; }
      .match-reason-content { flex-direction: column; gap: 0.5rem; }
      .career-action-buttons { flex-direction: column; }
      .career-modal-title { flex-direction: column; align-items: flex-start; gap: 0.5rem; }
    }

    /* Accessibility */
    button:disabled { opacity: 0.5; cursor: not-allowed; }
    button:focus-visible { outline: 2px solid var(--primary-color); outline-offset: 2px; }
    input:focus-visible, textarea:focus-visible { outline: 2px solid var(--primary-color); outline-offset: 2px; }

    .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
</style>
