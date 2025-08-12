const CLIENT_ID = 'a37c3d7f';
const mainContent = document.getElementById('main-content');
const navSearch = document.getElementById('nav-search');
const navFavorites = document.getElementById('nav-favorites');

// Artist-country mapping
const artistCountries = {
  "ElGrandeToto": "Morocco",
  "Kira7": "Morocco",
  "Bo9al": "Morocco",
  "Furelise": "Morocco",
  "Adele": "UK",
  "Drake": "US",
  "Daft Punk": "France",
  // Add more artists here...
};

function getFavorites() {
  const favs = localStorage.getItem('favorites');
  return favs ? JSON.parse(favs) : [];
}
function saveFavorites(favs) {
  localStorage.setItem('favorites', JSON.stringify(favs));
}
function addFavorite(track) {
  const favs = getFavorites();
  if(favs.find(t => t.id === track.id)) {
    alert('Track is already in favorites.');
    return;
  }
  favs.push(track);
  saveFavorites(favs);
  alert(`Added "${track.name}" to favorites!`);
}
function removeFavorite(trackId) {
  let favs = getFavorites();
  favs = favs.filter(t => t.id !== trackId);
  saveFavorites(favs);
  renderFavorites();
}

function createTrackTile(track, mode = 'search') {
  const trackDiv = document.createElement('div');
  trackDiv.className = 'track-tile';

  trackDiv.innerHTML = `
    <div class="track-info">
      <strong>${track.name}</strong> by <em>${track.artist_name}</em><br/>
      License: <a class="license-link" href="${track.license_ccurl}" target="_blank" rel="noopener noreferrer">${track.license_name}</a>
    </div>
    <audio controls preload="none" src="${track.audio}"></audio>
  `;

  const downloadBtn = document.createElement('button');
  downloadBtn.className = 'btn-download';
  downloadBtn.textContent = 'Download (Free & Legal)';
  downloadBtn.onclick = () => {
    window.open(track.audio_download, '_blank');
  };
  trackDiv.appendChild(downloadBtn);

  if(mode === 'search') {
    const favBtn = document.createElement('button');
    favBtn.className = 'btn-fav';
    favBtn.textContent = '❤️ Favorite';
    favBtn.onclick = () => addFavorite(track);
    trackDiv.appendChild(favBtn);
  } else if(mode === 'favorites') {
    const remBtn = document.createElement('button');
    remBtn.className = 'btn-remove';
    remBtn.textContent = 'Remove';
    remBtn.onclick = () => {
      if(confirm(`Remove "${track.name}" from favorites?`)) {
        removeFavorite(track.id);
      }
    };
    trackDiv.appendChild(remBtn);
  }

  if(track.license_name.toLowerCase().includes('attribution')) {
    const attr = document.createElement('pre');
    attr.className = 'attribution';
    attr.textContent = `Please attribute:\nMusic: "${track.name}" by ${track.artist_name}\nLicense: ${track.license_name}\nLink: ${track.license_ccurl}`;
    trackDiv.appendChild(attr);
  }

  return trackDiv;
}

function filterByCountry(tracks, country) {
  if(!country) return tracks;
  return tracks.filter(track => {
    const artistNameNoSpaces = track.artist_name.replace(/\s/g, '');
    return artistCountries[artistNameNoSpaces] === country;
  });
}

function renderSearch() {
  navSearch.classList.add('active');
  navSearch.setAttribute('aria-current', 'page');
  navFavorites.classList.remove('active');
  navFavorites.removeAttribute('aria-current');

  mainContent.innerHTML = `
    <form id="search-form" aria-label="Search music tracks">
      <input type="text" id="search-input" placeholder="Search artist, track, or tag" aria-required="true" />
      <select id="genre-select" aria-label="Select genre">
        <option value="">All Genres</option>
        <option value="pop">Pop</option>
        <option value="rap">Rap</option>
        <option value="rock">Rock</option>
        <option value="electronic">Electronic</option>
        <option value="jazz">Jazz</option>
      </select>
      <select id="country-select" aria-label="Select country">
        <option value="">All Countries</option>
        <option value="Morocco">Morocco</option>
        <option value="US">United States</option>
        <option value="UK">United Kingdom</option>
        <option value="France">France</option>
        <option value="MENA">MENA Region</option>
        <option value="Europe">Europe</option>
      </select>
      <button type="submit">Search</button>
    </form>
    <div id="results" aria-live="polite"></div>
  `;

  const form = document.getElementById('search-form');
  const resultsDiv = document.getElementById('results');

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const query = document.getElementById('search-input').value.trim();
    const genre = document.getElementById('genre-select').value;
    const country = document.getElementById('country-select').value;

    if(!query) {
      resultsDiv.innerHTML = '<p>Please enter a search term.</p>';
      return;
    }

    resultsDiv.innerHTML = '<p>Loading...</p>';

    try {
      let url = `https://api.jamendo.com/v3.0/tracks/?client_id=${CLIENT_ID}&format=json&limit=20&include=license+musicinfo&search=${encodeURIComponent(query)}`;
      if(genre) url += `&tags=${encodeURIComponent(genre)}`;

      const res = await fetch(url);
      const data = await res.json();

      if(!data.results || data.results.length === 0) {
        resultsDiv.innerHTML = '<p>No tracks found.</p>';
        return;
      }

      let filtered = filterByCountry(data.results, country);

      if(filtered.length === 0) {
        resultsDiv.innerHTML = '<p>No tracks found for selected country.</p>';
        return;
      }

      resultsDiv.innerHTML = '';
      filtered.forEach(track => {
        const tile = createTrackTile(track, 'search');
        resultsDiv.appendChild(tile);
      });
    } catch(err) {
      resultsDiv.innerHTML = '<p>Error fetching tracks. Please try again later.</p>';
      console.error(err);
    }
  });
  mainContent.focus();
}

function renderFavorites() {
  navFavorites.classList.add('active');
  navFavorites.setAttribute('aria-current', 'page');
  navSearch.classList.remove('active');
  navSearch.removeAttribute('aria-current');

  mainContent.innerHTML = '<h2>Your Favorite Tracks</h2>';
  const favs = getFavorites();

  if(favs.length === 0) {
    mainContent.innerHTML += '<p>You have no favorite tracks yet.</p>';
    return;
  }

  const favContainer = document.createElement('div');
  favContainer.className = 'track-list';

  favs.forEach(track => {
    const tile = createTrackTile(track, 'favorites');
    favContainer.appendChild(tile);
  });
  mainContent.appendChild(favContainer);
  mainContent.focus();
}

renderSearch();

navSearch.addEventListener('click', renderSearch);
navFavorites.addEventListener('click', renderFavorites);
