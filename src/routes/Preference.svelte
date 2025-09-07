<!-- Preferences -->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  // Type definitions for better type safety
  type WorkPreferenceData = {
    workTypes: string[];
    salaryExpectation: string;
    workMotivation: string;
    educationLevel: string;
    educationField: string;
    workExperience: string;
    preferredCompanySize: string;
  };

  // Initialize with default values
  export let data: WorkPreferenceData = {
    workTypes: [],
    salaryExpectation: '',
    workMotivation: '',
    educationLevel: '',
    educationField: '',
    workExperience: '',
    preferredCompanySize: ''
  };

  export let progressWidth = '33%';

  // Track form completion state
  let formPartCompleted = false;
  let showEducationField = false;

  // Constants for options
  const WORK_TYPE_LIMIT = 3;
  
  const workTypeOptions = [
    { id: 'creative', label: 'Creative', value: 'creative', icon: 'bx-palette', description: 'Design, writing, arts' },
    { id: 'analytical', label: 'Analytical', value: 'analytical', icon: 'bx-stats', description: 'Data analysis, research' },
    { id: 'technical', label: 'Technical', value: 'technical', icon: 'bx-code-alt', description: 'Engineering, programming' },
    { id: 'handsOn', label: 'Hands-on', value: 'handsOn', icon: 'bx-wrench', description: 'Construction, manufacturing' },
    { id: 'social', label: 'Social', value: 'social', icon: 'bx-group', description: 'Teaching, counseling, service' },
    { id: 'structured', label: 'Structured', value: 'structured', icon: 'bx-list-check', description: 'Accounting, administration' },
    { id: 'leadership', label: 'Leadership', value: 'leadership', icon: 'bx-trending-up', description: 'Team leading, management' },
    { id: 'entrepreneurial', label: 'Entrepreneurial', value: 'entrepreneurial', icon: 'bx-bulb', description: 'Startups, business' },
    { id: 'scientific', label: 'Scientific', value: 'scientific', icon: 'bx-test-tube', description: 'Biology, chemistry' },
    { id: 'healthcare', label: 'Healthcare', value: 'healthcare', icon: 'bx-plus-medical', description: 'Nursing, medicine' },
    { id: 'outdoor', label: 'Outdoor', value: 'outdoor', icon: 'bx-street-view', description: 'Agriculture, forestry' },
    { id: 'digital', label: 'Digital', value: 'digital', icon: 'bx-globe', description: 'Online work, remote' },
    { id: 'logistical', label: 'Logistical', value: 'logistical', icon: 'bx-package', description: 'Supply chain, operations' },
    { id: 'artistic', label: 'Artistic', value: 'artistic', icon: 'bx-music', description: 'Performing, visual arts' },
    { id: 'financial', label: 'Financial', value: 'financial', icon: 'bx-dollar', description: 'Banking, investment' },
    { id: 'legal', label: 'Legal', value: 'legal', icon: 'bx-registered', description: 'Law, compliance' },
    { id: 'educational', label: 'Educational', value: 'educational', icon: 'bx-book', description: 'Teaching, training' },
    { id: 'environmental', label: 'Environmental', value: 'environmental', icon: 'bx-leaf', description: 'Sustainability' },
    { id: 'sales', label: 'Sales', value: 'sales', icon: 'bx-line-chart', description: 'Business development' },
    { id: 'support', label: 'Support', value: 'support', icon: 'bx-support', description: 'HR, office management' }
  ];

  const salaryOptions = [
    { id: 'low', label: 'Below average', value: 'low', description: 'I prioritize other factors', icon: 'bx-chevron-down' },
    { id: 'average', label: 'Average', value: 'average', description: 'Match industry standards', icon: 'bx-minus' },
    { id: 'high', label: 'Above average', value: 'high', description: 'Critical for my choices', icon: 'bx-chevron-up' }
  ];

  const motivationOptions = [
    { id: 'impact', label: 'Impact', value: 'impact', icon: 'bx-target-lock', description: 'Making a difference' },
    { id: 'security', label: 'Security', value: 'security', icon: 'bx-shield', description: 'Stable employment' },
    { id: 'growth', label: 'Growth', value: 'growth', icon: 'bx-trending-up', description: 'Career advancement' },
    { id: 'balance', label: 'Balance', value: 'balance', icon: 'bx-equalizer', description: 'Work-life harmony' }
  ];

  const educationOptions = [
    { id: 'highschool', label: 'High School', value: 'highschool', description: 'Diploma or equivalent', icon: 'bx-badge' },
    { id: 'associate', label: 'Associate', value: 'associate', description: '2-year degree', icon: 'bx-award' },
    { id: 'bachelor', label: 'Bachelor\'s', value: 'bachelor', description: '4-year degree', icon: 'bx-medal' },
    { id: 'master', label: 'Master\'s', value: 'master', description: 'Graduate degree', icon: 'bx-book-reader' },
    { id: 'doctorate', label: 'Doctorate', value: 'doctorate', description: 'PhD or equivalent', icon: 'bx-brain' },
    { id: 'vocational', label: 'Vocational', value: 'vocational', description: 'Trade certificate', icon: 'bx-briefcase-alt' },
    { id: 'other', label: 'Other', value: 'other', description: 'Self-taught or alternative', icon: 'bx-dots-horizontal-rounded' }
  ];

  const educationFieldOptions = [
    { id: 'cs', label: 'Computer Science', value: 'Computer Science', icon: 'bx-code' },
    { id: 'engineering', label: 'Engineering', value: 'Engineering', icon: 'bx-cog' },
    { id: 'business', label: 'Business', value: 'Business', icon: 'bx-building' },
    { id: 'health', label: 'Health', value: 'Health', icon: 'bx-plus-medical' },
    { id: 'arts', label: 'Arts', value: 'Arts', icon: 'bx-palette' },
    { id: 'science', label: 'Sciences', value: 'Science', icon: 'bx-atom' },
    { id: 'social', label: 'Social Sciences', value: 'Social Sciences', icon: 'bx-group' },
    { id: 'education', label: 'Education', value: 'Education', icon: 'bx-book' },
    { id: 'law', label: 'Law', value: 'Law', icon: 'bx-gavel' },
    { id: 'other', label: 'Other', value: 'Other', icon: 'bx-dots-horizontal-rounded' }
  ];

  const companySizeOptions = [
    { id: 'startup', label: 'Startup', value: 'startup', icon: 'bx-rocket', description: '1-10 employees' },
    { id: 'small', label: 'Small', value: 'small', icon: 'bx-building-house', description: '11-50 employees' },
    { id: 'medium', label: 'Medium', value: 'medium', icon: 'bx-building', description: '51-200 employees' },
    { id: 'large', label: 'Large', value: 'large', icon: 'bx-buildings', description: '201-1000 employees' },
    { id: 'enterprise', label: 'Enterprise', value: 'enterprise', icon: 'bx-world', description: '1000+ employees' }
  ];

  function handleWorkTypeChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const { value, checked: isChecked } = target;
    
    if (isChecked && data.workTypes.length < WORK_TYPE_LIMIT) {
      data.workTypes = [...data.workTypes, value];
    } else if (!isChecked) {
      data.workTypes = data.workTypes.filter(type => type !== value);
    } else if (isChecked && data.workTypes.length >= WORK_TYPE_LIMIT) {
      target.checked = false;
      showAlert(`You can select up to ${WORK_TYPE_LIMIT} work types only.`);
    }
  }

  function handleEducationLevelChange(value: string) {
    data.educationLevel = value;
    showEducationField = ['bachelor', 'master', 'doctorate'].includes(value);
    if (!showEducationField) {
      data.educationField = '';
    }
  }

  function showAlert(message: string) {
    alert(message);
  }

  function goBack() {
    dispatch('backToHome');
  }

  function validateForm(): boolean {
    if (data.workTypes.length === 0) {
      showAlert('Please select at least one work type');
      return false;
    }
    
    const requiredFields = [
      { field: data.salaryExpectation, name: 'salary expectation' },
      { field: data.workMotivation, name: 'work motivation' },
      { field: data.educationLevel, name: 'education level' },
      { field: data.preferredCompanySize, name: 'preferred company size' }
    ];
    
    if (showEducationField && !data.educationField) {
      showAlert('Please select your field of study');
      return false;
    }
    
    for (const { field, name } of requiredFields) {
      if (!field) {
        showAlert(`Please select your ${name}`);
        return false;
      }
    }
    
    return true;
  }

  function nextQuestion() {
    if (!validateForm()) return;
    
    formPartCompleted = true;
    
    dispatch('complete', {
      workTypes: data.workTypes,
      salaryExpectation: data.salaryExpectation,
      workMotivation: data.workMotivation,
      educationLevel: data.educationLevel,
      educationField: data.educationField,
      workExperience: data.workExperience,
      preferredCompanySize: data.preferredCompanySize
    });
  }

  $: isWorkTypeDisabled = (value: string) => 
    data.workTypes.length >= WORK_TYPE_LIMIT && !data.workTypes.includes(value);

  function getWorkTypeLabel(value: string) {
    return workTypeOptions.find(option => option.value === value)?.label || value;
  }

  function getWorkTypeIcon(value: string) {
    return workTypeOptions.find(option => option.value === value)?.icon || '';
  }

  function getMotivationLabel(value: string) {
    return motivationOptions.find(option => option.value === value)?.label || value;
  }

  function getMotivationIcon(value: string) {
    return motivationOptions.find(option => option.value === value)?.icon || '';
  }

  function getEducationLabel(value: string) {
    return educationOptions.find(option => option.value === value)?.label || value;
  }

  function getCompanySizeLabel(value: string) {
    return companySizeOptions.find(option => option.value === value)?.label || value;
  }

  function getCompanySizeIcon(value: string) {
    return companySizeOptions.find(option => option.value === value)?.icon || '';
  }
</script>

<div class="preferences-page">
  <div class="preferences-header">
    <div class="header-content">
      <h1>Work Preferences</h1>
      <p>Tell us about your ideal work environment and expectations</p>
    </div>
  </div>

  <div class="center-container">
    <section class="preferences-content">
      <div class="progress-container">
        <div class="progress-bar">
          <div class="progress-fill" style="width: {progressWidth}"></div>
        </div>
        <div class="progress-text">Step 2 of 3</div>
      </div>

      <h2>Your Ideal Work Setup</h2>

      <!-- Selected Preview -->
      {#if data.workTypes.length > 0 || data.salaryExpectation || data.workMotivation || data.educationLevel || data.preferredCompanySize}
        <div class="selection-preview">
          <div class="preview-header">
            <i class='bx bx-check-circle'></i>
            <h3>Your Selections</h3>
          </div>
          <div class="preview-items">
            {#if data.workTypes.length > 0}
              <div class="preview-category">
                <h4>Work Types</h4>
                <div class="preview-tags">
                  {#each data.workTypes as type}
                    <span class="preview-tag">
                      <i class='bx {getWorkTypeIcon(type)}'></i> {getWorkTypeLabel(type)}
                    </span>
                  {/each}
                </div>
              </div>
            {/if}
            
            {#if data.salaryExpectation}
              <div class="preview-category">
                <h4>Salary</h4>
                <div class="preview-tags">
                  <span class="preview-tag">
                    <i class='bx {salaryOptions.find(o => o.value === data.salaryExpectation)?.icon}'></i> 
                    {salaryOptions.find(o => o.value === data.salaryExpectation)?.label}
                  </span>
                </div>
              </div>
            {/if}
            
            {#if data.workMotivation}
              <div class="preview-category">
                <h4>Motivation</h4>
                <div class="preview-tags">
                  <span class="preview-tag">
                    <i class='bx {getMotivationIcon(data.workMotivation)}'></i> {getMotivationLabel(data.workMotivation)}
                  </span>
                </div>
              </div>
            {/if}

            {#if data.educationLevel}
              <div class="preview-category">
                <h4>Education</h4>
                <div class="preview-tags">
                  <span class="preview-tag">
                    <i class='bx {educationOptions.find(o => o.value === data.educationLevel)?.icon}'></i> 
                    {getEducationLabel(data.educationLevel)}
                  </span>
                </div>
              </div>
            {/if}

            {#if data.preferredCompanySize}
              <div class="preview-category">
                <h4>Company Size</h4>
                <div class="preview-tags">
                  <span class="preview-tag">
                    <i class='bx {getCompanySizeIcon(data.preferredCompanySize)}'></i> {getCompanySizeLabel(data.preferredCompanySize)}
                  </span>
                </div>
              </div>
            {/if}
          </div>
        </div>
      {/if}

      <!-- Work Type Question -->
      <div class="question-card">
        <div class="question-header">
          <div class="question-title">
            <i class='bx bx-task'></i>
            <h3>What types of work do you enjoy? <span class="limit-text">(Select up to {WORK_TYPE_LIMIT})</span></h3>
          </div>
          <div class="tooltip">
            <i class='bx bx-info-circle'></i>
            <span class="tooltiptext">Select the work categories that best match your interests and skills</span>
          </div>
        </div>
        <p class="question-description">These categories help us understand your professional orientation</p>
        <div class="options-grid work-type-options">
          {#each workTypeOptions as option}
            <label class="option-card {isWorkTypeDisabled(option.value) ? 'disabled' : ''} {data.workTypes.includes(option.value) ? 'selected' : ''}">
              <input
                type="checkbox"
                value={option.value}
                checked={data.workTypes.includes(option.value)}
                on:change={handleWorkTypeChange}
                disabled={isWorkTypeDisabled(option.value)}
              />
              <div class="option-content">
                <div class="option-icon">
                  <i class='bx {option.icon}'></i>
                </div>
                <div class="option-details">
                  <span class="option-label">{option.label}</span>
                  <span class="option-description">{option.description}</span>
                </div>
                <div class="checkmark">
                  <i class='bx bx-check'></i>
                </div>
              </div>
            </label>
          {/each}
        </div>
        {#if data.workTypes.length > 0}
          <div class="selection-count">
            <i class='bx bx-check-square'></i> Selected: {data.workTypes.length}/{WORK_TYPE_LIMIT}
          </div>
        {/if}
      </div>

      <!-- Salary Expectation Question -->
      <div class="question-card">
        <div class="question-header">
          <div class="question-title">
            <i class='bx bx-money'></i>
            <h3>What are your salary expectations?</h3>
          </div>
        </div>
        <p class="question-description">Your preference helps match you with suitable opportunities</p>
        <div class="options-row salary-options">
          {#each salaryOptions as option}
            <label class="option-pill {data.salaryExpectation === option.value ? 'selected' : ''}">
              <input
                type="radio"
                name="salary"
                value={option.value}
                bind:group={data.salaryExpectation}
              />
              <div class="option-content">
                <i class='bx {option.icon}'></i>
                <span class="option-label">{option.label}</span>
                <span class="option-description">{option.description}</span>
              </div>
            </label>
          {/each}
        </div>
      </div>

      <!-- Motivation Question -->
      <div class="question-card">
        <div class="question-header">
          <div class="question-title">
            <i class='bx bx-trophy'></i>
            <h3>What motivates you most at work?</h3>
          </div>
          <div class="tooltip">
            <i class='bx bx-info-circle'></i>
            <span class="tooltiptext">Select the primary factor that drives your work satisfaction</span>
          </div>
        </div>
        <div class="options-grid motivation-options">
          {#each motivationOptions as option}
            <label class="option-card {data.workMotivation === option.value ? 'selected' : ''}">
              <input 
                type="radio" 
                name="motivation" 
                value={option.value}
                bind:group={data.workMotivation}
              />
              <div class="option-content">
                <div class="option-icon">
                  <i class='bx {option.icon}'></i>
                </div>
                <div class="option-details">
                  <span class="option-label">{option.label}</span>
                  <span class="option-description">{option.description}</span>
                </div>
                <div class="checkmark">
                  <i class='bx bx-check'></i>
                </div>
              </div>
            </label>
          {/each}
        </div>
      </div>

      <!-- Education Level Question -->
      <div class="question-card">
        <div class="question-header">
          <div class="question-title">
            <i class='bx bx-graduation'></i>
            <h3>What is your highest level of education?</h3>
          </div>
        </div>
        <p class="question-description">This helps us understand your educational background</p>
        <div class="options-grid education-options">
          {#each educationOptions as option}
            <label class="option-card {data.educationLevel === option.value ? 'selected' : ''}">
              <input 
                type="radio" 
                name="education" 
                value={option.value}
                checked={data.educationLevel === option.value}
                on:change={() => handleEducationLevelChange(option.value)}
              />
              <div class="option-content">
                <div class="option-icon">
                  <i class='bx {option.icon}'></i>
                </div>
                <div class="option-details">
                  <span class="option-label">{option.label}</span>
                  <span class="option-description">{option.description}</span>
                </div>
                <div class="checkmark">
                  <i class='bx bx-check'></i>
                </div>
              </div>
            </label>
          {/each}
        </div>
      </div>

      <!-- Education Field Question -->
      {#if showEducationField}
        <div class="question-card">
          <div class="question-header">
            <div class="question-title">
              <i class='bx bx-book'></i>
              <h3>What field is your {data.educationLevel === 'bachelor' ? "Bachelor's" : 
                                    data.educationLevel === 'master' ? "Master's" : 
                                    "Doctorate"} degree in?</h3>
            </div>
          </div>
          <div class="options-grid education-field-options">
            {#each educationFieldOptions as option}
              <label class="option-pill {data.educationField === option.value ? 'selected' : ''}">
                <input 
                  type="radio" 
                  name="educationField" 
                  value={option.value}
                  bind:group={data.educationField}
                />
                <div class="option-content">
                  <i class='bx {option.icon}'></i>
                  <span>{option.label}</span>
                </div>
              </label>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Company Size Preference Question -->
      <div class="question-card">
        <div class="question-header">
          <div class="question-title">
            <i class='bx bx-buildings'></i>
            <h3>What size company do you prefer to work for?</h3>
          </div>
          <div class="tooltip">
            <i class='bx bx-info-circle'></i>
            <span class="tooltiptext">Different company sizes offer different work environments</span>
          </div>
        </div>
        <div class="options-row company-size-options">
          {#each companySizeOptions as option}
            <label class="option-card {data.preferredCompanySize === option.value ? 'selected' : ''}">
              <input 
                type="radio" 
                name="companySize" 
                value={option.value}
                bind:group={data.preferredCompanySize}
              />
              <div class="option-content">
                <div class="option-icon">
                  <i class='bx {option.icon}'></i>
                </div>
                <div class="option-details">
                  <span class="option-label">{option.label}</span>
                  <span class="option-description">{option.description}</span>
                </div>
                <div class="checkmark">
                  <i class='bx bx-check'></i>
                </div>
              </div>
            </label>
          {/each}
        </div>
      </div>

      <!-- Navigation Buttons -->
      <div class="navigation-buttons">
        <button class="nav-button secondary" type="button" on:click={goBack}>
          <i class='bx bx-chevron-left'></i> Back
        </button>
        <button class="nav-button primary" type="button" on:click={nextQuestion}>
          Next <i class='bx bx-chevron-right'></i>
        </button>
      </div>
    </section>
  </div>
</div>

<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
  @import url('https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css');

  .preferences-page {
    min-height: 100vh;
    padding: 0;
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    font-family: 'Inter', sans-serif;
    color: #1e293b;
  }

  .preferences-header {
    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
    color: white;
    padding: 2rem 1.5rem;
    margin-bottom: 2rem;
    border-radius: 0 0 1.5rem 1.5rem;
    box-shadow: 0 4px 20px rgba(79, 70, 229, 0.2);
  }

  .header-content {
    max-width: 800px;
    margin: 0 auto;
    text-align: center;
  }

  .preferences-header h1 {
    font-size: 1.875rem;
    margin-bottom: 0.5rem;
    font-weight: 700;
    letter-spacing: -0.025em;
  }

  .preferences-header p {
    margin: 0;
    opacity: 0.9;
    font-size: 1.05rem;
    font-weight: 400;
  }

  /* Center container for the form */
  .center-container {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding: 0 1rem;
  }

  .preferences-content {
    width: 100%;
    max-width: 800px;
    background: white;
    padding: 2.5rem;
    border-radius: 1.25rem;
    box-shadow: 0 10px 25px rgba(0,0,0,0.05);
    margin-bottom: 3rem;
  }

  .progress-container {
    margin-bottom: 2.5rem;
  }

  .progress-bar {
    width: 100%;
    height: 8px;
    background-color: #e2e8f0;
    border-radius: 4px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #4f46e5 0%, #7c3aed 100%);
    transition: width 0.5s ease;
    border-radius: 4px;
  }

  .progress-text {
    text-align: right;
    font-size: 0.875rem;
    color: #64748b;
    margin-top: 0.5rem;
    font-weight: 500;
  }

  .preferences-content h2 {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
    text-align: center;
    color: #1e293b;
    position: relative;
    padding-bottom: 0.75rem;
  }

  .preferences-content h2::after {
    content: '';
    display: block;
    width: 60px;
    height: 4px;
    background: linear-gradient(90deg, #4f46e5 0%, #7c3aed 100%);
    margin: 0.5rem auto 0;
    border-radius: 2px;
  }

  /* Selection Preview */
  .selection-preview {
    background-color: #f8fafc;
    border-radius: 0.875rem;
    padding: 1.5rem;
    margin-bottom: 2rem;
    border-left: 4px solid #4f46e5;
    box-shadow: 0 2px 10px rgba(0,0,0,0.03);
  }

  .preview-header {
    display: flex;
    align-items: center;
    margin-bottom: 1rem;
  }

  .preview-header i {
    color: #10b981;
    font-size: 1.5rem;
    margin-right: 0.5rem;
  }

  .selection-preview h3 {
    font-size: 1.1rem;
    margin: 0;
    color: #334155;
    font-weight: 600;
  }

  .preview-items {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .preview-category {
    flex: 1;
    min-width: 200px;
  }

  .preview-category h4 {
    font-size: 0.875rem;
    color: #64748b;
    margin-bottom: 0.5rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .preview-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .preview-tag {
    background-color: white;
    padding: 0.5rem 0.875rem;
    border-radius: 1.5rem;
    font-size: 0.8rem;
    box-shadow: 0 1px 3px rgba(0,0,0,0.08);
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    border: 1px solid #e2e8f0;
    font-weight: 500;
  }

  .preview-tag i {
    font-size: 1rem;
    color: #4f46e5;
  }

  /* Question Cards */
  .question-card {
    background: white;
    border-radius: 0.875rem;
    padding: 1.75rem;
    margin-bottom: 2rem;
    box-shadow: 0 4px 12px rgba(0,0,0,0.04);
    border: 1px solid #f1f5f9;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .question-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0,0,0,0.06);
  }

  .question-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 0.75rem;
  }

  .question-title {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .question-title i {
    font-size: 1.5rem;
    color: #4f46e5;
  }

  .question-card h3 {
    font-size: 1.15rem;
    margin: 0;
    color: #1e293b;
    font-weight: 600;
  }

  .limit-text {
    font-weight: 400;
    color: #64748b;
    font-size: 0.95rem;
  }

  .question-description {
    font-size: 0.9rem;
    color: #64748b;
    margin-bottom: 1.25rem;
    line-height: 1.5;
    padding-left: 2.25rem;
  }

  .tooltip {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    color: #94a3b8;
    cursor: help;
  }

  .tooltip i {
    font-size: 1.25rem;
  }

  .tooltip .tooltiptext {
    visibility: hidden;
    width: 200px;
    background-color: #334155;
    color: #fff;
    text-align: center;
    border-radius: 6px;
    padding: 0.5rem;
    position: absolute;
    z-index: 1;
    bottom: 125%;
    left: 50%;
    transform: translateX(-50%);
    opacity: 0;
    transition: opacity 0.3s;
    font-size: 0.8rem;
    font-weight: normal;
    line-height: 1.4;
  }

  .tooltip:hover .tooltiptext {
    visibility: visible;
    opacity: 1;
  }

  /* Options Grid */
  .options-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 0.875rem;
  }

  .options-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 0.875rem;
  }

  /* Option Cards */
  .option-card {
    position: relative;
    border: 1px solid #e2e8f0;
    border-radius: 0.75rem;
    padding: 0;
    transition: all 0.2s ease;
    cursor: pointer;
    background: white;
    overflow: hidden;
  }

  .option-card:hover:not(.disabled) {
    border-color: #4f46e5;
    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.1);
    transform: translateY(-2px);
  }

  .option-card.selected {
    border-color: #4f46e5;
    background-color: #f5f3ff;
    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.15);
  }

  .option-card.disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background-color: #f8fafc;
  }

  .option-card input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
  }

  .option-content {
    display: flex;
    align-items: center;
    padding: 1rem;
    position: relative;
  }

  .option-icon {
    margin-right: 0.875rem;
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .option-card.selected .option-icon {
    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
    color: white;
  }

  .option-icon i {
    font-size: 1.25rem;
  }

  .option-details {
    display: flex;
    flex-direction: column;
    flex: 1;
  }

  .option-label {
    font-size: 0.95rem;
    color: #1e293b;
    font-weight: 500;
    margin-bottom: 0.25rem;
  }

  .option-description {
    font-size: 0.8rem;
    color: #64748b;
    line-height: 1.4;
  }

  .checkmark {
    opacity: 0;
    color: #4f46e5;
    font-size: 1.25rem;
    transition: opacity 0.2s ease;
  }

  .option-card.selected .checkmark {
    opacity: 1;
  }

  /* Option Pills */
  .option-pill {
    position: relative;
    border: 1px solid #e2e8f0;
    border-radius: 2rem;
    padding: 0;
    transition: all 0.2s ease;
    cursor: pointer;
    background: white;
    text-align: center;
  }

  .option-pill:hover {
    border-color: #4f46e5;
    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.1);
  }

  .option-pill.selected {
    border-color: #4f46e5;
    background-color: #f5f3ff;
    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.15);
  }

  .option-pill input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
  }

  .option-pill .option-content {
    display: flex;
    flex-direction: column;
    padding: 1.25rem 0.75rem;
    gap: 0.5rem;
  }

  .option-pill i {
    font-size: 1.5rem;
    color: #4f46e5;
  }

  .option-pill.selected i {
    color: #7c3aed;
  }

  .option-pill .option-label {
    font-weight: 600;
  }

  .option-pill .option-description {
    font-size: 0.75rem;
  }

  .selection-count {
    margin-top: 1rem;
    font-size: 0.875rem;
    color: #64748b;
    text-align: right;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.5rem;
  }

  .selection-count i {
    color: #10b981;
  }

  /* Navigation */
  .navigation-buttons {
    display: flex;
    justify-content: space-between;
    margin-top: 3rem;
    gap: 1rem;
  }

  .nav-button {
    padding: 0.875rem 2rem;
    border: none;
    border-radius: 0.75rem;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 500;
    min-width: 140px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  .nav-button.primary {
    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
    color: white;
    box-shadow: 0 4px 6px rgba(79, 70, 229, 0.2);
  }

  .nav-button.primary:hover:not(:disabled) {
    background: linear-gradient(135deg, #4338ca 0%, #6d28d9 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(79, 70, 229, 0.3);
  }

  .nav-button.secondary {
    background-color: white;
    color: #4f46e5;
    border: 1px solid #e2e8f0;
  }

  .nav-button.secondary:hover {
    background-color: #f8fafc;
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    border-color: #cbd5e1;
  }

  .nav-button:active {
    transform: translateY(0);
  }

  .nav-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
    background: #cbd5e1;
    color: #64748b;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .preferences-page {
      padding: 0;
    }

    .preferences-header {
      padding: 1.5rem 1rem;
      border-radius: 0;
    }

    .preferences-header h1 {
      font-size: 1.5rem;
    }

    .preferences-content {
      padding: 1.75rem;
      margin: 0 0.5rem;
    }

    .preview-items {
      flex-direction: column;
    }

    .options-grid,
    .options-row {
      grid-template-columns: 1fr;
    }

    .navigation-buttons {
      flex-direction: column;
    }

    .nav-button {
      width: 100%;
    }
  }

  @media (max-width: 480px) {
    .preferences-content {
      padding: 1.5rem;
    }

    .question-card {
      padding: 1.25rem;
    }

    .option-content {
      padding: 0.875rem;
    }

    .option-label {
      font-size: 0.9rem;
    }
  }
</style>