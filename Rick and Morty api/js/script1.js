const cardsGridSection = document.getElementById('cards-grid');
const navButtonsSection = document.getElementById('nav-buttons');
const viewCharacterSection = document.getElementById('view-character');

let url = 'https://rickandmortyapi.com/api/character';

cardsGridSection.addEventListener('click', (event) => {
    const link = event.target.closest('.view-more a');
    if (link) {
        event.preventDefault(); 
        const characterId = link.id;
        if (characterId) {
            viewCharacter(characterId);
        }
    }
});

viewCharacterSection.addEventListener('click', (event) => {
    if (event.target.closest('.return-link')) {
        event.preventDefault();
        returnToMain();
    }
    if (event.target.id === 'save-character-btn') {
        const characterData = JSON.parse(viewCharacterSection.dataset.currentCharacter);
        saveCharacter(characterData);
    }
});

function myCustomAlert(msg) {
    const dialog = document.getElementById('custom-alert');
    const messageP = document.getElementById('alert-message');
    const closeBtn = document.getElementById('close-dialog');

    messageP.textContent = msg;
    dialog.style.display = 'flex';
    dialog.showModal(); 

    closeBtn.onclick = () => {
        dialog.close();
        dialog.style.display = 'none';
    };
}

async function fetchData(url) {
    try {
        navButtonsSection.style.pointerEvents = 'none';
        navButtonsSection.style.opacity = '0.5';

        const response = await fetch(url);
        const data = await response.json();
        
        showData(data.results);
        showPagination(data.info);
    } catch (error) {
        console.error('Error fetching data:', error);
    } finally {
        navButtonsSection.style.pointerEvents = 'auto';
        navButtonsSection.style.opacity = '1';
    }
}

function showData(results) {
    cardsGridSection.innerHTML = ''; 
    const fragment = document.createDocumentFragment();
    
    results.forEach(character => {
        const card = document.createElement('article');
        card.classList.add('card');
        card.innerHTML = `
            <div class="div-card-img">
                <img 
                    src="${character.image}" 
                    alt="${character.name}" 
                    loading="lazy"
                    onerror="this.onerror=null; this.src='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';"
                >
            </div>
            <div class="div-card-info">
                <h3>Name: ${character.name}</h3>
                <p>Status: <button class="button-alive ${getStatusClass(character.status)}"></button> ${character.status}</p>
                <p>Species: ${character.species}</p>
                <p>Gender: ${character.gender}</p>
                <div class="view-more">
                    <a href="#" id="${character.id}"><span>View More</span>
                        <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>   
                            <polyline points="15 3 21 3 21 9"></polyline>
                            <line x1="10" y1="14" x2="21" y2="3"></line>
                        </svg>
                    </a>
                </div>
            </div>`;
        fragment.appendChild(card);
    });
    cardsGridSection.appendChild(fragment);
}

async function viewCharacter(id) {
    const characterUrl = `https://rickandmortyapi.com/api/character/${id}`;
    try {
        const response = await fetch(characterUrl);
        const character = await response.json();

        viewCharacterSection.dataset.currentCharacter = JSON.stringify(character);

        cardsGridSection.style.display = 'none';
        navButtonsSection.style.display = 'none';
        viewCharacterSection.style.display = 'flex';

        viewCharacterSection.innerHTML = `
        <article id="character-card">
            <div id="div-character-img">
                <img 
                    src="${character.image}" 
                    alt="${character.name}"
                    onerror="this.onerror=null; this.src='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';"
                >
                <button id="save-character-btn" class="nav-button">Save character</button>
            </div>
            <div id="div-character-info">
                <div>
                    <h3>Name: ${character.name}</h3>
                    <p>Status: <button class="button-alive ${getStatusClass(character.status)}"></button> ${character.status}</p>
                    <p>Species: ${character.species}</p>
                    <p>Type: ${character.type || 'N/A'}</p>
                    <p>Gender: ${character.gender}</p>
                    <p>Origin: ${character.origin.name}</p>
                    <p>Location: ${character.location.name}</p>
                </div>
                <div class="return">
                    <a href="#" class="return-link">
                        <span>Return</span>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M6 11V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2h-6"></path>
                            <polyline points="9 21 3 21 3 15"></polyline>
                            <line x1="14" y1="10" x2="3" y2="21"></line>
                        </svg>
                    </a>
                </div>
            </div>
        </article>`;
    } catch (error) {
        console.error('Error fetching character:', error);
    }
}

function returnToMain() {
    viewCharacterSection.style.display = 'none';
    cardsGridSection.style.display = 'grid';
    navButtonsSection.style.display = 'flex';
    viewCharacterSection.innerHTML = '';
    delete viewCharacterSection.dataset.currentCharacter;
}

function saveCharacter(character) {
    const KEY = 'favoriteCharacters';
    const itemsPerPage = 20;

    let store = JSON.parse(localStorage.getItem(KEY)) || {
        info: { count: 0, pages: 0, next: null, prev: null },
        results: []
    };

    const exists = store.results.some(fav => fav.id === character.id);
    if (exists) {
        return myCustomAlert("This character is already saved.");
    }

    store.results.push(character);
    store.info.count = store.results.length;
    store.info.pages = Math.ceil(store.info.count / itemsPerPage);
    
    localStorage.setItem(KEY, JSON.stringify(store));
    myCustomAlert(`${character.name} saved successfully.`);
}

function showPagination(info) {
    navButtonsSection.innerHTML = '';
    const totalPages = info.pages;
    
    const getPageNum = (urlStr) => {
        if (!urlStr) return null;
        try {
            return parseInt(new URL(urlStr).searchParams.get('page'));
        } catch(e) { return null; }
    };

    const prevPage = getPageNum(info.prev);
    const nextPage = getPageNum(info.next);
    const currentPage = prevPage !== null ? prevPage + 1 : (nextPage !== null ? nextPage - 1 : 1);

    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    if (startPage === 1) endPage = Math.min(totalPages, 5);
    if (endPage === totalPages) startPage = Math.max(1, totalPages - 4);

    const prevBtn = document.createElement('button');
    prevBtn.textContent = 'Previous';
    prevBtn.className = 'nav-button';
    prevBtn.disabled = !info.prev;
    prevBtn.onclick = () => goToPage(currentPage - 1);
    navButtonsSection.appendChild(prevBtn);

    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.textContent = i;
        pageBtn.className = `nav-button ${i === currentPage ? 'active-page' : ''}`;
        pageBtn.onclick = () => { if(i !== currentPage) goToPage(i); };
        navButtonsSection.appendChild(pageBtn);
    }

    const nextBtn = document.createElement('button');
    nextBtn.textContent = 'Next';
    nextBtn.className = 'nav-button';
    nextBtn.disabled = !info.next;
    nextBtn.onclick = () => goToPage(currentPage + 1);
    navButtonsSection.appendChild(nextBtn);
}

function goToPage(pageNumber) {
    url = `https://rickandmortyapi.com/api/character?page=${pageNumber}`;
    fetchData(url);
    cardsGridSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'     
    });
}

function getStatusClass(status) {
    return status === 'Alive' ? 'button-alive-true' : 
           status === 'Dead' ? 'button-alive-false' : 'button-alive-unknown';
}

fetchData(url);