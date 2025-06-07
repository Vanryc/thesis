<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  export let data: {
    workTypes: string[];
    salaryExpectation: string;
    workMotivation: string;
    educationLevel: string;
    workExperience: string;
    preferredCompanySize: string;
  } = {
    workTypes: [],
    salaryExpectation: '',
    workMotivation: '',
    educationLevel: '',
    workExperience: '',
    preferredCompanySize: ''
  };

  const workTypeOptions = [
    { id: 'creative', label: 'Creative (e.g., design, writing, arts)', value: 'creative' },
    { id: 'analytical', label: 'Analytical (e.g., data analysis, research)', value: 'analytical' },
    { id: 'technical', label: 'Technical (e.g., engineering, programming)', value: 'technical' },
    { id: 'handsOn', label: 'Hands-on (e.g., construction, manufacturing)', value: 'handsOn' },
    { id: 'social', label: 'Social (e.g., teaching, counseling, customer service)', value: 'social' },
    { id: 'structured', label: 'Structured (e.g., accounting, administration)', value: 'structured' },
    { id: 'leadership', label: 'Leadership/Management (e.g., team leading, project management)', value: 'leadership' },
    { id: 'entrepreneurial', label: 'Entrepreneurial (e.g., startups, business development)', value: 'entrepreneurial' },
    { id: 'scientific', label: 'Scientific (e.g., biology, chemistry, physics)', value: 'scientific' },
    { id: 'healthcare', label: 'Healthcare (e.g., nursing, medicine, therapy)', value: 'healthcare' },
    { id: 'outdoor', label: 'Outdoor/Physical (e.g., agriculture, forestry, sports)', value: 'outdoor' },
    { id: 'digital', label: 'Digital/Remote (e.g., online work, virtual collaboration)', value: 'digital' },
    { id: 'logistical', label: 'Logistical (e.g., supply chain, operations)', value: 'logistical' },
    { id: 'artistic', label: 'Artistic (e.g., performing arts, visual arts)', value: 'artistic' },
    { id: 'financial', label: 'Financial (e.g., banking, investment, insurance)', value: 'financial' },
    { id: 'legal', label: 'Legal (e.g., law, compliance, regulation)', value: 'legal' },
    { id: 'educational', label: 'Educational (e.g., teaching, training, curriculum development)', value: 'educational' },
    { id: 'environmental', label: 'Environmental (e.g., sustainability, conservation)', value: 'environmental' },
    { id: 'sales', label: 'Sales/Marketing (e.g., business development, advertising)', value: 'sales' },
    { id: 'support', label: 'Support Services (e.g., HR, recruiting, office management)', value: 'support' }
  ];

  const salaryOptions = [
    { id: 'low', label: 'Below average (I prioritize other factors)', value: 'low' },
    { id: 'average', label: 'Average (Match industry standards)', value: 'average' },
    { id: 'high', label: 'Above average (Critical for my choices)', value: 'high' }
  ];

  const motivationOptions = [
    { id: 'impact', label: 'Making an impact', value: 'impact' },
    { id: 'security', label: 'Job security', value: 'security' },
    { id: 'growth', label: 'Career growth', value: 'growth' },
    { id: 'balance', label: 'Work-life balance', value: 'balance' }
  ];

  const educationOptions = [
    { id: 'highschool', label: 'High School Diploma', value: 'highschool' },
    { id: 'associate', label: 'Associate Degree', value: 'associate' },
    { id: 'bachelor', label: 'Bachelor\'s Degree', value: 'bachelor' },
    { id: 'master', label: 'Master\'s Degree', value: 'master' },
    { id: 'doctorate', label: 'Doctorate/PhD', value: 'doctorate' },
    { id: 'vocational', label: 'Vocational/Trade Certificate', value: 'vocational' },
    { id: 'other', label: 'Other/Self-taught', value: 'other' }
  ];

  const experienceOptions = [
    { id: 'entry', label: 'Entry level (0-2 years)', value: 'entry' },
    { id: 'junior', label: 'Junior level (2-5 years)', value: 'junior' },
    { id: 'mid', label: 'Mid level (5-8 years)', value: 'mid' },
    { id: 'senior', label: 'Senior level (8+ years)', value: 'senior' },
    { id: 'executive', label: 'Executive/Leadership (10+ years)', value: 'executive' }
  ];

  const companySizeOptions = [
    { id: 'startup', label: 'Startup (1-10 employees)', value: 'startup' },
    { id: 'small', label: 'Small company (11-50 employees)', value: 'small' },
    { id: 'medium', label: 'Medium company (51-200 employees)', value: 'medium' },
    { id: 'large', label: 'Large company (201-1000 employees)', value: 'large' },
    { id: 'enterprise', label: 'Enterprise (1000+ employees)', value: 'enterprise' }
  ];

  function handleWorkTypeChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    const isChecked = target.checked;
    
    if (isChecked && data.workTypes.length < 3) {
      data.workTypes = [...data.workTypes, value];
    } else if (!isChecked) {
      data.workTypes = data.workTypes.filter(type => type !== value);
    } else if (isChecked && data.workTypes.length >= 3) {
      target.checked = false;
      alert('You can select up to 3 work types only.');
    }
  }

  function goBack() {
    dispatch('backToHome');
  }

  function nextQuestion() {
    if (data.workTypes.length === 0) {
      alert('Please select at least one work type');
      return;
    }
    
    if (!data.salaryExpectation || !data.workMotivation || !data.educationLevel || !data.workExperience || !data.preferredCompanySize) {
      alert('Please complete all sections');
      return;
    }
    
    dispatch('complete', {
      workTypes: data.workTypes,
      salaryExpectation: data.salaryExpectation,
      workMotivation: data.workMotivation,
      educationLevel: data.educationLevel,
      workExperience: data.workExperience,
      preferredCompanySize: data.preferredCompanySize
    });
  }

  $: isWorkTypeDisabled = (value: string) => 
    data.workTypes.length >= 3 && !data.workTypes.includes(value);
</script>

<div class="preferences-page">
  <div class="preferences-header">
    <h1>Set Your Preferences</h1>
    <p>Help us understand your ideal work environment and expectations.</p>
  </div>
  <div class="core-preferences">
    <div class="progress-bar">
      <div class="progress-fill"></div>
    </div>
    <h2>Work Preferences</h2>

    <!-- Work Type Question -->
    <div class="question">
      <h3>What types of work do you enjoy? (Select up to 3)</h3>
      <div class="options">
        {#each workTypeOptions as option}
          <label class="option-item {isWorkTypeDisabled(option.value) ? 'disabled' : ''}">
            <input
              type="checkbox"
              value={option.value}
              checked={data.workTypes.includes(option.value)}
              on:change={handleWorkTypeChange}
              disabled={isWorkTypeDisabled(option.value)}
            />
            <span class="option-label">{option.label}</span>
          </label>
        {/each}
      </div>
      <div class="selection-count">
        {data.workTypes.length} of 3 selected
      </div>
    </div>

    <!-- Salary Expectation Question -->
    <div class="question">
      <h3>What are your salary expectations?</h3>
      <div class="options">
        {#each salaryOptions as option}
          <label class="option-item">
            <input
              type="radio"
              name="salary"
              value={option.value}
              bind:group={data.salaryExpectation}
            />
            <span class="option-label">{option.label}</span>
          </label>
        {/each}
      </div>
    </div>

    <!-- Motivation Question -->
    <div class="question">
      <h3>What motivates you most at work?</h3>
      <div class="options">
        {#each motivationOptions as option}
          <label class="option-item">
            <input 
              type="radio" 
              name="motivation" 
              value={option.value}
              bind:group={data.workMotivation}
            />
            <span class="option-label">{option.label}</span>
          </label>
        {/each}
      </div>
    </div>

    <!-- Education Level Question -->
    <div class="question">
      <h3>What is your highest level of education?</h3>
      <div class="options">
        {#each educationOptions as option}
          <label class="option-item">
            <input 
              type="radio" 
              name="education" 
              value={option.value}
              bind:group={data.educationLevel}
            />
            <span class="option-label">{option.label}</span>
          </label>
        {/each}
      </div>
    </div>

    <!-- Work Experience Question -->
    <div class="question">
      <h3>What is your current experience level?</h3>
      <div class="options">
        {#each experienceOptions as option}
          <label class="option-item">
            <input 
              type="radio" 
              name="experience" 
              value={option.value}
              bind:group={data.workExperience}
            />
            <span class="option-label">{option.label}</span>
          </label>
        {/each}
      </div>
    </div>

    <!-- Company Size Preference Question -->
    <div class="question">
      <h3>What size company do you prefer to work for?</h3>
      <div class="options">
        {#each companySizeOptions as option}
          <label class="option-item">
            <input 
              type="radio" 
              name="companySize" 
              value={option.value}
              bind:group={data.preferredCompanySize}
            />
            <span class="option-label">{option.label}</span>
          </label>
        {/each}
      </div>
    </div>

    <!-- Navigation Buttons -->
    <div class="navigation-buttons">
      <button class="nav-button secondary" type="button" on:click={goBack}>Back</button>
      <button class="nav-button primary" type="button" on:click={nextQuestion}>Next</button>
    </div>
  </div>
</div>

<style>
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap');

  .preferences-page {
    min-height: 100vh;
    padding: 2rem 0;
    background-color: #f5f7fb;
    font-family: 'Poppins', sans-serif;
  }

  .preferences-header {
    background-color: #2563eb;
    color: white;
    text-align: center;
    padding: 1.5rem;
    margin-bottom: 2rem;
  }

  .preferences-header h1 {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
    font-weight: 600;
  }

  .preferences-header p {
    margin: 0;
    opacity: 0.9;
    font-size: 0.9rem;
  }

  .core-preferences {
    max-width: 600px;
    margin: 0 auto;
    background: white;
    padding: 2rem;
    border-radius: 1rem;
    box-shadow: 0 10px 25px rgba(0,0,0,0.05);
  }

  .progress-bar {
    width: 100%;
    height: 6px;
    background-color: #e5e7eb;
    border-radius: 3px;
    margin-bottom: 2rem;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background-color: #2563eb;
    transition: width 0.3s ease;
    width: 33%;
  }

  .core-preferences h2 {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
    text-align: center;
    color: #1f2937;
  }

  .question {
    margin-bottom: 2rem;
  }

  .question h3 {
    font-size: 1rem;
    margin-bottom: 1rem;
    color: #374151;
    font-weight: 500;
  }

  .options {
    background-color: #f3f4f6;
    border-radius: 0.75rem;
    padding: 1rem;
  }

  .option-item {
    display: flex;
    align-items: center;
    margin: 0.5rem 0;
    cursor: pointer;
    padding: 0.75rem;
    border-radius: 0.5rem;
    transition: all 0.2s ease;
    user-select: none;
  }

  .option-item:hover:not(.disabled) {
    background-color: #e5e7eb;
  }

  .option-item.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .option-item input {
    margin-right: 0.75rem;
    transform: scale(1.1);
    cursor: pointer;
  }

  .option-item input:disabled {
    cursor: not-allowed;
  }

  .option-label {
    cursor: pointer;
    flex: 1;
    font-size: 0.9rem;
    color: #374151;
  }

  .disabled .option-label {
    cursor: not-allowed;
  }

  .selection-count {
    margin-top: 0.5rem;
    font-size: 0.8rem;
    color: #6b7280;
    text-align: right;
    font-style: italic;
  }

  .navigation-buttons {
    display: flex;
    justify-content: space-between;
    margin-top: 2rem;
    gap: 1rem;
  }

  .nav-button {
    padding: 0.75rem 2rem;
    border: none;
    border-radius: 0.5rem;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 500;
    min-width: 120px;
  }

  .nav-button.primary {
    background-color: #2563eb;
    color: white;
  }

  .nav-button.primary:hover {
    background-color: #1d4ed8;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
  }

  .nav-button.secondary {
    background-color: #f3f4f6;
    color: #374151;
    border: 1px solid #d1d5db;
  }

  .nav-button.secondary:hover {
    background-color: #e5e7eb;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .nav-button:active {
    transform: translateY(0);
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .preferences-page {
      padding: 1rem 0;
    }

    .preferences-header {
      padding: 1rem;
    }

    .preferences-header h1 {
      font-size: 1.25rem;
    }

    .core-preferences {
      margin: 0 1rem;
      padding: 1.5rem;
    }

    .navigation-buttons {
      flex-direction: column;
    }

    .nav-button {
      width: 100%;
    }
  }

  @media (max-width: 480px) {
    .core-preferences {
      margin: 0 0.5rem;
      padding: 1rem;
    }

    .option-item {
      padding: 0.5rem;
    }

    .option-label {
      font-size: 0.85rem;
    }
  }
</style>