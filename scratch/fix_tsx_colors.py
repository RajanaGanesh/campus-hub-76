import glob
import re

def process_tsx_files():
    tsx_files = glob.glob('src/**/*.tsx', recursive=True)
    
    # Exceptions where white text is intentional (e.g. inside dark buttons, tooltips, or avatars)
    for path in tsx_files:
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()

        new_content = content
        
        # StudentWelcomeCard.tsx
        if 'StudentWelcomeCard.tsx' in path:
            new_content = new_content.replace("style={{ color: '#ffffff' }}", "style={{ color: 'var(--text-primary)' }}")
            new_content = new_content.replace('style={{ color: "#ffffff" }}', "style={{ color: 'var(--text-primary)' }}")
            
        # FeeSummaryCard.tsx
        if 'FeeSummaryCard.tsx' in path:
            new_content = new_content.replace("style={{ fontWeight: 700, color: '#ffffff' }}", "style={{ fontWeight: 700, color: 'var(--text-primary)' }}")

        # AdminDashboard.tsx
        if 'AdminDashboard.tsx' in path:
            new_content = new_content.replace("color: '#ffffff'", "color: 'var(--text-primary)'")

        # AdminAttendance.tsx
        if 'AdminAttendance.tsx' in path:
            new_content = new_content.replace("color: '#ffffff'", "color: 'var(--text-primary)'")

        # AdminAssignments.tsx
        if 'AdminAssignments.tsx' in path:
            new_content = new_content.replace("color: '#ffffff'", "color: 'var(--text-primary)'")

        # AdminCourses.tsx
        if 'AdminCourses.tsx' in path:
            new_content = new_content.replace("color: '#ffffff'", "color: 'var(--text-primary)'")

        # AdminFaculty.tsx
        if 'AdminFaculty.tsx' in path:
            new_content = new_content.replace("color: '#ffffff'", "color: 'var(--text-primary)'")

        # AdminFees.tsx
        if 'AdminFees.tsx' in path:
            new_content = new_content.replace("color: '#ffffff'", "color: 'var(--text-primary)'")

        # AdminHostel.tsx
        if 'AdminHostel.tsx' in path:
            new_content = new_content.replace("color: '#ffffff'", "color: 'var(--text-primary)'")

        # AdminLibrary.tsx
        if 'AdminLibrary.tsx' in path:
            new_content = new_content.replace("color: '#ffffff'", "color: 'var(--text-primary)'")

        # AdminPlacements.tsx
        if 'AdminPlacements.tsx' in path:
            new_content = new_content.replace("color: '#ffffff'", "color: 'var(--text-primary)'")

        # AdminExams.tsx
        if 'AdminExams.tsx' in path:
            new_content = new_content.replace("color: '#ffffff'", "color: 'var(--text-primary)'")

        # AdminSettings.tsx
        if 'AdminSettings.tsx' in path:
            new_content = new_content.replace("color: '#ffffff'", "color: 'var(--text-primary)'")

        # FacultyAssignments.tsx
        if 'FacultyAssignments.tsx' in path:
            new_content = new_content.replace("color: '#ffffff'", "color: 'var(--text-primary)'")

        # FacultyAttendance.tsx
        if 'FacultyAttendance.tsx' in path:
            new_content = new_content.replace("color: '#ffffff'", "color: 'var(--text-primary)'")

        # FacultyResults.tsx
        if 'FacultyResults.tsx' in path:
            new_content = new_content.replace("color: '#ffffff'", "color: 'var(--text-primary)'")

        # FacultyStudents.tsx
        if 'FacultyStudents.tsx' in path:
            new_content = new_content.replace("color: '#ffffff'", "color: 'var(--text-primary)'")

        # ParentDashboard.tsx
        if 'ParentDashboard.tsx' in path:
            new_content = new_content.replace("color: '#ffffff'", "color: 'var(--text-primary)'")

        # ParentSettings.tsx
        if 'ParentSettings.tsx' in path:
            new_content = new_content.replace("color: '#ffffff'", "color: 'var(--text-primary)'")

        if new_content != content:
            with open(path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f'Updated {path}')

if __name__ == '__main__':
    process_tsx_files()
