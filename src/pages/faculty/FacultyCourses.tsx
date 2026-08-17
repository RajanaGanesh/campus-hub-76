import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getManagementData, CourseRecord } from '../../data/managementData';

interface CourseMaterial {
  id: string;
  title: string;
  courseCode: string;
  type: 'PDF' | 'Notes' | 'Presentation' | 'Video' | 'Document';
  date: string;
}

export const FacultyCourses: React.FC = () => {
  const navigate = useNavigate();

  // Load courses
  const [courses] = useState<CourseRecord[]>(() => {
    // Filter to Dr. S. Kumar (FAC-101) courses
    return getManagementData().courses.filter((c) => c.facultyId === 'FAC-101');
  });

  // Load materials from localStorage or initial
  const [materials, setMaterials] = useState<CourseMaterial[]>(() => {
    try {
      const stored = localStorage.getItem('campushub_course_materials');
      return stored ? JSON.parse(stored) : [
        { id: 'mat-1', title: 'Lecture 1: Intro to Binary Search Trees', courseCode: 'CSE-301', type: 'PDF', date: '12 Aug 2026' },
        { id: 'mat-2', title: 'Chapter 3: ER-Model Mapping Guide', courseCode: 'CSE-302', type: 'Presentation', date: '14 Aug 2026' },
        { id: 'mat-3', title: 'Red-Black Tree Insertion Notes', courseCode: 'CSE-301', type: 'Notes', date: '15 Aug 2026' }
      ];
    } catch {
      return [];
    }
  });

  // Modal forms
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [materialTitle, setMaterialTitle] = useState('');
  const [materialType, setMaterialType] = useState<'PDF' | 'Notes' | 'Presentation' | 'Video' | 'Document'>('PDF');
  const [selectedCourseCode, setSelectedCourseCode] = useState('CSE-301');

  const [formError, setFormError] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleOpenUpload = () => {
    setMaterialTitle('');
    setMaterialType('PDF');
    setSelectedCourseCode('CSE-301');
    setFormError(null);
    setShowUploadModal(true);
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!materialTitle.trim()) {
      setFormError('Please enter a title for the study material.');
      return;
    }

    const newMaterial: CourseMaterial = {
      id: `mat-${Date.now()}`,
      title: materialTitle,
      courseCode: selectedCourseCode,
      type: materialType,
      date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
    };

    const nextMats = [newMaterial, ...materials];
    setMaterials(nextMats);
    localStorage.setItem('campushub_course_materials', JSON.stringify(nextMats));

    setShowUploadModal(false);
    setToastMsg(`Material "${materialTitle}" uploaded successfully.`);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const handleDeleteMaterial = (id: string) => {
    const nextMats = materials.filter((m) => m.id !== id);
    setMaterials(nextMats);
    localStorage.setItem('campushub_course_materials', JSON.stringify(nextMats));
    setToastMsg('Material deleted successfully.');
    setTimeout(() => setToastMsg(null), 2500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Back button */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <button
          type="button"
          className="btn-sso"
          onClick={() => navigate('/faculty')}
          style={{ margin: 0, padding: '0 12px', height: '32px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <i className="fa-solid fa-arrow-left"></i> Faculty Panel
        </button>
        <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>Faculty / Courses</span>
      </div>

      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1>My Courses & Syllabus</h1>
          <p>View your assigned academic course sections, track progress and publish study materials.</p>
        </div>

        <button
          type="button"
          className="btn-signin"
          style={{ width: 'auto', padding: '0 16px', height: '36px', margin: 0 }}
          onClick={handleOpenUpload}
        >
          <i className="fa-solid fa-cloud-arrow-up" style={{ marginRight: '6px' }}></i> Upload Material
        </button>
      </div>

      {/* Toast Alert */}
      {toastMsg && (
        <div className="toast-msg">
          <i className="fa-solid fa-circle-check" style={{ color: '#00d89a' }}></i>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Courses List Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
        {courses.map((c) => (
          <div key={c.code} className="card-panel" style={{ padding: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontSize: '11.5px', color: 'var(--accent-highlight)', fontWeight: '700' }}>{c.code}</span>
              <span className="subject-att-status good" style={{ fontSize: '9px' }}>{c.semester}</span>
            </div>

            <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'white', marginBottom: '4px' }}>{c.name}</h3>
            <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)', display: 'block', marginBottom: '16px' }}>
              Section: Section A/B • Enrolled: {c.studentsCount} Students
            </span>

            {/* Progress bar */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Syllabus Completion</span>
                <strong style={{ color: 'white' }}>{c.progress}%</strong>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${c.progress}%`, height: '100%', background: 'var(--accent-primary)', borderRadius: '4px' }} />
              </div>
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: 'var(--text-secondary)' }}>
              <span>Next Class: <strong style={{ color: 'white' }}>{c.nextClass}</strong></span>
            </div>
          </div>
        ))}
      </div>

      {/* Materials List Section */}
      <div className="card-panel">
        <h3 style={{ fontSize: '14.5px', fontWeight: '800', color: 'white', marginBottom: '16px' }}>Uploaded Study Materials</h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {materials.length > 0 ? (
            materials.map((mat) => (
              <div key={mat.id} className="timetable-item" style={{ padding: '14px 18px', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '6px', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', fontSize: '16px' }}>
                    <i className={
                      mat.type === 'PDF' ? 'fa-solid fa-file-pdf' :
                      mat.type === 'Presentation' ? 'fa-solid fa-file-powerpoint' :
                      mat.type === 'Video' ? 'fa-solid fa-file-video' : 'fa-solid fa-file-lines'
                    }></i>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '13.5px', fontWeight: '800', color: 'white', marginBottom: '2px' }}>{mat.title}</h4>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Course: {mat.courseCode} • Type: {mat.type} • Uploaded: {mat.date}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="btn-sso"
                    style={{ height: '30px', fontSize: '11px', padding: '0 12px', margin: 0, width: 'auto' }}
                    onClick={() => {
                      setToastMsg(`Downloading file preview: "${mat.title}"`);
                      setTimeout(() => setToastMsg(null), 2500);
                    }}
                  >
                    Download
                  </button>
                  <button
                    type="button"
                    className="btn-retry-err"
                    style={{ height: '30px', fontSize: '11px', padding: '0 12px', margin: 0, width: 'auto', background: 'rgba(217, 83, 79, 0.05)', borderColor: 'var(--color-error)', color: 'var(--color-error)' }}
                    onClick={() => handleDeleteMaterial(mat.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No study materials uploaded for courses yet.
            </div>
          )}
        </div>
      </div>

      {/* Upload Material Modal */}
      {showUploadModal && (
        <div className="search-modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="search-modal-card" style={{ maxWidth: '400px' }} onClick={(e) => e.stopPropagation()}>
            <div className="search-modal-header" style={{ justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div>
                <span style={{ fontSize: '10px', color: 'var(--accent-highlight)', display: 'block', textTransform: 'uppercase' }}>Course Syllabus</span>
                <h2 style={{ fontSize: '16.5px', marginTop: '2px' }}>Upload Study Material</h2>
              </div>
              <button type="button" className="btn-search-close" onClick={() => setShowUploadModal(false)}>
                <i className="fa-solid fa-xmark" style={{ fontSize: '14px' }}></i>
              </button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {formError && (
                <div className="login-error-box" style={{ margin: 0, padding: '10px 14px' }}>
                  <i className="fa-solid fa-circle-exclamation"></i>
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleUploadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label htmlFor="mat-title" style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Material Title</label>
                  <input
                    id="mat-title"
                    type="text"
                    placeholder="e.g. Chapter 4 Red-Black Trees..."
                    value={materialTitle}
                    onChange={(e) => setMaterialTitle(e.target.value)}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px 10px', color: 'white', fontSize: '12.5px', outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="form-group">
                    <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Select Course</label>
                    <select
                      value={selectedCourseCode}
                      onChange={(e) => setSelectedCourseCode(e.target.value)}
                      style={{ width: '100%', background: '#100f2e', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px 10px', color: 'white', fontSize: '12px', outline: 'none' }}
                    >
                      {courses.map((c) => (
                        <option key={c.code} value={c.code}>{c.code}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Material Type</label>
                    <select
                      value={materialType}
                      onChange={(e) => setMaterialType(e.target.value as any)}
                      style={{ width: '100%', background: '#100f2e', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px 10px', color: 'white', fontSize: '12px', outline: 'none' }}
                    >
                      <option value="PDF">PDF Document</option>
                      <option value="Notes">Notes (TXT/MD)</option>
                      <option value="Presentation">Presentation (PPTX)</option>
                      <option value="Video">Video Tutorial (MP4)</option>
                      <option value="Document">Word Document (DOCX)</option>
                    </select>
                  </div>
                </div>

                <button type="submit" className="btn-signin" style={{ height: '40px', margin: 0, marginTop: '10px', fontSize: '13px' }}>
                  Publish Material
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default FacultyCourses;
