<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  export let data: {
    workSetting: string;
    stressHandling: string;
    collaborationPreference: string;
    workSchedule: string;
    managementPreference: string;
    workPace: string;
  } = {
    workSetting: '',
    stressHandling: '',
    collaborationPreference: '',
    workSchedule: '',
    managementPreference: '',
    workPace: ''
  };

  export let progressWidth = '75%';
  export let isLoading = false;

  const workSettingOptions = [
    { id: 'remote', label: 'Remote', value: 'remote', icon: 'bx-home', description: 'Work from home full-time' },
    { id: 'office', label: 'Office', value: 'office', icon: 'bx-building', description: 'Work in a traditional office' },
    { id: 'hybrid', label: 'Hybrid', value: 'hybrid', icon: 'bx-home-smile', description: 'Mix of office and remote' },
    { id: 'outdoors', label: 'Outdoors', value: 'outdoors', icon: 'bx-street-view', description: 'Work outside or on-site' },
    { id: 'flexible', label: 'Flexible', value: 'flexible', icon: 'bx-reset', description: 'No strong preference' }
  ];

  const stressHandlingOptions = [
    { id: 'thrive', label: 'Thrive under pressure', value: 'thrive', icon: 'bx-trending-up', description: 'I perform best with tight deadlines' },
    { id: 'calm', label: 'Prefer calm environments', value: 'calm', icon: 'bx-spa', description: 'I work best with minimal stress' },
    { id: 'adaptable', label: 'Adaptable', value: 'adaptable', icon: 'bx-reset', description: 'I can handle both calm and high-pressure situations' }
  ];

  const collaborationOptions = [
    { id: 'team', label: 'Team collaboration', value: 'team', icon: 'bx-group', description: 'I prefer working closely with others' },
    { id: 'solo', label: 'Independent work', value: 'solo', icon: 'bx-user', description: 'I prefer working alone' },
    { id: 'mixed', label: 'Mix of both', value: 'mixed', icon: 'bx-user-plus', description: 'I enjoy a balance of both' }
  ];

  const scheduleOptions = [
    { id: 'fixed', label: 'Fixed schedule', value: 'fixed', icon: 'bx-time-five', description: 'I prefer consistent working hours' },
    { id: 'flexible', label: 'Flexible hours', value: 'flexible', icon: 'bx-time', description: 'I prefer setting my own hours' },
    { id: 'shift', label: 'Shift work', value: 'shift', icon: 'bx-rotate-right', description: 'I can work rotating shifts' },
    { id: 'results', label: 'Results-oriented', value: 'results', icon: 'bx-target-lock', description: 'I focus on deliverables not hours' }
  ];

  const managementOptions = [
    { id: 'structured', label: 'Structured', value: 'structured', icon: 'bx-list-check', description: 'Clear guidance and processes' },
    { id: 'autonomous', label: 'Autonomous', value: 'autonomous', icon: 'bx-run', description: 'Freedom to make decisions' },
    { id: 'mentorship', label: 'Mentorship', value: 'mentorship', icon: 'bx-user-voice', description: 'Regular feedback and coaching' },
    { id: 'collaborative', label: 'Collaborative', value: 'collaborative', icon: 'bx-chat', description: 'Shared decision making' }
  ];

  const paceOptions = [
    { id: 'fast', label: 'Fast-paced', value: 'fast', icon: 'bx-tachometer', description: 'Dynamic, rapidly changing' },
    { id: 'steady', label: 'Steady', value: 'steady', icon: 'bx-line-chart', description: 'Consistent, predictable' },
    { id: 'variable', label: 'Variable', value: 'variable', icon: 'bx-trending-up', description: 'Mix of busy and quiet periods' }
  ];

  function goBack() {
    dispatch('back');
  }

  function completeQuestionnaire() {
    const requiredFields = [
      { field: data.workSetting, name: 'work setting' },
      { field: data.stressHandling, name: 'stress handling' },
      { field: data.collaborationPreference, name: 'collaboration preference' },
      { field: data.workSchedule, name: 'work schedule' },
      { field: data.managementPreference, name: 'management preference' },
      { field: data.workPace, name: 'work pace' }
    ];
    
    for (const { field, name } of requiredFields) {
      if (!field) {
        alert(`Please select your ${name}`);
        return;
      }
    }

    dispatch('complete', {
      workSetting: data.workSetting,
      stressHandling: data.stressHandling,
      collaborationPreference: data.collaborationPreference,
      workSchedule: data.workSchedule,
      managementPreference: data.managementPreference,
      workPace: data.workPace
    });
  }

  function getOptionLabel(options: any[], value: string) {
    return options.find(option => option.value === value)?.label || value;
  }

  function getOptionIcon(options: any[], value: string) {
    return options.find(option => option.value === value)?.icon || '';
  }
</script>

<div class="work-page">
  <div class="work-header">
    <div class="header-content">
      <h1>Work Preferences</h1>
      <p>Tell us about your ideal work environment and preferences</p>
    </div>
  </div>

  <div class="center-container">
    <section class="work-content">
      <div class="progress-container">
        <div class="progress-bar">
          <div class="progress-fill" style="width: {progressWidth}"></div>
        </div>
        <div class="progress-text">Step 2 of 3</div>
      </div>

      <h2>Your Ideal Work Environment</h2>

      <!-- Selected Preview -->
      {#if data.workSetting || data.stressHandling || data.collaborationPreference || data.workSchedule || data.managementPreference || data.workPace}
        <div class="selection-preview">
          <div class="preview-header">
            <i class='bx bx-check-circle'></i>
            <h3>Your Selections</h3>
          </div>
          <div class="preview-items">
            {#if data.workSetting}
              <div class="preview-category">
                <h4>Work Setting</h4>
                <div class="preview-tags">
                  <span class="preview-tag">
                    <i class='bx {getOptionIcon(workSettingOptions, data.workSetting)}'></i> {getOptionLabel(workSettingOptions, data.workSetting)}
                  </span>
                </div>
              </div>
            {/if}
            
            {#if data.stressHandling}
              <div class="preview-category">
                <h4>Stress Handling</h4>
                <div class="preview-tags">
                  <span class="preview-tag">
                    <i class='bx {getOptionIcon(stressHandlingOptions, data.stressHandling)}'></i> {getOptionLabel(stressHandlingOptions, data.stressHandling)}
                  </span>
                </div>
              </div>
            {/if}

            {#if data.collaborationPreference}
              <div class="preview-category">
                <h4>Collaboration</h4>
                <div class="preview-tags">
                  <span class="preview-tag">
                    <i class='bx {getOptionIcon(collaborationOptions, data.collaborationPreference)}'></i> {getOptionLabel(collaborationOptions, data.collaborationPreference)}
                  </span>
                </div>
              </div>
            {/if}

            {#if data.workSchedule}
              <div class="preview-category">
                <h4>Schedule</h4>
                <div class="preview-tags">
                  <span class="preview-tag">
                    <i class='bx {getOptionIcon(scheduleOptions, data.workSchedule)}'></i> {getOptionLabel(scheduleOptions, data.workSchedule)}
                  </span>
                </div>
              </div>
            {/if}

            {#if data.managementPreference}
              <div class="preview-category">
                <h4>Management</h4>
                <div class="preview-tags">
                  <span class="preview-tag">
                    <i class='bx {getOptionIcon(managementOptions, data.managementPreference)}'></i> {getOptionLabel(managementOptions, data.managementPreference)}
                  </span>
                </div>
              </div>
            {/if}

            {#if data.workPace}
              <div class="preview-category">
                <h4>Work Pace</h4>
                <div class="preview-tags">
                  <span class="preview-tag">
                    <i class='bx {getOptionIcon(paceOptions, data.workPace)}'></i> {getOptionLabel(paceOptions, data.workPace)}
                  </span>
                </div>
              </div>
            {/if}
          </div>
        </div>
      {/if}

      <!-- Work Setting Question -->
      <div class="question-card">
        <div class="question-header">
          <div class="question-title">
            <i class='bx bx-building-house'></i>
            <h3>What is your preferred work setting?</h3>
          </div>
          <div class="tooltip">
            <i class='bx bx-info-circle'></i>
            <span class="tooltiptext">Select the environment where you're most productive</span>
          </div>
        </div>
        <p class="question-description">This helps us understand your ideal physical work environment</p>
        <div class="options-grid">
          {#each workSettingOptions as option}
            <label class="option-card {data.workSetting === option.value ? 'selected' : ''}">
              <input
                type="radio"
                name="workSetting"
                value={option.value}
                bind:group={data.workSetting}
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

      <!-- Stress Handling Question -->
      <div class="question-card">
        <div class="question-header">
          <div class="question-title">
            <i class='bx bx-brain'></i>
            <h3>How do you handle stress at work?</h3>
          </div>
          <div class="tooltip">
            <i class='bx bx-info-circle'></i>
            <span class="tooltiptext">Select how you typically perform under pressure</span>
          </div>
        </div>
        <div class="options-grid">
          {#each stressHandlingOptions as option}
            <label class="option-card {data.stressHandling === option.value ? 'selected' : ''}">
              <input
                type="radio"
                name="stressHandling"
                value={option.value}
                bind:group={data.stressHandling}
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

      <!-- Collaboration Preference Question -->
      <div class="question-card">
        <div class="question-header">
          <div class="question-title">
            <i class='bx bx-group'></i>
            <h3>How do you prefer to collaborate?</h3>
          </div>
          <div class="tooltip">
            <i class='bx bx-info-circle'></i>
            <span class="tooltiptext">Select your preferred way of working with others</span>
          </div>
        </div>
        <div class="options-grid">
          {#each collaborationOptions as option}
            <label class="option-card {data.collaborationPreference === option.value ? 'selected' : ''}">
              <input
                type="radio"
                name="collaboration"
                value={option.value}
                bind:group={data.collaborationPreference}
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

      <!-- Work Schedule Question -->
      <div class="question-card">
        <div class="question-header">
          <div class="question-title">
            <i class='bx bx-time'></i>
            <h3>What work schedule suits you best?</h3>
          </div>
          <div class="tooltip">
            <i class='bx bx-info-circle'></i>
            <span class="tooltiptext">Select your preferred working hours arrangement</span>
          </div>
        </div>
        <div class="options-grid">
          {#each scheduleOptions as option}
            <label class="option-card {data.workSchedule === option.value ? 'selected' : ''}">
              <input
                type="radio"
                name="schedule"
                value={option.value}
                bind:group={data.workSchedule}
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

      <!-- Management Preference Question -->
      <div class="question-card">
        <div class="question-header">
          <div class="question-title">
            <i class='bx bx-user-voice'></i>
            <h3>What management style do you prefer?</h3>
          </div>
          <div class="tooltip">
            <i class='bx bx-info-circle'></i>
            <span class="tooltiptext">Select how you like to be managed</span>
          </div>
        </div>
        <div class="options-grid">
          {#each managementOptions as option}
            <label class="option-card {data.managementPreference === option.value ? 'selected' : ''}">
              <input
                type="radio"
                name="management"
                value={option.value}
                bind:group={data.managementPreference}
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

      <!-- Work Pace Question -->
      <div class="question-card">
        <div class="question-header">
          <div class="question-title">
            <i class='bx bx-tachometer'></i>
            <h3>What work pace do you thrive in?</h3>
          </div>
          <div class="tooltip">
            <i class='bx bx-info-circle'></i>
            <span class="tooltiptext">Select the tempo that suits your working style</span>
          </div>
        </div>
        <div class="options-grid">
          {#each paceOptions as option}
            <label class="option-card {data.workPace === option.value ? 'selected' : ''}">
              <input
                type="radio"
                name="pace"
                value={option.value}
                bind:group={data.workPace}
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

      <!-- Navigation -->
      <div class="navigation-buttons">
        <button class="nav-button secondary" on:click={goBack} disabled={isLoading}>
          <i class='bx bx-chevron-left'></i> Back
        </button>
        <button
          class="nav-button primary"
          on:click={completeQuestionnaire}
          disabled={
            !data.workSetting ||
            !data.stressHandling ||
            !data.collaborationPreference ||
            !data.workSchedule ||
            !data.managementPreference ||
            !data.workPace ||
            isLoading
          }>
          {#if isLoading}
            <!-- Loading state with new SVG loader -->
            <div class="loader-container">
              <svg class="gegga">
                <defs>
                    <filter id="gegga">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="blur"></feGaussianBlur>
                        <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 20 -10" result="inreGegga"></feColorMatrix>
                        <feComposite in="SourceGraphic" in2="inreGegga" operator="atop"></feComposite>
                    </filter>
                </defs>
              </svg>
              <svg class="snurra" width="30" height="30" viewBox="0 0 200 200">
                <defs>
                    <linearGradient id="linjärGradient">
                        <stop class="stopp1" offset="0"></stop>
                        <stop class="stopp2" offset="1"></stop>
                    </linearGradient>
                    <linearGradient y2="160" x2="160" y1="40" x1="40" gradientUnits="userSpaceOnUse" id="gradient" xlink:href="#linjärGradient"></linearGradient>
                </defs>
                <path class="halvan" d="m 164,100 c 0,-35.346224 -28.65378,-64 -64,-64 -35.346224,0 -64,28.653776 -64,64 0,35.34622 28.653776,64 64,64 35.34622,0 64,-26.21502 64,-64 0,-37.784981 -26.92058,-64 -64,-64 -37.079421,0 -65.267479,26.922736 -64,64 1.267479,37.07726 26.703171,65.05317 64,64 37.29683,-1.05317 64,-64 64,-64"></path>
                <circle class="strecken" cx="100" cy="100" r="64"></circle>
              </svg>
              <svg class="skugga" width="30" height="30" viewBox="0 0 200 200">
                <path class="halvan" d="m 164,100 c 0,-35.346224 -28.65378,-64 -64,-64 -35.346224,0 -64,28.653776 -64,64 0,35.34622 28.653776,64 64,64 35.34622,0 64,-26.21502 64,-64 0,-37.784981 -26.92058,-64 -64,-64 -37.079421,0 -65.267479,26.922736 -64,64 1.267479,37.07726 26.703171,65.05317 64,64 37.29683,-1.05317 64,-64 64,-64"></path>
                <circle class="strecken" cx="100" cy="100" r="64"></circle>
              </svg>
            </div>
          {:else}
            See My Results <i class='bx bx-chevron-right'></i>
          {/if}
        </button>
      </div>
    </section>
  </div>
  
  <!-- Full-screen loader overlay -->
  {#if isLoading}
    <div class="loader-overlay">
      <div class="loader-wrapper">
        <svg class="gegga">
          <defs>
              <filter id="gegga">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="blur"></feGaussianBlur>
                  <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 20 -10" result="inreGegga"></feColorMatrix>
                  <feComposite in="SourceGraphic" in2="inreGegga" operator="atop"></feComposite>
              </filter>
          </defs>
        </svg>
        <svg class="snurra" width="200" height="200" viewBox="0 0 200 200">
          <defs>
              <linearGradient id="linjärGradient">
                  <stop class="stopp1" offset="0"></stop>
                  <stop class="stopp2" offset="1"></stop>
              </linearGradient>
              <linearGradient y2="160" x2="160" y1="40" x1="40" gradientUnits="userSpaceOnUse" id="gradient" xlink:href="#linjärGradient"></linearGradient>
          </defs>
          <path class="halvan" d="m 164,100 c 0,-35.346224 -28.65378,-64 -64,-64 -35.346224,0 -64,28.653776 -64,64 0,35.34622 28.653776,64 64,64 35.34622,0 64,-26.21502 64,-64 0,-37.784981 -26.92058,-64 -64,-64 -37.079421,0 -65.267479,26.922736 -64,64 1.267479,37.07726 26.703171,65.05317 64,64 37.29683,-1.05317 64,-64 64,-64"></path>
          <circle class="strecken" cx="100" cy="100" r="64"></circle>
        </svg>
        <svg class="skugga" width="200" height="200" viewBox="0 0 200 200">
          <path class="halvan" d="m 164,100 c 0,-35.346224 -28.65378,-64 -64,-64 -35.346224,0 -64,28.653776 -64,64 0,35.34622 28.653776,64 64,64 35.34622,0 64,-26.21502 64,-64 0,-37.784981 -26.92058,-64 -64,-64 -37.079421,0 -65.267479,26.922736 -64,64 1.267479,37.07726 26.703171,65.05317 64,64 37.29683,-1.05317 64,-64 64,-64"></path>
          <circle class="strecken" cx="100" cy="100" r="64"></circle>
        </svg>
      </div>
    </div>
  {/if}
</div>

<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
  @import url('https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css');

  .work-page {
    min-height: 100vh;
    padding: 0;
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    font-family: 'Inter', sans-serif;
    color: #1e293b;
    position: relative;
  }

  .work-header {
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

  .work-header h1 {
    font-size: 1.875rem;
    margin-bottom: 0.5rem;
    font-weight: 700;
    letter-spacing: -0.025em;
  }

  .work-header p {
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

  .work-content {
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

  .work-content h2 {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
    text-align: center;
    color: #1e293b;
    position: relative;
    padding-bottom: 0.75rem;
  }

  .work-content h2::after {
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

  .option-card:hover {
    border-color: #4f46e5;
    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.1);
    transform: translateY(-2px);
  }

  .option-card.selected {
    border-color: #4f46e5;
    background-color: #f5f3ff;
    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.15);
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

  /* Loader styles */
  .loader-container {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    position: relative;
  }
  
  .loader-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
  }
  
  .loader-wrapper {
    position: relative;
    width: 200px;
    height: 200px;
  }
  
  .gegga {
    width: 0;
  }
  
  .snurra {
    filter: url(#gegga);
    position: absolute;
    top: 0;
    left: 0;
  }
  
  .stopp1 {
    stop-color: #f700a8;
  }
  
  .stopp2 {
    stop-color: #ff8000;
  }
  
  .halvan {
    animation: Snurra1 10s infinite linear;
    stroke-dasharray: 180 800;
    fill: none;
    stroke: url(#gradient);
    stroke-width: 23;
    stroke-linecap: round;
  }
  
  .strecken {
    animation: Snurra1 3s infinite linear;
    stroke-dasharray: 26 54;
    fill: none;
    stroke: url(#gradient);
    stroke-width: 23;
    stroke-linecap: round;
  }
  
  .skugga {
    filter: blur(5px);
    opacity: 0.3;
    position: absolute;
    transform: translate(3px, 3px);
  }
  
  @keyframes Snurra1 {
    0% {
      stroke-dashoffset: 0;
    }
    100% {
      stroke-dashoffset: -403px;
    }
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .work-page {
      padding: 0;
    }

    .work-header {
      padding: 1.5rem 1rem;
      border-radius: 0;
    }

    .work-header h1 {
      font-size: 1.5rem;
    }

    .work-content {
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
    .work-content {
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