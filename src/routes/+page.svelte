<script lang="ts">
  import Preference from './Preference.svelte';
  import Skills from './Skills.svelte';
  import Work from './Work.svelte';
  import Result from './Results.svelte';
  import { afterUpdate } from 'svelte';
  import { onMount } from 'svelte';

  type Step = 'landing' | 'preferences' | 'skills' | 'environment' | 'results';
  let currentStep: Step = 'landing';
  let previousStep: Step = 'landing';
  let isLoading = false;
  let error = '';
  let recommendations: any[] = [];
  
  let formData = {
    preferences: {
      workTypes: [] as string[],
      salaryExpectation: '',
      workMotivation: '',
      workEnvironment: '',
      teamPreference: '',
      workSchedule: '',
      careerStage: '',
      skillDevelopment: [] as string[],
      workLocation: '',
      industryInterests: [] as string[]
    },
    skills: {
      strengths: [] as string[],
      experienceLevel: '',
      technicalSkills: [] as string[]
    },
    workEnvironment: {
      workSetting: '',
      stressHandling: '',
      collaborationPreference: ''
    }
  };

  // Scroll to top when step changes
  afterUpdate(() => {
    if (previousStep !== currentStep) {
      previousStep = currentStep;
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  });

  function startAssessment() {
    currentStep = 'preferences';
  }

  function handleBackToHome() {
    currentStep = 'landing';
    formData = {
      preferences: {
        workTypes: [],
        salaryExpectation: '',
        workMotivation: '',
        workEnvironment: '',
        teamPreference: '',
        workSchedule: '',
        careerStage: '',
        skillDevelopment: [],
        workLocation: '',
        industryInterests: []
      },
      skills: {
        strengths: [],
        experienceLevel: '',
        technicalSkills: []
      },
      workEnvironment: {
        workSetting: '',
        stressHandling: '',
        collaborationPreference: ''
      }
    };
    recommendations = [];
    error = '';
  }

  function handlePreferencesComplete(event: CustomEvent) {
    formData.preferences = { ...event.detail };
    currentStep = 'skills';
  }

  function updateFormData(part: string, data: any) {
    formData = { ...formData, [part]: data };
    if (part === 'skills') {
      currentStep = 'environment';
    }
  }

  function prevStep() {
    if (currentStep === 'skills') currentStep = 'preferences';
    if (currentStep === 'environment') currentStep = 'skills';
  }

  async function getRecommendations() {
    isLoading = true;
    error = '';
    
    try {
      const apiData = {
        workTypes: formData.preferences.workTypes,
        salary: formData.preferences.salaryExpectation,
        motivation: formData.preferences.workMotivation,
        workEnvironment: formData.preferences.workEnvironment,
        teamPreference: formData.preferences.teamPreference,
        workSchedule: formData.preferences.workSchedule,
        careerStage: formData.preferences.careerStage,
        skillDevelopment: formData.preferences.skillDevelopment,
        workLocation: formData.preferences.workLocation,
        industryInterests: formData.preferences.industryInterests,
        strengths: formData.skills.strengths,
        experience: formData.skills.experienceLevel,
        technicalSkills: formData.skills.technicalSkills,
        workSetting: formData.workEnvironment.workSetting,
        stressHandling: formData.workEnvironment.stressHandling,
        collaboration: formData.workEnvironment.collaborationPreference
      };

      const response = await fetch('/api/job-recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(apiData)
      });

      const result = await response.json();
      
      if (result.success) {
        recommendations = result.recommendations;
        currentStep = 'results';
      } else {
        error = result.error || 'Failed to get recommendations';
      }
    } catch (err) {
      error = 'Network error. Please try again.';
      console.error('API Error:', err);
    } finally {
      isLoading = false;
    }
  }

  function restart() {
    formData = {
      preferences: {
        workTypes: [],
        salaryExpectation: '',
        workMotivation: '',
        workEnvironment: '',
        teamPreference: '',
        workSchedule: '',
        careerStage: '',
        skillDevelopment: [],
        workLocation: '',
        industryInterests: []
      },
      skills: {
        strengths: [],
        experienceLevel: '',
        technicalSkills: []
      },
      workEnvironment: {
        workSetting: '',
        stressHandling: '',
        collaborationPreference: ''
      }
    };
    currentStep = 'landing';
    recommendations = [];
    error = '';
  }

  $: if (typeof window !== 'undefined') {
    console.log('Current form data:', formData);
  }
</script>

<svelte:head>
  <title>CareerGeenie - Find Your Dream Career</title>
  <meta name="description" content="AI-powered career guidance tailored to your skills, preferences, and goals across all industries." />
</svelte:head>

<!-- Anchor point for scrolling -->
<div id="top"></div>

{#if currentStep === 'landing'}
  <div class="landing-page">
    <header>
      <!-- Floating Bubbles -->
      <div class="bubble" style="--duration: 4s; --delay: 0s; top: 100%; left: 15%; width: 8px; height: 8px;"></div>
      <div class="bubble" style="--duration: 5s; --delay: 0.4s; top: 100%; left: 30%; width: 12px; height: 12px;"></div>
      <div class="bubble" style="--duration: 3.5s; --delay: 1.2s; top: 100%; left: 45%; width: 6px; height: 6px;"></div>
      <div class="bubble" style="--duration: 6s; --delay: 0.8s; top: 100%; left: 60%; width: 14px; height: 14px;"></div>
      <div class="bubble" style="--duration: 4.2s; --delay: 1.5s; top: 100%; left: 75%; width: 10px; height: 10px;"></div>
      <div class="bubble" style="--duration: 5.5s; --delay: 2s; top: 100%; left: 90%; width: 16px; height: 16px;"></div>
      <div class="bubble" style="--duration: 3.7s; --delay: 2.5s; top: 100%; left: 25%; width: 9px; height: 9px;"></div>
      <div class="bubble" style="--duration: 5.2s; --delay: 1.8s; top: 100%; left: 55%; width: 11px; height: 11px;"></div>
      <div class="bubble" style="--duration: 4.8s; --delay: 0.6s; top: 100%; left: 85%; width: 7px; height: 7px;"></div>
      <div class="bubble" style="--duration: 3.9s; --delay: 3s; top: 100%; left: 10%; width: 13px; height: 13px;"></div>
      <div class="bubble" style="--duration: 4.3s; --delay: 2.8s; top: 100%; left: 95%; width: 5px; height: 5px;"></div>
      <div class="bubble" style="--duration: 6.5s; --delay: 1.1s; top: 100%; left: 65%; width: 15px; height: 15px;"></div>

      <!-- Mini Galaxies -->
      <div class="mini-galaxy" style="--size: 80px; --left: 10%; --top: 20%; --animation-duration: 20s;"></div>
      <div class="mini-galaxy" style="--size: 120px; --left: 80%; --top: 30%; --animation-duration: 25s;"></div>
      <div class="mini-galaxy" style="--size: 60px; --left: 30%; --top: 70%; --animation-duration: 30s;"></div>
      <div class="mini-galaxy" style="--size: 100px; --left: 70%; --top: 15%; --animation-duration: 35s;"></div>
      <div class="mini-galaxy" style="--size: 70px; --left: 15%; --top: 60%; --animation-duration: 28s;"></div>
      
      <div class="header-container">
        <div class="header-content">
          <div class="logo">CareerGeenie</div>
          <h1>Discover Your Perfect Career Path</h1>
          <p class="subtitle">AI-powered career guidance tailored to your unique profile across all industries</p>
          <div class="button-container">
            <button class="primary-button" on:click={startAssessment}>
              <svg height="24" width="24" fill="#2bc0e4" viewBox="0 0 24 24" data-name="Layer 1" id="Layer_1" class="sparkle">
                <path d="M10,21.236,6.755,14.745.264,11.5,6.755,8.255,10,1.764l3.245,6.491L19.736,11.5l-6.491,3.245ZM18,21l1.5,3L21,21l3-1.5L21,18l-1.5-3L18,18l-3,1.5ZM19.333,4.667,20.5,7l1.167-2.333L24,3.5,21.667,2.333,20.5,0,19.333,2.333,17,3.5Z"></path>
              </svg>
              <span class="text">Start Your Journey</span>
            </button>
          </div>
        </div>
      </div>
    </header>

    <main class="main-container">
      <div class="content-container">
        <section class="benefits-section">
          <div class="benefit-card">
            <div class="icon"><i class="fas fa-clipboard-list"></i></div>
            <h3>Comprehensive Assessment</h3>
            <p>Complete career profiling covering work style, environment, and industry preferences</p>
          </div>
          <div class="benefit-card">
            <div class="icon"><i class="fas fa-industry"></i></div>
            <h3>Cross-Industry Insights</h3>
            <p>Explore opportunities across 12+ major industries with market trends and growth data</p>
          </div>
          <div class="benefit-card">
            <div class="icon"><i class="fas fa-route"></i></div>
            <h3>Personalized Roadmap</h3>
            <p>Get tailored career paths with skill development recommendations and learning resources</p>
          </div>
        </section>

        <section class="process-section">
          <h2>Comprehensive 3-Step Assessment</h2>
          <div class="process-steps">
            <div class="process-step">
              <div class="step-number">1</div>
              <h3>Career Preferences</h3>
              <p>Share your work style, environment preferences, and career goals across 10 key areas</p>
            </div>
            <div class="process-step">
              <div class="step-number">2</div>
              <h3>Skills & Experience</h3>
              <p>Detail your strengths, technical skills, and experience level for accurate matching</p>
            </div>
            <div class="process-step">
              <div class="step-number">3</div>
              <h3>AI-Powered Recommendations</h3>
              <p>Receive personalized career matches with detailed insights and development paths</p>
            </div>
          </div>
        </section>

        <!-- Updated Work Insights Section with verified data -->
        <section class="work-insights-section">
          <h2>Understanding Modern Work Environments</h2>
          <div class="insights-container">
            <div class="insight-card">
              <div class="insight-icon"><i class="fas fa-laptop-house"></i></div>
              <h3>Remote Work Evolution</h3>
              <p>According to Pew Research, 35% of workers with jobs that can be done remotely are working from home all the time. Hybrid arrangements have become a permanent feature of the modern workplace.</p>
            </div>
            <div class="insight-card">
              <div class="insight-icon"><i class="fas fa-hands-helping"></i></div>
              <h3>Collaboration Tools Adoption</h3>
              <p>Microsoft's Work Trend Index reports that time spent in Microsoft Teams meetings has more than doubled globally since 2020, indicating a significant shift toward digital collaboration.</p>
            </div>
            <div class="insight-card">
              <div class="insight-icon"><i class="fas fa-brain"></i></div>
              <h3>Skills-Based Hiring Growth</h3>
              <p>LinkedIn data shows that between 2019 and 2023, the share of US jobs that don't require a degree increased by nearly 10%, with many employers focusing more on skills than formal education.</p>
            </div>
            <div class="insight-card">
              <div class="insight-icon"><i class="fas fa-chart-line"></i></div>
              <h3>Future Job Market</h3>
              <p>The World Economic Forum estimates that by 2025, 85 million jobs may be displaced by automation, while 97 million new roles may emerge that are more adapted to the new division of labor between humans and machines.</p>
            </div>
          </div>
        </section>

        <section class="features-section">
          <h2>What Makes CareerGeenie Different</h2>
          <div class="features-grid">
            <div class="feature-item">
              <div class="feature-icon"><i class="fas fa-globe-americas"></i></div>
              <h4>Universal Coverage</h4>
              <p>From healthcare to hospitality, technology to trades - we cover all career paths</p>
            </div>
            <div class="feature-item">
              <div class="feature-icon"><i class="fas fa-robot"></i></div>
              <h4>Smart Matching</h4>
              <p>Advanced algorithms consider work environment, team dynamics, and growth preferences</p>
            </div>
            <div class="feature-item">
              <div class="feature-icon"><i class="fas fa-seedling"></i></div>
              <h4>Growth Focused</h4>
              <p>Recommendations include skill development paths and career advancement strategies</p>
            </div>
            <div class="feature-item">
              <div class="feature-icon"><i class="fas fa-bolt"></i></div>
              <h4>Instant Results</h4>
              <p>Get comprehensive career recommendations in minutes, not hours</p>
            </div>
          </div>
        </section>
      </div>
    </main>

    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    
    <footer>
      <div class="footer-container">
        <div class="footer-logo">CareerGeenie</div>
        <div class="copyright">© 2025 CareerGeenie. All rights reserved.</div>
      </div>
    </footer>
  </div>
{:else if currentStep === 'preferences'}
  <Preference   
    bind:data={formData.preferences}
    on:complete={handlePreferencesComplete}
    on:backToHome={handleBackToHome}
  />
{:else if currentStep === 'skills'}
  <Skills 
    bind:data={formData.skills}
    on:complete={updateFormData.bind(null, 'skills')}
    on:back={prevStep}
  />
{:else if currentStep === 'environment'}
  <Work 
    bind:data={formData.workEnvironment}
    on:complete={getRecommendations}
    on:back={prevStep}
    {isLoading}
  />
{:else if currentStep === 'results'}
  <Result 
    recommendations={recommendations}
    on:restart={restart}
  />
{/if}

{#if error && currentStep !== 'landing'}
  <div class="error-modal">
    <div class="error-content">
      <h3>Oops! Something went wrong</h3>
      <p>{error}</p>
      <div class="error-actions">
        <!-- Changed this button -->
        <button class="retry-button" on:click={handleBackToHome}>
          Try Again
        </button>
        <button class="back-button" on:click={prevStep}>Go Back</button>
      </div>
    </div>
  </div>
{/if}

<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

  :global(body) {
    font-family: 'Inter', sans-serif;
    margin: 0;
    padding: 0;
    background-color: #f8fafc;
    color: #334155;
    line-height: 1.6;
  }

  :global(*) {
    box-sizing: border-box;
  }

  /* Color Variables */
  :root {
    --primary-gradient: linear-gradient(135deg, #3a7bd5 0%, #00d2ff 100%);
    --secondary-gradient: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
    --accent-color: #3a7bd5;
    --accent-light: #00d2ff;
    --card-bg: #ffffff;
    --text-dark: #1e293b;
    --text-medium: #475569;
    --text-light: #64748b;
    --shadow-sm: 0 4px 6px rgba(0, 0, 0, 0.05);
    --shadow-md: 0 10px 15px rgba(0, 0, 0, 0.1);
    --shadow-lg: 0 20px 25px rgba(0, 0, 0, 0.15);
    --border-radius-sm: 8px;
    --border-radius-md: 12px;
    --border-radius-lg: 16px;
  }

  /* Container Styles */
  .header-container,
  .main-container,
  .footer-container {
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
    padding: 0 20px;
  }

  .content-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }

  /* Landing Page Styles */
  .landing-page {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  header {
    background: var(--primary-gradient);
    color: white;
    padding: 2rem 0;
    text-align: center;
    position: relative;
    overflow: hidden;
  }

  header::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="20" cy="20" r="1" fill="white" opacity="0.1"/><circle cx="80" cy="40" r="0.5" fill="white" opacity="0.1"/><circle cx="40" cy="80" r="1.5" fill="white" opacity="0.05"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>') repeat;
    pointer-events: none;
  }

  /* Floating Bubble with Soft Glow */
  .bubble {
    position: absolute;
    width: 15px;
    height: 15px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    opacity: 0;
    animation: float-up var(--duration) ease-in var(--delay) infinite;
    z-index: 1;
    box-shadow: 
      0 0 8px 2px rgba(255, 255, 255, 0.7),
      inset 0 0 10px rgba(255, 255, 255, 0.9);
    filter: blur(0.8px);
  }

  .bubble::before {
    content: '';
    position: absolute;
    top: 2px;
    left: 3px;
    width: 3px;
    height: 3px;
    background: rgba(255, 255, 255, 0.5);
    border-radius: 50%;
    filter: blur(0.5px);
  }

  .bubble::after {
    content: '';
    position: absolute;
    bottom: -15px;
    left: 50%;
    width: 8px;
    height: 8px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    transform: translateX(-50%);
    filter: blur(2px);
  }

  @keyframes float-up {
    0% {
      transform: translateY(0) scale(0.8);
      opacity: 0.5;
    }
    10% {
      opacity: 0.9;
    }
    50% {
      opacity: 0.9;
      transform: translateY(-250px) scale(1);
    }
    80% {
      opacity: 0.7;
    }
    100% {
      transform: translateY(-400px) scale(0.7);
      opacity: 0.5;
    }
  }

  /* Mini Galaxies */
  .mini-galaxy {
    position: absolute;
    width: var(--size);
    height: var(--size);
    left: var(--left);
    top: var(--top);
    background: radial-gradient(circle at center, 
      rgba(255,255,255,0.8) 0%, 
      rgba(255,255,255,0.5) 30%, 
      rgba(255,255,255,0.2) 50%, 
      transparent 70%);
    border-radius: 50%;
    filter: blur(2px);
    opacity: 0.3;
    animation: galaxy-move var(--animation-duration) linear infinite;
    transform: translate(-50%, -50%) rotate(0deg);
    z-index: 0;
  }

  .mini-galaxy::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 60%;
    height: 60%;
    background: radial-gradient(circle at center, 
      rgba(255,255,255,0.9) 0%, 
      rgba(58,123,213,0.6) 40%, 
      transparent 70%);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    filter: blur(1px);
  }

  @keyframes galaxy-move {
    0% {
      transform: translate(-50%, -50%) rotate(0deg) translateX(0) translateY(0);
    }
    25% {
      transform: translate(-50%, -50%) rotate(90deg) translateX(20px) translateY(40px);
    }
    50% {
      transform: translate(-50%, -50%) rotate(180deg) translateX(0) translateY(80px);
    }
    75% {
      transform: translate(-50%, -50%) rotate(270deg) translateX(-20px) translateY(40px);
    }
    100% {
      transform: translate(-50%, -50%) rotate(360deg) translateX(0) translateY(0);
    }
  }

  .header-content {
    max-width: 900px;
    margin: 0 auto;
    padding: 2rem 0;
    position: relative;
    z-index: 2;
  }

  .logo {
    font-size: 1.75rem;
    font-weight: 700;
    margin-bottom: 1rem;
    color: white;
    text-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }

  h1 {
    font-size: 2.75rem;
    font-weight: 700;
    margin: 0.5rem 0;
    line-height: 1.2;
    text-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }

  .subtitle {
    font-size: 1.2rem;
    opacity: 0.95;
    margin-bottom: 2.5rem;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
  }

  .button-container {
    display: flex;
    justify-content: center;
    width: 100%;
  }
  
  .primary-button {
    background-color: white;
    color: var(--accent-color);
    border: none;
    width: 18em;
    height: 4em;
    border-radius: 2.5em;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 450ms ease-in-out;
    box-shadow: var(--shadow-lg);
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 12px;
    position: relative;
    z-index: 2;
    padding: 0 2.5rem;
  }

  .sparkle {
    fill: var(--accent-color);
    transition: all 800ms ease;
  }

  .text {
    font-weight: 600;
    color: var(--accent-color);
    font-size: 1.1rem;
  }

  .primary-button:hover {
    transform: translateY(-3px);
    box-shadow: inset 0px 1px 0px 0px rgba(255, 255, 255, 0.4),
                inset 0px -4px 0px 0px rgba(0, 0, 0, 0.2),
                0px 0px 0px 4px rgba(255, 255, 255, 0.2),
                0px 12px 30px rgba(0, 0, 0, 0.2);
    background: var(--primary-gradient);
  }

  .primary-button:hover .text {
    color: white;
  }

  .primary-button:hover .sparkle {
    fill: white;
    transform: scale(1.2);
  }
  
  /* Main Content */
  .main-container {
    flex: 1;
    width: 100%;
    background-color: #fafafa;
  }

  /* Benefits Section */
  .benefits-section {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 2rem;
    margin: 3rem auto 5rem;
    max-width: 1200px;
  }

  .benefit-card {
    background: var(--card-bg);
    border-radius: var(--border-radius-lg);
    padding: 2.5rem;
    text-align: center;
    box-shadow: var(--shadow-md);
    transition: all 0.3s ease;
    border: 1px solid rgba(255,255,255,0.8);
    background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
  }

  .benefit-card:hover {
    transform: translateY(-8px);
    box-shadow: var(--shadow-lg);
    background: linear-gradient(145deg, #ffffff 0%, #f1f5f9 100%);
  }

  .icon {
    font-size: 3rem;
    margin-bottom: 1.5rem;
    display: block;
    color: var(--accent-color);
    background: var(--primary-gradient);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .benefit-card h3 {
    font-size: 1.35rem;
    margin: 0.5rem 0 1rem;
    color: var(--text-dark);
    font-weight: 600;
  }

  .benefit-card p {
    color: var(--text-light);
    margin: 0;
    line-height: 1.6;
  }

  /* Process Section */
  .process-section {
    margin: 5rem auto;
    text-align: center;
    max-width: 1200px;
  }

  .process-section h2 {
    font-size: 2.25rem;
    margin-bottom: 3rem;
    color: var(--text-dark);
    font-weight: 700;
  }

  .process-steps {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2.5rem;
    margin-top: 3rem;
  }

  .process-step {
    position: relative;
    padding: 2.5rem 2rem;
    background: var(--card-bg);
    border-radius: var(--border-radius-lg);
    box-shadow: var(--shadow-md);
    transition: transform 0.3s ease;
    background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
  }

  .process-step:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-lg);
  }

  .step-number {
    position: absolute;
    top: -1.5rem;
    left: 50%;
    transform: translateX(-50%);
    width: 3.5rem;
    height: 3.5rem;
    background: var(--secondary-gradient);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 1.25rem;
    box-shadow: 0 4px 15px rgba(17, 153, 142, 0.4);
  }

  .process-step h3 {
    font-size: 1.35rem;
    margin: 1.5rem 0 1rem;
    color: var(--text-dark);
    font-weight: 600;
  }

  .process-step p {
    color: var(--text-light);
    margin: 0;
    line-height: 1.6;
  }

  /* New Work Insights Section */
  .work-insights-section {
    margin: 5rem auto;
    text-align: center;
    max-width: 1200px;
  }

  .work-insights-section h2 {
    font-size: 2.25rem;
    margin-bottom: 3rem;
    color: var(--text-dark);
    font-weight: 700;
  }

  .insights-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2rem;
  }

  .insight-card {
    background: var(--card-bg);
    border-radius: var(--border-radius-lg);
    padding: 2.5rem 2rem;
    text-align: center;
    box-shadow: var(--shadow-md);
    transition: all 0.3s ease;
    border: 1px solid rgba(255,255,255,0.8);
    background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
    position: relative;
    overflow: hidden;
  }

  .insight-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: var(--primary-gradient);
  }

  .insight-card:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-lg);
  }

  .insight-icon {
    font-size: 2.5rem;
    margin-bottom: 1.5rem;
    color: var(--accent-color);
    background: var(--primary-gradient);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .insight-card h3 {
    font-size: 1.35rem;
    margin: 0.5rem 0 1rem;
    color: var(--text-dark);
    font-weight: 600;
  }

  .insight-card p {
    color: var(--text-light);
    margin: 0;
    line-height: 1.6;
    font-size: 0.95rem;
  }

  /* Features Section */
  .features-section {
    margin: 5rem auto;
    text-align: center;
    max-width: 1200px;
  }

  .features-section h2 {
    font-size: 2.25rem;
    margin-bottom: 3rem;
    color: var(--text-dark);
    font-weight: 700;
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
    margin-top: 3rem;
  }

  .feature-item {
    padding: 2rem;
    background: var(--card-bg);
    border-radius: var(--border-radius-md);
    border: 1px solid #e2e8f0;
    transition: all 0.3s ease;
    background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
  }

  .feature-item:hover {
    transform: translateY(-3px);
    box-shadow: var(--shadow-md);
    border-color: var(--accent-light);
  }

  .feature-icon {
    font-size: 2.5rem;
    margin-bottom: 1rem;
    color: var(--accent-color);
    background: var(--primary-gradient);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .feature-item h4 {
    font-size: 1.1rem;
    margin: 0.5rem 0;
    color: var(--text-dark);
    font-weight: 600;
  }

  .feature-item p {
    color: var(--text-light);
    margin: 0;
    font-size: 0.95rem;
    line-height: 1.5;
  }

  /* Footer */
  footer {
    background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
    color: white;
    padding: 3rem 0;
    margin-top: auto;
  }

  .footer-container {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .footer-logo {
    font-size: 1.75rem;
    font-weight: 700;
    margin-bottom: 1.5rem;
    background: linear-gradient(90deg, #ffffff 0%, #a5b4fc 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .copyright {
    margin-top: 2rem;
    font-size: 0.9rem;
    color: #94a3b8;
  }

  /* Error Modal */
  .error-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
  }

  .error-content {
    background: var(--card-bg);
    border-radius: var(--border-radius-lg);
    padding: 2.5rem;
    max-width: 400px;
    width: 100%;
    text-align: center;
    box-shadow: var(--shadow-lg);
  }

  .error-content h3 {
    color: #dc2626;
    margin: 0 0 1rem;
    font-size: 1.25rem;
  }

  .error-content p {
    color: var(--text-light);
    margin: 0 0 2rem;
    line-height: 1.5;
  }

  .error-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
  }

  .retry-button, .back-button {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: var(--border-radius-sm);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .retry-button {
    background: var(--accent-color);
    color: white;
  }

  .retry-button:hover:not(:disabled) {
    background: #2563eb;
    transform: translateY(-1px);
  }

  .retry-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .back-button {
    background: #f1f5f9;
    color: var(--text-medium);
    border: 1px solid #e2e8f0;
  }

  .back-button:hover {
    background: #e2e8f0;
    transform: translateY(-1px);
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .header-container,
    .main-container,
    .footer-container {
      padding: 0 15px;
    }

    h1 {
      font-size: 2.25rem;
    }

    .header-content {
      padding: 1.5rem 0;
    }

    .benefits-section, .process-steps, .features-grid, 
    .insights-container {
      grid-template-columns: 1fr;
    }

    .error-actions {
      flex-direction: column;
    }

    .retry-button, .back-button {
      width: 100%;
    }
  }

  @media (max-width: 480px) {
    .header-container,
    .main-container,
    .footer-container {
      padding: 0 10px;
    }

    h1 {
      font-size: 1.875rem;
    }

    .subtitle {
      font-size: 1rem;
    }

    .primary-button {
      padding: 0.875rem 2rem;
      font-size: 1rem;
    }

    .benefit-card, .process-step, .insight-card {
      padding: 2rem 1.5rem;
    }

    .process-section h2, .features-section h2, 
    .work-insights-section h2 {
      font-size: 1.875rem;
    }

    /* Adjust cosmic animations for mobile */
    .mini-galaxy {
      --size: 50px !important;
    }
  }
</style>