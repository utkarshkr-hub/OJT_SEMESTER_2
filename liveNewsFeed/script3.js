/**
 * Global Pulse News Feed Script File
 * Manages HTTP requests, parsing data asynchronously, and updating theme rules.
 */

// --- Configuration Setup Parameters ---
//Replace 'YOUR_NEWS_API_KEY' with your actual key from https://newsapi.org
const API_KEY = 'a18b0295c8fc41ae883aca39eeafa4cb'; 
const BASE_URL = 'https://newsapi.org/v2';
const NEWS_API_PROXY = 'https://api.allorigins.win/raw?url=';

// --- System State Storage Vectors ---
let currentCategory = 'general';
let currentSearchQuery = '';

// --- DOM Element Cache Maps ---
const themeToggle = document.getElementById('theme-toggle');
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const categoryChips = document.querySelectorAll('.category-chip');
const statusContainer = document.getElementById('status-container');
const newsGrid = document.getElementById('news-grid');

// --- Initialization Hook ---
document.addEventListener('DOMContentLoaded', () => {
    initializeThemeEngine();
    getLiveNewsFeed(); // Execute baseline pull request parameters on load
});

// --- Theme Preference Switching Logic ---
function initializeThemeEngine() {
    const activeTheme = localStorage.getItem('news-theme') || 
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    
    document.documentElement.setAttribute('data-theme', activeTheme);
    updateThemeIcon(activeTheme);

    themeToggle.addEventListener('click', () => {
        const activeState = document.documentElement.getAttribute('data-theme');
        const targetState = activeState === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', targetState);
        localStorage.setItem('news-theme', targetState);
        updateThemeIcon(targetState);
    });
}

function updateThemeIcon(theme) {
    const iconNode = themeToggle.querySelector('i');
    iconNode.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

// --- Asynchronous API Request Core Pipeline ---
async function getLiveNewsFeed() {
    showLoadingSpinner();
    
    let endpointUrl = '';
    
    // Select the correct endpoint based on whether a search query exists
    if (currentSearchQuery) {
        endpointUrl = `${BASE_URL}/everything?q=${encodeURIComponent(currentSearchQuery)}&sortBy=publishedAt&language=en&apiKey=${API_KEY}`;
    } else {
        // Top headlines handle standardized categories
        endpointUrl = `${BASE_URL}/top-headlines?country=us&category=${currentCategory}&apiKey=${API_KEY}`;
    }

    const requestUrl = buildRequestUrl(endpointUrl);

    try {
        const response = await fetch(requestUrl);
        
        // Parse raw response data into usable JSON
        const data = await response.json();

        if (!response.ok) {
            // Handle structured server-side validation error messages
            throw new Error(data.message || 'Server extraction constraints triggered anomaly.');
        }

        if (data.articles && data.articles.length > 0) {
            renderNewsArticles(data.articles);
        } else {
            showEmptyFeedbackState('No articles matched your request parameters. Try adjustments.');
        }

    } catch (networkError) {
        console.error('Data Fetch Anomaly Log:', networkError);
        showErrorFeedbackState(networkError.message);
    }
}

function buildRequestUrl(endpointUrl) {
    const isLocalhost = ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname);

    if (isLocalhost) {
        return endpointUrl;
    }

    return `${NEWS_API_PROXY}${encodeURIComponent(endpointUrl)}`;
}

// --- Render View UI Card Mutations ---
function renderNewsArticles(articles) {
    // Hide notifications, clear old entries
    statusContainer.classList.add('hidden');
    newsGrid.innerHTML = '';

    articles.forEach(article => {
        // Skip entries with broken text summaries
        if (article.title === '[Removed]' || !article.title) return;

        // Fallback placeholder image asset if the API article does not provide one
        const fallbackImg = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=600&q=80';
        const targetImage = article.urlToImage ? article.urlToImage : fallbackImg;
        
        // Human-readable date parsing
        const parsedDate = new Date(article.publishedAt).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });

        const cardMarkup = `
            <article class="card article-card">
                <div class="article-img-wrapper">
                    <img src="${targetImage}" alt="Headline Cover Image" class="article-img" onerror="this.src='${fallbackImg}'">
                    <span class="source-badge">${article.source.name || 'Global News'}</span>
                </div>
                <div class="article-content">
                    <span class="article-time"><i class="far fa-clock"></i> ${parsedDate}</span>
                    <h3 class="article-title">${article.title}</h3>
                    <p class="article-desc">${article.description || 'No summary text available. Proceed using the read link below to verify full details.'}</p>
                    <div class="article-footer">
                        <a href="${article.url}" target="_blank" class="read-more-link">
                            Read Full Story <i class="fas fa-arrow-right"></i>
                        </a>
                    </div>
                </div>
            </article>
        `;
        newsGrid.insertAdjacentHTML('beforeend', cardMarkup);
    });
}

// --- Interface State Management Handlers ---
function showLoadingSpinner() {
    newsGrid.innerHTML = '';
    statusContainer.innerHTML = `
        <i class="fas fa-circle-notch spinner"></i>
        <p>Syncing live global transmissions stream...</p>
    `;
    statusContainer.className = 'status-container';
}

function showEmptyFeedbackState(textMessage) {
    newsGrid.innerHTML = '';
    statusContainer.innerHTML = `
        <i class="fas fa-folder-open" style="font-size: 2.5rem; margin-bottom: 1rem;"></i>
        <p>${textMessage}</p>
    `;
    statusContainer.className = 'status-container';
}

function showErrorFeedbackState(errorMessage) {
    newsGrid.innerHTML = '';
    
    // Detect if default API key placeholder isn't changed yet
    if (API_KEY === 'YOUR_NEWS_API_KEY') {
        errorMessage = 'Invalid Access Credentials. Please insert your valid individual NewsAPI key token into script3.js to start parsing feeds.';
    }

    statusContainer.innerHTML = `
        <div class="card error-card">
            <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 0.5rem;"></i>
            <h3>Pipeline Synchronization Interrupted</h3>
            <p style="font-size: 0.95rem; margin-top: 0.5rem;">${errorMessage}</p>
        </div>
    `;
    statusContainer.className = 'status-container';
}

// --- Search Filter and Navigation Listeners ---
searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const query = searchInput.value.trim();
    
    if (query) {
        currentSearchQuery = query;
        // Clear active visual states across chips during a deep global text search
        categoryChips.forEach(chip => chip.classList.remove('active'));
        getLiveNewsFeed();
    }
});

categoryChips.forEach(chip => {
    chip.addEventListener('click', () => {
        // Skip operations if clicking an already active filter choice
        if (chip.classList.contains('active')) return;

        // Reset tracking configurations
        categoryChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        
        searchInput.value = ''; // Flush search input field
        currentSearchQuery = '';
        currentCategory = chip.getAttribute('data-category');
        
        getLiveNewsFeed();
    });
});