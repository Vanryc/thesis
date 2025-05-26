<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  export let data: {
    workSetting: string;
    stressHandling: string;
    collaborationPreference: string;
  } = {
    workSetting: '',
    stressHandling: '',
    collaborationPreference: ''
  };

  export let progressWidth = '75%';
  export let isLoading = false;

  const workSettingOptions = [
    { id: 'remote', label: 'Remote', value: 'remote' },
    { id: 'office', label: 'Office', value: 'office' },
    { id: 'hybrid', label: 'Hybrid', value: 'hybrid' },
    { id: 'outdoors', label: 'Outdoors', value: 'outdoors' }
  ];

  const stressHandlingOptions = [
    { id: 'thrive', label: 'Thrive under pressure', value: 'thrive' },
    { id: 'calm', label: 'Prefer calm environments', value: 'calm' }
  ];

  const collaborationOptions = [
    { id: 'team', label: 'Team collaboration', value: 'team' },
    { id: 'solo', label: 'Independent work', value: 'solo' },
    { id: 'mixed', label: 'Mix of both', value: 'mixed' }
  ];

  function goBack() {
    dispatch('back');
  }

  function completeQuestionnaire() {
    if (!data.workSetting || !data.stressHandling || !data.collaborationPreference) {
      alert('Please complete all sections.');
      return;
    }

    dispatch('complete', {
      workSetting: data.workSetting,
      stressHandling: data.stressHandling,
      collaborationPreference: data.collaborationPreference
    });
  }
</script>

<div class="skills-page">
  <div class="skills-header">
    <h1>Work Environment</h1>
    <p>Tell us about your ideal work environment and how you handle pressure</p>
  </div>

  <section class="skills-preferences">
    <div class="progress-bar">
      <div class="progress-fill" style="width: {progressWidth}"></div>
    </div>

    <h2>Environment Preferences</h2>

    <div class="question">
      <h3>Preferred work setting?</h3>
      <div class="options">
        {#each workSettingOptions as option}
          <label class="option-item">
            <input
              type="radio"
              name="workSetting"
              value={option.value}
              bind:group={data.workSetting}
            />
            <span class="option-label">{option.label}</span>
          </label>
        {/each}
      </div>
    </div>

    <div class="question">
      <h3>How do you handle stress?</h3>
      <div class="options">
        {#each stressHandlingOptions as option}
          <label class="option-item">
            <input
              type="radio"
              name="stressHandling"
              value={option.value}
              bind:group={data.stressHandling}
            />
            <span class="option-label">{option.label}</span>
          </label>
        {/each}
      </div>
    </div>

    <div class="question">
      <h3>How do you prefer to work?</h3>
      <div class="options">
        {#each collaborationOptions as option}
          <label class="option-item">
            <input
              type="radio"
              name="collaboration"
              value={option.value}
              bind:group={data.collaborationPreference}
            />
            <span class="option-label">{option.label}</span>
          </label>
        {/each}
      </div>
    </div>

    <div class="navigation-buttons">
      <button class="nav-button secondary" on:click={goBack} disabled={isLoading}>
        Back
      </button>
      <button
        class="nav-button primary"
        on:click={completeQuestionnaire}
        disabled={
          !data.workSetting ||
          !data.stressHandling ||
          !data.collaborationPreference ||
          isLoading
        }>
        {isLoading ? 'Processing...' : 'See My Results'}
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

  .option-item:hover {
    background-color: #e5e7eb;
  }

  .option-item input {
    margin-right: 0.75rem;
    transform: scale(1.1);
    cursor: pointer;
    accent-color: #2563eb;
  }

  .option-label {
    cursor: pointer;
    flex: 1;
    font-size: 0.9rem;
    color: #374151;
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

  .nav-button.primary:hover:not(:disabled) {
    background-color: #1d4ed8;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
  }

  .nav-button.secondary {
    background-color: #f3f4f6;
    color: #374151;
    border: 1px solid #d1d5db;
  }

  .nav-button.secondary:hover:not(:disabled) {
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