import { showClubDetails } from './DetailModal.js';
import { escapeHtml } from '../utils/sanitize.js';

// API endpoint for organization images
const ImageAPILink = "https://sfasu-cdn.presence.io/organization-photos/8317246b-60de-41af-9823-4a35504099d4/";

/**
 * Format description for card view - extract first meaningful section
 */
function formatDescriptionForCard(description) {
  if (!description) return 'No description available.';
  
  // Clean up the description text
  let cleanDesc = description.replace(/&#65279;/g, '').trim();
  
  // Fix syntax issues - add spaces after colons and periods where missing
  cleanDesc = cleanDesc
    // Add space after colons that are followed by a capital letter
    .replace(/([A-Z][^:]*):([A-Z])/g, '$1: $2')
    // Add space after periods that are followed by a capital letter
    .replace(/([a-z])\.([A-Z])/g, '$1. $2')
    // Fix missing spaces in "Social and recreational activities:"
    .replace(/Social and recreational activities:/g, 'Social and Recreational Activities:')
    // Ensure proper spacing around colons
    .replace(/:\s*/g, ': ')
    // Clean up any double spaces
    .replace(/\s+/g, ' ')
    .trim();
  
  // Split by sections that start with a title followed by colon
  const sections = cleanDesc.split(/(?=[A-Z][^:]*:)/);
  
  if (sections.length > 1) {
    // Find the first section that has content after the colon
    for (const section of sections) {
      const colonIndex = section.indexOf(':');
      if (colonIndex > 0 && colonIndex < section.length - 1) {
        const content = section.substring(colonIndex + 1).trim();
        if (content) {
          // Return first 150 characters of the content
          return content.length > 150 ? content.substring(0, 150) + '...' : content;
        }
      }
    }
  }
  
  // Fallback to the beginning of the description
  return cleanDesc.length > 150 ? cleanDesc.substring(0, 150) + '...' : cleanDesc;
}

export function createClubCard(org, includeScore = false, rankInfo = null) {
  // Validate input data
  if (!org || !org.name) {
    console.error('Invalid organization data:', org);
    return document.createElement('div'); // Return empty div if data is invalid
  }
  
  const el = document.createElement('div');
  el.className = 'club-card';
  el.addEventListener('click', () => showClubDetails(org));
  const imageUrl = org.photoUri ? (ImageAPILink + org.photoUri) : 'placeholder.jpg';

  let nameHtml = `<h3 class="club-name">${escapeHtml(org.name)}`;
  if (includeScore && org.score !== undefined) {
    // Calculate match percentage based on a more realistic maximum score
    // This percentage is still displayed to users for reference
    const maxPossibleScore = 400; // Conservative estimate for excellent matches
    const matchPercentage = Math.min(Math.round((org.score / maxPossibleScore) * 100), 100);
    
    // NEW: Determine color based on RELATIVE RANKING instead of absolute percentage
    // This ensures the highest scoring organizations are always green, regardless of actual percentage
    let matchLevel = 'low';
    if (rankInfo && rankInfo.rank && rankInfo.totalCount) {
      // rankInfo contains: { rank: 1, 2, 3... totalCount: total number of organizations }
      const { rank, totalCount } = rankInfo;
      
      // Ensure we have valid rank and totalCount values
      if (rank > 0 && totalCount > 0 && rank <= totalCount) {
        // For small lists, use a more reasonable distribution
        if (totalCount <= 4) {
          // For very small lists, just use rank-based coloring
          if (rank === 1) matchLevel = 'excellent';
          else if (rank <= 2) matchLevel = 'good';
          else if (rank <= 3) matchLevel = 'fair';
          else matchLevel = 'low';
        } else {
          // For larger lists, use percentile-based coloring
          const percentile = (rank / totalCount) * 100;
          
          // Color coding based on percentile ranking:
          if (percentile <= 25) matchLevel = 'excellent'; // Top 25% = Green (best matches)
          else if (percentile <= 50) matchLevel = 'good'; // Top 50% = Blue (good matches)
          else if (percentile <= 75) matchLevel = 'fair'; // Top 75% = Yellow (fair matches)
          else matchLevel = 'low'; // Bottom 25% = Red (lowest matches)
        }
      }
    } else {
      // Fallback to percentage-based coloring if no rank info is provided
      // This maintains backward compatibility for non-recommendation views
      matchLevel = matchPercentage >= 90 ? 'excellent' : matchPercentage >= 80 ? 'good' : matchPercentage >= 70 ? 'fair' : 'low';
    }
    
    // Display the percentage but color based on ranking
    nameHtml += ` <span class="match-indicator ${matchLevel}" aria-label="${matchPercentage}% match - ${matchLevel} fit">${matchPercentage}% Match</span>`;
  }
  nameHtml += '</h3>';

  el.innerHTML = `
    <img src="${imageUrl}" alt="${escapeHtml(org.name)}" class="club-image" onerror="this.src='placeholder.jpg'">
    <div class="club-info">
      ${nameHtml}
      <div class="club-categories">
        ${(org.categories && org.categories.length
          ? org.categories.map(c => `<span class="category-tag">${escapeHtml(c)}</span>`).join('')
          : '<span class="category-tag">Uncategorized</span>')}
      </div>
      <div class="club-members">${Number(org.memberCount || 0)} members</div>
      <p class="club-description">${escapeHtml(formatDescriptionForCard(org.description))}</p>
    </div>`;
  return el;
}
