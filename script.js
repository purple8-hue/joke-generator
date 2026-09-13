// Joke counter
let jokeCount = 0;
let currentJoke = null;

// DOM elements
const getJokeBtn = document.getElementById('getJokeBtn');
const copyBtn = document.getElementById('copyBtn');
const jokeContent = document.getElementById('jokeContent');
const jokeTypeSelect = document.getElementById('jokeType');
const jokeCountDisplay = document.getElementById('jokeCount');

// Event listeners
getJokeBtn.addEventListener('click', fetchJoke);
copyBtn.addEventListener('click', copyJoke);

// Fetch joke from API
async function fetchJoke() {
    const jokeType = jokeTypeSelect.value;
    
    // Disable button and show loading state
    getJokeBtn.disabled = true;
    getJokeBtn.textContent = 'Loading...';
    getJokeBtn.classList.add('loading');
    jokeContent.innerHTML = '<p class="loading">Getting a joke...</p>';
    copyBtn.disabled = true;
    
    try {
        let url = 'https://v2.jokeapi.dev/joke/';
        
        if (jokeType === 'any') {
            url += 'Any';
        } else if (jokeType === 'general') {
            url += 'General';
        } else if (jokeType === 'programming') {
            url += 'Programming';
        } else if (jokeType === 'knock-knock') {
            url += 'Knock-Knock';
        }
        
        // Add parameters to filter out some content
        url += '?type=single&safe-mode';
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('Failed to fetch joke');
        }
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error('No jokes found for this category');
        }
        
        // Store current joke for copying
        currentJoke = data;
        
        // Display joke
        displayJoke(data);
        
        // Increment counter
        jokeCount++;
        jokeCountDisplay.textContent = jokeCount;
        
        // Enable copy button
        copyBtn.disabled = false;
        
    } catch (error) {
        jokeContent.innerHTML = `<p class="error">✗ ${error.message}</p>`;
        copyBtn.disabled = true;
    } finally {
        // Re-enable button
        getJokeBtn.disabled = false;
        getJokeBtn.textContent = 'Get Joke';
        getJokeBtn.classList.remove('loading');
    }
}

// Display joke based on type
function displayJoke(joke) {
    let jokeHTML = '';
    
    if (joke.type === 'single') {
        // Single line joke
        jokeHTML = `<p>${escapeHtml(joke.joke)}</p>`;
    } else if (joke.type === 'twopart') {
        // Two part joke (setup and delivery)
        jokeHTML = `
            <p class="setup">${escapeHtml(joke.setup)}</p>
            <p class="punchline">${escapeHtml(joke.delivery)}</p>
        `;
    }
    
    // Add category badge
    jokeHTML += `<p style="margin-top: 20px; font-size: 0.85rem; color: #999;">📂 ${escapeHtml(joke.category)}</p>`;
    
    jokeContent.innerHTML = jokeHTML;
    
    // Add fade-in animation
    jokeContent.style.animation = 'none';
    setTimeout(() => {
        jokeContent.style.animation = 'slideIn 0.5s ease-out';
    }, 10);
}

// Copy joke to clipboard
function copyJoke() {
    if (!currentJoke) return;
    
    let jokeText = '';
    
    if (currentJoke.type === 'single') {
        jokeText = currentJoke.joke;
    } else if (currentJoke.type === 'twopart') {
        jokeText = `${currentJoke.setup}\n${currentJoke.delivery}`;
    }
    
    navigator.clipboard.writeText(jokeText).then(() => {
        const originalText = copyBtn.textContent;
        copyBtn.textContent = '✓ Copied!';
        
        setTimeout(() => {
            copyBtn.textContent = originalText;
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy:', err);
        alert('Failed to copy joke to clipboard');
    });
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Add animation keyframes dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);

// Load a joke on page load
window.addEventListener('load', () => {
    // Optionally auto-load a joke
    // fetchJoke();
});
