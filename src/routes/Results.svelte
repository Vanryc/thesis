<script lang="ts">
  import { createEventDispatcher } from 'svelte';
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
  }

  interface AlternatePath {
    title: string;
    matchPercentage: number;
  }

  interface ResultsData {
    topMatch: CareerMatch;
    alternatePaths: AlternatePath[];
    jobLinks: string[];
  }

  export let recommendations: CareerMatch[] = [];
  export let alternatePaths: AlternatePath[] = [];
  export let jobLinks: string[] = [];

  $: results = {
    topMatch: recommendations[0] || {
      title: "Career Match",
      matchPercentage: 0,
      strengths: [],
      growthOpportunity: "Not available"
    },
    alternatePaths: alternatePaths.length > 0 ? alternatePaths : [
      { title: "Similar Role", matchPercentage: 75 },
      { title: "Related Field", matchPercentage: 65 }
    ],
    jobLinks: jobLinks.length > 0 ? jobLinks : []
  };

  function handleStartOver() {
    dispatch('restart');
  }

  function copyLink(link: string) {
    navigator.clipboard.writeText(link);
    // You could add a toast notification here
  }

  function saveResults() {
    // Implement save functionality
    console.log("Saving results:", results);
    alert("Results saved successfully!");
  }
</script>

<div class="results-container">
  <div class="progress-bar">
    <div class="progress-complete" style="width: 100%"></div>
  </div>

  <h1>Your Career Matches</h1>
  <p class="subtitle">Based on your preferences, skills, and work environment</p>

  {#if recommendations.length === 0}
    <div class="empty-state">
      <p>No specific recommendations found based on your criteria.</p>
      <p>Try adjusting your preferences or skills for better matches.</p>
    </div>
  {:else}
    <!-- Top Match Card -->
    <div class="result-card top-match">
      <div class="match-badge">{results.topMatch.matchPercentage}% Match</div>
      <h2>{results.topMatch.title}</h2>
      
      {#if results.topMatch.company}
        <p class="company-location">
          {results.topMatch.company}
          {#if results.topMatch.location} • {results.topMatch.location}{/if}
        </p>
      {/if}
      
      <div class="strengths">
        <div class="icon">✅</div>
        <div>
          <strong>Your strengths align:</strong>
          {#each results.topMatch.strengths as strength, i}
            {strength}{i < results.topMatch.strengths.length - 1 ? ', ' : ''}
          {/each}
        </div>
      </div>
      
      {#if results.topMatch.growthOpportunity}
        <div class="growth">
          <div class="icon">🔍</div>
          <div>
            <strong>Growth opportunity:</strong> {results.topMatch.growthOpportunity}
          </div>
        </div>
      {/if}
      
      {#if results.topMatch.salary}
        <div class="salary">
          <div class="icon">💰</div>
          <div>
            <strong>Estimated salary:</strong> {results.topMatch.salary}
          </div>
        </div>
      {/if}
      
      {#if results.topMatch.url}
        <a href={results.topMatch.url} target="_blank" rel="noopener noreferrer" class="apply-btn">
          View Job Details
        </a>
      {/if}
    </div>

    <!-- Alternate Paths -->
    {#if results.alternatePaths.length > 0}
      <div class="alternate-paths">
        <h3>Alternate Career Paths:</h3>
        <ul>
          {#each results.alternatePaths as path}
            <li>• {path.title} ({path.matchPercentage}% match)</li>
          {/each}
        </ul>
      </div>
    {/if}

    <!-- Job Links -->
    {#if results.jobLinks.length > 0}
      <div class="job-posts">
        <h3>Recommended Job Posts:</h3>
        <ul>
          {#each results.jobLinks as link}
            <li>
              • <a href={link} target="_blank" rel="noopener noreferrer">{link}</a>
              <button class="copy-btn" on:click={() => copyLink(link)}>Copy</button>
            </li>
          {/each}
        </ul>
      </div>
    {/if}
  {/if}

  <!-- Action Buttons -->
  <div class="action-buttons">
    <button class="primary-btn" on:click={handleStartOver}>Start Over</button>
    <button class="secondary-btn" on:click={saveResults}>Save Results</button>
  </div>
</div>

<style>
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap');

  .results-container {
    max-width: 800px;
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
  }

  .result-card {
    position: relative;
    background-color: #f9fafb;
    border: 1px solid #e5e7eb;
    padding: 1.75rem;
    border-radius: 1rem;
    margin-bottom: 2rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
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
    margin-bottom: 0.75rem;
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

  ul {
    padding-left: 1.5rem;
    margin: 0 0 1.5rem 0;
  }

  li {
    margin-bottom: 0.5rem;
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
    margin-top: 1rem;
    padding: 0.75rem 1.5rem;
    background-color: #2563eb;
    color: white;
    border-radius: 0.5rem;
    font-weight: 500;
    transition: all 0.2s ease;
  }

  .apply-btn:hover {
    background-color: #1d4ed8;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
  }

  .copy-btn {
    margin-left: 0.5rem;
    padding: 0.25rem 0.6rem;
    border-radius: 6px;
    font-size: 0.75rem;
    border: 1px solid #d1d5db;
    background-color: #f9fafb;
    cursor: pointer;
    transition: background 0.2s ease;
  }

  .copy-btn:hover {
    background-color: #f3f4f6;
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

  @media (max-width: 768px) {
    .results-container {
      padding: 1.5rem;
      margin: 1rem;
    }

    .action-buttons {
      flex-direction: column;
    }

    .primary-btn, .secondary-btn {
      width: 100%;
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
  }
</style>