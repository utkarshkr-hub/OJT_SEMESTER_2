// --- Constants & Global State ---
const BASE_URL = 'https://api.github.com';
let currentRepoData = [];

// --- DOM Elements Cache ---
const themeToggle = document.getElementById('theme-toggle');
const searchForm = document.getElementById('search-form');
const usernameInput = document.getElementById('username-input');
const rateRemaining = document.getElementById('rate-remaining');
const messageContainer = document.getElementById('message-container');
const dashboard = document.getElementById('dashboard');
const repoSort = document.getElementById('repo-sort');
const reposList = document.getElementById('repos-list');

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    setupTheme();
    // Pre-check rate limit on page setup
    updateRateLimitInfo();
});

// --- Theme Management ---
function setupTheme() {
    // Check saved local storage theme or system preference
    const savedTheme = localStorage.getItem('theme') || 
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });
}

function updateThemeIcon(theme) {
    const icon = themeToggle.querySelector('i');
    if (theme === 'dark') {
        icon.className = 'fas fa-sun';
    } else {
        icon.className = 'fas fa-moon';
    }
}

// --- API Utility Helpers ---
async function fetchGitHubData(endpoint) {
    const response = await fetch(`${BASE_URL}${endpoint}`);
    
    // Capture and handle rate limits dynamically from headers
    const remaining = response.headers.get('X-RateLimit-Remaining');
    if (remaining !== null) {
        rateRemaining.textContent = remaining;
    }

    if (!response.ok) {
        if (response.status === 403) {
            throw new Error('API Rate limit reached. Try again later or authorize.');
        } else if (response.status === 404) {
            throw new Error('GitHub Developer profile not found.');
        } else {
            throw new Error('An unexpected error occurred.');
        }
    }
    return response.json();
}

async function updateRateLimitInfo() {
    try {
        const res = await fetch(`${BASE_URL}/rate_limit`);
        const data = await res.json();
        rateRemaining.textContent = data.rate.remaining;
    } catch (e) {
        console.warn('Could not update initial rate limit status.');
    }
}

// --- Event Handling ---
searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = usernameInput.value.trim();
    if (!username) return;

    showStatusMessage('<i class="fas fa-spinner fa-spin"></i> Inspecting standard GitHub ledger...', 'loading');
    dashboard.classList.add('hidden');

    try {
        // Multi-endpoint pipeline logic running concurrently
        const [profile, repos] = await Promise.all([
            fetchGitHubData(`/users/${username}`),
            fetchGitHubData(`/users/${username}/repos?per_page=100`)
        ]);

        currentRepoData = repos;
        
        // Render View Layer
        populateProfile(profile);
        computeLanguageChart(repos);
        sortAndRenderRepos();

        messageContainer.classList.add('hidden');
        dashboard.classList.remove('hidden');

    } catch (error) {
        showStatusMessage(error.message, 'error-msg');
    }
});

repoSort.addEventListener('change', () => {
    if (currentRepoData.length > 0) {
        sortAndRenderRepos();
    }
});

// --- View Mutation Functions ---
function showStatusMessage(text, className) {
    messageContainer.innerHTML = text;
    messageContainer.className = className;
    messageContainer.classList.remove('hidden');
}

function populateProfile(user) {
    document.getElementById('user-avatar').src = user.avatar_url;
    document.getElementById('user-name').textContent = user.name || user.login;
    
    const loginLink = document.getElementById('user-login');
    loginLink.textContent = `@${user.login}`;
    loginLink.href = user.html_url;

    document.getElementById('user-bio').textContent = user.bio || 'This developer has chosen to keep their bio a mystery.';
    
    // Conditional visibility filters for null profiles values
    toggleElementText('user-location', user.location);
    toggleElementLink('user-blog', user.blog, user.blog);
    toggleElementLink('user-twitter', user.twitter_username, `https://twitter.com/${user.twitter_username}`);

    document.getElementById('count-repos').textContent = user.public_repos;
    document.getElementById('count-followers').textContent = user.followers;
    document.getElementById('count-following').textContent = user.following;
}

function toggleElementText(id, value) {
    const el = document.getElementById(id);
    if(value) {
        el.querySelector('span').textContent = value;
        el.classList.remove('hidden');
    } else {
        el.classList.add('hidden');
    }
}

function toggleElementLink(id, text, url) {
    const el = document.getElementById(id);
    if(text) {
        const link = el.querySelector('a');
        link.textContent = text;
        link.href = url.startsWith('http') ? url : `https://${url}`;
        el.classList.remove('hidden');
    } else {
        el.classList.add('hidden');
    }
}

// --- Data Transformation (Aggregations) ---
function computeLanguageChart(repos) {
    const container = document.getElementById('languages-container');
    container.innerHTML = '';

    const langMetrics = {};
    let validatedReposCount = 0;

    repos.forEach(repo => {
        if (repo.language) {
            langMetrics[repo.language] = (langMetrics[repo.language] || 0) + 1;
            validatedReposCount++;
        }
    });

    if (validatedReposCount === 0) {
        container.innerHTML = '<p class="repo-desc">No language matrix data found.</p>';
        return;
    }

    // Transform metric object maps into sortable matrices 
    const sortedLanguages = Object.entries(langMetrics)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5); // Pick top 5 languages used

    sortedLanguages.forEach(([lang, totalCount]) => {
        const distributionPercentage = Math.round((totalCount / validatedReposCount) * 100);
        
        const markup = `
            <div class="lang-row">
                <div class="lang-info">
                    <span>${lang}</span>
                    <span>${distributionPercentage}%</span>
                </div>
                <div class="progress-bar-bg">
                    <div class="progress-bar-fill" style="width: ${distributionPercentage}%"></div>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', markup);
    });
}

function sortAndRenderRepos() {
    const sortBy = repoSort.value;
    
    let arrangedRepos = [...currentRepoData];

    arrangedRepos.sort((a, b) => {
        if (sortBy === 'stars') return b.stargazers_count - a.stargazers_count;
        if (sortBy === 'forks') return b.forks_count - a.forks_count;
        if (sortBy === 'updated') return new Date(b.updated_at) - new Date(a.updated_at);
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        return 0;
    });

    reposList.innerHTML = '';

    if (arrangedRepos.length === 0) {
        reposList.innerHTML = '<div class="card"><p>This user has no public repositories available.</p></div>';
        return;
    }

    arrangedRepos.forEach(repo => {
        const itemMarkup = `
            <div class="card repo-card">
                <div class="repo-title-row">
                    <h4><a href="${repo.html_url}" target="_blank">${repo.name}</a></h4>
                    ${repo.private ? '<span class="rate-badge">Private</span>' : ''}
                </div>
                <p class="repo-desc">${repo.description || 'No description provided for this directory.'}</p>
                <div class="repo-meta-row">
                    ${repo.language ? `<span class="lang-badge">${repo.language}</span>` : ''}
                    <span><i class="far fa-star"></i> ${repo.stargazers_count}</span>
                    <span><i class="fas fa-code-branch"></i> ${repo.forks_count}</span>
                    <span>Updated: ${new Date(repo.updated_at).toLocaleDateString()}</span>
                </div>
            </div>
        `;
        reposList.insertAdjacentHTML('beforeend', itemMarkup);
    });
}