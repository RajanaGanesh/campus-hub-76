import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../../components/AppLayout';
import { servicesData, LibraryBook, BorrowLog } from '../../data/servicesData';
import { Modal } from '../../components/Modal';
import { Toast } from '../../components/Toast';

export const StudentLibrary: React.FC = () => {
  const navigate = useNavigate();

  // Books catalog state
  const [books, setBooks] = useState<LibraryBook[]>(servicesData.books);
  const [borrowHistory, setBorrowHistory] = useState<BorrowLog[]>(servicesData.borrowHistory);

  // Active section tab
  const [activeTab, setActiveTab] = useState<'catalog' | 'my-books'>('catalog');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [availabilityFilter, setAvailabilityFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'title-asc' | 'title-desc' | 'newest' | 'available'>('title-asc');

  // Modal States
  const [selectedBook, setSelectedBook] = useState<LibraryBook | null>(null);
  const [requestBookModalItem, setRequestBookModalItem] = useState<LibraryBook | null>(null);

  // Action Toast State
  const [toastMsg, setToastMsg] = useState<{ message: string; type: 'info' | 'success' | 'warning' | 'error' } | null>(null);

  const showToast = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setToastMsg({ message, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Metrics calculation
  const borrowedActiveCount = borrowHistory.filter((b) => b.status === 'Active' || b.status === 'Overdue').length;
  const dueSoonCount = 1; // 1 book due soon
  const overdueCount = borrowHistory.filter((b) => b.status === 'Overdue').length;
  const totalFineAmount = 0;

  // Filter categories
  const categoriesList = useMemo(() => {
    return ['All', ...Array.from(new Set(books.map((b) => b.category)))];
  }, [books]);

  // Filtered & Sorted Catalog
  const filteredBooks = useMemo(() => {
    let list = books.filter((bk) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        bk.title.toLowerCase().includes(q) ||
        bk.author.toLowerCase().includes(q) ||
        bk.isbn.toLowerCase().includes(q) ||
        bk.category.toLowerCase().includes(q);

      const matchCategory = categoryFilter === 'All' || bk.category === categoryFilter;
      const matchAvailability = availabilityFilter === 'All' || bk.availability === availabilityFilter;

      return matchSearch && matchCategory && matchAvailability;
    });

    list.sort((a, b) => {
      if (sortBy === 'title-desc') return b.title.localeCompare(a.title);
      if (sortBy === 'newest') return (b.publicationYear || 0) - (a.publicationYear || 0);
      if (sortBy === 'available') {
        if (a.availability === 'Available' && b.availability !== 'Available') return -1;
        if (a.availability !== 'Available' && b.availability === 'Available') return 1;
      }
      return a.title.localeCompare(b.title);
    });

    return list;
  }, [books, searchQuery, categoryFilter, availabilityFilter, sortBy]);

  const hasActiveFilters = searchQuery !== '' || categoryFilter !== 'All' || availabilityFilter !== 'All' || sortBy !== 'title-asc';

  const resetFilters = () => {
    setSearchQuery('');
    setCategoryFilter('All');
    setAvailabilityFilter('All');
    setSortBy('title-asc');
    showToast('Library filters reset.', 'info');
  };

  // Handle Book Borrow / Request
  const handleConfirmRequestBook = (bk: LibraryBook) => {
    // Update book status to Reserved / Issued
    setBooks((prev) =>
      prev.map((b) =>
        b.id === bk.id
          ? { ...b, availability: 'Issued', dueDate: '02 Sep 2026' }
          : b
      )
    );

    // Add to borrow history
    setBorrowHistory((prev) => [
      ...prev,
      {
        bookTitle: bk.title,
        borrowedDate: '18 Aug 2026',
        status: 'Active'
      }
    ]);

    setRequestBookModalItem(null);
    showToast(`Book "${bk.title}" issued successfully. Pickup from Central Library counter.`, 'success');
  };

  // Handle Loan Renewal
  const handleRenewLoan = (title: string) => {
    showToast(`Loan renewed for "${title}" by 14 additional days.`, 'success');
  };

  const getAvailabilityBadge = (avail: LibraryBook['availability']) => {
    switch (avail) {
      case 'Available':
        return <span className="c1-badge c1-badge-success"><i className="fa-solid fa-circle-check"></i> Available</span>;
      case 'Issued':
        return <span className="c1-badge c1-badge-warning"><i className="fa-solid fa-clock"></i> Issued</span>;
      case 'Reserved':
      default:
        return <span className="c1-badge c1-badge-primary"><i className="fa-solid fa-bookmark"></i> Reserved</span>;
    }
  };

  return (
    <AppLayout>
      <div className="academic-module-page">
        {/* Module Header */}
        <div className="module-header-row">
          <div>
            <div className="module-breadcrumbs">
              <span>Campus Services</span>
              <span className="crumb-sep">/</span>
              <span className="crumb-current">Digital Library</span>
            </div>
            <h1 className="module-title">Digital Library</h1>
            <p className="module-subtitle">
              Browse 50,000+ print & e-book titles, manage borrowed books, renew loan periods, and place reservations.
            </p>
          </div>

          <div className="module-header-meta">
            <div className="meta-badge-box">
              <span className="meta-badge-label">Library Card ID</span>
              <span className="meta-badge-val">LIB-236F1A0551 (Active)</span>
            </div>
          </div>
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="academic-stats-grid">
          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
              <i className="fa-solid fa-book-bookmark"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">{borrowedActiveCount}</span>
              <span className="stat-label">Books Borrowed</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
              <i className="fa-solid fa-clock"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">{dueSoonCount}</span>
              <span className="stat-label">Books Due Soon</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185' }}>
              <i className="fa-solid fa-triangle-exclamation"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">{overdueCount}</span>
              <span className="stat-label">Overdue Books</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <i className="fa-solid fa-receipt"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">₹{totalFineAmount}</span>
              <span className="stat-label">Current Outstanding Fine</span>
            </div>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="exam-section-tabs">
          <button
            type="button"
            className={`section-tab-btn ${activeTab === 'catalog' ? 'active' : ''}`}
            onClick={() => setActiveTab('catalog')}
          >
            <i className="fa-solid fa-magnifying-glass"></i>
            <span>Search Book Catalog ({filteredBooks.length})</span>
          </button>
          <button
            type="button"
            className={`section-tab-btn ${activeTab === 'my-books' ? 'active' : ''}`}
            onClick={() => setActiveTab('my-books')}
          >
            <i className="fa-solid fa-book-open-reader"></i>
            <span>My Library ({borrowHistory.length})</span>
          </button>
        </div>

        {/* ============================================================
            TAB 1: BOOK CATALOG SEARCH & FILTERS
            ============================================================ */}
        {activeTab === 'catalog' && (
          <div>
            {/* Search and Filters Toolbar */}
            <div className="c1-card academic-filters-card" style={{ marginBottom: '24px' }}>
              <div className="search-filter-input-wrap">
                <i className="fa-solid fa-magnifying-glass search-icon"></i>
                <input
                  type="text"
                  className="c1-input search-filter-input"
                  placeholder="Search library by book title, author name, ISBN, or subject topic..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="clear-search-btn"
                    onClick={() => setSearchQuery('')}
                  >
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                )}
              </div>

              <div className="filters-row-wrap">
                <div className="filter-select-item">
                  <label htmlFor="filter-lib-category">Category</label>
                  <select
                    id="filter-lib-category"
                    className="c1-select"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    {categoriesList.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-select-item">
                  <label htmlFor="filter-lib-avail">Availability</label>
                  <select
                    id="filter-lib-avail"
                    className="c1-select"
                    value={availabilityFilter}
                    onChange={(e) => setAvailabilityFilter(e.target.value)}
                  >
                    <option value="All">All Statuses</option>
                    <option value="Available">Available for Issue</option>
                    <option value="Issued">Currently Issued</option>
                  </select>
                </div>

                <div className="filter-select-item">
                  <label htmlFor="sort-lib">Sort By</label>
                  <select
                    id="sort-lib"
                    className="c1-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                  >
                    <option value="title-asc">Title (A to Z)</option>
                    <option value="title-desc">Title (Z to A)</option>
                    <option value="newest">Publication Year</option>
                    <option value="available">Availability First</option>
                  </select>
                </div>

                {hasActiveFilters && (
                  <button
                    type="button"
                    className="c1-btn c1-btn-secondary btn-clear-filters"
                    onClick={resetFilters}
                  >
                    <i className="fa-solid fa-arrow-rotate-left"></i>
                    <span>Reset</span>
                  </button>
                )}
              </div>
            </div>

            {/* Book Cards Grid */}
            {filteredBooks.length > 0 ? (
              <div className="library-books-grid">
                {filteredBooks.map((book) => {
                  const isAvailable = book.availability === 'Available';

                  return (
                    <div key={book.id} className="c1-card library-book-card">
                      <div className="book-card-top">
                        <div className="book-cover-mock">
                          <i className="fa-solid fa-book book-cover-icon"></i>
                          <span className="shelf-badge">{book.shelfNumber}</span>
                        </div>

                        <div className="book-info-col">
                          <div className="book-category-row">
                            <span className="course-code-tag">{book.category}</span>
                            {getAvailabilityBadge(book.availability)}
                          </div>
                          <h3 className="book-title">{book.title}</h3>
                          <span className="book-author">By {book.author}</span>
                          <span className="book-isbn">ISBN: {book.isbn} • {book.publisher}</span>
                          <div className="book-rating">
                            <span className="stars">★★★★★</span>
                            <span className="rating-num">{book.rating}</span>
                          </div>
                        </div>
                      </div>

                      <p className="book-snippet-desc">{book.description}</p>

                      <div className="library-card-actions">
                        <button
                          type="button"
                          className="c1-btn c1-btn-secondary btn-action-half"
                          onClick={() => setSelectedBook(book)}
                        >
                          <i className="fa-solid fa-circle-info"></i>
                          <span>View Details</span>
                        </button>

                        {isAvailable ? (
                          <button
                            type="button"
                            className="c1-btn c1-btn-gradient btn-action-half"
                            onClick={() => setRequestBookModalItem(book)}
                          >
                            <i className="fa-solid fa-hand-holding-hand"></i>
                            <span>Borrow / Request</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="c1-btn c1-btn-secondary btn-action-half btn-reserve-copy"
                            onClick={() => {
                              showToast(`Reservation request placed for "${book.title}". You will be notified upon return.`, 'info');
                            }}
                          >
                            <i className="fa-solid fa-bookmark"></i>
                            <span>Reserve Copy</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="c1-card academic-empty-card">
                <i className="fa-solid fa-book-skull empty-card-icon"></i>
                <h4>No books found</h4>
                <p>No titles match your active search terms or category selection.</p>
                {hasActiveFilters && (
                  <button
                    type="button"
                    className="c1-btn c1-btn-secondary"
                    onClick={resetFilters}
                  >
                    Reset Active Filters
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* ============================================================
            TAB 2: MY BORROWED BOOKS
            ============================================================ */}
        {activeTab === 'my-books' && (
          <div className="c1-card my-library-card">
            <div className="c1-card-header">
              <div>
                <h3 className="c1-card-title">My Borrowed Books & Active Loans</h3>
                <p className="c1-card-subtitle">Track your loan return deadlines, renew loan periods, and check fine statuses</p>
              </div>
              <span className="c1-badge c1-badge-success">
                {borrowHistory.filter((b) => b.status === 'Active').length} Active Loans
              </span>
            </div>

            {borrowHistory.length > 0 ? (
              <div className="my-books-table-wrap">
                <table className="c1-table">
                  <thead>
                    <tr>
                      <th>Book Title</th>
                      <th>Borrow Date</th>
                      <th>Due Date</th>
                      <th>Loan Status</th>
                      <th>Fine Incurred</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {borrowHistory.map((item, idx) => {
                      const isActive = item.status === 'Active';
                      const isReturned = item.status === 'Returned';

                      return (
                        <tr key={idx}>
                          <td>
                            <div className="book-table-title-cell">
                              <i className="fa-solid fa-book"></i>
                              <strong style={{ color: 'var(--text-primary)' }}>{item.bookTitle}</strong>
                            </div>
                          </td>
                          <td>{item.borrowedDate}</td>
                          <td>
                            {isReturned ? (
                              <span className="text-muted">Returned on {item.returnedDate}</span>
                            ) : (
                              <span style={{ color: 'var(--color-warning)', fontWeight: 600 }}>
                                14 Sep 2026 (Due in 27 Days)
                              </span>
                            )}
                          </td>
                          <td>
                            {isActive ? (
                              <span className="c1-badge c1-badge-cyan">Active Loan</span>
                            ) : isReturned ? (
                              <span className="c1-badge c1-badge-success">Returned</span>
                            ) : (
                              <span className="c1-badge c1-badge-error">Overdue</span>
                            )}
                          </td>
                          <td>
                            <strong>₹0.00</strong>
                          </td>
                          <td>
                            {isActive ? (
                              <button
                                type="button"
                                className="c1-btn c1-btn-secondary"
                                style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                                onClick={() => handleRenewLoan(item.bookTitle)}
                              >
                                <i className="fa-solid fa-arrow-rotate-right"></i>
                                <span>Renew Loan</span>
                              </button>
                            ) : (
                              <span className="text-muted">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="c1-card academic-empty-card">
                <i className="fa-solid fa-book-open empty-card-icon"></i>
                <h4>You haven't borrowed any books yet</h4>
                <p>Browse the catalog above to request books from the library.</p>
                <button
                  type="button"
                  className="c1-btn c1-btn-gradient"
                  onClick={() => setActiveTab('catalog')}
                >
                  Explore Catalog
                </button>
              </div>
            )}
          </div>
        )}

        {/* ============================================================
            MODAL 1: BOOK DETAILS MODAL
            ============================================================ */}
        {selectedBook && (
          <Modal
            isOpen={true}
            onClose={() => setSelectedBook(null)}
            title={`Book Details: ${selectedBook.title}`}
            maxWidth="md"
          >
            <div className="book-detail-dialog">
              <div className="book-detail-grid">
                <div className="detail-box">
                  <span className="detail-lbl">Author</span>
                  <span className="detail-val">{selectedBook.author}</span>
                </div>
                <div className="detail-box">
                  <span className="detail-lbl">Category</span>
                  <span className="detail-val">{selectedBook.category}</span>
                </div>
                <div className="detail-box">
                  <span className="detail-lbl">ISBN & Publisher</span>
                  <span className="detail-val">{selectedBook.isbn} ({selectedBook.publisher})</span>
                </div>
                <div className="detail-box">
                  <span className="detail-lbl">Shelf Location</span>
                  <span className="detail-val">Aisle {selectedBook.shelfNumber}</span>
                </div>
              </div>

              <div className="details-section">
                <h4>Synopsis & Book Overview</h4>
                <p>{selectedBook.description}</p>
              </div>

              <div className="details-section">
                <h4>Availability Status</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {getAvailabilityBadge(selectedBook.availability)}
                  {selectedBook.dueDate && (
                    <span className="text-muted" style={{ fontSize: '0.8125rem' }}>
                      Currently issued until {selectedBook.dueDate}
                    </span>
                  )}
                </div>
              </div>

              <div className="modal-dialog-footer">
                <button
                  type="button"
                  className="c1-btn c1-btn-secondary"
                  onClick={() => setSelectedBook(null)}
                >
                  Close
                </button>
                {selectedBook.availability === 'Available' ? (
                  <button
                    type="button"
                    className="c1-btn c1-btn-gradient"
                    onClick={() => {
                      const bk = selectedBook;
                      setSelectedBook(null);
                      setRequestBookModalItem(bk);
                    }}
                  >
                    <i className="fa-solid fa-hand-holding-hand"></i>
                    <span>Borrow / Request Book</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    className="c1-btn c1-btn-secondary"
                    onClick={() => {
                      showToast(`Reservation recorded for "${selectedBook.title}".`, 'info');
                      setSelectedBook(null);
                    }}
                  >
                    <i className="fa-solid fa-bookmark"></i>
                    <span>Reserve Copy</span>
                  </button>
                )}
              </div>
            </div>
          </Modal>
        )}

        {/* ============================================================
            MODAL 2: BORROW / REQUEST BOOK CONFIRMATION MODAL
            ============================================================ */}
        {requestBookModalItem && (
          <Modal
            isOpen={true}
            onClose={() => setRequestBookModalItem(null)}
            title="Confirm Library Book Borrow Request"
            maxWidth="md"
          >
            <div className="borrow-request-dialog">
              <div className="borrow-prompt-box">
                <i className="fa-solid fa-book-circle-check borrow-icon"></i>
                <div>
                  <h3 style={{ color: 'var(--text-primary)', fontSize: '1.1rem' }}>{requestBookModalItem.title}</h3>
                  <span className="text-muted" style={{ fontSize: '0.8125rem' }}>By {requestBookModalItem.author}</span>
                </div>
              </div>

              <div className="borrow-terms-box">
                <h4>Loan Terms & Conditions:</h4>
                <ul>
                  <li>Standard student loan duration is <strong>14 calendar days</strong>.</li>
                  <li>Collect physical copy from <strong>Central Library Counter (Shelf: {requestBookModalItem.shelfNumber})</strong> within 24 hours.</li>
                  <li>Overdue fine of ₹2 per day will be charged beyond the due date.</li>
                </ul>
              </div>

              <div className="modal-dialog-footer">
                <button
                  type="button"
                  className="c1-btn c1-btn-secondary"
                  onClick={() => setRequestBookModalItem(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="c1-btn c1-btn-gradient"
                  onClick={() => handleConfirmRequestBook(requestBookModalItem)}
                >
                  <i className="fa-solid fa-circle-check"></i>
                  <span>Confirm Issue Request</span>
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* Toast Notification Container */}
        {toastMsg && (
          <Toast
            message={toastMsg.message}
            type={toastMsg.type}
            onClose={() => setToastMsg(null)}
          />
        )}

        {/* Academic Quick Route Bridge Footer */}
        <div className="module-footer-bridge c1-card">
          <div className="bridge-text">
            <h4>Check Fee & Hostel Services</h4>
            <p>Review your academic fee invoices or manage your campus hostel accommodation.</p>
          </div>
          <div className="bridge-actions">
            <button
              type="button"
              className="c1-btn c1-btn-secondary"
              onClick={() => navigate('/student/fees')}
            >
              <i className="fa-solid fa-wallet"></i>
              <span>Fee Management</span>
            </button>
            <button
              type="button"
              className="c1-btn c1-btn-secondary"
              onClick={() => navigate('/student/hostel')}
            >
              <i className="fa-solid fa-hotel"></i>
              <span>Hostel Management</span>
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default StudentLibrary;
