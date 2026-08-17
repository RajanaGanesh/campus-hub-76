import React, { useState } from 'react';
import { servicesData, LibraryBook, BorrowLog } from '../data/servicesData';

export const Library: React.FC = () => {
  // Load books catalog state
  const [books, setBooks] = useState<LibraryBook[]>(() => {
    try {
      const stored = localStorage.getItem('campushub_library_books');
      return stored ? JSON.parse(stored) : servicesData.books;
    } catch {
      return servicesData.books;
    }
  });

  // Load borrowing history state
  const [history, setHistory] = useState<BorrowLog[]>(() => {
    try {
      const stored = localStorage.getItem('campushub_library_history');
      return stored ? JSON.parse(stored) : servicesData.borrowHistory;
    } catch {
      return servicesData.borrowHistory;
    }
  });

  // Filters & Search states
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [availabilityFilter, setAvailabilityFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Title');

  // Modal / Confirmations States
  const [selectedBook, setSelectedBook] = useState<LibraryBook | null>(null);
  const [borrowConfirmBook, setBorrowConfirmBook] = useState<LibraryBook | null>(null);
  const [returnConfirmBook, setReturnConfirmBook] = useState<LibraryBook | null>(null);

  // Alert Toasts State
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // History category filter state
  const [historyFilter, setHistoryFilter] = useState('All');

  // Derive metrics dynamically
  const activeIssuedList = books.filter((b) => b.availability === 'Issued');
  const activeIssuedCount = activeIssuedList.length;
  
  // Hardcoded base metrics + dynamic offsets to keep stats looking realistic
  const booksIssuedCount = activeIssuedCount + 2; // Offset to start at 3
  const booksDueSoonCount = 1;
  const booksOverdueCount = 0;

  const categoriesList = Array.from(new Set(books.map((b) => b.category)));

  // Filtered & Sorted catalog
  const filteredBooks = books
    .filter((b) => {
      const matchSearch =
        b.title.toLowerCase().includes(search.toLowerCase()) ||
        b.author.toLowerCase().includes(search.toLowerCase()) ||
        b.category.toLowerCase().includes(search.toLowerCase()) ||
        b.isbn.toLowerCase().includes(search.toLowerCase());
      const matchCategory = categoryFilter === 'All' || b.category === categoryFilter;
      const matchAvailability = availabilityFilter === 'All' || b.availability === availabilityFilter;
      return matchSearch && matchCategory && matchAvailability;
    })
    .sort((a, b) => {
      if (sortBy === 'Title') {
        return a.title.localeCompare(b.title);
      } else if (sortBy === 'Newest') {
        return b.publicationYear - a.publicationYear;
      } else if (sortBy === 'Popular') {
        return b.rating - a.rating;
      }
      return 0;
    });

  // Filtered History
  const filteredHistory = history.filter((log) => {
    if (historyFilter === 'All') return true;
    return log.status === historyFilter;
  });

  const handleOpenDetails = (book: LibraryBook) => {
    setSelectedBook(book);
  };

  const handleTriggerBorrow = (book: LibraryBook) => {
    setSelectedBook(null);
    setBorrowConfirmBook(book);
  };

  const handleConfirmBorrow = () => {
    if (!borrowConfirmBook) return;

    const formattedDueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

    // Update catalog state
    const nextBooks = books.map((b) => {
      if (b.id === borrowConfirmBook.id) {
        return {
          ...b,
          availability: 'Issued' as const,
          dueDate: formattedDueDate
        };
      }
      return b;
    });

    // Update history state
    const todayStr = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    const nextHistory: BorrowLog[] = [
      { bookTitle: borrowConfirmBook.title, borrowedDate: todayStr, status: 'Active' },
      ...history
    ];

    setBooks(nextBooks);
    setHistory(nextHistory);
    localStorage.setItem('campushub_library_books', JSON.stringify(nextBooks));
    localStorage.setItem('campushub_library_history', JSON.stringify(nextHistory));

    setBorrowConfirmBook(null);
    setToastMsg('Book issued successfully.');
    setTimeout(() => setToastMsg(null), 2500);
  };

  const handleTriggerReturn = (book: LibraryBook) => {
    setReturnConfirmBook(book);
  };

  const handleConfirmReturn = () => {
    if (!returnConfirmBook) return;

    // Update catalog state
    const nextBooks = books.map((b) => {
      if (b.id === returnConfirmBook.id) {
        return {
          ...b,
          availability: 'Available' as const,
          dueDate: undefined
        };
      }
      return b;
    });

    // Update history state
    const todayStr = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    const nextHistory = history.map((log) => {
      if (log.bookTitle === returnConfirmBook.title && log.status === 'Active') {
        return {
          ...log,
          status: 'Returned' as const,
          returnedDate: todayStr
        };
      }
      return log;
    });

    setBooks(nextBooks);
    setHistory(nextHistory);
    localStorage.setItem('campushub_library_books', JSON.stringify(nextBooks));
    localStorage.setItem('campushub_library_history', JSON.stringify(nextHistory));

    setReturnConfirmBook(null);
    setToastMsg('Book returned successfully.');
    setTimeout(() => setToastMsg(null), 2500);
  };

  const handleReserve = (book: LibraryBook) => {
    setSelectedBook(null);

    // Update catalog state
    const nextBooks = books.map((b) => {
      if (b.id === book.id) {
        return {
          ...b,
          availability: 'Reserved' as const,
          reservationDate: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
        };
      }
      return b;
    });

    // Update history state
    const todayStr = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    const nextHistory: BorrowLog[] = [
      { bookTitle: book.title, borrowedDate: todayStr, status: 'Reserved' },
      ...history
    ];

    setBooks(nextBooks);
    setHistory(nextHistory);
    localStorage.setItem('campushub_library_books', JSON.stringify(nextBooks));
    localStorage.setItem('campushub_library_history', JSON.stringify(nextHistory));

    setToastMsg('Book reserved successfully.');
    setTimeout(() => setToastMsg(null), 2500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Library Header */}
      <div className="dashboard-header">
        <h1>Digital Library</h1>
        <p>Discover, borrow, and manage your academic resources.</p>
      </div>

      {/* Due Alerts Notifications */}
      <div className="login-error-box" style={{ margin: 0, borderColor: 'rgba(255,178,54,0.3)', background: 'rgba(255,178,54,0.02)' }}>
        <i className="fa-solid fa-circle-exclamation" style={{ color: '#ffb236' }}></i>
        <span style={{ color: '#ffb236' }}>
          <strong>Book Due Soon:</strong> Database System Concepts is due in 3 days. Please return or renew it soon.
        </span>
      </div>

      {/* Toast Alert Msg */}
      {toastMsg && (
        <div className="toast-msg">
          <i className="fa-solid fa-circle-check" style={{ color: '#00d89a' }}></i>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="stats-grid">
        <div className="card-panel stat-card">
          <div className="stat-card-row">
            <div className="stat-card-icon primary">
              <i className="fa-solid fa-book"></i>
            </div>
          </div>
          <div className="stat-card-value">{booksIssuedCount}</div>
          <div className="stat-card-desc">Books Issued</div>
        </div>

        <div className="card-panel stat-card">
          <div className="stat-card-row">
            <div className="stat-card-icon red">
              <i className="fa-solid fa-hourglass-half"></i>
            </div>
            <span className="stat-card-trend due">Due Soon</span>
          </div>
          <div className="stat-card-value">{booksDueSoonCount}</div>
          <div className="stat-card-desc">Due Soon</div>
        </div>

        <div className="card-panel stat-card">
          <div className="stat-card-row">
            <div className="stat-card-icon red">
              <i className="fa-solid fa-circle-xmark"></i>
            </div>
          </div>
          <div className="stat-card-value">{booksOverdueCount}</div>
          <div className="stat-card-desc">Overdue Books</div>
        </div>

        <div className="card-panel stat-card">
          <div className="stat-card-row">
            <div className="stat-card-icon cyan">
              <i className="fa-solid fa-book-open-reader"></i>
            </div>
          </div>
          <div className="stat-card-value">12</div>
          <div className="stat-card-desc">Reading activity this year</div>
        </div>
      </div>

      {/* Search and filter toolbar */}
      <div className="card-panel" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', maxWidth: '320px', width: '100%' }}>
            <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '12px', fontSize: '12px', color: 'var(--text-secondary)' }}></i>
            <input
              type="text"
              placeholder="Search books, authors, ISBN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '8px 12px 8px 32px',
                fontSize: '13px',
                color: 'white',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{
                background: '#100f2e',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '12px',
                color: 'white',
                outline: 'none'
              }}
            >
              <option value="All">All Categories</option>
              {categoriesList.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
              style={{
                background: '#100f2e',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '12px',
                color: 'white',
                outline: 'none'
              }}
            >
              <option value="All">All Availability</option>
              <option value="Available">Available</option>
              <option value="Issued">Issued</option>
              <option value="Reserved">Reserved</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                background: '#100f2e',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '12px',
                color: 'white',
                outline: 'none'
              }}
            >
              <option value="Title">Sort: Title</option>
              <option value="Newest">Sort: Newest</option>
              <option value="Popular">Sort: Popular</option>
            </select>
          </div>
        </div>
      </div>

      {/* Catalog Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {filteredBooks.length > 0 ? (
          filteredBooks.map((bk) => (
            <div key={bk.id} className="card-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                  <span style={{ fontSize: '10.5px', color: 'var(--accent-highlight)', fontWeight: '600' }}>{bk.category}</span>
                  <span className={`subject-att-status ${bk.availability === 'Available' ? 'safe' : bk.availability === 'Issued' ? 'warning' : 'good'}`} style={{ fontSize: '9.5px' }}>
                    {bk.availability}
                  </span>
                </div>

                {/* Mock Cover container */}
                <div style={{ width: '100%', height: '140px', background: 'rgba(255,255,255,0.01)', border: '1px dashed rgba(255,255,255,0.06)', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#555365', marginBottom: '14px' }}>
                  <i className="fa-solid fa-book-bookmark" style={{ fontSize: '24px', marginBottom: '6px' }}></i>
                  <span style={{ fontSize: '10.5px', textTransform: 'uppercase' }}>Academic Reference Cover</span>
                </div>

                <h3 style={{ fontSize: '15.5px', fontWeight: '700', color: 'white', marginBottom: '4px' }}>{bk.title}</h3>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>by {bk.author}</span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#ffb236', marginTop: '10px' }}>
                  <i className="fa-solid fa-star"></i>
                  <span style={{ color: 'white', fontWeight: '700' }}>{bk.rating}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>Rating</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '18px' }}>
                <button
                  type="button"
                  className="btn-view-all"
                  style={{ flex: 1.2, margin: 0, border: '1px solid var(--accent-primary)', color: 'white' }}
                  onClick={() => handleOpenDetails(bk)}
                >
                  View Details
                </button>
                {bk.availability === 'Available' ? (
                  <button
                    type="button"
                    className="btn-signin"
                    style={{ flex: 1, margin: 0, height: '34px', fontSize: '11.5px', padding: 0 }}
                    onClick={() => handleTriggerBorrow(bk)}
                  >
                    Borrow
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn-retry-err"
                    style={{ flex: 1, margin: 0, padding: 0, border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}
                    onClick={() => handleReserve(bk)}
                    disabled={bk.availability === 'Reserved'}
                  >
                    {bk.availability === 'Reserved' ? 'Reserved' : 'Reserve'}
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="card-panel" style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <i className="fa-solid fa-book-open" style={{ fontSize: '32px', opacity: 0.3, marginBottom: '12px' }}></i>
            <h3>No books found</h3>
            <p style={{ fontSize: '12.5px' }}>Try changing your filters.</p>
          </div>
        )}
      </div>

      {/* My Issued Books list */}
      <div className="card-panel">
        <div className="card-panel-header" style={{ marginBottom: '16px' }}>
          <h3>My Issued Books</h3>
          <i className="fa-solid fa-folder-closed" style={{ color: 'var(--text-secondary)' }}></i>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '12px' }}>Book Title</th>
                <th style={{ padding: '12px' }}>Category</th>
                <th style={{ padding: '12px' }}>Due Date</th>
                <th style={{ padding: '12px' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {activeIssuedList.map((bk) => (
                <tr key={bk.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                  <td style={{ padding: '12px', fontWeight: '600', color: 'white' }}>{bk.title}</td>
                  <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{bk.category}</td>
                  <td style={{ padding: '12px' }}>{bk.dueDate || '30 days from issue'}</td>
                  <td style={{ padding: '12px' }}>
                    <span className="subject-att-status warning" style={{ fontSize: '9px' }}>Active</span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    <button
                      type="button"
                      className="btn-retry-err"
                      style={{ margin: 0, padding: '4px 12px', fontSize: '11px' }}
                      onClick={() => handleTriggerReturn(bk)}
                    >
                      Return
                    </button>
                  </td>
                </tr>
              ))}
              {activeIssuedList.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No active book checkouts found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Borrow History Logs */}
      <div className="card-panel">
        <div className="card-panel-header" style={{ flexWrap: 'wrap', gap: '12px' }}>
          <h3>Borrowing & Reservation History</h3>

          <select
            value={historyFilter}
            onChange={(e) => setHistoryFilter(e.target.value)}
            style={{
              background: '#100f2e',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '12px',
              color: 'white',
              outline: 'none'
            }}
          >
            <option value="All">All Logs</option>
            <option value="Active">Active</option>
            <option value="Returned">Returned</option>
            <option value="Reserved">Reserved</option>
          </select>
        </div>

        <div style={{ overflowX: 'auto', marginTop: '10px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '12px' }}>Book Title</th>
                <th style={{ padding: '12px' }}>Borrowed/Reserved Date</th>
                <th style={{ padding: '12px' }}>Returned Date</th>
                <th style={{ padding: '12px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map((log, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                  <td style={{ padding: '12px', fontWeight: '600', color: 'white' }}>{log.bookTitle}</td>
                  <td style={{ padding: '12px' }}>{log.borrowedDate}</td>
                  <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{log.returnedDate || '-'}</td>
                  <td style={{ padding: '12px' }}>
                    <span className={`subject-att-status ${log.status === 'Returned' ? 'safe' : log.status === 'Active' ? 'warning' : 'good'}`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Book Details Modal */}
      {selectedBook && (
        <div className="search-modal-overlay" onClick={() => setSelectedBook(null)}>
          <div className="search-modal-card" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
            <div className="search-modal-header" style={{ justifyContent: 'space-between', padding: '18px 24px' }}>
              <h2 style={{ fontSize: '18px' }}>{selectedBook.title}</h2>
              <button type="button" className="btn-search-close" onClick={() => setSelectedBook(null)}>
                <i className="fa-solid fa-xmark" style={{ fontSize: '14px' }}></i>
              </button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '13px' }}>
                <div><span style={{ color: 'var(--text-secondary)' }}>Author:</span> <strong style={{ color: 'white' }}>{selectedBook.author}</strong></div>
                <div><span style={{ color: 'var(--text-secondary)' }}>Category:</span> <strong style={{ color: 'white' }}>{selectedBook.category}</strong></div>
                <div><span style={{ color: 'var(--text-secondary)' }}>ISBN:</span> <strong style={{ color: 'white' }}>{selectedBook.isbn}</strong></div>
                <div><span style={{ color: 'var(--text-secondary)' }}>Publisher:</span> <strong style={{ color: 'white' }}>{selectedBook.publisher}</strong></div>
                <div><span style={{ color: 'var(--text-secondary)' }}>Pub Year:</span> <strong style={{ color: 'white' }}>{selectedBook.publicationYear}</strong></div>
                <div><span style={{ color: 'var(--text-secondary)' }}>Shelf No:</span> <strong style={{ color: 'white' }}>{selectedBook.shelfNumber}</strong></div>
                <div><span style={{ color: 'var(--text-secondary)' }}>Availability:</span> <span className="subject-att-status safe">{selectedBook.availability}</span></div>
                <div><span style={{ color: 'var(--text-secondary)' }}>Rating:</span> <strong style={{ color: '#ffb236' }}>{selectedBook.rating} / 5</strong></div>
              </div>

              <div>
                <h4 style={{ fontSize: '13px', color: 'white', marginBottom: '6px' }}>Description</h4>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{selectedBook.description}</p>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                {selectedBook.availability === 'Available' ? (
                  <button
                    type="button"
                    className="btn-signin"
                    style={{ flex: 1, margin: 0, height: '40px' }}
                    onClick={() => handleTriggerBorrow(selectedBook)}
                  >
                    Borrow Book
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn-retry-err"
                    style={{ flex: 1, margin: 0, height: '40px' }}
                    onClick={() => handleReserve(selectedBook)}
                    disabled={selectedBook.availability === 'Reserved'}
                  >
                    {selectedBook.availability === 'Reserved' ? 'Reserved' : 'Reserve Book'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Borrow Confirmation Modal */}
      {borrowConfirmBook && (
        <div className="search-modal-overlay" onClick={() => setBorrowConfirmBook(null)}>
          <div className="search-modal-card" style={{ maxWidth: '400px' }} onClick={(e) => e.stopPropagation()}>
            <div className="search-modal-header" style={{ justifyContent: 'space-between', padding: '18px 24px' }}>
              <h2 style={{ fontSize: '16.5px' }}>Confirm Borrowing</h2>
            </div>
            
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ fontSize: '13.5px', color: 'white', lineHeight: '1.4' }}>
                Are you sure you want to borrow <strong>{borrowConfirmBook.title}</strong> by {borrowConfirmBook.author}?
              </p>
              <div style={{ padding: '12px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                <div><strong>Borrow Date:</strong> Today</div>
                <div style={{ marginTop: '4px' }}><strong>Return Due Date:</strong> 30 Days from today</div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  className="btn-retry-err"
                  style={{ flex: 1, margin: 0 }}
                  onClick={() => setBorrowConfirmBook(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-signin"
                  style={{ flex: 1, margin: 0, height: '38px' }}
                  onClick={handleConfirmBorrow}
                >
                  Confirm Borrow
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Return Confirmation Modal */}
      {returnConfirmBook && (
        <div className="search-modal-overlay" onClick={() => setReturnConfirmBook(null)}>
          <div className="search-modal-card" style={{ maxWidth: '400px' }} onClick={(e) => e.stopPropagation()}>
            <div className="search-modal-header" style={{ justifyContent: 'space-between', padding: '18px 24px' }}>
              <h2 style={{ fontSize: '16.5px' }}>Confirm Book Return</h2>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ fontSize: '13.5px', color: 'white', lineHeight: '1.4' }}>
                Return <strong>{returnConfirmBook.title}</strong> back to shelf repository <strong>{returnConfirmBook.shelfNumber}</strong>?
              </p>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  className="btn-retry-err"
                  style={{ flex: 1, margin: 0 }}
                  onClick={() => setReturnConfirmBook(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-signin"
                  style={{ flex: 1, margin: 0, height: '38px' }}
                  onClick={handleConfirmReturn}
                >
                  Confirm Return
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Library;
