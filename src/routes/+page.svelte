<script lang="ts">
  import Preference from './Preference.svelte';
  import Skills from './Skills.svelte';
  import Work from './Work.svelte';
  import Result from './Results.svelte';
  import { afterUpdate } from 'svelte';

  let currentStep: 'landing' | 'preferences' | 'skills' | 'environment' | 'results' = 'landing';
  let isLoading = false;
  let error = '';
  let recommendations: any[] = [];
  
  // Combined form data
  let formData = {
    preferences: {
      workTypes: [] as string[],
      salaryExpectation: '',
      workMotivation: ''
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

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function startAssessment() {
    currentStep = 'preferences';
    scrollToTop();
  }

  function handleBackToHome() {
    currentStep = 'landing';
    // Clear data when going back to home
    formData = {
      preferences: {
        workTypes: [],
        salaryExpectation: '',
        workMotivation: ''
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
  }

  function updateFormData(part: string, data: any) {
    formData = { ...formData, [part]: data };
    if (part === 'preferences') {
      currentStep = 'skills';
      scrollToTop();
    }
    if (part === 'skills') {
      currentStep = 'environment';
      scrollToTop();
    }
  }

  function prevStep() {
    if (currentStep === 'skills') currentStep = 'preferences';
    if (currentStep === 'environment') currentStep = 'skills';
    scrollToTop();
  }

  async function getRecommendations() {
    isLoading = true;
    error = '';
    
    try {
      // Transform data for API
      const apiData = {
        workTypes: formData.preferences.workTypes,
        salary: formData.preferences.salaryExpectation,
        motivation: formData.preferences.workMotivation,
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
        scrollToTop();
      } else {
        error = result.error || 'Failed to get recommendations';
      }
    } catch (err) {
      error = 'Network error. Please try again.';
      console.error(err);
    } finally {
      isLoading = false;
    }
  }

  function restart() {
    formData = {
      preferences: {
        workTypes: [],
        salaryExpectation: '',
        workMotivation: ''
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
  }
</script>

<svelte:head>
  <title>CareerGenie - Find Your Dream Career</title>
</svelte:head>

{#if currentStep === 'landing'}
  <div class="landing-page">
    <header>
      <div class="header-content">
        <div class="logo">CareerGenie</div>
        <h1>Discover Your Perfect Career Path</h1>
        <p class="subtitle">AI-powered career guidance tailored just for you</p>
        <button class="primary-button" on:click={startAssessment}>Start Your Journey →</button>
      </div>
    </header>

    <main class="container">
      <section class="benefits-section">
        <div class="benefit-card">
          <div class="icon">💡</div>
          <h3>Personalized Recommendations</h3>
          <p>Get career matches based on your unique skills and preferences</p>
        </div>
        <div class="benefit-card">
          <div class="icon">📊</div>
          <h3>Market Insights</h3>
          <p>Understand job trends and growth potential for each career</p>
        </div>
        <div class="benefit-card">
          <div class="icon">🎓</div>
          <h3>Learning Paths</h3>
          <p>Discover courses and certifications to help you transition</p>
        </div>
      </section>

      <section class="process-section">
        <h2>Simple 3-Step Process</h2>
        <div class="process-steps">
          <div class="process-step">
            <div class="step-number">1</div>
            <h3>Share Your Profile</h3>
            <p>Tell us about your skills, interests, and work preferences</p>
          </div>
          <div class="process-step">
            <div class="step-number">2</div>
            <h3>AI Analysis</h3>
            <p>Our system evaluates thousands of career options</p>
          </div>
          <div class="process-step">
            <div class="step-number">3</div>
            <h3>Get Results</h3>
            <p>Receive your personalized career matches</p>
          </div>
        </div>
      </section>
    </main>

    <footer>
      <div class="footer-content">
        <div class="footer-logo">CareerGenie</div>
        <div class="footer-links">
          <a href="privacy-policy">Privacy Policy</a>
          <a href="terms-of-service">Terms of Service</a>
          <a href="contact">Contact Us</a>
        </div>
        <div class="copyright">© 2025 CareerGenie. All rights reserved.</div>
      </div>
    </footer>
  </div>
{:else if currentStep === 'preferences'}
  <Preference 
    bind:data={formData.preferences}
    on:complete={updateFormData.bind(null, 'preferences')}
    on:backToHome={handleBackToHome}
  />
{:else if currentStep === 'skills'}
  <Skills 
    bind:data={formData.skills}
    progressWidth="50%"
    on:complete={updateFormData.bind(null, 'skills')}
    on:back={prevStep}
  />
{:else if currentStep === 'environment'}
  <Work 
    bind:data={formData.workEnvironment}
    progressWidth="75%"
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
  <div class="error-message">{error}</div>
{/if}

<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

  :global(body) {
    font-family: 'Inter', sans-serif;
    margin: 0;
    padding: 0;
    background-color: #f8fafc;
    color: #334155;
    line-height: 1.5;
  }

  /* Wizard Container Styles */

  .error-message {
    color: red;
    margin-top: 1rem;
    text-align: center;
  }

  /* Landing Page Styles */
  .landing-page {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  header {
    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
    color: white;
    padding: 2rem 1rem;
    text-align: center;
  }

  .header-content {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem 0;
  }

  .logo {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 1rem;
    color: white;
  }

  h1 {
    font-size: 2.5rem;
    font-weight: 700;
    margin: 0.5rem 0;
    line-height: 1.2;
  }

  .subtitle {
    font-size: 1.1rem;
    opacity: 0.9;
    margin-bottom: 2rem;
  }

  .primary-button {
    background-color: white;
    color: #4f46e5;
    border: none;
    padding: 0.75rem 2rem;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .primary-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem 1rem;
    flex: 1;
  }

  /* Benefits Section */
  .benefits-section {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    margin: 3rem 0;
  }

  .benefit-card {
    background: white;
    border-radius: 12px;
    padding: 2rem;
    text-align: center;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    transition: transform 0.2s ease;
  }

  .benefit-card:hover {
    transform: translateY(-5px);
  }

  .icon {
    font-size: 2.5rem;
    margin-bottom: 1rem;
  }

  .benefit-card h3 {
    font-size: 1.25rem;
    margin: 0.5rem 0;
    color: #1e293b;
  }

  .benefit-card p {
    color: #64748b;
    margin: 0;
  }

  /* Process Section */
  .process-section {
    margin: 4rem 0;
    text-align: center;
  }

  .process-section h2 {
    font-size: 2rem;
    margin-bottom: 3rem;
    color: #1e293b;
  }

  .process-steps {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
  }

  .process-step {
    position: relative;
    padding: 2rem 1.5rem;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  }

  .step-number {
    position: absolute;
    top: -1.5rem;
    left: 50%;
    transform: translateX(-50%);
    width: 3rem;
    height: 3rem;
    background: #4f46e5;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 1.25rem;
  }

  .process-step h3 {
    font-size: 1.25rem;
    margin: 1rem 0 0.5rem;
    color: #1e293b;
  }

  .process-step p {
    color: #64748b;
    margin: 0;
  }

  /* Footer */
  footer {
    background: #1e293b;
    color: white;
    padding: 2rem 1rem;
    margin-top: auto;
  }

  .footer-content {
    max-width: 1200px;
    margin: 0 auto;
    text-align: center;
  }

  .footer-logo {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 1rem;
  }

  .footer-links {
    display: flex;
    justify-content: center;
    gap: 1.5rem;
    margin: 1rem 0;
  }

  .footer-links a {
    color: #e2e8f0;
    text-decoration: none;
    transition: color 0.2s ease;
  }

  .footer-links a:hover {
    color: white;
  }

  .copyright {
    margin-top: 1rem;
    font-size: 0.875rem;
    color: #94a3b8;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    h1 {
      font-size: 2rem;
    }

    .header-content {
      padding: 1rem 0;
    }

    .benefits-section, .process-steps {
      grid-template-columns: 1fr;
    }

    .footer-links {
      flex-direction: column;
      gap: 0.5rem;
    }
  }
</style>