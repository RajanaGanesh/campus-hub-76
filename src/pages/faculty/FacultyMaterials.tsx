import React, { useState, useMemo } from 'react';
import { AppLayout } from '../../components/AppLayout';
import { Modal } from '../../components/Modal';
import { Toast } from '../../components/Toast';
import { getFacultyMaterials, saveFacultyMaterials, FacultyMaterialItem } from '../../services/storageService';

export const FacultyMaterials: React.FC = () => {
  // Materials state loaded from persistent storage
  const [materials, setMaterials] = useState<FacultyMaterialItem[]>(() => getFacultyMaterials());

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [courseFilter, setCourseFilter] = useState('All');

  // Modals state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [deletingMaterial, setDeletingMaterial] = useState<FacultyMaterialItem | null>(null);

  // Form State
  const [matTitle, setMatTitle] = useState('');
  const [matCourse, setMatCourse] = useState('CSE-301');
  const [matType, setMatType] = useState<FacultyMaterialItem['type']>('PDF');

  // Toast
  const [toastMsg, setToastMsg] = useState<{ message: string; type: 'info' | 'success' | 'warning' | 'error' } | null>(null);

  const showToast = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setToastMsg({ message, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matTitle.trim()) {
      showToast('Please provide a document title.', 'error');
      return;
    }

    const newMat: FacultyMaterialItem = {
      id: `mat-${Date.now()}`,
      title: matTitle,
      courseCode: matCourse,
      courseName: matCourse === 'CSE-301' ? 'Advanced Data Structures' : 'Database Management Systems',
      type: matType,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      fileSize: '2.1 MB'
    };

    const updated = [newMat, ...materials];
    setMaterials(updated);
    saveFacultyMaterials(updated);

    setIsUploadModalOpen(false);
    setMatTitle('');
    showToast(`Material "${matTitle}" published and synced with Student LMS!`, 'success');
  };

  const handleDeleteConfirm = () => {
    if (!deletingMaterial) return;
    const updated = materials.filter((m) => m.id !== deletingMaterial.id);
    setMaterials(updated);
    saveFacultyMaterials(updated);

    setDeletingMaterial(null);
    showToast('Study material deleted.', 'info');
  };

  const filteredMaterials = useMemo(() => {
    return materials.filter((m) => {
      const q = searchQuery.toLowerCase().trim();
      const matchQ = !q || m.title.toLowerCase().includes(q) || m.courseCode.toLowerCase().includes(q);
      const matchType = typeFilter === 'All' || m.type === typeFilter;
      const matchCourse = courseFilter === 'All' || m.courseCode === courseFilter;
      return matchQ && matchType && matchCourse;
    });
  }, [materials, searchQuery, typeFilter, courseFilter]);

  const getTypeIcon = (type: FacultyMaterialItem['type']) => {
    switch (type) {
      case 'PDF':
        return 'fa-file-pdf';
      case 'Presentation':
        return 'fa-file-powerpoint';
      case 'Video':
        return 'fa-video';
      case 'Notes':
        return 'fa-note-sticky';
      default:
        return 'fa-file-lines';
    }
  };

  return (
    <AppLayout>
      <div className="academic-module-page">
        {/* Header */}
        <div className="module-header-row">
          <div>
            <div className="module-breadcrumbs">
              <span>Faculty Portal</span>
              <span className="crumb-sep">/</span>
              <span className="crumb-current">Study Materials Management</span>
            </div>
            <h1 className="module-title">Course Study Materials & LMS Repository</h1>
            <p className="module-subtitle">
              Publish lecture slides, reference PDF notes, coding tutorials, and laboratory manuals to enrolled student cohorts.
            </p>
          </div>

          <div className="module-header-meta">
            <button
              type="button"
              className="c1-btn c1-btn-gradient"
              onClick={() => setIsUploadModalOpen(true)}
            >
              <i className="fa-solid fa-cloud-arrow-up"></i>
              <span>Upload New Material</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="academic-stats-grid">
          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
              <i className="fa-solid fa-file-lines"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">{materials.length} Files</span>
              <span className="stat-label">Published Study Notes</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
              <i className="fa-solid fa-file-pdf"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">{materials.filter((m) => m.type === 'PDF').length} PDFs</span>
              <span className="stat-label">Reference Documents</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <i className="fa-solid fa-download"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">340+</span>
              <span className="stat-label">Student Downloads</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
              <i className="fa-solid fa-bolt"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">Live Sync</span>
              <span className="stat-label">Student LMS Integrated</span>
            </div>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="c1-card academic-filters-card" style={{ marginBottom: '24px' }}>
          <div className="search-filter-input-wrap">
            <i className="fa-solid fa-magnifying-glass search-icon"></i>
            <input
              type="text"
              className="c1-input search-filter-input"
              placeholder="Search materials by title or course code..."
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
              <label htmlFor="select-mat-type">Document Type</label>
              <select
                id="select-mat-type"
                className="c1-select"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="All">All Types</option>
                <option value="PDF">PDF Handouts</option>
                <option value="Presentation">Presentations (PPT)</option>
                <option value="Notes">Notes & Cheatsheets</option>
              </select>
            </div>

            <div className="filter-select-item">
              <label htmlFor="select-mat-course">Course Filter</label>
              <select
                id="select-mat-course"
                className="c1-select"
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
              >
                <option value="All">All Courses</option>
                <option value="CSE-301">CSE-301</option>
                <option value="CSE-302">CSE-302</option>
                <option value="CSE-401">CSE-401</option>
              </select>
            </div>
          </div>
        </div>

        {/* Materials Grid */}
        <div className="faculty-materials-grid">
          {filteredMaterials.map((mat) => (
            <div key={mat.id} className="c1-card faculty-material-card">
              <div className="mat-card-header">
                <div className="mat-type-icon-box">
                  <i className={`fa-solid ${getTypeIcon(mat.type)}`}></i>
                </div>
                <div className="mat-meta-info">
                  <span className="course-code-tag">{mat.courseCode}</span>
                  <span className="mat-size-badge">{mat.fileSize}</span>
                </div>
              </div>

              <h3 className="mat-title-text">{mat.title}</h3>
              <span className="mat-course-sub">{mat.courseName}</span>

              <div className="mat-card-footer">
                <span className="mat-date">
                  <i className="fa-regular fa-calendar"></i> {mat.date}
                </span>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="c1-btn c1-btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                    onClick={() => showToast(`Downloading "${mat.title}"...`, 'info')}
                  >
                    <i className="fa-solid fa-download"></i>
                    <span>Download</span>
                  </button>
                  <button
                    type="button"
                    className="c1-btn c1-btn-secondary btn-icon-only"
                    style={{ width: '30px', height: '30px', padding: 0 }}
                    onClick={() => setDeletingMaterial(mat)}
                    title="Delete file"
                  >
                    <i className="fa-solid fa-trash-can" style={{ color: 'var(--color-error)' }}></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ============================================================
            MODAL 1: UPLOAD MATERIAL MODAL
            ============================================================ */}
        {isUploadModalOpen && (
          <Modal
            isOpen={true}
            onClose={() => setIsUploadModalOpen(false)}
            title="Upload Study Material to Course Repository"
            maxWidth="md"
          >
            <form onSubmit={handleUploadSubmit} className="faculty-form-stack">
              <div className="form-field-wrap">
                <label className="form-label">Material Title / Lecture Topic</label>
                <input
                  type="text"
                  className="c1-input"
                  placeholder="e.g. Unit 3: Graph Traversal & Dijkstra Algorithm"
                  value={matTitle}
                  onChange={(e) => setMatTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-fields-two-col">
                <div className="form-field-wrap">
                  <label className="form-label">Course Subject</label>
                  <select
                    className="c1-select"
                    value={matCourse}
                    onChange={(e) => setMatCourse(e.target.value)}
                  >
                    <option value="CSE-301">CSE-301: Advanced Data Structures</option>
                    <option value="CSE-302">CSE-302: Database Management Systems</option>
                    <option value="CSE-401">CSE-401: Cloud Computing Architecture</option>
                  </select>
                </div>

                <div className="form-field-wrap">
                  <label className="form-label">Document Classification</label>
                  <select
                    className="c1-select"
                    value={matType}
                    onChange={(e) => setMatType(e.target.value as any)}
                  >
                    <option value="PDF">PDF Handout / Book Chapter</option>
                    <option value="Presentation">PowerPoint Presentation (PPT)</option>
                    <option value="Notes">Lecture Notes & Cheatsheet</option>
                    <option value="Video">Recorded Lecture Link</option>
                  </select>
                </div>
              </div>

              <div className="form-field-wrap">
                <label className="form-label">Upload File (PDF, PPT, DOCX - Max 25MB)</label>
                <div className="resume-upload-zone">
                  <div className="upload-zone-content">
                    <i className="fa-solid fa-cloud-arrow-up upload-icon"></i>
                    <div className="upload-texts">
                      <span className="upload-main-text">Click to select course document</span>
                      <span className="upload-sub-text">Supported: PDF, PPTX, DOCX, ZIP</span>
                    </div>
                    <button type="button" className="c1-btn c1-btn-secondary btn-browse-file">
                      Browse
                    </button>
                  </div>
                </div>
              </div>

              <div className="modal-dialog-footer">
                <button
                  type="button"
                  className="c1-btn c1-btn-secondary"
                  onClick={() => setIsUploadModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="c1-btn c1-btn-gradient"
                >
                  <i className="fa-solid fa-cloud-arrow-up"></i>
                  <span>Publish Material</span>
                </button>
              </div>
            </form>
          </Modal>
        )}

        {/* ============================================================
            MODAL 2: DELETE MATERIAL MODAL
            ============================================================ */}
        {deletingMaterial && (
          <Modal
            isOpen={true}
            onClose={() => setDeletingMaterial(null)}
            title="Delete Study Material"
            maxWidth="sm"
          >
            <div className="confirm-dialog-content">
              <div className="confirm-icon-box" style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185' }}>
                <i className="fa-solid fa-trash-can"></i>
              </div>
              <h3 className="confirm-heading">Delete Document?</h3>
              <p className="confirm-body-text">
                Are you sure you want to remove <strong>"{deletingMaterial.title}"</strong> from the student repository?
              </p>

              <div className="modal-dialog-footer">
                <button
                  type="button"
                  className="c1-btn c1-btn-secondary"
                  onClick={() => setDeletingMaterial(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="c1-btn c1-btn-gradient"
                  style={{ background: 'var(--color-error)' }}
                  onClick={handleDeleteConfirm}
                >
                  Delete File
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
      </div>
    </AppLayout>
  );
};

export default FacultyMaterials;
