<!-- Work -->
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
    { id: 'remote', label: 'Remote', value: 'remote', icon: '🏠', description: 'Work from home full-time' },
    { id: 'office', label: 'Office', value: 'office', icon: '🏢', description: 'Work in a traditional office' },
    { id: 'hybrid', label: 'Hybrid', value: 'hybrid', icon: '🏠🏢', description: 'Mix of office and remote' },
    { id: 'outdoors', label: 'Outdoors', value: 'outdoors', icon: '🌳', description: 'Work outside or on-site' },
    { id: 'flexible', label: 'Flexible', value: 'flexible', icon: '🔄', description: 'No strong preference' }
  ];

  const stressHandlingOptions = [
    { id: 'thrive', label: 'Thrive under pressure', value: 'thrive', icon: '⚡', description: 'I perform best with tight deadlines' },
    { id: 'calm', label: 'Prefer calm environments', value: 'calm', icon: '🧘', description: 'I work best with minimal stress' },
    { id: 'adaptable', label: 'Adaptable', value: 'adaptable', icon: '🔄', description: 'I can handle both calm and high-pressure situations' }
  ];

  const collaborationOptions = [
    { id: 'team', label: 'Team collaboration', value: 'team', icon: '👥', description: 'I prefer working closely with others' },
    { id: 'solo', label: 'Independent work', value: 'solo', icon: '🧑💻', description: 'I prefer working alone' },
    { id: 'mixed', label: 'Mix of both', value: 'mixed', icon: '👥🧑💻', description: 'I enjoy a balance of both' }
  ];

  const scheduleOptions = [
    { id: 'fixed', label: 'Fixed schedule', value: 'fixed', icon: '🕘', description: 'I prefer consistent working hours' },
    { id: 'flexible', label: 'Flexible hours', value: 'flexible', icon: '⏱️', description: 'I prefer setting my own hours' },
    { id: 'shift', label: 'Shift work', value: 'shift', icon: '🔄', description: 'I can work rotating shifts' },
    { id: 'results', label: 'Results-oriented', value: 'results', icon: '🎯', description: 'I focus on deliverables not hours' }
  ];

  const managementOptions = [
    { id: 'structured', label: 'Structured', value: 'structured', icon: '📋', description: 'Clear guidance and processes' },
    { id: 'autonomous', label: 'Autonomous', value: 'autonomous', icon: '🦅', description: 'Freedom to make decisions' },
    { id: 'mentorship', label: 'Mentorship', value: 'mentorship', icon: '🧑🏫', description: 'Regular feedback and coaching' },
    { id: 'collaborative', label: 'Collaborative', value: 'collaborative', icon: '🤝', description: 'Shared decision making' }
  ];

  const paceOptions = [
    { id: 'fast', label: 'Fast-paced', value: 'fast', icon: '⚡', description: 'Dynamic, rapidly changing' },
    { id: 'steady', label: 'Steady', value: 'steady', icon: '🐢', description: 'Consistent, predictable' },
    { id: 'variable', label: 'Variable', value: 'variable', icon: '🌊', description: 'Mix of busy and quiet periods' }
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
    <h1>Work Preferences</h1>
    <p>Tell us about your ideal work environment and preferences</p>
  </div>

  <section class="work-preferences">
    <div class="progress-bar">
      <div class="progress-fill" style="width: {progressWidth}"></div>
    </div>

    <h2>Your Ideal Work Environment</h2>

    <!-- Selected Preview -->
    {#if data.workSetting || data.stressHandling || data.collaborationPreference || data.workSchedule || data.managementPreference || data.workPace}
      <div class="selection-preview">
        <h3>Your Selections</h3>
        <div class="preview-items">
          {#if data.workSetting}
            <div class="preview-category">
              <h4>Work Setting:</h4>
              <div class="preview-tags">
                <span class="preview-tag">
                  {getOptionIcon(workSettingOptions, data.workSetting)} {getOptionLabel(workSettingOptions, data.workSetting)}
                </span>
              </div>
            </div>
          {/if}
          
          {#if data.stressHandling}
            <div class="preview-category">
              <h4>Stress Handling:</h4>
              <div class="preview-tags">
                <span class="preview-tag">
                  {getOptionIcon(stressHandlingOptions, data.stressHandling)} {getOptionLabel(stressHandlingOptions, data.stressHandling)}
                </span>
              </div>
            </div>
          {/if}

          {#if data.collaborationPreference}
            <div class="preview-category">
              <h4>Collaboration:</h4>
              <div class="preview-tags">
                <span class="preview-tag">
                  {getOptionIcon(collaborationOptions, data.collaborationPreference)} {getOptionLabel(collaborationOptions, data.collaborationPreference)}
                </span>
              </div>
            </div>
          {/if}

          {#if data.workSchedule}
            <div class="preview-category">
              <h4>Schedule:</h4>
              <div class="preview-tags">
                <span class="preview-tag">
                  {getOptionIcon(scheduleOptions, data.workSchedule)} {getOptionLabel(scheduleOptions, data.workSchedule)}
                </span>
              </div>
            </div>
          {/if}

          {#if data.managementPreference}
            <div class="preview-category">
              <h4>Management:</h4>
              <div class="preview-tags">
                <span class="preview-tag">
                  {getOptionIcon(managementOptions, data.managementPreference)} {getOptionLabel(managementOptions, data.managementPreference)}
                </span>
              </div>
            </div>
          {/if}

          {#if data.workPace}
            <div class="preview-category">
              <h4>Work Pace:</h4>
              <div class="preview-tags">
                <span class="preview-tag">
                  {getOptionIcon(paceOptions, data.workPace)} {getOptionLabel(paceOptions, data.workPace)}
                </span>
              </div>
            </div>
          {/if}
        </div>
      </div>
    {/if}

    <!-- Work Setting Question -->
    <div class="question">
      <div class="question-header">
        <h3>What is your preferred work setting?</h3>
        <div class="tooltip">?
          <span class="tooltiptext">Select the environment where you're most productive</span>
        </div>
      </div>
      <p class="question-description">This helps us understand your ideal physical work environment</p>
      <div class="options work-setting-options">
        {#each workSettingOptions as option}
          <label class="option-item">
            <input
              type="radio"
              name="workSetting"
              value={option.value}
              bind:group={data.workSetting}
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

    <!-- Stress Handling Question -->
    <div class="question">
      <div class="question-header">
        <h3>How do you handle stress at work?</h3>
        <div class="tooltip">?
          <span class="tooltiptext">Select how you typically perform under pressure</span>
        </div>
      </div>
      <div class="options stress-options">
        {#each stressHandlingOptions as option}
          <label class="option-item">
            <input
              type="radio"
              name="stressHandling"
              value={option.value}
              bind:group={data.stressHandling}
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

    <!-- Collaboration Preference Question -->
    <div class="question">
      <div class="question-header">
        <h3>How do you prefer to collaborate?</h3>
        <div class="tooltip">?
          <span class="tooltiptext">Select your preferred way of working with others</span>
        </div>
      </div>
      <div class="options collaboration-options">
        {#each collaborationOptions as option}
          <label class="option-item">
            <input
              type="radio"
              name="collaboration"
              value={option.value}
              bind:group={data.collaborationPreference}
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

    <!-- Work Schedule Question -->
    <div class="question">
      <div class="question-header">
        <h3>What work schedule suits you best?</h3>
        <div class="tooltip">?
          <span class="tooltiptext">Select your preferred working hours arrangement</span>
        </div>
      </div>
      <div class="options schedule-options">
        {#each scheduleOptions as option}
          <label class="option-item">
            <input
              type="radio"
              name="schedule"
              value={option.value}
              bind:group={data.workSchedule}
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

    <!-- Management Preference Question -->
    <div class="question">
      <div class="question-header">
        <h3>What management style do you prefer?</h3>
        <div class="tooltip">?
          <span class="tooltiptext">Select how you like to be managed</span>
        </div>
      </div>
      <div class="options management-options">
        {#each managementOptions as option}
          <label class="option-item">
            <input
              type="radio"
              name="management"
              value={option.value}
              bind:group={data.managementPreference}
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

    <!-- Work Pace Question -->
    <div class="question">
      <div class="question-header">
        <h3>What work pace do you thrive in?</h3>
        <div class="tooltip">?
          <span class="tooltiptext">Select the tempo that suits your working style</span>
        </div>
      </div>
      <div class="options pace-options">
        {#each paceOptions as option}
          <label class="option-item">
            <input
              type="radio"
              name="pace"
              value={option.value}
              bind:group={data.workPace}
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

    <div class="navigation-buttons">
      <button class="nav-button secondary" on:click={goBack} disabled={isLoading}>
        <span class="button-icon">←</span> Back
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
          <div class="three-body">
            <div class="three-body__dot"></div>
            <div class="three-body__dot"></div>
            <div class="three-body__dot"></div>
          </div>
        {:else}
          See My Results <span class="button-icon">→</span>
        {/if}
      </button>
    </div>
  </section>
</div>

<style>
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

  .work-page {
    min-height: 100vh;
    padding: 0;
    background-color: #f8fafc;
    font-family: 'Poppins', sans-serif;
    color: #1e293b;
  }

  .work-header {
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
    color: white;
    text-align: center;
    padding: 2rem 1.5rem;
    margin-bottom: 2rem;
    border-radius: 0 0 1.5rem 1.5rem;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  }

  .work-header h1 {
    font-size: 1.75rem;
    margin-bottom: 0.5rem;
    font-weight: 600;
  }

  .work-header p {
    margin: 0;
    opacity: 0.9;
    font-size: 1rem;
    max-width: 600px;
    margin: 0 auto;
  }

  .work-preferences {
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

  .work-preferences h2 {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
    text-align: center;
    color: #1e293b;
    position: relative;
  }

  .work-preferences h2::after {
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

  .work-setting-options,
  .stress-options,
  .collaboration-options,
  .schedule-options,
  .management-options,
  .pace-options {
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

  .option-item:hover {
    border-color: #2563eb;
    box-shadow: 0 0 0 1px #2563eb;
  }

  .option-item:has(input:checked) {
    background-color: #eff6ff;
    border-color: #2563eb;
  }

  .option-item input {
    margin-right: 0.75rem;
    cursor: pointer;
    accent-color: #2563eb;
    min-width: 16px;
    min-height: 16px;
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

  /* Three-body loader styles */
  .three-body {
    --uib-size: 22px;
    --uib-speed: 0.8s;
    --uib-color: white;
    position: relative;
    display: inline-block;
    height: var(--uib-size);
    width: var(--uib-size);
    animation: spin78236 calc(var(--uib-speed) * 2.5) infinite linear;
    margin: 0 auto;
  }

  .three-body__dot {
    position: absolute;
    height: 100%;
    width: 30%;
  }

  .three-body__dot:after {
    content: '';
    position: absolute;
    height: 0%;
    width: 100%;
    padding-bottom: 100%;
    background-color: var(--uib-color);
    border-radius: 50%;
  }

  .three-body__dot:nth-child(1) {
    bottom: 5%;
    left: 0;
    transform: rotate(60deg);
    transform-origin: 50% 85%;
  }

  .three-body__dot:nth-child(1)::after {
    bottom: 0;
    left: 0;
    animation: wobble1 var(--uib-speed) infinite ease-in-out;
    animation-delay: calc(var(--uib-speed) * -0.3);
  }

  .three-body__dot:nth-child(2) {
    bottom: 5%;
    right: 0;
    transform: rotate(-60deg);
    transform-origin: 50% 85%;
  }

  .three-body__dot:nth-child(2)::after {
    bottom: 0;
    left: 0;
    animation: wobble1 var(--uib-speed) infinite
      calc(var(--uib-speed) * -0.15) ease-in-out;
  }

  .three-body__dot:nth-child(3) {
    bottom: -5%;
    left: 0;
    transform: translateX(116.666%);
  }

  .three-body__dot:nth-child(3)::after {
    top: 0;
    left: 0;
    animation: wobble2 var(--uib-speed) infinite ease-in-out;
  }

  @keyframes spin78236 {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  @keyframes wobble1 {
    0%,
    100% {
      transform: translateY(0%) scale(1);
      opacity: 1;
    }
    50% {
      transform: translateY(-66%) scale(0.65);
      opacity: 0.8;
    }
  }

  @keyframes wobble2 {
    0%,
    100% {
      transform: translateY(0%) scale(1);
      opacity: 1;
    }
    50% {
      transform: translateY(66%) scale(0.65);
      opacity: 0.8;
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

    .work-preferences {
      margin: 0 1rem;
      padding: 1.75rem;
      top: 0;
      border-radius: 0.75rem;
    }

    .preview-items {
      flex-direction: column;
    }

    .navigation-buttons {
      flex-direction: column;
    }

    .nav-button {
      width: 100%;
    }
  }

  @media (max-width: 480px) {
    .work-preferences {
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