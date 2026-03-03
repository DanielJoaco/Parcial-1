const cardsGridSection = document.getElementById('cards-grid');
const navButtonsSection = document.getElementById('nav-buttons');
const viewCharacterSection = document.getElementById('view-character');

const ITEMS_PER_PAGE = 20;
const STORAGE_KEY = 'favoriteCharacters';


cardsGridSection.addEventListener('click', (event) => {
    const link = event.target.closest('.view-more a');
    if (link) {
        event.preventDefault();
        viewCharacter(link.id);
    }
});

viewCharacterSection.addEventListener('click', (event) => {
    if (event.target.closest('.return-link')) {
        event.preventDefault();
        returnToMain();
    }

    if (event.target.id === 'delete-character-btn') {
        deleteCharacter(event.target.dataset.id);
    }
});

function fetchData(page = 1) {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const store = JSON.parse(raw) || { results: [] };

        const totalItems = store.results.length;

        if (totalItems === 0) {
            cardsGridSection.innerHTML = '<p class="empty-msg">No characters saved in your collection.</p>';
            navButtonsSection.innerHTML = '';
            return;
        }

        const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
        const start = (page - 1) * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;

        const mockResponse = {
            info: {
                count: totalItems,
                pages: totalPages,
                next: page < totalPages ? `local://favs?page=${page + 1}` : null,
                prev: page > 1 ? `local://favs?page=${page - 1}` : null
            },
            results: store.results.slice(start, end)
        };

        showData(mockResponse.results);
        showPagination(mockResponse.info);

    } catch (error) {
        console.error('Error al procesar datos locales:', error);
    }
}

function deleteCharacter(id) {
    let store = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!store) return;

    store.results = store.results.filter(char => char.id !== parseInt(id));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));

    myCustomAlert("Character removed.");
    returnToMain();
}

function showData(results) {
    cardsGridSection.style.display = 'grid';
    cardsGridSection.innerHTML = '';
    
    const fragment = document.createDocumentFragment();

    results.forEach(character => {
        const card = document.createElement('article');
        card.className = 'card';
        card.innerHTML = `
            <div class="div-card-img">
                <img 
                    src="${character.image}" 
                    alt="${character.name}" 
                    loading="lazy" 
                    onerror="this.onerror=null;"
                >
            </div>
            <div class="div-card-info">
                <h3>Name: ${character.name}</h3>
                <p>Status: <button class="button-alive ${getStatusClass(character.status)}"></button> ${character.status}</p>
                <p>Species: ${character.species}</p>
                <div class="view-more">
                    <a href="#" id="${character.id}"><span>View More</span></a>
                </div>
            </div>`;
        fragment.appendChild(card);
    });

    cardsGridSection.appendChild(fragment);
}

function viewCharacter(id) {
    const store = JSON.parse(localStorage.getItem(STORAGE_KEY));
    const character = store.results.find(char => char.id === parseInt(id));
    
    if (!character) return;

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
                    loading="lazy" 
                    onerror="this.onerror=null;"
                >
                <button id="delete-character-btn" data-id="${character.id}" class="nav-button">Delete</button>
            </div>
            <div id="div-character-info">
                <div>
                    <h3>Name: ${character.name}</h3>
                    <p>Status: <button class="button-alive ${getStatusClass(character.status)}"></button> ${character.status}</p>
                    <p>Species: ${character.species}</p>
                    <p>Gender: ${character.gender}</p>
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
}

function returnToMain() {
    viewCharacterSection.style.display = 'none';
    viewCharacterSection.innerHTML = '';
    fetchData();
}

function showPagination(info) {
    navButtonsSection.innerHTML = '';
    if (!info || info.pages <= 1) return;

    navButtonsSection.style.display = 'flex';

    const getPageNum = (urlStr) => {
        if (!urlStr) return null;
        try { return parseInt(new URL(urlStr).searchParams.get('page')); } catch(e) { return null; }
    };

    const prevPage = getPageNum(info.prev);
    const nextPage = getPageNum(info.next);
    const currentPage = prevPage !== null ? prevPage + 1 : (nextPage !== null ? nextPage - 1 : 1);

    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(info.pages, currentPage + 2);

    if (startPage === 1) endPage = Math.min(info.pages, 5);
    if (endPage === info.pages) startPage = Math.max(1, info.pages - 4);

    renderNavBtn('Previous', currentPage - 1, !info.prev);
    for (let i = startPage; i <= endPage; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.className = `nav-button ${i === currentPage ? 'active-page' : ''}`;
        btn.onclick = () => { if(i !== currentPage) goToPage(i); };
        navButtonsSection.appendChild(btn);
    }
    renderNavBtn('Next', currentPage + 1, !info.next);
}

function renderNavBtn(text, target, disabled) {
    const btn = document.createElement('button');
    btn.textContent = text;
    btn.className = 'nav-button';
    btn.disabled = disabled;
    if (!disabled) btn.onclick = () => goToPage(target);
    navButtonsSection.appendChild(btn);
}

function goToPage(pageNum) {
    cardsGridSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    fetchData(pageNum);
}

function getStatusClass(status) {
    const map = { 'Alive': 'button-alive-true', 'Dead': 'button-alive-false' };
    return map[status] || 'button-alive-unknown';
}

function myCustomAlert(msg) {
    const dialog = document.getElementById('custom-alert');
    const messageP = document.getElementById('alert-message');
    const closeBtn = document.getElementById('close-dialog');

    if (!dialog) return alert(msg);

    messageP.textContent = msg;
    dialog.style.display = 'flex';
    dialog.showModal(); 
    closeBtn.onclick = () => { dialog.close(); dialog.style.display = 'none'; };
}

fetchData();