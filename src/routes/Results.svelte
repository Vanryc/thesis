<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { fade } from 'svelte/transition';
  const dispatch = createEventDispatcher();

  interface CareerMatch {
    title: string;
    company?: string;
    location?: string;
    matchPercentage: number;
    strengths: string[];
    growthOpportunity?: string;
    salary?: string;
    url?: string;
    industry?: string;
    responsibilities?: string;
    requiredSkills?: string[];
    matchReason?: string;
  }

  interface AlternatePath {
    title: string;
    matchPercentage: number;
    description?: string;
  }

  interface ResultsData {
    topMatches: CareerMatch[];
    alternatePaths: AlternatePath[];
    jobLinks: string[];
  }

  export let recommendations: CareerMatch[] = [];
  export let alternatePaths: AlternatePath[] = [];
  export let jobLinks: string[] = [];

  // Default job links for common career paths
  const defaultJobLinks = [
    "https://www.indeed.com/jobs?q=software+engineer&l=&from=searchOnHP",
    "https://www.linkedin.com/jobs/search/?keywords=Data%20Scientist&position=1&pageNum=0",
    "https://www.indeed.com/jobs?q=project+manager&l="
  ];

  let isSaving = false;
  let showDetails: boolean[] = [];

  // Function to extract and calculate salary values
  function calculateSalaries(salaryString: string | undefined) {
    if (!salaryString) return null;
    
    // Extract numbers from salary string (handles formats like "$50,000 - $70,000" or "50K-70K")
    const numbers = salaryString.match(/\d+/g);
    if (!numbers || numbers.length < 2) return null;
    
    const min = parseInt(numbers[0]);
    const max = parseInt(numbers[1]);
    
    // Check if salary is in thousands (e.g., 50K-70K)
    const isInThousands = salaryString.toLowerCase().includes('k') || 
                         (min < 100 && max < 100);
    
    const annualMin = isInThousands ? min * 1000 : min;
    const annualMax = isInThousands ? max * 1000 : max;
    
    const monthlyMin = Math.round(annualMin / 12);
    const monthlyMax = Math.round(annualMax / 12);
    
    return {
      annual: `$${annualMin.toLocaleString()} - $${annualMax.toLocaleString()}`,
      monthly: `$${monthlyMin.toLocaleString()} - $${monthlyMax.toLocaleString()}`
    };
  }

  $: results = {
    topMatches: recommendations.slice(0, 3) || [],
    alternatePaths: alternatePaths.length > 0 ? alternatePaths : recommendations.slice(3).map(job => ({
      title: job.title,
      matchPercentage: job.matchPercentage,
      description: job.industry ? `Industry: ${job.industry}` : ''
    })) || [
      { 
        title: "Similar Role", 
        matchPercentage: 75,
        description: "Roles with similar skill requirements but different focus areas"
      },
      { 
        title: "Related Field", 
        matchPercentage: 65,
        description: "Fields that leverage transferable skills from your background"
      }
    ],
    jobLinks: jobLinks.length > 0 ? jobLinks : defaultJobLinks.slice(0, recommendations.length > 3 ? 3 : recommendations.length)
  };

  function handleStartOver() {
    dispatch('restart');
  }

  function copyLink(link: string) {
    navigator.clipboard.writeText(link);
  }

  async function saveAsPDF() {
    isSaving = true;
    try {
      // Create a print stylesheet
      const style = document.createElement('style');
      style.innerHTML = `
        @media print {
          body * {
            visibility: hidden;
          }
          .results-container, .results-container * {
            visibility: visible;
          }
          .results-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 20px;
            box-shadow: none;
            background: white;
          }
          .action-buttons, .details-btn, .copy {
            display: none !important;
          }
          /* Expand all details sections for printing */
          .details-section {
            display: block !important;
          }
          /* Hide empty elements */
          .empty-state {
            display: none !important;
          }
        }
      `;
      document.head.appendChild(style);

      // Create a report header
      const reportHeader = document.createElement('div');
      reportHeader.className = 'report-header';
      reportHeader.innerHTML = `
        <h1 style="text-align: center; margin-bottom: 5px; color: #1f2937;">Career Match Results Report</h1>
        <p style="text-align: center; color: #6b7280; margin-bottom: 30px;">Generated on ${new Date().toLocaleDateString()}</p>
      `;
      
      // Find the results container
      const resultsContainer = document.querySelector('.results-container');
      if (!resultsContainer) {
        throw new Error("Results container not found.");
      }
      const resultsContainerEl = resultsContainer as HTMLElement;
      
      // Clone the container to avoid modifying the original
      const clone = resultsContainerEl.cloneNode(true) as HTMLElement;
      
      // Remove action buttons from the clone
      const actionButtons = clone.querySelector('.action-buttons');
      if (actionButtons) actionButtons.remove();
      
      // Remove progress bar from the clone
      const progressBar = clone.querySelector('.progress-bar');
      if (progressBar) progressBar.remove();
      
      // Insert the header
      clone.insertBefore(reportHeader, clone.firstChild);
      
      // Create a temporary container for printing
      const printContainer = document.createElement('div');
      printContainer.className = 'print-only';
      printContainer.appendChild(clone);
      
      // Hide the original content
      resultsContainerEl.style.visibility = 'hidden';
      
      // Add the print container to the body
      document.body.appendChild(printContainer);
      
      // Print the page
      window.print();
      
      // Clean up
      setTimeout(() => {
        document.head.removeChild(style);
        printContainer.remove();
        (resultsContainer as HTMLElement).style.visibility = 'visible';
        isSaving = false;
      }, 1000);
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("Failed to generate PDF. Please try printing the page manually.");
      isSaving = false;
    }
  }

  function toggleDetails(index: number) {
    showDetails[index] = !showDetails[index];
    // Force Svelte to recognize the change
    showDetails = [...showDetails];
  }
</script>

<div class="results-container">
  <div class="progress-bar">
    <div class="progress-complete" style="width: 100%"></div>
  </div>

  <h1>Your Top 3 Career Matches</h1>
  <p class="subtitle">Based on your preferences, skills, and work environment</p>

  {#if recommendations.length === 0}
    <div class="empty-state" transition:fade>
      <p>No specific recommendations found based on your criteria.</p>
      <p>Try adjusting your preferences or skills for better matches.</p>
    </div>
  {:else}
    <!-- Top 3 Matches -->
    <div class="top-matches-grid">
      {#each results.topMatches as match, i}
        <div class="result-card top-match" transition:fade>
          <div class="match-badge">{match.matchPercentage}% Match</div>
          <h2>{match.title}</h2>
          
          {#if match.industry}
            <p class="company-location">
              Industry: {match.industry}
            </p>
          {/if}
          
          <div class="strengths">
            <div class="icon">✅</div>
            <div>
              <strong>Your strengths align:</strong>
              {#if match.requiredSkills && match.requiredSkills.length > 0}
                {#each match.requiredSkills.slice(0, 3) as skill, i}
                  {skill}{i < match.requiredSkills.slice(0, 3).length - 1 ? ', ' : ''}
                {/each}
              {:else}
                {#each match.strengths as strength, i}
                  {strength}{i < match.strengths.length - 1 ? ', ' : ''}
                {/each}
              {/if}
            </div>
          </div>
          
          {#if match.growthOpportunity}
            <div class="growth">
              <div class="icon">📈</div>
              <div>
                <strong>Growth potential:</strong> {match.growthOpportunity}
              </div>
            </div>
          {/if}
          
          {#if match.salary}
            <div class="salary">
              <div class="icon">💰</div>
              <div>
                <strong>Salary range:</strong> {match.salary}
                {#if calculateSalaries(match.salary)}
                  <div class="salary-details">
                    <span class="salary-breakdown">
                      Monthly: {calculateSalaries(match.salary)?.monthly}<br>
                      Annual: {calculateSalaries(match.salary)?.annual}
                    </span>
                  </div>
                {/if}
              </div>
            </div>
          {/if}
          
          <button class="details-btn" on:click={() => toggleDetails(i)}>
            {showDetails[i] ? 'Hide Details' : 'Show More Details'}
          </button>
          
          {#if showDetails[i]}
            <div class="details-section">
              {#if match.responsibilities}
                <div class="detail-item">
                  <strong>Typical Responsibilities:</strong>
                  <p>{match.responsibilities}</p>
                </div>
              {/if}
              
              {#if match.requiredSkills}
                <div class="detail-item">
                  <strong>Required Skills:</strong>
                  <div class="skills-container">
                    {#each match.requiredSkills as skill}
                      <span class="skill-tag">{skill}</span>
                    {/each}
                  </div>
                </div>
              {/if}
              
              {#if match.matchReason}
                <div class="detail-item">
                  <strong>Why This Matches You:</strong>
                  <p>{match.matchReason}</p>
                </div>
              {/if}
            </div>
          {/if}
          
          {#if results.jobLinks[i]}
            <a href={results.jobLinks[i]} target="_blank" rel="noopener noreferrer" class="apply-btn">
              Find {match.title} Jobs
            </a>
          {/if}
        </div>
      {/each}
    </div>

    <!-- Alternate Paths -->
    {#if results.alternatePaths.length > 0}
      <div class="alternate-paths" transition:fade>
        <h3>Other Career Paths to Consider:</h3>
        <div class="paths-grid">
          {#each results.alternatePaths as path}
            <div class="path-card">
              <div class="path-match">{path.matchPercentage}% Match</div>
              <h4>{path.title}</h4>
              {#if path.description}
                <p class="path-description">{path.description}</p>
              {/if}
            </div>
          {/each}
        </div>
      </div>
    {/if}

    <!-- Job Links -->
    {#if results.jobLinks.length > 0}
      <div class="job-posts" transition:fade>
        <h3>Job Search Links for Your Top Matches:</h3>
        <ul>
          {#each results.topMatches as match, i}
            <li>
              <div class="job-link-container">
                <span class="job-title">{match.title}:</span>
                <a href={results.jobLinks[i]} target="_blank" rel="noopener noreferrer" class="job-link">
                  {results.jobLinks[i].includes('linkedin.com') ? 'LinkedIn Jobs' : 'Indeed Jobs'}
                </a>
                <button class="copy" aria-label="Copy job link to clipboard" on:click={() => copyLink(results.jobLinks[i])}>
                  <span data-text-end="Copied!" data-text-initial="Copy to clipboard" class="tooltip"></span>
                  <span>
                    <svg xml:space="preserve" style="enable-background:new 0 0 512 512" viewBox="0 0 6.35 6.35" y="0" x="0" height="20" width="20" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" xmlns="http://www.w3.org/2000/svg" class="clipboard">
                      <g>
                        <path fill="currentColor" d="M2.43.265c-.3 0-.548.236-.573.53h-.328a.74.74 0 0 0-.735.734v3.822a.74.74 0 0 0 .735.734H4.82a.74.74 0 0 0 .735-.734V1.529a.74.74 0 0 0-.735-.735h-.328a.58.58 0 0 0-.573-.53zm0 .529h1.49c.032 0 .049.017.049.049v.431c0 .032-.017.049-.049.049H2.43c-.032 0-.05-.017-.05-.049V.843c0-.032.018-.05.05-.05zm-.901.53h.328c.026.292.274.528.573.528h1.49a.58.58 0 0 0 .573-.529h.328a.2.2 0 0 1 .206.206v3.822a.2.2 0 0 1-.206.205H1.53a.2.2 0 0 1-.206-.205V1.529a.2.2 0 0 1 .206-.206z"></path>
                      </g>
                    </svg>
                    <svg xml:space="preserve" style="enable-background:new 0 0 512 512" viewBox="0 0 24 24" y="0" x="0" height="18" width="18" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" xmlns="http://www.w3.org/2000/svg" class="checkmark">
                      <g>
                        <path data-original="#000000" fill="currentColor" d="M9.707 19.121a.997.997 0 0 1-1.414 0l-5.646-5.647a1.5 1.5 0 0 1 0-2.121l.707-.707a1.5 1.5 0 0 1 2.121 0L9 14.171l9.525-9.525a1.5 1.5 0 0 1 2.121 0l.707.707a1.5 1.5 0 0 1 0 2.121z"></path>
                      </g>
                    </svg>
                  </span>
                </button>
              </div>
            </li>
          {/each}
        </ul>
      </div>
    {/if}
  {/if}

  <!-- Action Buttons -->
  <div class="action-buttons">
    <button class="primary-btn" on:click={handleStartOver}>
      Start Over
    </button>
    <button class="secondary-btn" on:click={saveAsPDF} disabled={isSaving}>
      {isSaving ? 'Generating PDF...' : 'Save as PDF'}
    </button>
  </div>
</div>

<style>
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap');

  :global(body) {
    background-color: #f5f7fa;
    margin: 0;
    padding: 0;
    font-family: 'Poppins', sans-serif;
  }

  .results-container {
    max-width: 1000px;
    margin: 2rem auto;
    padding: 2rem;
    background: #ffffff;
    border-radius: 1rem;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
    font-family: 'Poppins', sans-serif;
  }

  .progress-bar {
    height: 10px;
    background-color: #e5e7eb;
    border-radius: 999px;
    margin-bottom: 2rem;
    overflow: hidden;
  }

  .progress-complete {
    height: 100%;
    background: linear-gradient(90deg, #6366f1, #8b5cf6);
    border-radius: 999px;
    transition: width 0.5s ease;
  }

  h1 {
    color: #1f2937;
    font-size: 2rem;
    font-weight: 600;
    margin-bottom: 0.25rem;
    text-align: center;
  }

  .subtitle {
    color: #6b7280;
    font-size: 1rem;
    margin-bottom: 2rem;
    text-align: center;
  }

  .empty-state {
    text-align: center;
    padding: 2rem;
    color: #6b7280;
    background-color: #f9fafb;
    border-radius: 0.75rem;
    margin: 1rem 0;
  }

  .top-matches-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .result-card {
    position: relative;
    background-color: #f9fafb;
    border: 1px solid #e5e7eb;
    padding: 1.75rem;
    border-radius: 1rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .top-match {
    background-color: #f0fdf4;
    border-color: #bbf7d0;
  }

  .match-badge {
    position: absolute;
    top: -12px;
    right: 20px;
    background: #10b981;
    color: white;
    padding: 0.35rem 1rem;
    font-size: 0.75rem;
    border-radius: 9999px;
    font-weight: 600;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  }

  h2 {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0 0 0.5rem 0;
    color: #111827;
  }

  .company-location {
    color: #6b7280;
    margin-bottom: 1rem;
    font-size: 0.95rem;
  }

  h3 {
    font-size: 1.25rem;
    font-weight: 500;
    color: #1f2937;
    margin-bottom: 1rem;
  }

  h4 {
    font-size: 1.1rem;
    font-weight: 500;
    color: #1f2937;
    margin: 0.5rem 0;
  }

  .strengths, .growth, .salary {
    display: flex;
    gap: 0.75rem;
    align-items: flex-start;
    margin-bottom: 1rem;
    font-size: 0.95rem;
  }

  .icon {
    font-size: 1.25rem;
    flex-shrink: 0;
  }

  .salary-details {
    margin-top: 0.25rem;
    font-size: 0.85rem;
    color: #4b5563;
  }

  .salary-breakdown {
    display: block;
    padding-left: 1.5rem;
  }

  ul {
    padding-left: 0;
    margin: 0 0 1.5rem 0;
    list-style: none;
  }

  li {
    margin-bottom: 0.75rem;
    color: #374151;
    font-size: 0.95rem;
  }

  a {
    color: #6366f1;
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
  }

  .apply-btn {
    display: inline-block;
    margin-top: auto;
    padding: 0.75rem 1.5rem;
    background-color: #2563eb;
    color: white;
    border-radius: 0.5rem;
    font-weight: 500;
    transition: all 0.2s ease;
    border: none;
    cursor: pointer;
    text-align: center;
    width: 100%;
  }

  .apply-btn:hover {
    background-color: #1d4ed8;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
  }

  .details-btn {
    display: block;
    margin: 1rem 0;
    padding: 0.5rem 1rem;
    background: transparent;
    color: #6366f1;
    border: 1px solid #6366f1;
    border-radius: 6px;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .details-btn:hover {
    background-color: #f0f2ff;
  }

  .details-section {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px dashed #e5e7eb;
  }

  .detail-item {
    margin-bottom: 1.25rem;
  }

  .detail-item strong {
    display: block;
    margin-bottom: 0.5rem;
    color: #374151;
  }

  .detail-item p {
    margin: 0;
    color: #4b5563;
    font-size: 0.9rem;
    line-height: 1.5;
  }

  .skills-container {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }

  .skill-tag {
    background-color: #e0e7ff;
    color: #4338ca;
    padding: 0.25rem 0.75rem;
    border-radius: 999px;
    font-size: 0.8rem;
    font-weight: 500;
  }

  .job-link-container {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .job-title {
    font-weight: 500;
    min-width: 150px;
    display: inline-block;
  }

  .job-link {
    flex-grow: 1;
  }

  /* New copy button styles */
  .copy {
    /* button */
    --button-bg: transparent;
    --button-hover-bg: #f3f4f6;
    --button-text-color: #CCCCCC;
    --button-hover-text-color: #8bb9fe;
    --button-border-radius: 6px;
    --button-diameter: 36px;
    --button-outline-width: 1px;
    --button-outline-color: rgb(141, 141, 141);
    /* tooltip */
    --tooltip-bg: #f4f3f3;
    --toolptip-border-radius: 4px;
    --tooltip-font-family: Menlo, Roboto Mono, monospace;
    --tooltip-font-size: 12px;
    --tootip-text-color: rgb(50, 50, 50);
    --tooltip-padding-x: 7px;
    --tooltip-padding-y: 7px;
    --tooltip-offset: 8px;
  }

  .copy {
    box-sizing: border-box;
    width: var(--button-diameter);
    height: var(--button-diameter);
    border-radius: var(--button-border-radius);
    background-color: var(--button-bg);
    color: var(--button-text-color);
    border: none;
    cursor: pointer;
    position: relative;
    outline: none;
  }

  .tooltip {
    position: absolute;
    opacity: 0;
    visibility: 0;
    top: -35px;
    left: 50%;
    transform: translateX(-50%);
    white-space: nowrap;
    font: var(--tooltip-font-size) var(--tooltip-font-family);
    color: var(--tootip-text-color);
    background: var(--tooltip-bg);
    padding: var(--tooltip-padding-y) var(--tooltip-padding-x);
    border-radius: var(--toolptip-border-radius);
    pointer-events: none;
  }

  .tooltip::before {
    content: attr(data-text-initial);
  }

  .tooltip::after {
    content: "";
    position: absolute;
    bottom: calc(var(--tooltip-padding-y) / 2 * -1);
    width: var(--tooltip-padding-y);
    height: var(--tooltip-padding-y);
    background: inherit;
    left: 50%;
    transform: translateX(-50%) rotate(45deg);
    z-index: -999;
    pointer-events: none;
  }

  .copy svg {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .checkmark {
    display: none;
  }

  /* actions */
  .copy:hover .tooltip,
  .copy:focus:not(:focus-visible) .tooltip {
    opacity: 1;
    visibility: visible;
    top: calc((100% + var(--tooltip-offset)) * -1);
  }

  .copy:focus:not(:focus-visible) .tooltip::before {
    content: attr(data-text-end);
  }

  .copy:focus:not(:focus-visible) .clipboard {
    display: none;
  }

  .copy:focus:not(:focus-visible) .checkmark {
    display: block;
  }

  .copy:hover,
  .copy:focus {
    background-color: var(--button-hover-bg);
  }

  .copy:active {
    outline: var(--button-outline-width) solid var(--button-outline-color);
  }

  .copy:hover svg {
    color: var(--button-hover-text-color);
  }

  .alternate-paths {
    margin-bottom: 2rem;
  }

  .paths-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
  }

  .path-card {
    background-color: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 0.75rem;
    padding: 1.25rem;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .path-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }

  .path-match {
    font-size: 0.75rem;
    font-weight: 600;
    color: #10b981;
    margin-bottom: 0.5rem;
  }

  .path-description {
    font-size: 0.85rem;
    color: #64748b;
    margin: 0.5rem 0 0;
    line-height: 1.4;
  }

  .action-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin-top: 2rem;
    justify-content: center;
  }

  .primary-btn {
    background: linear-gradient(to right, #6366f1, #8b5cf6);
    color: white;
    border: none;
    border-radius: 8px;
    padding: 0.75rem 1.75rem;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    box-shadow: 0 4px 10px rgba(99, 102, 241, 0.25);
    transition: all 0.3s ease;
  }

  .primary-btn:hover {
    opacity: 0.95;
    transform: translateY(-1px);
  }

  .primary-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .secondary-btn {
    background-color: white;
    color: #6366f1;
    padding: 0.75rem 1.75rem;
    border-radius: 8px;
    border: 2px solid #6366f1;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .secondary-btn:hover {
    background-color: #f3f4f6;
  }

  .secondary-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    background-color: white;
  }

  @media (max-width: 768px) {
    .results-container {
      padding: 1.5rem;
      margin: 1rem;
    }

    .top-matches-grid {
      grid-template-columns: 1fr;
    }

    .action-buttons {
      flex-direction: column;
    }

    .primary-btn, .secondary-btn {
      width: 100%;
    }

    .paths-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 480px) {
    h1 {
      font-size: 1.5rem;
    }

    h2 {
      font-size: 1.25rem;
    }

    .result-card {
      padding: 1.25rem;
    }

    .job-title {
      min-width: 100%;
      margin-bottom: 0.25rem;
    }

    .salary-breakdown {
      padding-left: 0;
    }
  }

  @media print {
    .results-container, .results-container * {
      visibility: visible;
    }
    .results-container {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      margin: 0;  
      padding: 20px;
      box-shadow: none;
    }
    .action-buttons, .details-btn, .copy {
      display: none !important;
    }
  }
</style>