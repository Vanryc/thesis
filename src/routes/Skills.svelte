<!-- Skills -->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  export let data: {
    strengths: string[];
    experienceLevel: string;
    technicalSkills: string[];
    certifications: string;
  } = {
    strengths: [],
    experienceLevel: '',
    technicalSkills: [],
    certifications: ''
  };

  export let progressWidth = '75%';

  const strengthOptions = [
    { id: 'leadership', label: 'Leadership', value: 'leadership', icon: '👑' },
    { id: 'teamwork', label: 'Teamwork', value: 'teamwork', icon: '🤝' },
    { id: 'creativity', label: 'Creativity', value: 'creativity', icon: '🎨' },
    { id: 'problem-solving', label: 'Problem Solving', value: 'problem-solving', icon: '🧩' },
    { id: 'adaptability', label: 'Adaptability', value: 'adaptability', icon: '🔄' },
    { id: 'communication', label: 'Communication', value: 'communication', icon: '💬' },
    { id: 'time-management', label: 'Time Management', value: 'time-management', icon: '⏱️' },
    { id: 'critical-thinking', label: 'Critical Thinking', value: 'critical-thinking', icon: '🧠' }
  ];

  const experienceOptions = [
    { id: 'intern', label: 'Intern/Student', value: 'intern', description: 'Limited professional experience' },
    { id: 'junior', label: 'Junior (0-2 years)', value: 'junior', description: 'Early career professional' },
    { id: 'mid', label: 'Mid-level (2-5 years)', value: 'mid', description: 'Experienced professional' },
    { id: 'senior', label: 'Senior (5+ years)', value: 'senior', description: 'Seasoned expert' },
    { id: 'executive', label: 'Executive/Manager', value: 'executive', description: 'Leadership role' }
  ];

  const technicalSkillCategories = [
    {
      name: 'Technical',
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
      skills: [
        { id: 'financial-skills', label: 'Financial Skills', value: 'financial-skills' },
        { id: 'project-management', label: 'Project Management', value: 'project-management' },
        { id: 'business-analysis', label: 'Business Analysis', value: 'business-analysis' },
        { id: 'marketing', label: 'Marketing', value: 'marketing' }
      ]
    },
    {
      name: 'Creative',
      skills: [
        { id: 'design-skills', label: 'Design Skills', value: 'design-skills' },
        { id: 'video-editing', label: 'Video Editing', value: 'video-editing' },
        { id: 'graphic-design', label: 'Graphic Design', value: 'graphic-design' }
      ]
    },
    {
      name: 'Industrial',
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

  function handleMultiSelect(field: string[], value: string, max: number) {
    const index = field.indexOf(value);
    if (index === -1) {
      if (field.length < max) return [...field, value];
      alert(`Maximum ${max} selections allowed`);
      return field;
    }
    return field.filter(item => item !== value);
  }

  function handleStrengthChange(event: Event) {
    const input = event.target as HTMLInputElement;
    data.strengths = handleMultiSelect(data.strengths, input.value, 3);
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
      technicalSkills: data.technicalSkills,
      certifications: data.certifications
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

  function getExperienceLabel(value: string) {
    return experienceOptions.find(option => option.value === value)?.label || value;
  }
</script>

<div class="skills-page">
  <div class="skills-header">
    <h1>Skills & Strengths</h1>
    <p>Showcase your professional capabilities and expertise</p>
  </div>

  <section class="skills-preferences">
    <div class="progress-bar">
      <div class="progress-fill" style="width: {progressWidth}"></div>
    </div>

    <h2>Build Your Professional Profile</h2>

    <!-- Selected Preview -->
    {#if data.strengths.length > 0 || data.experienceLevel || data.technicalSkills.length > 0}
      <div class="selection-preview">
        <h3>Your Selections</h3>
        <div class="preview-items">
          {#if data.strengths.length > 0}
            <div class="preview-category">
              <h4>Strengths:</h4>
              <div class="preview-tags">
                {#each data.strengths as strength}
                  <span class="preview-tag">
                    {strengthOptions.find(o => o.value === strength)?.icon} {getStrengthLabel(strength)}
                  </span>
                {/each}
              </div>
            </div>
          {/if}
          
          {#if data.experienceLevel}
            <div class="preview-category">
              <h4>Experience:</h4>
              <div class="preview-tags">
                <span class="preview-tag">{getExperienceLabel(data.experienceLevel)}</span>
              </div>
            </div>
          {/if}
          
          {#if data.technicalSkills.length > 0}
            <div class="preview-category">
              <h4>Skills:</h4>
              <div class="preview-tags">
                {#each data.technicalSkills as skill}
                  <span class="preview-tag">{skill.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</span>
                {/each}
              </div>
            </div>
          {/if}
        </div>
      </div>
    {/if}

    <!-- Strengths -->
    <div class="question">
      <div class="question-header">
        <h3>What are your top strengths? (Select up to 3)</h3>
        <div class="tooltip">?
          <span class="tooltiptext">Select the qualities that best represent your professional strengths</span>
        </div>
      </div>
      <div class="options strength-options">
        {#each strengthOptions as option}
          <label class="option-item {isStrengthDisabled(option.value) ? 'disabled' : ''}">
            <input
              type="checkbox"
              value={option.value}
              checked={data.strengths.includes(option.value)}
              on:change={handleStrengthChange}
              disabled={isStrengthDisabled(option.value)}
            />
            <span class="option-icon">{option.icon}</span>
            <span class="option-label">{option.label}</span>
          </label>
        {/each}
      </div>
      {#if data.strengths.length > 0}
        <div class="selection-count">Selected: {data.strengths.length}/3</div>
      {/if}
    </div>

    <!-- Experience -->
    <div class="question">
      <h3>What's your professional experience level?</h3>
      <div class="options experience-options">
        {#each experienceOptions as option}
          <label class="option-item">
            <input
              type="radio"
              name="experience"
              value={option.value}
              bind:group={data.experienceLevel}
            />
            <div class="experience-details">
              <span class="option-label">{option.label}</span>
              <span class="experience-description">{option.description}</span>
            </div>
          </label>
        {/each}
      </div>
    </div>

    <!-- Technical Skills -->
    <div class="question">
      <div class="question-header">
        <h3>Select your technical/professional skills (up to 6)</h3>
        <div class="tooltip">?
          <span class="tooltiptext">Choose skills relevant to your field. You can search for specific skills.</span>
        </div>
      </div>
      <p class="skill-description">These are specialized skills related to your field or profession</p>
      
      <div class="search-box">
        <input type="text" placeholder="Search skills..." class="skill-search" />
      </div>
      
      <div class="skill-categories">
        {#each technicalSkillCategories as category}
          <div class="skill-category">
            <h4 class="category-title">{category.name}</h4>
            <div class="options skill-options">
              {#each category.skills as option}
                <label class="option-item {isTechnicalSkillDisabled(option.value) ? 'disabled' : ''}">
                  <input
                    type="checkbox"
                    value={option.value}
                    checked={data.technicalSkills.includes(option.value)}
                    on:change={() => handleTechnicalSkillChange(option.value)}
                    disabled={isTechnicalSkillDisabled(option.value)}
                  />
                  <span class="option-label">{option.label}</span>
                </label>
              {/each}
            </div>
          </div>
        {/each}
      </div>
      {#if data.technicalSkills.length > 0}
        <div class="selection-count">Selected: {data.technicalSkills.length}/6</div>
      {/if}
    </div>

    <!-- Certifications -->
    <div class="question">
      <h3>Any relevant certifications? (Optional)</h3>
      <p class="skill-description">List any professional certifications you've earned (comma separated)</p>
      <textarea
        bind:value={data.certifications}
        placeholder="e.g., PMP, AWS Certified, Google Analytics..."
        class="certifications-input"
      ></textarea>
    </div>

    <!-- Navigation -->
    <div class="navigation-buttons">
      <button class="nav-button secondary" on:click={goBack}>
        <span class="button-icon">←</span> Back
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
        Next <span class="button-icon">→</span>
      </button>
    </div>
  </section>
</div>

<style>
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

  .skills-page {
    min-height: 100vh;
    padding: 0;
    background-color: #f8fafc;
    font-family: 'Poppins', sans-serif;
    color: #1e293b;
  }

  .skills-header {
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
    color: white;
    text-align: center;
    padding: 2rem 1.5rem;
    margin-bottom: 2rem;
    border-radius: 0 0 1.5rem 1.5rem;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  }

  .skills-header h1 {
    font-size: 1.75rem;
    margin-bottom: 0.5rem;
    font-weight: 600;
  }

  .skills-header p {
    margin: 0;
    opacity: 0.9;
    font-size: 1rem;
    max-width: 600px;
    margin: 0 auto;
  }

  .skills-preferences {
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

  .skills-preferences h2 {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
    text-align: center;
    color: #1e293b;
    position: relative;
  }

  .skills-preferences h2::after {
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
    margin-bottom: 1rem;
  }

  .question h3 {
    font-size: 1.1rem;
    margin-bottom: 0;
    color: #1e293b;
    font-weight: 500;
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

  .skill-description {
    font-size: 0.85rem;
    color: #64748b;
    margin-top: -0.5rem;
    margin-bottom: 1rem;
    line-height: 1.5;
  }

  .options {
    background-color: #f8fafc;
    border-radius: 0.75rem;
    padding: 1rem;
    border: 1px solid #e2e8f0;
  }

  .strength-options {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 0.75rem;
  }

  .experience-options {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
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
    margin-right: 0.5rem;
    font-size: 1.1rem;
  }

  .option-label {
    cursor: pointer;
    flex: 1;
    font-size: 0.95rem;
    color: #1e293b;
    font-weight: 500;
  }

  .experience-details {
    display: flex;
    flex-direction: column;
  }

  .experience-description {
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

  /* Skill Search and Categories */
  .search-box {
    margin-bottom: 1rem;
  }

  .skill-search {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 1px solid #e2e8f0;
    border-radius: 0.5rem;
    font-size: 0.95rem;
    transition: all 0.2s;
  }

  .skill-search:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 2px #bfdbfe;
  }

  .skill-categories {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .skill-category {
    background-color: #f8fafc;
    border-radius: 0.75rem;
    padding: 1rem;
    border: 1px solid #e2e8f0;
  }

  .category-title {
    font-size: 0.95rem;
    font-weight: 600;
    color: #2563eb;
    margin-bottom: 0.75rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px dashed #cbd5e1;
  }

  .skill-options {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 0.5rem;
    background: transparent;
    padding: 0;
    border: none;
  }

  /* Certifications */
  .certifications-input {
    width: 100%;
    min-height: 100px;
    padding: 1rem;
    border: 1px solid #e2e8f0;
    border-radius: 0.5rem;
    font-family: 'Poppins', sans-serif;
    font-size: 0.95rem;
    resize: vertical;
    transition: all 0.2s;
  }

  .certifications-input:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 2px #bfdbfe;
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

    .skills-preferences {
      margin: 0 1rem;
      padding: 1.75rem;
      top: 0;
      border-radius: 0.75rem;
    }

    .preview-items {
      flex-direction: column;
    }

    .strength-options {
      grid-template-columns: 1fr;
    }

    .skill-options {
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
    .skills-preferences {
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