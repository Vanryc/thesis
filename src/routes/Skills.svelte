<!-- Skills.svelte -->
<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { fade, scale } from 'svelte/transition';
  
  const dispatch = createEventDispatcher();

  // Types for better type safety
  type SkillData = {
    strengths: string[];
    experienceLevel: string;
    technicalSkills: string[];
  };

  type ToastType = 'success' | 'warning' | 'info';

  export let data: SkillData = {
    strengths: [],
    experienceLevel: '',
    technicalSkills: []
  };

  export let progressWidth = '50%';

  // Reactive state
  let searchQuery = '';
  let isLoading = false;
  let selectedCategory = 'all';
  let activeToast: { message: string; type: ToastType } | null = null;

  // Constants - optimized with memoization potential
  const STRENGTH_LIMIT = 3;
  const SKILLS_LIMIT = 6;

  const strengthOptions = [
    { id: 'leadership', label: 'Leadership', value: 'leadership', icon: 'bx-crown', description: 'Guiding and motivating teams' },
    { id: 'teamwork', label: 'Teamwork', value: 'teamwork', icon: 'bx-group', description: 'Collaborating effectively with others' },
    { id: 'creativity', label: 'Creativity', value: 'creativity', icon: 'bx-palette', description: 'Generating innovative ideas' },
    { id: 'problem-solving', label: 'Problem Solving', value: 'problem-solving', icon: 'bx-cube', description: 'Analyzing and resolving challenges' },
    { id: 'adaptability', label: 'Adaptability', value: 'adaptability', icon: 'bx-reset', description: 'Adjusting to changing circumstances' },
    { id: 'communication', label: 'Communication', value: 'communication', icon: 'bx-chat', description: 'Expressing ideas clearly' },
    { id: 'time-management', label: 'Time Management', value: 'time-management', icon: 'bx-time', description: 'Prioritizing tasks efficiently' },
    { id: 'critical-thinking', label: 'Critical Thinking', value: 'critical-thinking', icon: 'bx-brain', description: 'Evaluating information logically' }
  ];

  const experienceOptions = [
    { id: 'intern', label: 'Intern/Student', value: 'intern', description: 'Limited professional experience', icon: 'bx-user-pin', years: '0-1 years' },
    { id: 'junior', label: 'Junior (0-2 years)', value: 'junior', description: 'Early career professional', icon: 'bx-user', years: '0-2 years' },
    { id: 'mid', label: 'Mid-level (2-5 years)', value: 'mid', description: 'Experienced professional', icon: 'bx-user-voice', years: '2-5 years' },
    { id: 'senior', label: 'Senior (5+ years)', value: 'senior', description: 'Seasoned expert', icon: 'bx-user-check', years: '5+ years' },
    { id: 'executive', label: 'Executive/Manager', value: 'executive', description: 'Leadership role', icon: 'bx-trending-up', years: '8+ years' }
  ];

  // Updated skill data structure without popularity and with new categories
  const technicalSkillCategories = [
    {
      id: 'healthcare',
      name: 'Healthcare & Medicine',
      icon: 'bx-plus-medical',
      color: '#dc2626',
      skills: [
        { id: 'patient-care', label: 'Patient Care', value: 'patient-care', category: 'healthcare' },
        { id: 'medical-diagnosis', label: 'Medical Diagnosis', value: 'medical-diagnosis', category: 'healthcare' },
        { id: 'surgical-skills', label: 'Surgical Skills', value: 'surgical-skills', category: 'healthcare' },
        { id: 'pharmaceutical-knowledge', label: 'Pharmaceutical Knowledge', value: 'pharmaceutical-knowledge', category: 'healthcare' },
        { id: 'medical-research', label: 'Medical Research', value: 'medical-research', category: 'healthcare' }
      ]
    },
    {
      id: 'technology',
      name: 'Technology & IT',
      icon: 'bx-code-alt',
      color: '#4f46e5',
      skills: [
        { id: 'programming', label: 'Programming', value: 'programming', category: 'technology' },
        { id: 'web-development', label: 'Web Development', value: 'web-development', category: 'technology' },
        { id: 'mobile-development', label: 'Mobile Development', value: 'mobile-development', category: 'technology' },
        { id: 'cloud-computing', label: 'Cloud Computing', value: 'cloud-computing', category: 'technology' },
        { id: 'cybersecurity', label: 'Cybersecurity', value: 'cybersecurity', category: 'technology' }
      ]
    },
    {
      id: 'business',
      name: 'Business & Management',
      icon: 'bx-building',
      color: '#7c3aed',
      skills: [
        { id: 'project-management', label: 'Project Management', value: 'project-management', category: 'business' },
        { id: 'financial-analysis', label: 'Financial Analysis', value: 'financial-analysis', category: 'business' },
        { id: 'marketing-strategy', label: 'Marketing Strategy', value: 'marketing-strategy', category: 'business' },
        { id: 'sales-skills', label: 'Sales Skills', value: 'sales-skills', category: 'business' },
        { id: 'business-development', label: 'Business Development', value: 'business-development', category: 'business' }
      ]
    },
    {
      id: 'creative',
      name: 'Creative & Design',
      icon: 'bx-palette',
      color: '#ec4899',
      skills: [
        { id: 'graphic-design', label: 'Graphic Design', value: 'graphic-design', category: 'creative' },
        { id: 'ui-ux-design', label: 'UI/UX Design', value: 'ui-ux-design', category: 'creative' },
        { id: 'video-editing', label: 'Video Editing', value: 'video-editing', category: 'creative' },
        { id: 'content-writing', label: 'Content Writing', value: 'content-writing', category: 'creative' },
        { id: 'digital-illustration', label: 'Digital Illustration', value: 'digital-illustration', category: 'creative' }
      ]
    },
    {
      id: 'trades',
      name: 'Skilled Trades',
      icon: 'bx-wrench',
      color: '#f59e0b',
      skills: [
        { id: 'electrical-work', label: 'Electrical Work', value: 'electrical-work', category: 'trades' },
        { id: 'plumbing', label: 'Plumbing', value: 'plumbing', category: 'trades' },
        { id: 'carpentry', label: 'Carpentry', value: 'carpentry', category: 'trades' },
        { id: 'automotive-repair', label: 'Automotive Repair', value: 'automotive-repair', category: 'trades' },
        { id: 'welding', label: 'Welding', value: 'welding', category: 'trades' }
      ]
    },
    {
      id: 'hospitality',
      name: 'Hospitality & Service',
      icon: 'bx-restaurant',
      color: '#10b981',
      skills: [
        { id: 'culinary-arts', label: 'Culinary Arts', value: 'culinary-arts', category: 'hospitality' },
        { id: 'hotel-management', label: 'Hotel Management', value: 'hotel-management', category: 'hospitality' },
        { id: 'customer-service', label: 'Customer Service', value: 'customer-service', category: 'hospitality' },
        { id: 'event-planning', label: 'Event Planning', value: 'event-planning', category: 'hospitality' },
        { id: 'tourism', label: 'Tourism', value: 'tourism', category: 'hospitality' }
      ]
    },
    {
      id: 'logistics',
      name: 'Logistics & Transportation',
      icon: 'bx-truck',
      color: '#8b5cf6',
      skills: [
        { id: 'supply-chain', label: 'Supply Chain Management', value: 'supply-chain', category: 'logistics' },
        { id: 'warehouse-operations', label: 'Warehouse Operations', value: 'warehouse-operations', category: 'logistics' },
        { id: 'inventory-management', label: 'Inventory Management', value: 'inventory-management', category: 'logistics' },
        { id: 'commercial-driving', label: 'Commercial Driving', value: 'commercial-driving', category: 'logistics' },
        { id: 'fleet-management', label: 'Fleet Management', value: 'fleet-management', category: 'logistics' }
      ]
    },
    {
      id: 'construction',
      name: 'Construction & Manufacturing',
      icon: 'bx-building-house',
      color: '#ef4444',
      skills: [
        { id: 'construction-management', label: 'Construction Management', value: 'construction-management', category: 'construction' },
        { id: 'blueprint-reading', label: 'Blueprint Reading', value: 'blueprint-reading', category: 'construction' },
        { id: 'equipment-operation', label: 'Equipment Operation', value: 'equipment-operation', category: 'construction' },
        { id: 'quality-control', label: 'Quality Control', value: 'quality-control', category: 'construction' },
        { id: 'safety-compliance', label: 'Safety Compliance', value: 'safety-compliance', category: 'construction' }
      ]
    },
    {
      id: 'administrative',
      name: 'Administrative & Office',
      icon: 'bx-file',
      color: '#6b7280',
      skills: [
        { id: 'office-administration', label: 'Office Administration', value: 'office-administration', category: 'administrative' },
        { id: 'data-entry', label: 'Data Entry', value: 'data-entry', category: 'administrative' },
        { id: 'bookkeeping', label: 'Bookkeeping', value: 'bookkeeping', category: 'administrative' },
        { id: 'reception-skills', label: 'Reception Skills', value: 'reception-skills', category: 'administrative' },
        { id: 'records-management', label: 'Records Management', value: 'records-management', category: 'administrative' }
      ]
    },
    {
      id: 'personal-care',
      name: 'Personal Care & Wellness',
      icon: 'bx-heart',
      color: '#ec4899',
      skills: [
        { id: 'cosmetology', label: 'Cosmetology', value: 'cosmetology', category: 'personal-care' },
        { id: 'fitness-training', label: 'Fitness Training', value: 'fitness-training', category: 'personal-care' },
        { id: 'massage-therapy', label: 'Massage Therapy', value: 'massage-therapy', category: 'personal-care' },
        { id: 'elderly-care', label: 'Elderly Care', value: 'elderly-care', category: 'personal-care' },
        { id: 'child-care', label: 'Child Care', value: 'child-care', category: 'personal-care' }
      ]
    }
  ];

  // Pre-computed lookups for better performance
  const strengthLookup = new Map(strengthOptions.map(opt => [opt.value, opt]));
  const experienceLookup = new Map(experienceOptions.map(opt => [opt.value, opt]));
  const skillCategoryLookup = new Map();
  
  // Initialize skill category lookup
  technicalSkillCategories.forEach(category => {
    category.skills.forEach(skill => {
      skillCategoryLookup.set(skill.value, category);
    });
  });

  // Optimized reactive declarations
  $: selectedSkillsCount = data.technicalSkills.length;
  $: selectedStrengthsCount = data.strengths.length;
  
  $: isFormComplete = data.strengths.length > 0 && 
                      data.experienceLevel && 
                      data.technicalSkills.length > 0;

  $: hasSelections = data.strengths.length > 0 || 
                     data.experienceLevel || 
                     data.technicalSkills.length > 0;

  // Optimized filtering with early returns and caching
  $: filteredCategories = (() => {
    const query = searchQuery.trim().toLowerCase();
    const isAllCategory = selectedCategory === 'all';
    
    // Fast path: no filters applied
    if (!query && isAllCategory) {
      return technicalSkillCategories;
    }

    return technicalSkillCategories
      .map(category => {
        // Early category filtering
        if (!isAllCategory && category.id !== selectedCategory) {
          return { ...category, skills: [] };
        }

        const filteredSkills = category.skills.filter(skill => {
          // Fast path for category-only filter
          if (!query) return true;
          
          return skill.label.toLowerCase().includes(query) || 
                 skill.value.toLowerCase().includes(query) ||
                 category.name.toLowerCase().includes(query);
        });
        
        return {
          ...category,
          skills: filteredSkills
        };
      })
      .filter(category => category.skills.length > 0);
  })();

  // Optimized disabled state checks
  $: isStrengthDisabled = (value: string) => 
    data.strengths.length >= STRENGTH_LIMIT && !data.strengths.includes(value);

  $: isTechnicalSkillDisabled = (value: string) => 
    data.technicalSkills.length >= SKILLS_LIMIT && !data.technicalSkills.includes(value);

  // Lifecycle
  onMount(() => {
    console.log('Skills component mounted');
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

  const handleStrengthChange = (value: string) => {
    data.strengths = handleMultiSelect(data.strengths, value, STRENGTH_LIMIT, 'strength');
  };

  const handleTechnicalSkillChange = (value: string) => {
    data.technicalSkills = handleMultiSelect(data.technicalSkills, value, SKILLS_LIMIT, 'skill');
  };

  const handleExperienceChange = (value: string) => {
    data.experienceLevel = value;
    showToast('Experience level updated', 'success');
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
    data.strengths = [];
    data.experienceLevel = '';
    data.technicalSkills = [];
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
  const goNext = async () => {
    // Early validation
    if (data.strengths.length === 0) {
      showToast('Please select at least one strength', 'warning');
      return;
    }
    
    if (!data.experienceLevel) {
      showToast('Please select your experience level', 'warning');
      return;
    }
    
    if (data.technicalSkills.length === 0) {
      showToast('Please select at least one technical skill', 'warning');
      return;
    }
    
    isLoading = true;
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      dispatch('complete', {
        strengths: data.strengths,
        experienceLevel: data.experienceLevel,
        technicalSkills: data.technicalSkills,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      showToast('Failed to save skills', 'warning');
      console.error('Error saving skills:', error);
    } finally {
      isLoading = false;
    }
  };

  const goBack = () => {
    dispatch('back');
  };

  // Optimized helper functions using pre-computed lookups
  const getStrengthIcon = (value: string) => strengthLookup.get(value)?.icon || 'bx-question-mark';
  const getStrengthLabel = (value: string) => strengthLookup.get(value)?.label || value;
  const getExperienceIcon = (value: string) => experienceLookup.get(value)?.icon || 'bx-briefcase';
  const getExperienceLabel = (value: string) => experienceLookup.get(value)?.label || value;
  const getSkillCategory = (value: string) => skillCategoryLookup.get(value);

  // Format skill label for display
  const formatSkillLabel = (skillValue: string) => {
    return skillValue.split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
</script>

<div class="skills-page">
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

  <div class="skills-header">
    <div class="header-content">
      <h1>Skills & Strengths</h1>
      <p>Showcase your professional capabilities and expertise across all industries</p>
    </div>
  </div>

  <div class="center-container">
    <section class="skills-content">
      <!-- Progress Section -->
      <div class="progress-container">
        <div class="progress-bar">
          <div class="progress-fill" style="width: {progressWidth}"></div>
        </div>
        <div class="progress-text">Step 2 of 4</div>
      </div>

      <h2>Build Your Professional Profile</h2>

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
            {#if data.strengths.length > 0}
              <div class="preview-category">
                <h4>Strengths ({selectedStrengthsCount}/{STRENGTH_LIMIT})</h4>
                <div class="preview-tags">
                  {#each data.strengths as strength}
                    <span class="preview-tag" transition:scale>
                      <i class='bx {getStrengthIcon(strength)}'></i> 
                      {getStrengthLabel(strength)}
                      <button 
                        class="remove-tag" 
                        on:click={() => handleStrengthChange(strength)}
                        aria-label="Remove {getStrengthLabel(strength)}"
                      >
                        <i class='bx bx-x'></i>
                      </button>
                    </span>
                  {/each}
                </div>
              </div>
            {/if}
            
            {#if data.experienceLevel}
              <div class="preview-category">
                <h4>Experience Level</h4>
                <div class="preview-tags">
                  <span class="preview-tag">
                    <i class='bx {getExperienceIcon(data.experienceLevel)}'></i> 
                    {getExperienceLabel(data.experienceLevel)}
                    <button 
                      class="remove-tag" 
                      on:click={() => data.experienceLevel = ''}
                      aria-label="Remove experience level"
                    >
                      <i class='bx bx-x'></i>
                    </button>
                  </span>
                </div>
              </div>
            {/if}
            
            {#if data.technicalSkills.length > 0}
              <div class="preview-category">
                <h4>Skills ({selectedSkillsCount}/{SKILLS_LIMIT})</h4>
                <div class="preview-tags">
                  {#each data.technicalSkills as skill}
                    {#key skill}
                      {@const category = getSkillCategory(skill)}
                      <span class="preview-tag" transition:scale>
                        {#if category}
                          <i class='bx {category.icon}' style="color: {category.color}"></i>
                        {/if}
                        {formatSkillLabel(skill)}
                        <button 
                          class="remove-tag" 
                          on:click={() => handleTechnicalSkillChange(skill)}
                          aria-label="Remove {formatSkillLabel(skill)}"
                        >
                          <i class='bx bx-x'></i>
                        </button>
                      </span>
                    {/key}
                  {/each}
                </div>
              </div>
            {/if}
          </div>
        </div>
      {/if}

      <!-- Strengths Section -->
      <div class="question-card">
        <div class="question-header">
          <div class="question-title">
            <i class='bx bx-star'></i>
            <h3>What are your top strengths? <span class="limit-text">(Select up to {STRENGTH_LIMIT})</span></h3>
          </div>
          <div class="tooltip">
            <i class='bx bx-info-circle'></i>
            <span class="tooltiptext">Select the qualities that best represent your professional strengths. Choose up to {STRENGTH_LIMIT}.</span>
          </div>
        </div>
        <p class="question-description">These personal attributes will help employers understand your work style and potential</p>
        
        <div class="options-grid strength-options">
          {#each strengthOptions as option (option.id)}
            <label 
              class="option-card {isStrengthDisabled(option.value) ? 'disabled' : ''} {data.strengths.includes(option.value) ? 'selected' : ''}"
              title="{option.description}"
            >
              <input
                type="checkbox"
                value={option.value}
                checked={data.strengths.includes(option.value)}
                on:change={() => handleStrengthChange(option.value)}
                disabled={isStrengthDisabled(option.value)}
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
        
        {#if selectedStrengthsCount > 0}
          <div class="selection-count">
            <i class='bx bx-check-square'></i> 
            Selected: {selectedStrengthsCount}/{STRENGTH_LIMIT}
            {#if selectedStrengthsCount === STRENGTH_LIMIT}
              <span class="limit-reached">Maximum reached</span>
            {/if}
          </div>
        {/if}
      </div>

      <!-- Experience Section -->
      <div class="question-card">
        <div class="question-header">
          <div class="question-title">
            <i class='bx bx-briefcase'></i>
            <h3>What's your professional experience level?</h3>
          </div>
        </div>
        <p class="question-description">This helps match you with appropriate opportunities and career paths</p>
        
        <div class="options-grid experience-options">
          {#each experienceOptions as option (option.id)}
            <label class="option-card {data.experienceLevel === option.value ? 'selected' : ''}">
              <input
                type="radio"
                name="experience"
                value={option.value}
                checked={data.experienceLevel === option.value}
                on:change={() => handleExperienceChange(option.value)}
                aria-label="{option.label} - {option.description}"
              />
              <div class="option-content">
                <div class="option-icon">
                  <i class='bx {option.icon}'></i>
                </div>
                <div class="option-details">
                  <span class="option-label">{option.label}</span>
                  <span class="option-description">{option.description}</span>
                  <span class="option-meta">{option.years}</span>
                </div>
                <div class="checkmark">
                  <i class='bx bx-check'></i>
                </div>
              </div>
            </label>
          {/each}
        </div>
      </div>

      <!-- Technical Skills Section -->
      <div class="question-card">
        <div class="question-header">
          <div class="question-title">
            <i class='bx bx-wrench'></i>
            <h3>Select your professional skills <span class="limit-text">(Select up to {SKILLS_LIMIT})</span></h3>
          </div>
          <div class="tooltip">
            <i class='bx bx-info-circle'></i>
            <span class="tooltiptext">Choose skills relevant to your field. Browse categories or search for specific skills.</span>
          </div>
        </div>
        <p class="question-description">Select skills from various industries including skilled trades, healthcare, technology, and more</p>
        
        <!-- Search and Filter Controls -->
        <div class="skills-controls">
          <div class="search-box">
            <i class='bx bx-search'></i>
            <input 
              type="text" 
              placeholder="Search skills across all categories..." 
              class="skill-search" 
              bind:value={searchQuery}
              aria-label="Search skills"
            />
            {#if searchQuery}
              <button class="clear-search" on:click={clearSearch} aria-label="Clear search">
                <i class='bx bx-x'></i>
              </button>
            {/if}
          </div>
          
          <div class="category-filters">
            <button 
              class="category-filter {selectedCategory === 'all' ? 'active' : ''}"
              on:click={() => handleCategoryFilter('all')}
              aria-label="Show all categories"
            >
              All Categories
            </button>
            {#each technicalSkillCategories as category (category.id)}
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
        {#if searchQuery && filteredCategories.length === 0}
          <div class="no-results">
            <i class='bx bx-search-alt'></i>
            <p>No skills found for "{searchQuery}"</p>
            <small>Try a different search term or browse all categories</small>
            <button class="clear-search-btn" on:click={clearSearch}>
              Clear Search
            </button>
          </div>
        {/if}
        
        <!-- Skills Categories -->
        <div class="skill-categories">
          {#each filteredCategories as category (category.id)}
            <div class="skill-category">
              <h4 class="category-title">
                <i class='bx {category.icon}' style="color: {category.color}"></i> 
                {category.name}
                {#if searchQuery || selectedCategory !== 'all'}
                  <span class="match-count">({category.skills.length} match{#if category.skills.length !== 1}es{/if})</span>
                {/if}
              </h4>
              <div class="options-grid skill-options">
                {#each category.skills as option (option.id)}
                  <label 
                    class="option-card {isTechnicalSkillDisabled(option.value) ? 'disabled' : ''} {data.technicalSkills.includes(option.value) ? 'selected' : ''}"
                  >
                    <input
                      type="checkbox"
                      value={option.value}
                      checked={data.technicalSkills.includes(option.value)}
                      on:change={() => handleTechnicalSkillChange(option.value)}
                      disabled={isTechnicalSkillDisabled(option.value)}
                      aria-label="{option.label}"
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
        
        {#if selectedSkillsCount > 0}
          <div class="selection-count">
            <i class='bx bx-check-square'></i> 
            Selected: {selectedSkillsCount}/{SKILLS_LIMIT}
            {#if selectedSkillsCount === SKILLS_LIMIT}
              <span class="limit-reached">Maximum reached</span>
            {/if}
          </div>
        {/if}
      </div>

      <!-- Navigation -->
      <div class="navigation-buttons">
        <button class="nav-button secondary" on:click={goBack}>
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
          on:click={goNext} 
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

  .skills-page {
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

  .option-meta {
    font-size: 0.75rem;
    color: #94a3b8;
    margin-top: 0.25rem;
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
    .skills-page {
      padding: 0;
    }

    .toast {
      top: 1rem;
      right: 1rem;
      left: 1rem;
      max-width: none;
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
