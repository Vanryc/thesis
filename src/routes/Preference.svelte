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
    { id: 'creative', label: 'Creative', value: 'creative', icon: '🎨', description: 'Design, writing, arts' },
    { id: 'analytical', label: 'Analytical', value: 'analytical', icon: '📊', description: 'Data analysis, research' },
    { id: 'technical', label: 'Technical', value: 'technical', icon: '💻', description: 'Engineering, programming' },
    { id: 'handsOn', label: 'Hands-on', value: 'handsOn', icon: '🛠️', description: 'Construction, manufacturing' },
    { id: 'social', label: 'Social', value: 'social', icon: '🗣️', description: 'Teaching, counseling, service' },
    { id: 'structured', label: 'Structured', value: 'structured', icon: '📋', description: 'Accounting, administration' },
    { id: 'leadership', label: 'Leadership', value: 'leadership', icon: '👔', description: 'Team leading, management' },
    { id: 'entrepreneurial', label: 'Entrepreneurial', value: 'entrepreneurial', icon: '💡', description: 'Startups, business' },
    { id: 'scientific', label: 'Scientific', value: 'scientific', icon: '🔬', description: 'Biology, chemistry' },
    { id: 'healthcare', label: 'Healthcare', value: 'healthcare', icon: '🏥', description: 'Nursing, medicine' },
    { id: 'outdoor', label: 'Outdoor', value: 'outdoor', icon: '🌳', description: 'Agriculture, forestry' },
    { id: 'digital', label: 'Digital', value: 'digital', icon: '🌐', description: 'Online work, remote' },
    { id: 'logistical', label: 'Logistical', value: 'logistical', icon: '🚚', description: 'Supply chain, operations' },
    { id: 'artistic', label: 'Artistic', value: 'artistic', icon: '🎭', description: 'Performing, visual arts' },
    { id: 'financial', label: 'Financial', value: 'financial', icon: '💰', description: 'Banking, investment' },
    { id: 'legal', label: 'Legal', value: 'legal', icon: '⚖️', description: 'Law, compliance' },
    { id: 'educational', label: 'Educational', value: 'educational', icon: '📚', description: 'Teaching, training' },
    { id: 'environmental', label: 'Environmental', value: 'environmental', icon: '🌱', description: 'Sustainability' },
    { id: 'sales', label: 'Sales', value: 'sales', icon: '📈', description: 'Business development' },
    { id: 'support', label: 'Support', value: 'support', icon: '🛟', description: 'HR, office management' }
  ];

  const salaryOptions = [
    { id: 'low', label: 'Below average', value: 'low', description: 'I prioritize other factors' },
    { id: 'average', label: 'Average', value: 'average', description: 'Match industry standards' },
    { id: 'high', label: 'Above average', value: 'high', description: 'Critical for my choices' }
  ];

  const motivationOptions = [
    { id: 'impact', label: 'Impact', value: 'impact', icon: '✨', description: 'Making a difference' },
    { id: 'security', label: 'Security', value: 'security', icon: '🛡️', description: 'Stable employment' },
    { id: 'growth', label: 'Growth', value: 'growth', icon: '📈', description: 'Career advancement' },
    { id: 'balance', label: 'Balance', value: 'balance', icon: '⚖️', description: 'Work-life harmony' }
  ];

  const educationOptions = [
    { id: 'highschool', label: 'High School', value: 'highschool', description: 'Diploma or equivalent' },
    { id: 'associate', label: 'Associate', value: 'associate', description: '2-year degree' },
    { id: 'bachelor', label: 'Bachelor\'s', value: 'bachelor', description: '4-year degree' },
    { id: 'master', label: 'Master\'s', value: 'master', description: 'Graduate degree' },
    { id: 'doctorate', label: 'Doctorate', value: 'doctorate', description: 'PhD or equivalent' },
    { id: 'vocational', label: 'Vocational', value: 'vocational', description: 'Trade certificate' },
    { id: 'other', label: 'Other', value: 'other', description: 'Self-taught or alternative' }
  ];

  const educationFieldOptions = [
    { id: 'cs', label: 'Computer Science', value: 'Computer Science', icon: '💻' },
    { id: 'engineering', label: 'Engineering', value: 'Engineering', icon: '⚙️' },
    { id: 'business', label: 'Business', value: 'Business', icon: '📊' },
    { id: 'health', label: 'Health', value: 'Health', icon: '🏥' },
    { id: 'arts', label: 'Arts', value: 'Arts', icon: '🎨' },
    { id: 'science', label: 'Sciences', value: 'Science', icon: '🔬' },
    { id: 'social', label: 'Social Sciences', value: 'Social Sciences', icon: '🧑‍🤝‍🧑' },
    { id: 'education', label: 'Education', value: 'Education', icon: '📚' },
    { id: 'law', label: 'Law', value: 'Law', icon: '⚖️' },
    { id: 'other', label: 'Other', value: 'Other', icon: '❓' }
  ];

  const companySizeOptions = [
    { id: 'startup', label: 'Startup', value: 'startup', icon: '🚀', description: '1-10 employees' },
    { id: 'small', label: 'Small', value: 'small', icon: '🏢', description: '11-50 employees' },
    { id: 'medium', label: 'Medium', value: 'medium', icon: '🏛️', description: '51-200 employees' },
    { id: 'large', label: 'Large', value: 'large', icon: '🏙️', description: '201-1000 employees' },
    { id: 'enterprise', label: 'Enterprise', value: 'enterprise', icon: '🌐', description: '1000+ employees' }
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
    <h1>Work Preferences</h1>
    <p>Tell us about your ideal work environment and expectations</p>
  </div>

  <section class="preferences-content">
    <div class="progress-bar">
      <div class="progress-fill" style="width: {progressWidth}"></div>
    </div>

    <h2>Your Ideal Work Setup</h2>

    <!-- Selected Preview -->
    {#if data.workTypes.length > 0 || data.salaryExpectation || data.workMotivation || data.educationLevel || data.preferredCompanySize}
      <div class="selection-preview">
        <h3>Your Selections</h3>
        <div class="preview-items">
          {#if data.workTypes.length > 0}
            <div class="preview-category">
              <h4>Work Types:</h4>
              <div class="preview-tags">
                {#each data.workTypes as type}
                  <span class="preview-tag">
                    {getWorkTypeIcon(type)} {getWorkTypeLabel(type)}
                  </span>
                {/each}
              </div>
            </div>
          {/if}
          
          {#if data.salaryExpectation}
            <div class="preview-category">
              <h4>Salary:</h4>
              <div class="preview-tags">
                <span class="preview-tag">
                  {data.salaryExpectation === 'low' ? '💲' : 
                   data.salaryExpectation === 'average' ? '💲💲' : '💲💲💲'} 
                  {salaryOptions.find(o => o.value === data.salaryExpectation)?.label}
                </span>
              </div>
            </div>
          {/if}
          
          {#if data.workMotivation}
            <div class="preview-category">
              <h4>Motivation:</h4>
              <div class="preview-tags">
                <span class="preview-tag">
                  {getMotivationIcon(data.workMotivation)} {getMotivationLabel(data.workMotivation)}
                </span>
              </div>
            </div>
          {/if}

          {#if data.educationLevel}
            <div class="preview-category">
              <h4>Education:</h4>
              <div class="preview-tags">
                <span class="preview-tag">{getEducationLabel(data.educationLevel)}</span>
              </div>
            </div>
          {/if}

          {#if data.preferredCompanySize}
            <div class="preview-category">
              <h4>Company Size:</h4>
              <div class="preview-tags">
                <span class="preview-tag">
                  {getCompanySizeIcon(data.preferredCompanySize)} {getCompanySizeLabel(data.preferredCompanySize)}
                </span>
              </div>
            </div>
          {/if}
        </div>
      </div>
    {/if}

    <!-- Work Type Question -->
    <div class="question">
      <div class="question-header">
        <h3>What types of work do you enjoy? (Select up to {WORK_TYPE_LIMIT})</h3>
        <div class="tooltip">?
          <span class="tooltiptext">Select the work categories that best match your interests and skills</span>
        </div>
      </div>
      <p class="question-description">These categories help us understand your professional orientation</p>
      <div class="options work-type-options">
        {#each workTypeOptions as option}
          <label class="option-item {isWorkTypeDisabled(option.value) ? 'disabled' : ''}">
            <input
              type="checkbox"
              value={option.value}
              checked={data.workTypes.includes(option.value)}
              on:change={handleWorkTypeChange}
              disabled={isWorkTypeDisabled(option.value)}
            />
            <span class="option-icon">{option.icon}</span>
            <div class="option-details">
              <span class="option-label">{option.label}</span>
              <span class="option-description">{option.description}</span>
            </div>
          </label>
        {/each}
      </div>
      {#if data.workTypes.length > 0}
        <div class="selection-count">Selected: {data.workTypes.length}/{WORK_TYPE_LIMIT}</div>
      {/if}
    </div>

    <!-- Salary Expectation Question -->
    <div class="question">
      <h3>What are your salary expectations?</h3>
      <p class="question-description">Your preference helps match you with suitable opportunities</p>
      <div class="options salary-options">
        {#each salaryOptions as option}
          <label class="option-item">
            <input
              type="radio"
              name="salary"
              value={option.value}
              bind:group={data.salaryExpectation}
            />
            <div class="option-details">
              <span class="option-label">{option.label}</span>
              <span class="option-description">{option.description}</span>
            </div>
          </label>
        {/each}
      </div>
    </div>

    <!-- Motivation Question -->
    <div class="question">
      <div class="question-header">
        <h3>What motivates you most at work?</h3>
        <div class="tooltip">?
          <span class="tooltiptext">Select the primary factor that drives your work satisfaction</span>
        </div>
      </div>
      <div class="options motivation-options">
        {#each motivationOptions as option}
          <label class="option-item">
            <input 
              type="radio" 
              name="motivation" 
              value={option.value}
              bind:group={data.workMotivation}
            />
            <span class="option-icon">{option.icon}</span>
            <div class="option-details">
              <span class="option-label">{option.label}</span>
              <span class="option-description">{option.description}</span>
            </div>
          </label>
        {/each}
      </div>
    </div>

    <!-- Education Level Question -->
    <div class="question">
      <h3>What is your highest level of education?</h3>
      <p class="question-description">This helps us understand your educational background</p>
      <div class="options education-options">
        {#each educationOptions as option}
          <label class="option-item">
            <input 
              type="radio" 
              name="education" 
              value={option.value}
              checked={data.educationLevel === option.value}
              on:change={() => handleEducationLevelChange(option.value)}
            />
            <div class="option-details">
              <span class="option-label">{option.label}</span>
              <span class="option-description">{option.description}</span>
            </div>
          </label>
        {/each}
      </div>
    </div>

    <!-- Education Field Question -->
    {#if showEducationField}
      <div class="question">
        <h3>What field is your {data.educationLevel === 'bachelor' ? "Bachelor's" : 
                              data.educationLevel === 'master' ? "Master's" : 
                              "Doctorate"} degree in?</h3>
        <div class="options education-field-options">
          {#each educationFieldOptions as option}
            <label class="option-item">
              <input 
                type="radio" 
                name="educationField" 
                value={option.value}
                bind:group={data.educationField}
              />
              <span class="option-icon">{option.icon}</span>
              <span class="option-label">{option.label}</span>
            </label>
          {/each}
        </div>
      </div>
    {/if}

    <!-- Company Size Preference Question -->
    <div class="question">
      <div class="question-header">
        <h3>What size company do you prefer to work for?</h3>
        <div class="tooltip">?
          <span class="tooltiptext">Different company sizes offer different work environments</span>
        </div>
      </div>
      <div class="options company-size-options">
        {#each companySizeOptions as option}
          <label class="option-item">
            <input 
              type="radio" 
              name="companySize" 
              value={option.value}
              bind:group={data.preferredCompanySize}
            />
            <span class="option-icon">{option.icon}</span>
            <div class="option-details">
              <span class="option-label">{option.label}</span>
              <span class="option-description">{option.description}</span>
            </div>
          </label>
        {/each}
      </div>
    </div>

    <!-- Navigation Buttons -->
    <div class="navigation-buttons">
      <button class="nav-button secondary" type="button" on:click={goBack}>
        <span class="button-icon">←</span> Back
      </button>
      <button class="nav-button primary" type="button" on:click={nextQuestion}>
        Next <span class="button-icon">→</span>
      </button>
    </div>
  </section>
</div>

<style>
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

  .preferences-page {
    min-height: 100vh;
    padding: 0;
    background-color: #f8fafc;
    font-family: 'Poppins', sans-serif;
    color: #1e293b;
  }

  .preferences-header {
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
    color: white;
    text-align: center;
    padding: 2rem 1.5rem;
    margin-bottom: 2rem;
    border-radius: 0 0 1.5rem 1.5rem;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  }

  .preferences-header h1 {
    font-size: 1.75rem;
    margin-bottom: 0.5rem;
    font-weight: 600;
  }

  .preferences-header p {
    margin: 0;
    opacity: 0.9;
    font-size: 1rem;
    max-width: 600px;
    margin: 0 auto;
  }

  .preferences-content {
    max-width: 800px;
    margin: 0 auto 3rem;
    background: white;
    padding: 2.5rem;
    border-radius: 1rem;
    box-shadow: 0 10px 25px rgba(0,0,0,0.05);
    position: relative;
    top: -1.5rem;
  }

  .progress-bar {
    width: 100%;
    height: 8px;
    background-color: #e2e8f0;
    border-radius: 4px;
    margin-bottom: 2.5rem;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #2563eb 0%, #3b82f6 100%);
    transition: width 0.3s ease;
  }

  .preferences-content h2 {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
    text-align: center;
    color: #1e293b;
    position: relative;
  }

  .preferences-content h2::after {
    content: '';
    display: block;
    width: 60px;
    height: 3px;
    background: #2563eb;
    margin: 0.5rem auto 0;
    border-radius: 3px;
  }

  /* Selection Preview */
  .selection-preview {
    background-color: #f1f5f9;
    border-radius: 0.75rem;
    padding: 1.25rem;
    margin-bottom: 2rem;
    border-left: 4px solid #2563eb;
  }

  .selection-preview h3 {
    font-size: 1rem;
    margin-bottom: 0.75rem;
    color: #334155;
    font-weight: 600;
  }

  .preview-items {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .preview-category {
    flex: 1;
    min-width: 200px;
  }

  .preview-category h4 {
    font-size: 0.85rem;
    color: #64748b;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }

  .preview-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .preview-tag {
    background-color: white;
    padding: 0.35rem 0.75rem;
    border-radius: 1rem;
    font-size: 0.8rem;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
  }

  .question {
    margin-bottom: 2.5rem;
    animation: fadeIn 0.4s ease-out;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .question-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .question h3 {
    font-size: 1.1rem;
    margin-bottom: 0;
    color: #1e293b;
    font-weight: 500;
  }

  .question-description {
    font-size: 0.85rem;
    color: #64748b;
    margin-bottom: 1rem;
    line-height: 1.5;
  }

  .tooltip {
    position: relative;
    display: inline-block;
    width: 18px;
    height: 18px;
    background-color: #94a3b8;
    color: white;
    border-radius: 50%;
    text-align: center;
    font-size: 0.75rem;
    line-height: 18px;
    cursor: help;
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
  }

  .tooltip:hover .tooltiptext {
    visibility: visible;
    opacity: 1;
  }

  .options {
    background-color: #f8fafc;
    border-radius: 0.75rem;
    padding: 1rem;
    border: 1px solid #e2e8f0;
  }

  .work-type-options {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 0.75rem;
  }

  .salary-options,
  .motivation-options,
  .education-options,
  .company-size-options {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .education-field-options {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 0.75rem;
  }

  .option-item {
    display: flex;
    align-items: center;
    padding: 0.85rem 1rem;
    border-radius: 0.5rem;
    transition: all 0.2s ease;
    user-select: none;
    background-color: white;
    border: 1px solid #e2e8f0;
  }

  .option-item:hover:not(.disabled) {
    border-color: #2563eb;
    box-shadow: 0 0 0 1px #2563eb;
  }

  .option-item:has(input:checked) {
    background-color: #eff6ff;
    border-color: #2563eb;
  }

  .option-item.disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background-color: #f8fafc;
  }

  .option-item input {
    margin-right: 0.75rem;
    cursor: pointer;
    accent-color: #2563eb;
    min-width: 16px;
    min-height: 16px;
  }

  .option-item input:disabled {
    cursor: not-allowed;
  }

  .option-icon {
    margin-right: 0.75rem;
    font-size: 1.25rem;
    flex-shrink: 0;
  }

  .option-details {
    display: flex;
    flex-direction: column;
  }

  .option-label {
    cursor: pointer;
    font-size: 0.95rem;
    color: #1e293b;
    font-weight: 500;
  }

  .option-description {
    font-size: 0.8rem;
    color: #64748b;
    margin-top: 0.2rem;
  }

  .disabled .option-label {
    cursor: not-allowed;
  }

  .selection-count {
    margin-top: 0.75rem;
    font-size: 0.85rem;
    color: #64748b;
    text-align: right;
    font-style: italic;
  }

  /* Navigation */
  .navigation-buttons {
    display: flex;
    justify-content: space-between;
    margin-top: 3rem;
    gap: 1rem;
  }

  .nav-button {
    padding: 0.85rem 2rem;
    border: none;
    border-radius: 0.5rem;
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
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
    color: white;
  }

  .nav-button.primary:hover:not(:disabled) {
    background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
  }

  .nav-button.secondary {
    background-color: white;
    color: #2563eb;
    border: 1px solid #2563eb;
  }

  .nav-button.secondary:hover {
    background-color: #f8fafc;
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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

  .button-icon {
    font-size: 1.1rem;
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
      margin: 0 1rem;
      padding: 1.75rem;
      top: 0;
      border-radius: 0.75rem;
    }

    .preview-items {
      flex-direction: column;
    }

    .work-type-options,
    .education-field-options {
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
      margin: 0 0.75rem;
      padding: 1.5rem;
    }

    .option-item {
      padding: 0.75rem;
    }

    .option-label {
      font-size: 0.9rem;
    }
  }
</style>