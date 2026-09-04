import re

def fix_dashboard_css():
    with open('src/styles/dashboard.css', 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update student-name-highlight gradient to rich purple-to-blue gradient
    content = content.replace(
        'background: linear-gradient(135deg, #ffffff 0%, #a5b4fc 50%, #38bdf8 100%);',
        'background: linear-gradient(135deg, #6C4BFF 0%, #0284C7 100%);'
    )

    # 2. Update specific hardcoded text colors in dashboard.css
    # Replace white/light colors on headings, stat numbers, labels, titles, table cells, etc.
    replacements = [
        # Welcome & Student dashboard
        (r'(\.welcome-title\s*\{[^}]*?)color:\s*#ffffff;', r'\1color: var(--text-primary);'),
        (r'(\.mini-stat-val\s*\{[^}]*?)color:\s*#ffffff;', r'\1color: var(--text-primary);'),
        (r'(\.stat-value\s*\{[^}]*?)color:\s*#ffffff;', r'\1color: var(--text-primary);'),
        (r'(\.gauge-percentage\s*\{[^}]*?)color:\s*#ffffff;', r'\1color: var(--text-primary);'),
        (r'(\.metric-num\s*\{[^}]*?)color:\s*#ffffff;', r'\1color: var(--text-primary);'),
        (r'(\.tooltip-val\s*\{[^}]*?)color:\s*#ffffff;', r'\1color: var(--text-primary);'),
        (r'(\.assignment-item-title\s*\{[^}]*?)color:\s*#ffffff;', r'\1color: var(--text-primary);'),
        (r'(\.exam-cal-day\s*\{[^}]*?)color:\s*#ffffff;', r'\1color: var(--text-primary);'),
        (r'(\.exam-item-name\s*\{[^}]*?)color:\s*#ffffff;', r'\1color: var(--text-primary);'),
        (r'(\.event-title-text\s*\{[^}]*?)color:\s*#ffffff;', r'\1color: var(--text-primary);'),
        (r'(\.fee-val\s*\{[^}]*?)color:\s*#ffffff;', r'\1color: var(--text-primary);'),
        (r'(\.lib-chip-num\s*\{[^}]*?)color:\s*#ffffff;', r'\1color: var(--text-primary);'),
        (r'(\.book-banner-title\s*\{[^}]*?)color:\s*#ffffff;', r'\1color: var(--text-primary);'),
        (r'(\.placement-metric-val\s*\{[^}]*?)color:\s*#ffffff;', r'\1color: var(--text-primary);'),
        (r'(\.drive-role\s*\{[^}]*?)color:\s*#ffffff;', r'\1color: var(--text-primary);'),
        (r'(\.notif-item-title\s*\{[^}]*?)color:\s*#ffffff;', r'\1color: var(--text-primary);'),
        (r'(\.announcement-headline\s*\{[^}]*?)color:\s*#ffffff;', r'\1color: var(--text-primary);'),
        (r'(\.ai-insight-header h3\s*\{[^}]*?)color:\s*white;', r'\1color: var(--text-primary);'),
        (r'(\.error-state-box h4\s*\{[^}]*?)color:\s*white;', r'\1color: var(--text-primary);'),
        (r'(\.ai-prompt-chip\s*\{[^}]*?)color:\s*#cbd5e1;', r'\1color: var(--text-primary);'),

        # Academic modules (Timetable, Assignments, Examinations, Results, LMS)
        (r'(\.module-title\s*\{[^}]*?)color:\s*#ffffff;', r'\1color: var(--text-primary);'),
        (r'(\.meta-badge-val\s*\{[^}]*?)color:\s*#ffffff;', r'\1color: var(--text-primary);'),
        (r'(\.stat-card-data \.stat-num\s*\{[^}]*?)color:\s*#ffffff;', r'\1color: var(--text-primary);'),
        (r'(\.live-class-name\s*\{[^}]*?)color:\s*#ffffff;', r'\1color: var(--text-primary);'),
        (r'(\.current-week-label\s*\{[^}]*?)color:\s*#ffffff;', r'\1color: var(--text-primary);'),
        (r'(\.day-name\s*\{[^}]*?)color:\s*#ffffff;', r'\1color: var(--text-primary);'),
        (r'(\.timetable-table th\s*\{[^}]*?)color:\s*#ffffff;', r'\1color: var(--text-primary);'),
        (r'(\.period-subject\s*\{[^}]*?)color:\s*#ffffff;', r'\1color: var(--text-primary);'),
        (r'(\.daily-day-title\s*\{[^}]*?)color:\s*#ffffff;', r'\1color: var(--text-primary);'),
        (r'(\.period-start-time\s*\{[^}]*?)color:\s*#ffffff;', r'\1color: var(--text-primary);'),
        (r'(\.daily-subject-name\s*\{[^}]*?)color:\s*#ffffff;', r'\1color: var(--text-primary);'),
        (r'(\.assignment-card-title\s*\{[^}]*?)color:\s*#ffffff;', r'\1color: var(--text-primary);'),
        (r'(\.meta-cell-val\s*\{[^}]*?)color:\s*#ffffff;', r'\1color: var(--text-primary);'),
        (r'(\.details-title\s*\{[^}]*?)color:\s*#ffffff;', r'\1color: var(--text-primary);'),
        (r'(\.info-val\s*\{[^}]*?)color:\s*#ffffff;', r'\1color: var(--text-primary);'),
        (r'(\.details-section h4\s*\{[^}]*?)color:\s*#ffffff;', r'\1color: var(--text-primary);'),
        (r'(\.submitted-file-badge\s*\{[^}]*?)color:\s*#ffffff;', r'\1color: var(--text-primary);'),
        (r'(\.dropzone-title\s*\{[^}]*?)color:\s*#ffffff;', r'\1color: var(--text-primary);'),
        (r'(\.countdown-exam-title\s*\{[^}]*?)color:\s*#ffffff;', r'\1color: var(--text-primary);'),
        (r'(\.unit-number\s*\{[^}]*?)color:\s*#ffffff;', r'\1color: var(--text-primary);'),
        (r'(\.cal-box-day\s*\{[^}]*?)color:\s*#ffffff;', r'\1color: var(--text-primary);'),
        (r'(\.exam-subject-title\s*\{[^}]*?)color:\s*#ffffff;', r'\1color: var(--text-primary);'),
        (r'(\.sem-pill-title\s*\{[^}]*?)color:\s*#ffffff;', r'\1color: var(--text-primary);'),
        (r'(\.material-card-title\s*\{[^}]*?)color:\s*#ffffff;', r'\1color: var(--text-primary);'),
        (r'(\.video-card-title\s*\{[^}]*?)color:\s*#ffffff;', r'\1color: var(--text-primary);'),
        (r'(\.quiz-card-title\s*\{[^}]*?)color:\s*#ffffff;', r'\1color: var(--text-primary);'),
        (r'(\.syllabus-course-title\s*\{[^}]*?)color:\s*#ffffff;', r'\1color: var(--text-primary);'),
        (r'(\.unit-info h4\s*\{[^}]*?)color:\s*#ffffff;', r'\1color: var(--text-primary);'),
        (r'(\.video-dialog-title\s*\{[^}]*?)color:\s*#ffffff;', r'\1color: var(--text-primary);'),
        (r'(\.q-progress-text\s*\{[^}]*?)color:\s*#ffffff;', r'\1color: var(--text-primary);'),
        (r'(\.q-prompt\s*\{[^}]*?)color:\s*#ffffff;', r'\1color: var(--text-primary);'),
        (r'(\.score-big\s*\{[^}]*?)color:\s*#ffffff;', r'\1color: var(--text-primary);'),
        (r'(\.bridge-text h4\s*\{[^}]*?)color:\s*#ffffff;', r'\1color: var(--text-primary);'),

        # Services modules (Library, Fees, Hostel, Transport, Notices, Notifications)
        (r'(\.book-title\s*\{[^}]*?)color:\s*#ffffff;', r'\1color: var(--text-primary);'),
        (r'(\.book-rating \.rating-num\s*\{[^}]*?)color:\s*#ffffff;', r'\1color: var(--text-primary);'),
        (r'(\.borrow-terms-box h4\s*\{[^}]*?)color:\s*#ffffff;', r'\1color: var(--text-primary);'),
        (r'(\.progress-headline\s*\{[^}]*?)color:\s*#ffffff;', r'\1color: var(--text-primary);'),
        (r'(\.method-name\s*\{[^}]*?)color:\s*#ffffff;', r'\1color: var(--text-primary);'),
        (r'(\.alloc-val\s*\{[^}]*?)color:\s*#ffffff;', r'\1color: var(--text-primary);'),
        (r'(\.contact-info h4\s*\{[^}]*?)color:\s*#ffffff;', r'\1color: var(--text-primary);'),
        (r'(\.notice-title\s*\{[^}]*?)color:\s*#ffffff;', r'\1color: var(--text-primary);'),
        (r'(\.driver-info h4\s*\{[^}]*?)color:\s*#ffffff;', r'\1color: var(--text-primary);'),
        (r'(\.stop-name\s*\{[^}]*?)color:\s*#ffffff;', r'\1color: var(--text-primary);'),
        (r'(\.time-chip strong\s*\{[^}]*?)color:\s*#ffffff;', r'\1color: var(--text-primary);'),
        (r'(\.route-name\s*\{[^}]*?)color:\s*#ffffff;', r'\1color: var(--text-primary);'),
        (r'(\.r-val\s*\{[^}]*?)color:\s*#ffffff;', r'\1color: var(--text-primary);'),
        (r'(\.notice-card-heading\s*\{[^}]*?)color:\s*#ffffff;', r'\1color: var(--text-primary);'),
        (r'(\.notice-publisher strong\s*\{[^}]*?)color:\s*#ffffff;', r'\1color: var(--text-primary);'),
        (r'(\.dialog-notice-title\s*\{[^}]*?)color:\s*#ffffff;', r'\1color: var(--text-primary);'),
        (r'(\.att-name\s*\{[^}]*?)color:\s*#ffffff;', r'\1color: var(--text-primary);'),
        (r'(\.notif-inbox-title\s*\{[^}]*?)color:\s*#ffffff;', r'\1color: var(--text-primary);'),

        # Placements
        (r'(\.hero-title\s*\{[^}]*?)color:\s*#ffffff;', r'\1color: var(--text-primary);'),
        (r'(\.job-role-title\s*\{[^}]*?)color:\s*#ffffff;', r'\1color: var(--text-primary);'),
        (r'(\.drive-card-title\s*\{[^}]*?)color:\s*#ffffff;', r'\1color: var(--text-primary);'),
        (r'(\.interview-company-title\s*\{[^}]*?)color:\s*#ffffff;', r'\1color: var(--text-primary);'),
        (r'(\.t-val\s*\{[^}]*?)color:\s*#ffffff;', r'\1color: var(--text-primary);'),
        (r'(\.resource-item-card h3\s*\{[^}]*?)color:\s*#ffffff;', r'\1color: var(--text-primary);'),
        (r'(\.analytics-title\s*\{[^}]*?)color:\s*#ffffff;', r'\1color: var(--text-primary);'),
        (r'(\.f-bar-lbl strong\s*\{[^}]*?)color:\s*#ffffff;', r'\1color: var(--text-primary);'),
        (r'(\.job-dialog-title\s*\{[^}]*?)color:\s*#ffffff;', r'\1color: var(--text-primary);'),
        (r'(\.section-h4\s*\{[^}]*?)color:\s*#ffffff;', r'\1color: var(--text-primary);'),
        (r'(\.upload-main-text\s*\{[^}]*?)color:\s*#ffffff;', r'\1color: var(--text-primary);'),
        (r'(\.tracker-role\s*\{[^}]*?)color:\s*#ffffff;', r'\1color: var(--text-primary);'),
        (r'(\.timeline-title\s*\{[^}]*?)color:\s*#ffffff;', r'\1color: var(--text-primary);'),
        (r'(\.t-node-text\s*\{[^}]*?)color:\s*#ffffff;', r'\1color: var(--text-primary);'),
        (r'(\.drive-dialog-title\s*\{[^}]*?)color:\s*#ffffff;', r'\1color: var(--text-primary);'),
        (r'(\.d-val\s*\{[^}]*?)color:\s*#ffffff;', r'\1color: var(--text-primary);'),
        (r'(\.drive-dialog-desc h4\s*\{[^}]*?)color:\s*#ffffff;', r'\1color: var(--text-primary);'),

        # Faculty portal
        (r'(\.c-time-val\s*\{[^}]*?)color:\s*#ffffff;', r'\1color: var(--text-primary);'),
        (r'(\.class-name\s*\{[^}]*?)color:\s*#ffffff;', r'\1color: var(--text-primary);'),
        (r'(\.class-meta-row strong\s*\{[^}]*?)color:\s*#ffffff;', r'\1color: var(--text-primary);'),
        (r'(\.shortcut-tile span\s*\{[^}]*?)color:\s*#ffffff;', r'\1color: var(--text-primary);'),
        (r'(\.f-course-name\s*\{[^}]*?)color:\s*#ffffff;', r'\1color: var(--text-primary);'),
        (r'(\.course-title-text\s*\{[^}]*?)color:\s*#ffffff;', r'\1color: var(--text-primary);'),
        (r'(\.c-info-cell strong\s*\{[^}]*?)color:\s*#ffffff;', r'\1color: var(--text-primary);'),
        (r'(\.dialog-course-name\s*\{[^}]*?)color:\s*#ffffff;', r'\1color: var(--text-primary);'),
        (r'(\.dialog-units-section h4\s*\{[^}]*?)color:\s*#ffffff;', r'\1color: var(--text-primary);'),
        (r'(\.stu-name\s*\{[^}]*?)color:\s*#ffffff;', r'\1color: var(--text-primary);'),
        (r'(\.confirm-heading\s*\{[^}]*?)color:\s*#ffffff;', r'\1color: var(--text-primary);'),
        (r'(\.exam-title-text\s*\{[^}]*?)color:\s*#ffffff;', r'\1color: var(--text-primary);'),
        (r'(\.e-val\s*\{[^}]*?)color:\s*#ffffff;', r'\1color: var(--text-primary);'),
        (r'(\.dialog-exam-name\s*\{[^}]*?)color:\s*#ffffff;', r'\1color: var(--text-primary);'),
        (r'(\.dialog-instructions-box h4\s*\{[^}]*?)color:\s*#ffffff;', r'\1color: var(--text-primary);'),
        (r'(\.marks-cell-input\s*\{[^}]*?)color:\s*#ffffff;', r'\1color: var(--text-primary);'),
        (r'(\.mat-title-text\s*\{[^}]*?)color:\s*#ffffff;', r'\1color: var(--text-primary);'),
    ]

    for pattern, repl in replacements:
        new_content = re.sub(pattern, repl, content, flags=re.IGNORECASE)
        if new_content == content:
            print(f'WARNING: Pattern not matched: {pattern}')
        content = new_content

    with open('src/styles/dashboard.css', 'w', encoding='utf-8') as f:
        f.write(content)
    print('dashboard.css updated successfully.')

if __name__ == '__main__':
    fix_dashboard_css()
