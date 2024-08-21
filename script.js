// DOM Elements
const pokemonContainer = document.getElementById('pokemon-container');
const searchInput = document.getElementById('search');
const sortSelect = document.getElementById('sort');
const paginationContainer = document.getElementById('pagination');
const modal = document.getElementById('pokemon-modal');
const modalContent = document.getElementById('modal-details');
const closeModal = document.querySelector('.close');

// Pokemon per page
let pokemonData = [];
const itemsPerPage = 20;
let currentPage = 1;

// Fetch Pokémon Data
async function fetchPokemon() {
    loader.style.display = 'block';
    try {
        for (let i = 1; i <= 150; i++) {
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${i}`);
            const data = await response.json();
            pokemonData.push(data);
        }
        displayPokemon(pokemonData, currentPage);
        setupPagination(pokemonData.length, itemsPerPage);
    } catch (error) {
        console.error('Error fetching Pokémon data:', error);
    } finally {
        loader.style.display = 'none';
    }
}

function setupPagination(totalItems, itemsPerPage) {
    paginationContainer.innerHTML = ''; 
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.className = 'page-button';
        pageButton.textContent = i;
        pageButton.dataset.page = i;

        if (i === currentPage) {
            pageButton.classList.add('active');
        }

        pageButton.addEventListener('click', () => {
            currentPage = i;
            displayPokemon(pokemonData, currentPage);
            setupPagination(totalItems, itemsPerPage); 
        });

        paginationContainer.appendChild(pageButton);
    }
}


// Display Pokemon
function displayPokemon(pokemonList, page) {
    pokemonContainer.innerHTML = '';
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedPokemon = pokemonList.slice(startIndex, endIndex);
    
    paginatedPokemon.forEach(pokemon => {
        const pokemonCard = document.createElement('div');
        pokemonCard.className = 'pokemon-card';
        pokemonCard.innerHTML = `
            <h3>${pokemon.name}</h3>
            <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
            <p>Height: ${pokemon.height}</p>
            <p>Weight: ${pokemon.weight}</p>
            <button class="detail-button" data-id="${pokemon.id}">Detail</button>
        `;
        pokemonContainer.appendChild(pokemonCard);
    });

    // Detail button popup
    document.querySelectorAll('.detail-button').forEach(button => {
        button.addEventListener('click', async (e) => {
            const id = e.target.dataset.id;
            await fetchAndDisplayDetails(id);
            modal.style.display = 'flex'; 
        });
    });
}

// Open the modal with fade-in effect
async function fetchAndDisplayDetails(id) {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        const data = await response.json();
        modalContent.innerHTML = `
            <h2>${data.name}</h2>
            <img src="${data.sprites.front_default}" alt="${data.name}">
            <h4>Abilities:</h4>
            <ul>
                ${data.abilities.map(ability => `<li>${ability.ability.name}</li>`).join('')}
            </ul>
            <h4>Types:</h4>
            <ul>
                ${data.types.map(type => `<li>${type.type.name}</li>`).join('')}
            </ul>
            <h4>Base Stats:</h4>
            <ul>
                ${data.stats.map(stat => `<li>${stat.stat.name}: ${stat.base_stat}</li>`).join('')}
            </ul>
        `;
        modal.classList.add('fade-in'); // Add fade-in effect
    } catch (error) {
        console.error('Error fetching Pokémon details:', error);
        modalContent.innerHTML = '<p>Failed to load details.</p>';
    }
}

// Close the modal
closeModal.addEventListener('click', () => {
    modal.style.display = 'none'; 
    modal.classList.remove('fade-in');
});

// Click outside the modal to close it
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
        modal.classList.remove('fade-in');
    }
});


// Live Search
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredPokemon = pokemonData.filter(pokemon => pokemon.name.includes(searchTerm));
    displayPokemon(filteredPokemon, 1); // Reset to first page for filtered results
    setupPagination(filteredPokemon.length, itemsPerPage);
});

// Sort Pokemon
sortSelect.addEventListener('change', (e) => {
    const sortBy = e.target.value;
    const sortedPokemon = [...pokemonData].sort((a, b) => a[sortBy] > b[sortBy] ? 1 : -1);
    displayPokemon(sortedPokemon, 1); // Reset to first page for sorted results
    setupPagination(sortedPokemon.length, itemsPerPage);
});

// Initial Fetch
fetchPokemon();
