async function fetchBooks() {
  try {
    const res = await fetch('https://openlibrary.org/people/mekBot/books/want-to-read.json');
    const data = await res.json();
    const books = data.reading_log_entries;

    const container = document.getElementById('books-container');
    container.innerHTML = '';

    books.forEach(entry => {
      const book = entry.work;
      const coverId = book.cover_id;
      const imageUrl = coverId
        ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`
        : 'https://via.placeholder.com/200x300?text=No+Cover';

      const col = document.createElement('div');
      col.className = 'col-md-4 mb-4';
      col.innerHTML = `
        <div class="card book-card h-100">
          <img src="${imageUrl}" class="card-img-top" alt="${book.title}">
          <div class="card-body">
            <h5 class="card-title">${book.title}</h5>
            ${book.author_names ? `<p class="card-text">by ${book.author_names.join(', ')}</p>` : ''}
            <a href="https://openlibrary.org${book.key}" target="_blank" class="btn btn-primary mt-2">View Book</a>
          </div>
        </div>
      `;
      container.appendChild(col);
    });

  } catch (error) {
    console.error('Error fetching book data:', error);
  }
}
window.addEventListener('DOMContentLoaded', () => {
  fetchBooks();
});

async function handleSearch() {
  let name = document.getElementById('authorName').value.trim();
  console.log("Searching for:", name);

  if (!name) return;

  const apiUrl = `https://openlibrary.org/search/authors.json?q=${encodeURIComponent(name)}`;
  
  try {
    document.getElementById('books-container').innerHTML = `<p class="text-center">Searching author...</p>`;
    const res = await fetch(apiUrl);
    const data = await res.json();

    const authors = data.docs;
    if (!authors.length) {
      document.getElementById('books-container').innerHTML = `<p class="text-muted text-center">No author found with that name.</p>`;
      return;
    }

    const topAuthor = authors[0];
    const authorKey = topAuthor.key; // e.g. OL8783426A
    fetchAuthorBooks(authorKey);
  } catch (error) {
    console.error('Author search failed:', error);
    document.getElementById('books-container').innerHTML = `<p class="text-danger text-center">Failed to fetch author info.</p>`;
  }
}

async function fetchAuthorBooks(authorKey) {
  const worksUrl = `https://openlibrary.org/authors/${authorKey}/works.json`;

  try {
    document.getElementById('books-container').innerHTML = `<p class="text-center">Loading books...</p>`;
    const res = await fetch(worksUrl);
    const data = await res.json();
    const entries = data.entries.slice(0, 12); // Top 12 works

    const container = document.getElementById('books-container');
    container.innerHTML = '';

    if (entries.length === 0) {
      container.innerHTML = `<p class="text-muted text-center">No books found for this author.</p>`;
      return;
    }

    entries.forEach(book => {
      const coverId = book.covers ? book.covers[0] : null;
      const imageUrl = coverId
        ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`
        : 'https://via.placeholder.com/200x300?text=No+Cover';

      const col = document.createElement('div');
      col.className = 'col-md-4 mb-4';
      col.innerHTML = `
        <div class="card book-card h-100 shadow-sm">
          <img src="${imageUrl}" class="card-img-top" alt="${book.title}">
          <div class="card-body">
            <h5 class="card-title">${book.title}</h5>
            <a href="https://openlibrary.org${book.key}" target="_blank" class="btn btn-primary mt-2">View Book</a>
          </div>
        </div>
      `;
      container.appendChild(col);
    });

  } catch (error) {
    console.error('Error fetching books:', error);
    document.getElementById('books-container').innerHTML = `<p class="text-danger text-center">Failed to load books.</p>`;
  }
}


function filterByCategory(category) {
  document.getElementById("books-container").innerHTML = ""; // clear existing
  const url = `https://openlibrary.org/subjects/${category.toLowerCase()}.json?limit=12`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      if (!data.works || data.works.length === 0) {
        document.getElementById("books-container").innerHTML = "<p class='text-warning'>No books found for this category.</p>";
        return;
      }

      data.works.forEach(book => {
        const title = book.title || "No Title";
        const author = book.authors?.[0]?.name || "Unknown";
        const coverId = book.cover_id;
        const coverImg = coverId
          ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`
          : `https://via.placeholder.com/150x200?text=No+Cover`;

        const bookCard = `
          <div class="col-md-4 mb-4">
            <div class="card h-100 shadow-sm">
              <img src="${coverImg}" class="card-img-top" alt="${title}">
              <div class="card-body">
                <h5 class="card-title">${title}</h5>
                <p class="card-text"><strong>Author:</strong> ${author}</p>
              </div>
            </div>
          </div>
        `;
        document.getElementById("books-container").innerHTML += bookCard;
      });
    })
    .catch(err => {
      document.getElementById("books-container").innerHTML = `<p class='text-danger'>Error: ${err.message}</p>`;
    });
}
