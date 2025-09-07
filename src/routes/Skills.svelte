<!-- Skills -->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  export let data: {
    strengths: string[];
    experienceLevel: string;
    technicalSkills: string[];
  } = {
    strengths: [],
    experienceLevel: '',
    technicalSkills: []
  };

  export let progressWidth = '75%';

  const strengthOptions = [
    { id: 'leadership', label: 'Leadership', value: 'leadership', icon: 'bx-crown' },
    { id: 'teamwork', label: 'Teamwork', value: 'teamwork', icon: 'bx-group' },
    { id: 'creativity', label: 'Creativity', value: 'creativity', icon: 'bx-palette' },
    { id: 'problem-solving', label: 'Problem Solving', value: 'problem-solving', icon: 'bx-cube' },
    { id: 'adaptability', label: 'Adaptability', value: 'adaptability', icon: 'bx-reset' },
    { id: 'communication', label: 'Communication', value: 'communication', icon: 'bx-chat' },
    { id: 'time-management', label: 'Time Management', value: 'time-management', icon: 'bx-time' },
    { id: 'critical-thinking', label: 'Critical Thinking', value: 'critical-thinking', icon: 'bx-brain' }
  ];

  const experienceOptions = [
    { id: 'intern', label: 'Intern/Student', value: 'intern', description: 'Limited professional experience', icon: 'bx-user-pin' },
    { id: 'junior', label: 'Junior (0-2 years)', value: 'junior', description: 'Early career professional', icon: 'bx-user' },
    { id: 'mid', label: 'Mid-level (2-5 years)', value: 'mid', description: 'Experienced professional', icon: 'bx-user-voice' },
    { id: 'senior', label: 'Senior (5+ years)', value: 'senior', description: 'Seasoned expert', icon: 'bx-user-check' },
    { id: 'executive', label: 'Executive/Manager', value: 'executive', description: 'Leadership role', icon: 'bx-trending-up' }
  ];

  const technicalSkillCategories = [
    {
      name: 'Technical',
      icon: 'bx-code-alt',
      skills: [
        { id: 'data-analysis', label: 'Data Analysis', value: 'data-analysis' },
        { id: 'programming', label: 'Programming', value: 'programming' },
        { id: 'ai-ml', label: 'AI/ML', value: 'ai-ml' },
        { id: 'cloud-computing', label: 'Cloud Computing', value: 'cloud-computing' },
        { id: 'cybersecurity', label: 'Cybersecurity', value: 'cybersecurity' },
        { id: 'technical-writing', label: 'Technical Writing', value: 'technical-writing' }
      ]
    },
    {
      name: 'Business',
      icon: 'bx-building',
      skills: [
        { id: 'financial-skills', label: 'Financial Skills', value: 'financial-skills' },
        { id: 'project-management', label: 'Project Management', value: 'project-management' },
        { id: 'business-analysis', label: 'Business Analysis', value: 'business-analysis' },
        { id: 'marketing', label: 'Marketing', value: 'marketing' }
      ]
    },
    {
      name: 'Creative',
      icon: 'bx-palette',
      skills: [
        { id: 'design-skills', label: 'Design Skills', value: 'design-skills' },
        { id: 'video-editing', label: 'Video Editing', value: 'video-editing' },
        { id: 'graphic-design', label: 'Graphic Design', value: 'graphic-design' }
      ]
    },
    {
      name: 'Industrial',
      icon: 'bx-cog',
      skills: [
        { id: 'equipment-operation', label: 'Equipment Operation', value: 'equipment-operation' },
        { id: 'quality-control', label: 'Quality Control', value: 'quality-control' },
        { id: 'safety-procedures', label: 'Safety Procedures', value: 'safety-procedures' },
        { id: 'technical-drawing', label: 'Technical Drawing', value: 'technical-drawing' },
        { id: 'manufacturing-processes', label: 'Manufacturing Processes', value: 'manufacturing-processes' },
        { id: 'laboratory-techniques', label: 'Laboratory Techniques', value: 'laboratory-techniques' }
      ]
    }
  ];

  // Search functionality
  let searchQuery = '';
  let filteredCategories = [...technicalSkillCategories];
  
  // Function to filter skills based on search query
  function filterSkills() {
    if (!searchQuery.trim()) {
      filteredCategories = [...technicalSkillCategories];
      return;
    }
    
    const query = searchQuery.toLowerCase().trim();
    filteredCategories = technicalSkillCategories.map(category => {
      const filteredSkills = category.skills.filter(skill => 
        skill.label.toLowerCase().includes(query) || 
        skill.value.toLowerCase().includes(query) ||
        category.name.toLowerCase().includes(query)
      );
      
      return {
        ...category,
        skills: filteredSkills
      };
    }).filter(category => category.skills.length > 0);
  }
  
  // Handle search input
  function handleSearch(event: Event) {
    searchQuery = (event.target as HTMLInputElement).value;
    filterSkills();
  }

  function handleMultiSelect(field: string[], value: string, max: number) {
    const index = field.indexOf(value);
    if (index === -1) {
      if (field.length < max) return [...field, value];
      alert(`Maximum ${max} selections allowed`);
      return field;
    }
    return field.filter(item => item !== value);
  }

  function handleStrengthChange(value: string) {
    data.strengths = handleMultiSelect(data.strengths, value, 3);
  }

  function handleTechnicalSkillChange(value: string) {
    data.technicalSkills = handleMultiSelect(data.technicalSkills, value, 6);
  }

  function goNext() {
    if (data.strengths.length === 0) {
      alert('Please select at least one strength');
      return;
    }
    if (!data.experienceLevel) {
      alert('Please select your experience level');
      return;
    }
    if (data.technicalSkills.length === 0) {
      alert('Please select at least one technical skill');
      return;
    }
    
    dispatch('complete', {
      strengths: data.strengths,
      experienceLevel: data.experienceLevel,
      technicalSkills: data.technicalSkills
    });
  }

  function goBack() {
    dispatch('back');
  }

  function isStrengthDisabled(value: string) {
    return data.strengths.length >= 3 && !data.strengths.includes(value);
  }

  function isTechnicalSkillDisabled(value: string) {
    return data.technicalSkills.length >= 6 && !data.technicalSkills.includes(value);
  }

  function getStrengthLabel(value: string) {
    return strengthOptions.find(option => option.value === value)?.label || value;
  }

  function getStrengthIcon(value: string) {
    return strengthOptions.find(option => option.value === value)?.icon || '';
  }

  function getExperienceLabel(value: string) {
    return experienceOptions.find(option => option.value === value)?.label || value;
  }

  function getExperienceIcon(value: string) {
    return experienceOptions.find(option => option.value === value)?.icon || '';
  }
</script>

<div class="skills-page">
  <div class="skills-header">
    <div class="header-content">
      <h1>Skills & Strengths</h1>
      <p>Showcase your professional capabilities and expertise</p>
    </div>
  </div>

  <div class="center-container">
    <section class="skills-content">
      <div class="progress-container">
        <div class="progress-bar">
          <div class="progress-fill" style="width: {progressWidth}"></div>
        </div>
        <div class="progress-text">Step 1 of 3</div>
      </div>

      <h2>Build Your Professional Profile</h2>

      <!-- Selected Preview -->
      {#if data.strengths.length > 0 || data.experienceLevel || data.technicalSkills.length > 0}
        <div class="selection-preview">
          <div class="preview-header">
            <i class='bx bx-check-circle'></i>
            <h3>Your Selections</h3>
          </div>
          <div class="preview-items">
            {#if data.strengths.length > 0}
              <div class="preview-category">
                <h4>Strengths</h4>
                <div class="preview-tags">
                  {#each data.strengths as strength}
                    <span class="preview-tag">
                      <i class='bx {getStrengthIcon(strength)}'></i> {getStrengthLabel(strength)}
                    </span>
                  {/each}
                </div>
              </div>
            {/if}
            
            {#if data.experienceLevel}
              <div class="preview-category">
                <h4>Experience</h4>
                <div class="preview-tags">
                  <span class="preview-tag">
                    <i class='bx {getExperienceIcon(data.experienceLevel)}'></i> {getExperienceLabel(data.experienceLevel)}
                  </span>
                </div>
              </div>
            {/if}
            
            {#if data.technicalSkills.length > 0}
              <div class="preview-category">
                <h4>Skills</h4>
                <div class="preview-tags">
                  {#each data.technicalSkills as skill}
                    <span class="preview-tag">
                      {skill.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </span>
                  {/each}
                </div>
              </div>
            {/if}
          </div>
        </div>
      {/if}

      <!-- Strengths -->
      <div class="question-card">
        <div class="question-header">
          <div class="question-title">
            <i class='bx bx-star'></i>
            <h3>What are your top strengths? <span class="limit-text">(Select up to 3)</span></h3>
          </div>
          <div class="tooltip">
            <i class='bx bx-info-circle'></i>
            <span class="tooltiptext">Select the qualities that best represent your professional strengths</span>
          </div>
        </div>
        <p class="question-description">These personal attributes will help employers understand your work style</p>
        <div class="options-grid strength-options">
          {#each strengthOptions as option}
            <label class="option-card {isStrengthDisabled(option.value) ? 'disabled' : ''} {data.strengths.includes(option.value) ? 'selected' : ''}">
              <input
                type="checkbox"
                value={option.value}
                checked={data.strengths.includes(option.value)}
                on:change={() => handleStrengthChange(option.value)}
                disabled={isStrengthDisabled(option.value)}
              />
              <div class="option-content">
                <div class="option-icon">
                  <i class='bx {option.icon}'></i>
                </div>
                <div class="option-details">
                  <span class="option-label">{option.label}</span>
                </div>
                <div class="checkmark">
                  <i class='bx bx-check'></i>
                </div>
              </div>
            </label>
          {/each}
        </div>
        {#if data.strengths.length > 0}
          <div class="selection-count">
            <i class='bx bx-check-square'></i> Selected: {data.strengths.length}/3
          </div>
        {/if}
      </div>

      <!-- Experience -->
      <div class="question-card">
        <div class="question-header">
          <div class="question-title">
            <i class='bx bx-briefcase'></i>
            <h3>What's your professional experience level?</h3>
          </div>
        </div>
        <p class="question-description">This helps match you with appropriate opportunities</p>
        <div class="options-grid experience-options">
          {#each experienceOptions as option}
            <label class="option-card {data.experienceLevel === option.value ? 'selected' : ''}">
              <input
                type="radio"
                name="experience"
                value={option.value}
                bind:group={data.experienceLevel}
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

      <!-- Technical Skills -->
      <div class="question-card">
        <div class="question-header">
          <div class="question-title">
            <i class='bx bx-wrench'></i>
            <h3>Select your technical/professional skills <span class="limit-text">(Select up to 6)</span></h3>
          </div>
          <div class="tooltip">
            <i class='bx bx-info-circle'></i>
            <span class="tooltiptext">Choose skills relevant to your field. You can search for specific skills.</span>
          </div>
        </div>
        <p class="question-description">These are specialized skills related to your field or profession</p>
        
        <div class="search-box">
          <i class='bx bx-search'></i>
          <input 
            type="text" 
            placeholder="Search skills..." 
            class="skill-search" 
            bind:value={searchQuery}
            on:input={handleSearch}
          />
        </div>
        
        {#if searchQuery && filteredCategories.length === 0}
          <div class="no-results">
            <i class='bx bx-search-alt'></i>
            <p>No skills found for "{searchQuery}"</p>
            <small>Try a different search term or browse the categories below</small>
          </div>
        {/if}
        
        <div class="skill-categories">
          {#each filteredCategories as category}
            <div class="skill-category">
              <h4 class="category-title">
                <i class='bx {category.icon}'></i> {category.name}
                {#if searchQuery}
                  <span class="match-count">({category.skills.length} match{#if category.skills.length !== 1}es{/if})</span>
                {/if}
              </h4>
              <div class="options-grid skill-options">
                {#each category.skills as option}
                  <label class="option-card {isTechnicalSkillDisabled(option.value) ? 'disabled' : ''} {data.technicalSkills.includes(option.value) ? 'selected' : ''}">
                    <input
                      type="checkbox"
                      value={option.value}
                      checked={data.technicalSkills.includes(option.value)}
                      on:change={() => handleTechnicalSkillChange(option.value)}
                      disabled={isTechnicalSkillDisabled(option.value)}
                    />
                    <div class="option-content">
                      <span class="option-label">{option.label}</span>
                      <div class="checkmark">
                        <i class='bx bx-check'></i>
                      </div>
                    </div>
                  </label>
                {/each}
              </div>
            </div>
          {/each}
        </div>
        {#if data.technicalSkills.length > 0}
          <div class="selection-count">
            <i class='bx bx-check-square'></i> Selected: {data.technicalSkills.length}/6
          </div>
        {/if}
      </div>

      <!-- Navigation -->
      <div class="navigation-buttons">
        <button class="nav-button secondary" on:click={goBack}>
          <i class='bx bx-chevron-left'></i> Back
        </button>
        <button 
          class="nav-button primary" 
          on:click={goNext} 
          disabled={
            data.strengths.length === 0 ||
            !data.experienceLevel ||
            data.technicalSkills.length === 0
          }
        >
          Next <i class='bx bx-chevron-right'></i>
        </button>
      </div>
    </section>
  </div>
</div>

<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
  @import url('https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css');

  .skills-page {
    min-height: 100vh;
    padding: 0;
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    font-family: 'Inter', sans-serif;
    color: #1e293b;
  }

  .skills-header {
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

  .skills-header h1 {
    font-size: 1.875rem;
    margin-bottom: 0.5rem;
    font-weight: 700;
    letter-spacing: -0.025em;
  }

  .skills-header p {
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

  .skills-content {
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

  .skills-content h2 {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
    text-align: center;
    color: #1e293b;
    position: relative;
    padding-bottom: 0.75rem;
  }

  .skills-content h2::after {
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
    background: linear-gradient(135deg, #4f46e5 0%, '7c3aed' 100%);
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

  /* Search Box */
  .search-box {
    position: relative;
    margin-bottom: 1.5rem;
    max-width: 400px;
  }

  .search-box i {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: #94a3b8;
  }

  .skill-search {
    width: 100%;
    padding: 0.75rem 1rem 0.75rem 2.75rem;
    border: 1px solid #e2e8f0;
    border-radius: 0.5rem;
    font-size: 0.95rem;
    transition: all 0.2s;
  }

  .skill-search:focus {
    outline: none;
    border-color: #4f46e5;
    box-shadow: 0 0 0 2px #c7d2fe;
  }

  /* No results message */
  .no-results {
    text-align: center;
    padding: 2rem;
    color: #64748b;
    background-color: #f8fafc;
    border-radius: 0.75rem;
    margin-bottom: 1.5rem;
  }

  .no-results i {
    font-size: 3rem;
    color: #cbd5e1;
    margin-bottom: 1rem;
    display: block;
  }

  .no-results p {
    font-size: 1.1rem;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }

  .no-results small {
    font-size: 0.9rem;
  }

  /* Skill Categories */
  .skill-categories {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .skill-category {
    background-color: #f8fafc;
    border-radius: 0.75rem;
    padding: 1.25rem;
    border: 1px solid #e2e8f0;
  }

  .category-title {
    font-size: 0.95rem;
    font-weight: 600;
    color: #4f46e5;
    margin-bottom: 0.75rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px dashed #cbd5e1;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .category-title i {
    font-size: 1.1rem;
  }

  .match-count {
    font-size: 0.8rem;
    color: #64748b;
    font-weight: normal;
    margin-left: auto;
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
    .skills-page {
      padding: 0;
    }

    .skills-header {
      padding: 1.5rem 1rem;
      border-radius: 0;
    }

    .skills-header h1 {
      font-size: 1.5rem;
    }

    .skills-content {
      padding: 1.75rem;
      margin: 0 0.5rem;
    }

    .preview-items {
      flex-direction: column;
    }

    .options-grid {
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
    .skills-content {
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