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

  export let progressWidth = '50%';

  const strengthOptions = [
    { id: 'leadership', label: 'Leadership', value: 'leadership' },
    { id: 'teamwork', label: 'Teamwork', value: 'teamwork' },
    { id: 'creativity', label: 'Creativity', value: 'creativity' },
    { id: 'problem-solving', label: 'Problem Solving', value: 'problem-solving' },
    { id: 'adaptability', label: 'Adaptability', value: 'adaptability' },
    { id: 'communication', label: 'Communication', value: 'communication' }
  ];

  const experienceOptions = [
    { id: 'junior', label: 'Junior (0-2 years)', value: 'junior' },
    { id: 'mid', label: 'Mid-level (2-5 years)', value: 'mid' },
    { id: 'senior', label: 'Senior (5+ years)', value: 'senior' }
  ];

  const technicalSkillOptions = [
    { id: 'data-analysis', label: 'Data Analysis', value: 'data-analysis' },
    { id: 'financial-skills', label: 'Financial Skills', value: 'financial-skills' },
    { id: 'project-management', label: 'Project Management', value: 'project-management' },
    { id: 'technical-writing', label: 'Technical Writing', value: 'technical-writing' },
    { id: 'design-skills', label: 'Design Skills', value: 'design-skills' },
    { id: 'research-methods', label: 'Research Methods', value: 'research-methods' },
    { id: 'equipment-operation', label: 'Equipment Operation', value: 'equipment-operation' },
    { id: 'quality-control', label: 'Quality Control', value: 'quality-control' },
    { id: 'safety-procedures', label: 'Safety Procedures', value: 'safety-procedures' },
    { id: 'technical-drawing', label: 'Technical Drawing', value: 'technical-drawing' },
    { id: 'manufacturing-processes', label: 'Manufacturing Processes', value: 'manufacturing-processes' },
    { id: 'laboratory-techniques', label: 'Laboratory Techniques', value: 'laboratory-techniques' }
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
    data.strengths = handleMultiSelect(data.strengths, input.value, 2);
  }

  function goNext() {
    if (data.strengths.length === 0 || data.technicalSkills.length === 0 || !data.experienceLevel) {
      alert('Please complete all sections');
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
    return data.strengths.length >= 2 && !data.strengths.includes(value);
  }
</script>

<div class="skills-page">
  <div class="skills-header">
    <h1>Skills & Strengths</h1>
    <p>Tell us about your key strengths, experience level, and technical skills</p>
  </div>

  <section class="skills-preferences">
    <div class="progress-bar">
      <div class="progress-fill" style="width: {progressWidth}"></div>
    </div>

    <h2>Your Professional Profile</h2>

    <!-- Strengths -->
    <div class="question">
      <h3>Which best describes your strengths? (Pick 2)</h3>
      <div class="options">
        {#each strengthOptions as option}
          <label class="option-item" class:disabled={isStrengthDisabled(option.value)}>
            <input
              type="checkbox"
              value={option.value}
              checked={data.strengths.includes(option.value)}
              on:change={handleStrengthChange}
              disabled={isStrengthDisabled(option.value)}
            />
            <span class="option-label">{option.label}</span>
          </label>
        {/each}
      </div>
      {#if data.strengths.length > 0}
        <div class="selection-count">Selected: {data.strengths.length}/2</div>
      {/if}
    </div>

    <!-- Experience -->
    <div class="question">
      <h3>What's your experience level?</h3>
      <div class="options">
        {#each experienceOptions as option}
          <label class="option-item">
            <input
              type="radio"
              name="experience"
              value={option.value}
              bind:group={data.experienceLevel}
            />
            <span class="option-label">{option.label}</span>
          </label>
        {/each}
      </div>
    </div>

    <!-- Technical Skills -->
    <div class="question">
      <h3>Select your technical/professional skills (up to 5)</h3>
      <p class="skill-description">These are specialized skills related to your field or profession</p>
      <div class="options">
        {#each technicalSkillOptions as option}
          <label class="option-item">
            <input
              type="checkbox"
              checked={data.technicalSkills.includes(option.value)}
              on:change={() =>
                data.technicalSkills = handleMultiSelect(data.technicalSkills, option.value, 5)
              }
            />
            <span class="option-label">{option.label}</span>
          </label>
        {/each}
      </div>
    </div>

    <!-- Navigation -->
    <div class="navigation-buttons">
      <button class="nav-button secondary" on:click={goBack}>Back</button>
      <button 
        class="nav-button primary" 
        on:click={goNext} 
        disabled={
          data.strengths.length === 0 ||
          !data.experienceLevel ||
          data.technicalSkills.length === 0
        }
      >
        Next
      </button>
    </div>
  </section>
</div>

<style>
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap');

  .skills-page {
    min-height: 100vh;
    padding: 2rem 0;
    background-color: #f5f7fb;
    font-family: 'Poppins', sans-serif;
  }

  .skills-header {
    background-color: #2563eb;
    color: white;
    text-align: center;
    padding: 1.5rem;
    margin-bottom: 2rem;
  }

  .skills-header h1 {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
    font-weight: 600;
  }

  .skills-header p {
    margin: 0;
    opacity: 0.9;
    font-size: 0.9rem;
  }

  .skills-preferences {
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
  }

  .skills-preferences h2 {
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

  .skill-description {
    font-size: 0.85rem;
    color: #6b7280;
    margin-top: -0.5rem;
    margin-bottom: 1rem;
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

  .nav-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .skills-page {
      padding: 1rem 0;
    }

    .skills-header {
      padding: 1rem;
    }

    .skills-header h1 {
      font-size: 1.25rem;
    }

    .skills-preferences {
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
    .skills-preferences {
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