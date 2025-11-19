<!-- Preferences.svelte -->
<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { fade, scale } from 'svelte/transition';
  
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

  type ToastType = 'success' | 'warning' | 'info';

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

  // Reactive state
  let searchQuery = '';
  let isLoading = false;
  let selectedCategory = 'all';
  let activeToast: { message: string; type: ToastType } | null = null;
  let showEducationField = false;

  // Constants for options
  const WORK_TYPE_LIMIT = 3;
  
  const workTypeOptions = [
    { id: 'creative', label: 'Creative', value: 'creative', icon: 'bx-palette', description: 'Design, writing, arts', category: 'creative' },
    { id: 'analytical', label: 'Analytical', value: 'analytical', icon: 'bx-stats', description: 'Data analysis, research', category: 'analytical' },
    { id: 'technical', label: 'Technical', value: 'technical', icon: 'bx-code-alt', description: 'Engineering, programming', category: 'technical' },
    { id: 'handsOn', label: 'Hands-on', value: 'handsOn', icon: 'bx-wrench', description: 'Construction, manufacturing', category: 'practical' },
    { id: 'social', label: 'Social', value: 'social', icon: 'bx-group', description: 'Teaching, counseling, service', category: 'social' },
    { id: 'structured', label: 'Structured', value: 'structured', icon: 'bx-list-check', description: 'Accounting, administration', category: 'organizational' },
    { id: 'leadership', label: 'Leadership', value: 'leadership', icon: 'bx-trending-up', description: 'Team leading, management', category: 'management' },
    { id: 'entrepreneurial', label: 'Entrepreneurial', value: 'entrepreneurial', icon: 'bx-bulb', description: 'Startups, business', category: 'business' },
    { id: 'scientific', label: 'Scientific', value: 'scientific', icon: 'bx-test-tube', description: 'Biology, chemistry', category: 'scientific' },
    { id: 'healthcare', label: 'Healthcare', value: 'healthcare', icon: 'bx-plus-medical', description: 'Nursing, medicine', category: 'healthcare' },
    { id: 'outdoor', label: 'Outdoor', value: 'outdoor', icon: 'bx-street-view', description: 'Agriculture, forestry', category: 'environmental' },
    { id: 'digital', label: 'Digital', value: 'digital', icon: 'bx-globe', description: 'Online work, remote', category: 'technical' },
    { id: 'logistical', label: 'Logistical', value: 'logistical', icon: 'bx-package', description: 'Supply chain, operations', category: 'organizational' },
    { id: 'artistic', label: 'Artistic', value: 'artistic', icon: 'bx-music', description: 'Performing, visual arts', category: 'creative' },
    { id: 'financial', label: 'Financial', value: 'financial', icon: 'bx-dollar', description: 'Banking, investment', category: 'business' },
    { id: 'legal', label: 'Legal', value: 'legal', icon: 'bx-registered', description: 'Law, compliance', category: 'professional' },
    { id: 'educational', label: 'Educational', value: 'educational', icon: 'bx-book', description: 'Teaching, training', category: 'social' },
    { id: 'environmental', label: 'Environmental', value: 'environmental', icon: 'bx-leaf', description: 'Sustainability', category: 'environmental' },
    { id: 'sales', label: 'Sales', value: 'sales', icon: 'bx-line-chart', description: 'Business development', category: 'business' },
    { id: 'support', label: 'Support', value: 'support', icon: 'bx-support', description: 'HR, office management', category: 'organizational' }
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

  // Work type categories for filtering
  const workTypeCategories = [
    { id: 'all', name: 'All Types', icon: 'bx-grid-alt', color: '#4f46e5' },
    { id: 'creative', name: 'Creative', icon: 'bx-palette', color: '#ec4899' },
    { id: 'technical', name: 'Technical', icon: 'bx-code-alt', color: '#4f46e5' },
    { id: 'business', name: 'Business', icon: 'bx-building', color: '#7c3aed' },
    { id: 'social', name: 'Social', icon: 'bx-group', color: '#059669' },
    { id: 'scientific', name: 'Scientific', icon: 'bx-test-tube', color: '#dc2626' },
    { id: 'organizational', name: 'Organizational', icon: 'bx-list-check', color: '#d97706' }
  ];

  // Pre-computed lookups for better performance
  const workTypeLookup = new Map(workTypeOptions.map(opt => [opt.value, opt]));
  const salaryLookup = new Map(salaryOptions.map(opt => [opt.value, opt]));
  const motivationLookup = new Map(motivationOptions.map(opt => [opt.value, opt]));
  const educationLookup = new Map(educationOptions.map(opt => [opt.value, opt]));
  const educationFieldLookup = new Map(educationFieldOptions.map(opt => [opt.value, opt]));
  const companySizeLookup = new Map(companySizeOptions.map(opt => [opt.value, opt]));

  // Optimized reactive declarations
  $: selectedWorkTypesCount = data.workTypes.length;
  $: selectedEducationFieldCount = data.educationField ? 1 : 0;
  
  $: isFormComplete = data.workTypes.length > 0 && 
                      data.salaryExpectation && 
                      data.workMotivation && 
                      data.educationLevel && 
                      data.preferredCompanySize &&
                      (!showEducationField || data.educationField);

  $: hasSelections = data.workTypes.length > 0 || 
                     data.salaryExpectation || 
                     data.workMotivation || 
                     data.educationLevel || 
                     data.educationField || 
                     data.preferredCompanySize;

  // Optimized disabled state checks
  $: isWorkTypeDisabled = (value: string) => 
    data.workTypes.length >= WORK_TYPE_LIMIT && !data.workTypes.includes(value);

  // Optimized filtering with early returns
  $: filteredWorkTypes = (() => {
    const query = searchQuery.trim().toLowerCase();
    const isAllCategory = selectedCategory === 'all';
    
    // Fast path: no filters applied
    if (!query && isAllCategory) {
      return workTypeOptions;
    }

    return workTypeOptions.filter(option => {
      const matchesSearch = !query || 
        option.label.toLowerCase().includes(query) || 
        option.value.toLowerCase().includes(query) ||
        option.description.toLowerCase().includes(query);
      
      const matchesCategory = isAllCategory || option.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  })();

  // Lifecycle
  onMount(() => {
    console.log('Preferences component mounted');
  });

  // Optimized event handlers
  const handleMultiSelect = (field: string[], value: string, max: number, type: string) => {
    const index = field.indexOf(value);
    
    if (index === -1) {
      if (field.length < max) {
        showToast(`${type} added`, 'success');
        return [...field, value];
      }
      showToast(`Maximum ${max} ${type}s allowed`, 'warning');
      return field;
    }
    
    showToast(`${type} removed`, 'info');
    return field.filter(item => item !== value);
  };

  const handleWorkTypeChange = (value: string) => {
    data.workTypes = handleMultiSelect(data.workTypes, value, WORK_TYPE_LIMIT, 'work type');
  };

  const handleEducationLevelChange = (value: string) => {
    data.educationLevel = value;
    showEducationField = ['bachelor', 'master', 'doctorate'].includes(value);
    if (!showEducationField) {
      data.educationField = '';
    }
    showToast('Education level updated', 'success');
  };

  const handleSalaryChange = (value: string) => {
    data.salaryExpectation = value;
    showToast('Salary preference updated', 'success');
  };

  const handleMotivationChange = (value: string) => {
    data.workMotivation = value;
    showToast('Work motivation updated', 'success');
  };

  const handleCompanySizeChange = (value: string) => {
    data.preferredCompanySize = value;
    showToast('Company size preference updated', 'success');
  };

  const handleEducationFieldChange = (value: string) => {
    data.educationField = value;
    showToast('Education field updated', 'success');
  };

  const handleSearch = (event: Event) => {
    searchQuery = (event.target as HTMLInputElement).value;
  };

  const handleCategoryFilter = (categoryId: string) => {
    selectedCategory = categoryId;
  };

  const clearSearch = () => {
    searchQuery = '';
    selectedCategory = 'all';
  };

  const clearAllSelections = () => {
    data.workTypes = [];
    data.salaryExpectation = '';
    data.workMotivation = '';
    data.educationLevel = '';
    data.educationField = '';
    data.preferredCompanySize = '';
    showEducationField = false;
    showToast('All selections cleared', 'info');
  };

  // Optimized toast system
  const showToast = (message: string, type: ToastType = 'info') => {
    activeToast = { message, type };
    
    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      if (activeToast?.message === message) {
        activeToast = null;
      }
    }, 3000);
  };

  // Optimized navigation with validation
  const nextQuestion = async () => {
    // Early validation
    if (data.workTypes.length === 0) {
      showToast('Please select at least one work type', 'warning');
      return;
    }
    
    if (!data.salaryExpectation) {
      showToast('Please select your salary expectation', 'warning');
      return;
    }
    
    if (!data.workMotivation) {
      showToast('Please select your work motivation', 'warning');
      return;
    }
    
    if (!data.educationLevel) {
      showToast('Please select your education level', 'warning');
      return;
    }
    
    if (showEducationField && !data.educationField) {
      showToast('Please select your field of study', 'warning');
      return;
    }
    
    if (!data.preferredCompanySize) {
      showToast('Please select your preferred company size', 'warning');
      return;
    }
    
    isLoading = true;
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      dispatch('complete', {
        workTypes: data.workTypes,
        salaryExpectation: data.salaryExpectation,
        workMotivation: data.workMotivation,
        educationLevel: data.educationLevel,
        educationField: data.educationField,
        workExperience: data.workExperience,
        preferredCompanySize: data.preferredCompanySize,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      showToast('Failed to save preferences', 'warning');
      console.error('Error saving preferences:', error);
    } finally {
      isLoading = false;
    }
  };

  const goBack = () => {
    dispatch('backToHome');
  };

  // Optimized helper functions using pre-computed lookups
  const getWorkTypeLabel = (value: string) => workTypeLookup.get(value)?.label || value;
  const getWorkTypeIcon = (value: string) => workTypeLookup.get(value)?.icon || '';
  const getSalaryIcon = (value: string) => salaryLookup.get(value)?.icon || '';
  const getSalaryLabel = (value: string) => salaryLookup.get(value)?.label || value;
  const getMotivationLabel = (value: string) => motivationLookup.get(value)?.label || value;
  const getMotivationIcon = (value: string) => motivationLookup.get(value)?.icon || '';
  const getEducationLabel = (value: string) => educationLookup.get(value)?.label || value;
  const getEducationIcon = (value: string) => educationLookup.get(value)?.icon || '';
  const getEducationFieldIcon = (value: string) => educationFieldLookup.get(value)?.icon || '';
  const getCompanySizeLabel = (value: string) => companySizeLookup.get(value)?.label || value;
  const getCompanySizeIcon = (value: string) => companySizeLookup.get(value)?.icon || '';
</script>

<div class="preferences-page">
  <!-- Toast Notification -->
  {#if activeToast}
    <div class="toast toast--{activeToast.type}" transition:fade>
      <i class='bx {activeToast.type === "success" ? "bx-check-circle" : activeToast.type === "warning" ? "bx-error" : "bx-info-circle"}'></i>
      <span>{activeToast.message}</span>
      <button class="toast-close" on:click={() => activeToast = null} aria-label="Dismiss notification">
        <i class='bx bx-x'></i>
      </button>
    </div>
  {/if}

  <div class="preferences-header">
    <div class="header-content">
      <h1>Work Preferences</h1>
      <p>Tell us about your ideal work environment and expectations</p>
    </div>
  </div>

  <div class="center-container">
    <section class="preferences-content">
      <!-- Progress Section -->
      <div class="progress-container">
        <div class="progress-bar">
          <div class="progress-fill" style="width: {progressWidth}"></div>
        </div>
        <div class="progress-text">Step 2 of 3</div>
      </div>

      <h2>Your Ideal Work Setup</h2>

      <!-- Selected Preview -->
      {#if hasSelections}
        <div class="selection-preview" transition:fade>
          <div class="preview-header">
            <i class='bx bx-check-circle'></i>
            <h3>Your Selections</h3>
            <button class="clear-all" on:click={clearAllSelections} aria-label="Clear all selections">
              <i class='bx bx-trash'></i> Clear All
            </button>
          </div>
          <div class="preview-items">
            {#if data.workTypes.length > 0}
              <div class="preview-category">
                <h4>Work Types ({data.workTypes.length}/{WORK_TYPE_LIMIT})</h4>
                <div class="preview-tags">
                  {#each data.workTypes as type}
                    <span class="preview-tag" transition:scale>
                      <i class='bx {getWorkTypeIcon(type)}'></i> {getWorkTypeLabel(type)}
                      <button 
                        class="remove-tag" 
                        on:click={() => handleWorkTypeChange(type)}
                        aria-label="Remove {getWorkTypeLabel(type)}"
                      >
                        <i class='bx bx-x'></i>
                      </button>
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
                    <i class='bx {getSalaryIcon(data.salaryExpectation)}'></i> 
                    {getSalaryLabel(data.salaryExpectation)}
                    <button 
                      class="remove-tag" 
                      on:click={() => data.salaryExpectation = ''}
                      aria-label="Remove salary preference"
                    >
                      <i class='bx bx-x'></i>
                    </button>
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
                    <button 
                      class="remove-tag" 
                      on:click={() => data.workMotivation = ''}
                      aria-label="Remove work motivation"
                    >
                      <i class='bx bx-x'></i>
                    </button>
                  </span>
                </div>
              </div>
            {/if}

            {#if data.educationLevel}
              <div class="preview-category">
                <h4>Education</h4>
                <div class="preview-tags">
                  <span class="preview-tag">
                    <i class='bx {getEducationIcon(data.educationLevel)}'></i> 
                    {getEducationLabel(data.educationLevel)}
                    <button 
                      class="remove-tag" 
                      on:click={() => { data.educationLevel = ''; data.educationField = ''; showEducationField = false; }}
                      aria-label="Remove education level"
                    >
                      <i class='bx bx-x'></i>
                    </button>
                  </span>
                </div>
              </div>
            {/if}

            {#if data.educationField}
              <div class="preview-category">
                <h4>Field of Study</h4>
                <div class="preview-tags">
                  <span class="preview-tag">
                    <i class='bx {getEducationFieldIcon(data.educationField)}'></i> 
                    {data.educationField}
                    <button 
                      class="remove-tag" 
                      on:click={() => data.educationField = ''}
                      aria-label="Remove education field"
                    >
                      <i class='bx bx-x'></i>
                    </button>
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
                    <button 
                      class="remove-tag" 
                      on:click={() => data.preferredCompanySize = ''}
                      aria-label="Remove company size preference"
                    >
                      <i class='bx bx-x'></i>
                    </button>
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
        
        <!-- Search and Filter Controls -->
        <div class="skills-controls">
          <div class="search-box">
            <i class='bx bx-search'></i>
            <input 
              type="text" 
              placeholder="Search work types..." 
              class="skill-search" 
              bind:value={searchQuery}
              aria-label="Search work types"
            />
            {#if searchQuery}
              <button class="clear-search" on:click={clearSearch} aria-label="Clear search">
                <i class='bx bx-x'></i>
              </button>
            {/if}
          </div>
          
          <div class="category-filters">
            {#each workTypeCategories as category (category.id)}
              <button 
                class="category-filter {selectedCategory === category.id ? 'active' : ''}"
                on:click={() => handleCategoryFilter(category.id)}
                style="--category-color: {category.color}"
                title="{category.name}"
                aria-label="Show {category.name} category"
              >
                <i class='bx {category.icon}'></i>
                {category.name}
              </button>
            {/each}
          </div>
        </div>
        
        <!-- Search Results -->
        {#if searchQuery && filteredWorkTypes.length === 0}
          <div class="no-results">
            <i class='bx bx-search-alt'></i>
            <p>No work types found for "{searchQuery}"</p>
            <small>Try a different search term or browse all categories</small>
            <button class="clear-search-btn" on:click={clearSearch}>
              Clear Search
            </button>
          </div>
        {/if}
        
        <div class="options-grid work-type-options">
          {#each filteredWorkTypes as option (option.id)}
            <label 
              class="option-card {isWorkTypeDisabled(option.value) ? 'disabled' : ''} {data.workTypes.includes(option.value) ? 'selected' : ''}"
              title="{option.description}"
            >
              <input
                type="checkbox"
                value={option.value}
                checked={data.workTypes.includes(option.value)}
                on:change={() => handleWorkTypeChange(option.value)}
                disabled={isWorkTypeDisabled(option.value)}
                aria-label="{option.label} - {option.description}"
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
        
        {#if selectedWorkTypesCount > 0}
          <div class="selection-count">
            <i class='bx bx-check-square'></i> 
            Selected: {selectedWorkTypesCount}/{WORK_TYPE_LIMIT}
            {#if selectedWorkTypesCount === WORK_TYPE_LIMIT}
              <span class="limit-reached">Maximum reached</span>
            {/if}
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
          {#each salaryOptions as option (option.id)}
            <label class="option-pill {data.salaryExpectation === option.value ? 'selected' : ''}">
              <input
                type="radio"
                name="salary"
                value={option.value}
                checked={data.salaryExpectation === option.value}
                on:change={() => handleSalaryChange(option.value)}
                aria-label="{option.label} - {option.description}"
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
          {#each motivationOptions as option (option.id)}
            <label class="option-card {data.workMotivation === option.value ? 'selected' : ''}">
              <input 
                type="radio" 
                name="motivation" 
                value={option.value}
                checked={data.workMotivation === option.value}
                on:change={() => handleMotivationChange(option.value)}
                aria-label="{option.label} - {option.description}"
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
          {#each educationOptions as option (option.id)}
            <label class="option-card {data.educationLevel === option.value ? 'selected' : ''}">
              <input 
                type="radio" 
                name="education" 
                value={option.value}
                checked={data.educationLevel === option.value}
                on:change={() => handleEducationLevelChange(option.value)}
                aria-label="{option.label} - {option.description}"
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
            {#each educationFieldOptions as option (option.id)}
              <label class="option-pill {data.educationField === option.value ? 'selected' : ''}">
                <input 
                  type="radio" 
                  name="educationField" 
                  value={option.value}
                  checked={data.educationField === option.value}
                  on:change={() => handleEducationFieldChange(option.value)}
                  aria-label="{option.label}"
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
          {#each companySizeOptions as option (option.id)}
            <label class="option-card {data.preferredCompanySize === option.value ? 'selected' : ''}">
              <input 
                type="radio" 
                name="companySize" 
                value={option.value}
                checked={data.preferredCompanySize === option.value}
                on:change={() => handleCompanySizeChange(option.value)}
                aria-label="{option.label} - {option.description}"
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
        
        <div class="completion-status">
          {#if isFormComplete}
            <i class='bx bx-check-circle'></i>
            <span>All sections completed</span>
          {:else}
            <i class='bx bx-error-circle'></i>
            <span>Complete all sections to continue</span>
          {/if}
        </div>
        
        <button 
          class="nav-button primary" 
          type="button" 
          on:click={nextQuestion}
          disabled={!isFormComplete || isLoading}
        >
          {#if isLoading}
            <i class='bx bx-loader-alt bx-spin'></i>
            Processing...
          {:else}
            Next <i class='bx bx-chevron-right'></i>
          {/if}
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
    position: relative;
  }

  /* Toast Styles */
  .toast {
    position: fixed;
    top: 2rem;
    right: 2rem;
    background: white;
    padding: 1rem 1.5rem;
    border-radius: 0.75rem;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    display: flex;
    align-items: center;
    gap: 0.75rem;
    z-index: 1000;
    max-width: 400px;
    border-left: 4px solid;
    animation: slideInRight 0.3s ease;
  }

  .toast--success {
    border-left-color: #10b981;
  }

  .toast--warning {
    border-left-color: #f59e0b;
  }

  .toast--info {
    border-left-color: #4f46e5;
  }

  .toast-close {
    background: none;
    border: none;
    color: #64748b;
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 0.25rem;
    margin-left: auto;
  }

  .toast-close:hover {
    background: #f1f5f9;
  }

  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
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
    justify-content: space-between;
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

  .clear-all {
    background: none;
    border: none;
    color: #64748b;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    transition: all 0.2s;
  }

  .clear-all:hover {
    background-color: #e2e8f0;
    color: #dc2626;
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
    padding: 0.5rem 0.75rem;
    border-radius: 1.5rem;
    font-size: 0.8rem;
    box-shadow: 0 1px 3px rgba(0,0,0,0.08);
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    border: 1px solid #e2e8f0;
    font-weight: 500;
    position: relative;
  }

  .preview-tag i {
    font-size: 1rem;
  }

  .remove-tag {
    background: none;
    border: none;
    color: #94a3b8;
    cursor: pointer;
    padding: 0.125rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    margin-left: 0.25rem;
  }

  .remove-tag:hover {
    background-color: #f1f5f9;
    color: #64748b;
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

  /* Skills Controls */
  .skills-controls {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .search-box {
    position: relative;
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

  .clear-search {
    position: absolute;
    right: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: #94a3b8;
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .clear-search:hover {
    background-color: #f1f5f9;
    color: #64748b;
  }

  .category-filters {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .category-filter {
    background: white;
    border: 1px solid #e2e8f0;
    padding: 0.5rem 1rem;
    border-radius: 2rem;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .category-filter:hover {
    border-color: var(--category-color, #4f46e5);
    color: var(--category-color, #4f46e5);
  }

  .category-filter.active {
    background-color: var(--category-color, #4f46e5);
    color: white;
    border-color: var(--category-color, #4f46e5);
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
    display: block;
    margin-bottom: 1rem;
  }

  .clear-search-btn {
    background: #4f46e5;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    cursor: pointer;
    font-size: 0.875rem;
    transition: background-color 0.2s;
  }

  .clear-search-btn:hover {
    background: #4338ca;
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

  .limit-reached {
    color: #dc2626;
    font-weight: 500;
    margin-left: 0.5rem;
  }

  /* Navigation */
  .navigation-buttons {
    display: flex;
    justify-content: space-between;
    align-items: center;
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

  .completion-status {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: #64748b;
  }

  .completion-status i {
    font-size: 1.25rem;
  }

  .completion-status i.bx-check-circle {
    color: #10b981;
  }

  .completion-status i.bx-error-circle {
    color: #f59e0b;
  }

  /* Loading animation */
  .bx-loader-alt.bx-spin {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .preferences-page {
      padding: 0;
    }

    .toast {
      top: 1rem;
      right: 1rem;
      left: 1rem;
      max-width: none;
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
      align-items: stretch;
    }

    .nav-button {
      width: 100%;
    }

    .completion-status {
      order: -1;
      justify-content: center;
      margin-bottom: 1rem;
    }

    .skills-controls {
      flex-direction: column;
    }

    .category-filters {
      justify-content: center;
    }

    .category-filter {
      font-size: 0.8rem;
      padding: 0.375rem 0.75rem;
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
