let degreesList = [];
let currentHighlightedIndex = -1;

// Load degrees from JSON file
export async function loadDegrees() {
  if (degreesList.length > 0) {
    return; // Already loaded
  }
  
  try {
    // Try paths relative to module location first (most reliable for ES modules)
    let response = await fetch('../../sfasu_degrees.json');
    if (!response.ok) {
      // Try absolute path from root
      response = await fetch('/sfasu_degrees.json');
    }
    if (!response.ok) {
      // Try path relative to public directory
      response = await fetch('../sfasu_degrees.json');
    }
    if (!response.ok) {
      throw new Error('Could not find sfasu_degrees.json file');
    }
    degreesList = await response.json();
  } catch (error) {
    console.error('Error loading degrees:', error);
    degreesList = [];
  }
}

// Initialize autocomplete for academic focus input
export function initAcademicFocusAutocomplete() {
  const input = document.getElementById('academicFocus');
  const dropdown = document.getElementById('academicFocusAutocomplete');
  
  if (!input || !dropdown) return;
  
  // Prevent duplicate initialization
  if (input.dataset.autocompleteInitialized === 'true') {
    return;
  }
  
  input.dataset.autocompleteInitialized = 'true';

  // Filter and display suggestions
  function filterSuggestions(query) {
    if (!query || query.trim().length === 0) {
      return [];
    }
    const lowerQuery = query.toLowerCase();
    return degreesList.filter(degree => 
      degree.toLowerCase().includes(lowerQuery)
    ).slice(0, 10); // Limit to 10 results
  }

  function showSuggestions(suggestions) {
    dropdown.innerHTML = '';
    currentHighlightedIndex = -1;
    
    if (suggestions.length === 0) {
      dropdown.classList.remove('show');
      return;
    }

    suggestions.forEach((suggestion, index) => {
      const item = document.createElement('div');
      item.className = 'autocomplete-item';
      item.textContent = suggestion;
      item.addEventListener('click', () => {
        input.value = suggestion;
        dropdown.classList.remove('show');
        currentHighlightedIndex = -1;
      });
      dropdown.appendChild(item);
    });

    dropdown.classList.add('show');
  }

  function highlightItem(index) {
    const items = dropdown.querySelectorAll('.autocomplete-item');
    items.forEach((item, i) => {
      item.classList.toggle('highlighted', i === index);
    });
    currentHighlightedIndex = index;
  }

  // Handle input changes
  input.addEventListener('input', (e) => {
    const query = e.target.value;
    const suggestions = filterSuggestions(query);
    showSuggestions(suggestions);
  });

  // Handle keyboard navigation
  input.addEventListener('keydown', (e) => {
    const items = dropdown.querySelectorAll('.autocomplete-item');
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (items.length > 0) {
        currentHighlightedIndex = (currentHighlightedIndex + 1) % items.length;
        highlightItem(currentHighlightedIndex);
        items[currentHighlightedIndex].scrollIntoView({ block: 'nearest' });
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (items.length > 0) {
        currentHighlightedIndex = currentHighlightedIndex <= 0 
          ? items.length - 1 
          : currentHighlightedIndex - 1;
        highlightItem(currentHighlightedIndex);
        items[currentHighlightedIndex].scrollIntoView({ block: 'nearest' });
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (currentHighlightedIndex >= 0 && items[currentHighlightedIndex]) {
        input.value = items[currentHighlightedIndex].textContent;
        dropdown.classList.remove('show');
        currentHighlightedIndex = -1;
      }
    } else if (e.key === 'Escape') {
      dropdown.classList.remove('show');
      currentHighlightedIndex = -1;
    }
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!input.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.classList.remove('show');
      currentHighlightedIndex = -1;
    }
  });

  // Close dropdown when input loses focus (with a small delay to allow clicks)
  input.addEventListener('blur', () => {
    setTimeout(() => {
      dropdown.classList.remove('show');
      currentHighlightedIndex = -1;
    }, 200);
  });
}

