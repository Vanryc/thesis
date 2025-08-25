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

  let isSaving = false;
  let showDetails: boolean[] = [];
  let showConfirmation = false;

  // Function to generate job links that match the specific career recommendations
  function generateMatchingJobLinks(recommendations: CareerMatch[]): string[] {
    return recommendations.map((job, index) => {
      const cleanTitle = job.title
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      
      const encodedTitle = encodeURIComponent(cleanTitle);
      const location = encodeURIComponent('Philippines');
      
      // Alternate between LinkedIn and Indeed for each job
      if (index % 2 === 0) {
        // LinkedIn
        return `https://www.linkedin.com/jobs/search/?keywords=${encodedTitle}&location=${location}&geoId=103121230&f_TPR=r86400`;
      } else {
        // Indeed
        return `https://ph.indeed.com/jobs?q=${encodedTitle}&l=Philippines&fromage=7`;
      }
    });
  }

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
    // Use jobLinks from server if available, otherwise generate matching links
    jobLinks: jobLinks.length > 0 ? jobLinks : generateMatchingJobLinks(recommendations.slice(0, 3))
  };

  function handleStartOver() {
    showConfirmation = true;
  }

  function confirmStartOver() {
    showConfirmation = false;
    dispatch('restart');
  }

  function cancelStartOver() {
    showConfirmation = false;
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

  // Function to get the platform name from URL
  function getPlatformName(url: string): string {
    if (url.includes('linkedin.com')) return 'LinkedIn Jobs';
    if (url.includes('indeed.com')) return 'Indeed Jobs';
    if (url.includes('jobstreet.com')) return 'JobStreet';
    if (url.includes('kalibrr.com')) return 'Kalibrr';
    if (url.includes('monster.com')) return 'Monster Jobs';
    return 'Job Search';
  }
</script>

<div class="results-container">
  <div class="progress-bar">
    <div class="progress-complete" style="width: 100%"></div>
  </div>

  <div class="results-header">
    <h1>Your Career Match Results</h1>
    <p class="subtitle">We've analyzed your skills and preferences to find the best career matches</p>
    <div class="match-summary">
      <div class="summary-card">
        <div class="summary-value">{recommendations.length > 0 ? recommendations[0].matchPercentage : '0'}%</div>
        <div class="summary-label">Top Match</div>
      </div>
      <div class="summary-card">
        <div class="summary-value">{recommendations.length}</div>
        <div class="summary-label">Recommendations</div>
      </div>
      <div class="summary-card">
        <div class="summary-value">{alternatePaths.length > 0 ? alternatePaths.length : '3'}</div>
        <div class="summary-label">Alternate Paths</div>
      </div>
    </div>
  </div>

  {#if recommendations.length === 0}
    <div class="empty-state" transition:fade>
      <p>No specific recommendations found based on your criteria.</p>
      <p>Try adjusting your preferences or skills for better matches.</p>
    </div>
  {:else}
    <!-- Top 3 Matches -->
    <div class="section-header">
      <h2>Your Top 3 Career Matches</h2>
      <p class="section-description">These roles align best with your skills, experience, and preferences</p>
    </div>
    
    <div class="top-matches-grid">
      {#each results.topMatches as match, i}
        <div class="result-card top-match" transition:fade>
          <div class="match-badge" style:background-color={getMatchBadgeColor(match.matchPercentage)}>
            {match.matchPercentage}% Match
          </div>
          <h3>{match.title}</h3>
          
          {#if match.industry}
            <p class="company-location">
              <svg class="icon" viewBox="0 0 24 24" width="16" height="16">
                <path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              Industry: {match.industry}
            </p>
          {/if}
          
          <!-- Match Meter -->
          <div class="match-meter">
            <div class="meter-bar" style="width: {match.matchPercentage}%; background: linear-gradient(90deg, {getMatchBarColor(match.matchPercentage, 0)}, {getMatchBarColor(match.matchPercentage, 1)});"></div>
            <div class="meter-labels">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>
          
          <div class="strengths">
            <div class="icon">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
              </svg>
            </div>
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
              <div class="icon">
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="currentColor" d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6h-6z"/>
                </svg>
              </div>
              <div>
                <strong>Growth potential:</strong> {match.growthOpportunity}
              </div>
            </div>
          {/if}
          
          {#if match.salary}
            <div class="salary">
              <div class="icon">
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z"/>
                </svg>
              </div>
              <div>
                <strong>Estimated Salary:</strong> {match.salary}
                
              </div>
            </div>
          {/if}
          
          <button class="details-btn" on:click={() => toggleDetails(i)}>
            {showDetails[i] ? 'Hide Details' : 'Show More Details'}
            <svg class="chevron" viewBox="0 0 24 24" width="16" height="16">
              <path fill="currentColor" d="{showDetails[i] ? 'M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z' : 'M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z'}"/>
            </svg>
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
              <svg viewBox="0 0 24 24" width="16" height="16" style="margin-left: 8px;">
                <path fill="currentColor" d="M19 19H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>
              </svg>
            </a>
          {/if}
        </div>
      {/each}
    </div>

    <!-- Alternate Paths -->
    {#if results.alternatePaths.length > 0}
      <div class="section-header">
        <h2>Alternative Career Paths</h2>
        <p class="section-description">These options might also be good fits based on your transferable skills</p>
      </div>
      
      <div class="alternate-paths" transition:fade>
        <div class="paths-grid">
          {#each results.alternatePaths as path}
            <div class="path-card">
              <div class="path-match" style:background={getMatchBarColor(path.matchPercentage, 0.5)}>
                {path.matchPercentage}% Match
              </div>
              <h4>{path.title}</h4>
              {#if path.description}
                <p class="path-description">{path.description}</p>
              {/if}
              <div class="path-meter">
                <div class="meter-bar" style="width: {path.matchPercentage}%; background: linear-gradient(90deg, {getMatchBarColor(path.matchPercentage, 0)}, {getMatchBarColor(path.matchPercentage, 1)});"></div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}

    <!-- Job Links -->
    {#if results.jobLinks.length > 0}
      <div class="section-header">
        <h2>Job Search Resources</h2>
        <p class="section-description">Find current job openings for your top matches</p>
      </div>
      
      <div class="job-posts" transition:fade>
        <div class="job-links-grid">
          {#each results.topMatches as match, i}
            <div class="job-link-card">
              <div class="job-link-header">
                <h4>{match.title}</h4>
                <span class="job-match">{match.matchPercentage}% Match</span>
              </div>
              <div class="job-link-container">
                <a href={results.jobLinks[i]} target="_blank" rel="noopener noreferrer" class="job-link">
                  <svg viewBox="0 0 24 24" width="18" height="18" style="margin-right: 8px;">
                    <path fill="currentColor" d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                  </svg>
                  View on {getPlatformName(results.jobLinks[i])}
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
            </div>
          {/each}
        </div>
      </div>
    {/if}
  {/if}

  <!-- Action Buttons -->
  <div class="action-buttons">
    <button class="primary-btn" on:click={handleStartOver}>
      <svg viewBox="0 0 24 24" width="18" height="18" style="margin-right: 8px;">
        <path fill="currentColor" d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
      </svg>
      Start Over
    </button>
    <button class="secondary-btn" on:click={saveAsPDF} disabled={isSaving}>
      <svg viewBox="0 0 24 24" width="18" height="18" style="margin-right: 8px;">
        <path fill="currentColor" d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM12 7v6h5v-2h-3V7z"/>
      </svg>
      {isSaving ? 'Generating PDF...' : 'Save as PDF'}
    </button>
  </div>
</div>

<!-- Confirmation Modal -->
{#if showConfirmation}
  <div class="confirmation-modal" transition:fade>
    <div class="modal-content">
      <h3>Are you sure you want to start over?</h3>
      <p>This will reset all your answers and you'll need to begin the assessment again.</p>
      <div class="modal-buttons">
        <button class="cancel-btn" on:click={cancelStartOver}>Cancel</button>
        <button class="confirm-btn" on:click={confirmStartOver}>Start Over</button>
      </div>
    </div>
  </div>
{/if}

<style>
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

  :global(body) {
    background: linear-gradient(135deg, #c0c0aa, #1cefff);
    margin: 0;
    padding: 2rem 1rem;
    font-family: 'Poppins', sans-serif;
    min-height: 100vh;
  }

  .results-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2.5rem;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 1.5rem;
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1);
    font-family: 'Poppins', sans-serif;
    backdrop-filter: blur(5px);
    border: 1px solid rgba(255, 255, 255, 0.3);
  }

  .progress-bar {
    height: 8px;
    background-color: #e5e7eb;
    border-radius: 999px;
    margin-bottom: 2.5rem;
    overflow: hidden;
  }

  .progress-complete {
    height: 100%;
    background: linear-gradient(90deg, #c0c0aa, #1cefff);
    border-radius: 999px;
    transition: width 0.5s ease;
  }

  .results-header {
    text-align: center;
    margin-bottom: 3rem;
  }

  h1 {
    color: #1f2937;
    font-size: 2.25rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    background: linear-gradient(90deg, #1f2937, #4b5563);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .subtitle {
    color: #4b5563;
    font-size: 1.1rem;
    margin-bottom: 2rem;
    max-width: 700px;
    margin-left: auto;
    margin-right: auto;
    line-height: 1.6;
  }

  .match-summary {
    display: flex;
    justify-content: center;
    gap: 1.5rem;
    margin-top: 2rem;
  }

  .summary-card {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    min-width: 120px;
    text-align: center;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    border: 1px solid rgba(0, 0, 0, 0.05);
  }

  .summary-value {
    font-size: 1.8rem;
    font-weight: 700;
    color: #1f2937;
    margin-bottom: 0.5rem;
    background: linear-gradient(90deg, #c0c0aa, #1cefff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .summary-label {
    font-size: 0.9rem;
    color: #6b7280;
    font-weight: 500;
  }

  .section-header {
    margin-bottom: 2rem;
    text-align: center;
  }

  h2 {
    color: #1f2937;
    font-size: 1.8rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    position: relative;
    display: inline-block;
  }

  h2::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 3px;
    background: linear-gradient(90deg, #c0c0aa, #1cefff);
    border-radius: 3px;
  }

  .section-description {
    color: #6b7280;
    font-size: 1rem;
    max-width: 700px;
    margin: 0 auto 1.5rem;
    line-height: 1.6;
  }

  .empty-state {
    text-align: center;
    padding: 3rem 2rem;
    color: #6b7280;
    background-color: #f9fafb;
    border-radius: 1rem;
    margin: 2rem 0;
    border: 1px dashed #e5e7eb;
  }

  .top-matches-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 2rem;
    margin-bottom: 3rem;
  }

  .result-card {
    position: relative;
    background-color: white;
    border: 1px solid #e5e7eb;
    padding: 2rem;
    border-radius: 1rem;
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.03);
    display: flex;
    flex-direction: column;
    height: 100%;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }

  .result-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
  }

  .top-match {
    background-color: white;
    border: 1px solid rgba(192, 192, 170, 0.3);
    box-shadow: 0 6px 18px rgba(28, 239, 255, 0.1);
  }

  .match-badge {
    position: absolute;
    top: -12px;
    right: 20px;
    color: white;
    padding: 0.5rem 1.25rem;
    font-size: 0.8rem;
    border-radius: 9999px;
    font-weight: 600;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    z-index: 1;
  }

  h3 {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0.5rem 0 1rem 0;
    color: #111827;
    line-height: 1.3;
  }

  .company-location {
    color: #6b7280;
    margin-bottom: 1.5rem;
    font-size: 0.95rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .icon {
    color: #1cefff;
  }

  .match-meter {
    margin: 1rem 0 1.5rem;
  }

  .meter-bar {
    height: 8px;
    border-radius: 4px;
    margin-bottom: 0.5rem;
    transition: width 1s ease;
  }

  .meter-labels {
    display: flex;
    justify-content: space-between;
    font-size: 0.75rem;
    color: #6b7280;
  }

  .strengths, .growth, .salary {
    display: flex;
    gap: 0.75rem;
    align-items: flex-start;
    margin-bottom: 1.25rem;
    font-size: 0.95rem;
    line-height: 1.5;
  }

  .strengths {
    margin-top: 1rem;
  }

  .details-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 1.5rem 0;
    padding: 0.75rem 1.5rem;
    background: transparent;
    color: #1cefff;
    border: 1px solid #1cefff;
    border-radius: 8px;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .details-btn:hover {
    background-color: rgba(28, 239, 255, 0.1);
  }

  .chevron {
    margin-left: 8px;
    transition: transform 0.3s ease;
  }

  .details-section {
    margin-top: 1rem;
    padding-top: 1.5rem;
    border-top: 1px solid rgba(192, 192, 170, 0.3);
    animation: fadeIn 0.3s ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .detail-item {
    margin-bottom: 1.5rem;
  }

  .detail-item strong {
    display: block;
    margin-bottom: 0.75rem;
    color: #1f2937;
    font-size: 0.95rem;
  }

  .detail-item p {
    margin: 0;
    color: #4b5563;
    font-size: 0.9rem;
    line-height: 1.6;
  }

  .skills-container {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 0.75rem;
  }

  .skill-tag {
    background-color: rgba(28, 239, 255, 0.1);
    color: #0d9488;
    padding: 0.35rem 0.85rem;
    border-radius: 999px;
    font-size: 0.8rem;
    font-weight: 500;
    border: 1px solid rgba(28, 239, 255, 0.3);
  }

  .apply-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: auto;
    padding: 1rem 1.5rem;
    background: linear-gradient(90deg, #c0c0aa, #1cefff);
    color: #1f2937;
    border-radius: 8px;
    font-weight: 600;
    transition: all 0.3s ease;
    border: none;
    cursor: pointer;
    text-align: center;
    width: 100%;
  }

  .apply-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(28, 239, 255, 0.3);
  }

  .alternate-paths {
    margin-bottom: 3rem;
  }

  .paths-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
    margin-top: 1.5rem;
  }

  .path-card {
    background-color: white;
    border: 1px solid rgba(192, 192, 170, 0.3);
    border-radius: 1rem;
    padding: 1.5rem;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    position: relative;
    overflow: hidden;
  }

  .path-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(28, 239, 255, 0.1);
  }

  .path-match {
    position: absolute;
    top: 0;
    right: 0;
    padding: 0.35rem 1rem;
    font-size: 0.75rem;
    font-weight: 600;
    color: white;
    border-bottom-left-radius: 8px;
  }

  .path-description {
    font-size: 0.9rem;
    color: #64748b;
    margin: 1rem 0;
    line-height: 1.5;
  }

  .path-meter {
    height: 4px;
    background-color: #e5e7eb;
    border-radius: 2px;
    margin-top: 1.5rem;
    overflow: hidden;
  }

  .job-posts {
    margin-bottom: 2rem;
  }

  .job-links-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 1.5rem;
  }

  .job-link-card {
    background-color: white;
    border: 1px solid rgba(192, 192, 170, 0.3);
    border-radius: 1rem;
    padding: 1.5rem;
    transition: transform 0.3s ease;
  }

  .job-link-card:hover {
    transform: translateY(-3px);
  }

  .job-link-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .job-match {
    font-size: 0.8rem;
    font-weight: 600;
    color: white;
    background-color: #1cefff;
    padding: 0.25rem 0.75rem;
    border-radius: 999px;
  }

  .job-link-container {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .job-link {
    flex-grow: 1;
    display: flex;
    align-items: center;
    padding: 0.75rem 1rem;
    background-color: #f9fafb;
    border-radius: 8px;
    color: #1f2937;
    font-weight: 500;
    transition: all 0.3s ease;
  }

  .job-link:hover {
    background-color: #f3f4f6;
    text-decoration: none;
  }

  /* Copy button styles */
  .copy {
    /* button */
    --button-bg: transparent;
    --button-hover-bg: #f3f4f6;
    --button-text-color: #CCCCCC;
    --button-hover-text-color: #1cefff;
    --button-border-radius: 8px;
    --button-diameter: 42px;
    --button-outline-width: 1px;
    --button-outline-color: rgb(141, 141, 141);
    /* tooltip */
    --tooltip-bg: #1f2937;
    --toolptip-border-radius: 6px;
    --tooltip-font-family: 'Poppins', sans-serif;
    --tooltip-font-size: 12px;
    --tootip-text-color: white;
    --tooltip-padding-x: 10px;
    --tooltip-padding-y: 6px;
    --tooltip-offset: 10px;
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
    transition: all 0.3s ease;
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
    transition: all 0.2s ease;
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

  /* Action Buttons */
  .action-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    margin-top: 3rem;
    justify-content: center;
  }

  .primary-btn {
    display: flex;
    align-items: center;
    background: linear-gradient(90deg, #c0c0aa, #1cefff);
    color: #1f2937;
    border: none;
    border-radius: 12px;
    padding: 1rem 2rem;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 4px 15px rgba(28, 239, 255, 0.3);
    transition: all 0.3s ease;
  }

  .primary-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(28, 239, 255, 0.4);
  }

  .primary-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .secondary-btn {
    display: flex;
    align-items: center;
    background-color: white;
    color: #1f2937;
    padding: 1rem 2rem;
    border-radius: 12px;
    border: 2px solid #1cefff;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .secondary-btn:hover {
    background-color: rgba(28, 239, 255, 0.1);
    transform: translateY(-2px);
  }

  .secondary-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    background-color: white;
  }

  /* Confirmation Modal */
  .confirmation-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(5px);
  }

  .modal-content {
    background-color: white;
    padding: 2rem;
    border-radius: 1rem;
    max-width: 500px;
    width: 90%;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    text-align: center;
  }

  .modal-content h3 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    color: #1f2937;
  }

  .modal-content p {
    color: #6b7280;
    margin-bottom: 2rem;
    line-height: 1.6;
  }

  .modal-buttons {
    display: flex;
    justify-content: center;
    gap: 1rem;
  }

  .cancel-btn {
    padding: 0.75rem 1.5rem;
    background-color: #f3f4f6;
    color: #1f2937;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .cancel-btn:hover {
    background-color: #e5e7eb;
  }

  .confirm-btn {
    padding: 0.75rem 1.5rem;
    background: linear-gradient(90deg, #c0c0aa, #1cefff);
    color: #1f2937;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .confirm-btn:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  @media (max-width: 1024px) {
    .results-container {
      padding: 2rem;
    }
    
    .top-matches-grid, .job-links-grid {
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    }
  }

  @media (max-width: 768px) {
    :global(body) {
      padding: 1rem;
    }
    
    .results-container {
      padding: 1.5rem;
    }
    
    .match-summary {
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }
    
    .summary-card {
      width: 100%;
      max-width: 200px;
    }
    
    .action-buttons {
      flex-direction: column;
    }
    
    .primary-btn, .secondary-btn {
      width: 100%;
      justify-content: center;
    }

    .modal-buttons {
      flex-direction: column;
    }

    .cancel-btn, .confirm-btn {
      width: 100%;
    }
  }

  @media (max-width: 480px) {
    h1 {
      font-size: 1.75rem;
    }
    
    h2 {
      font-size: 1.5rem;
    }
    
    .top-matches-grid, .paths-grid, .job-links-grid {
      grid-template-columns: 1fr;
    }
    
    .result-card {
      padding: 1.5rem;
    }
    
    .job-link-container {
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .job-link {
      width: 100%;
    }
  }

  @media print {
    :global(body) {
      background: white !important;
      padding: 0 !important;
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
    
    /* Ensure all details are visible when printing */
    .details-section {
      display: block !important;
    }
  }
</style>

<script context="module">
  // Helper functions for match percentage colors
  export function getMatchBadgeColor(percentage: number): string {
    if (percentage >= 90) return '#10b981';
    if (percentage >= 75) return '#3b82f6';
    if (percentage >= 60) return '#f59e0b';
    return '#ef4444';
  }

  export function getMatchBarColor(percentage: number, opacity = 1): string {
    if (percentage >= 90) return `rgba(16, 185, 129, ${opacity})`;
    if (percentage >= 75) return `rgba(59, 130, 246, ${opacity})`;
    if (percentage >= 60) return `rgba(245, 158, 11, ${opacity})`;
    return `rgba(239, 68, 68, ${opacity})`;
  }
</script>