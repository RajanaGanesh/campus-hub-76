export interface JobOpportunity {
  id: string;
  title: string;
  company: string;
  location: string;
  packageStr: string; // e.g. "₹8 LPA"
  packageMinVal: number; // For filtering, e.g. 8
  type: 'Full Time' | 'Internship' | 'Graduate Trainee' | 'Part Time';
  cgpaRequired: number;
  branchRequired: string[]; // e.g. ["CSE", "IT"]
  skills: string[];
  deadline: string;
  status: 'Open' | 'Closing Soon' | 'Closed';
  description: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  openings: number;
  questions?: string[];
}

export interface CareerApplication {
  id: string;
  jobId: string;
  company: string;
  role: string;
  appliedDate: string;
  deadline: string;
  status: 'Applied' | 'Under Review' | 'Shortlisted' | 'Assessment' | 'Interview' | 'Selected' | 'Rejected' | 'Withdrawn';
  nextStep?: string;
  resumeName: string;
  answers?: Record<string, string>;
  timeline: { date: string; statusText: string }[];
}

export interface PlacementEvent {
  id: string;
  title: string;
  company: string;
  date: string;
  time: string;
  venue: string;
  type: 'Pre-placement Talk' | 'Aptitude Test' | 'Coding Test' | 'Technical Interview' | 'HR Interview' | 'Placement Drive' | 'Workshop' | 'Career Fair';
  description: string;
  eligibility: string;
  registrationDeadline: string;
  isRegistered: boolean;
}

export interface CareerCertification {
  id: string;
  name: string;
  organization: string;
  issueDate: string;
  credentialId: string;
}

export interface CareerProject {
  id: string;
  name: string;
  description: string;
  technologies: string;
  link?: string;
}

export interface PlacementPrepSection {
  id: string;
  title: string;
  progress: number;
  resources: string[];
  questions: { q: string; a: string }[];
}

export interface PlacementsData {
  jobs: JobOpportunity[];
  applications: CareerApplication[];
  events: PlacementEvent[];
  certifications: CareerCertification[];
  projects: CareerProject[];
  savedJobIds: string[];
  skills: string[];
  linkedinUrl: string | null;
}

export const placementsData: PlacementsData = {
  jobs: [
    {
      id: 'job-technova-sd',
      title: 'Software Developer',
      company: 'TechNova Solutions',
      location: 'Hyderabad',
      packageStr: '₹8 LPA',
      packageMinVal: 8,
      type: 'Full Time',
      cgpaRequired: 7.5,
      branchRequired: ['CSE', 'IT'],
      skills: ['JavaScript', 'React', 'Node.js'],
      deadline: '30 Aug 2026',
      status: 'Open',
      description: 'Develop next-generation cloud architectures and collaborative student platforms.',
      responsibilities: [
        'Write clean, modular code following MVC patterns.',
        'Integrate client-side components with RESTful APIs.',
        'Optimize database queries and query execution logs.'
      ],
      requirements: [
        'Solid programming skills in JavaScript or Java.',
        'Knowledge of React framework and DOM structures.',
        'Understanding of relational databases and normalization.'
      ],
      benefits: [
        'Performance-linked annual bonuses.',
        'Complete medical cover for family.',
        'Work from home flexible schedules.'
      ],
      openings: 5,
      questions: ['Why are you interested in this Software Developer role?', 'Explain a React coding project you built recently.']
    },
    {
      id: 'job-cloudcore-get',
      title: 'Graduate Engineer Trainee',
      company: 'CloudCore Technologies',
      location: 'Bangalore',
      packageStr: '₹6.5 LPA',
      packageMinVal: 6.5,
      type: 'Graduate Trainee',
      cgpaRequired: 7.0,
      branchRequired: ['CSE', 'IT', 'ECE'],
      skills: ['Python', 'Linux', 'AWS'],
      deadline: '02 Sep 2026',
      status: 'Open',
      description: 'Join our cloud infrastructure operations team monitoring server networks and subnets.',
      responsibilities: [
        'Automate system deployment steps using Bash or Python.',
        'Configure and monitor AWS cloud metrics.',
        'Troubleshoot network routing latency logs.'
      ],
      requirements: [
        'Basic understanding of network topologies and TCP/IP.',
        'Proficiency in Linux command shell operations.',
        'Basic programming knowledge in Python or Go.'
      ],
      benefits: [
        'AWS training and certifications support.',
        'Subsidized campus cafeteria food.',
        'Annual wellness allowance.'
      ],
      openings: 8,
      questions: ['What experience do you have with AWS services?', 'Are you comfortable working on-call shifts?']
    },
    {
      id: 'job-websphere-fe',
      title: 'Frontend Developer',
      company: 'WebSphere Labs',
      location: 'Remote',
      packageStr: '₹7 LPA',
      packageMinVal: 7,
      type: 'Full Time',
      cgpaRequired: 7.5,
      branchRequired: ['CSE', 'IT'],
      skills: ['HTML', 'CSS', 'React', 'TypeScript'],
      deadline: '05 Sep 2026',
      status: 'Open',
      description: 'Build responsive web design products using React, HTML/CSS and TypeScript variables.',
      responsibilities: [
        'Convert visual design mockups into premium HTML/CSS styles.',
        'Build stateful layouts using React Hooks.',
        'Implement automated unit tests for components.'
      ],
      requirements: [
        'Expertise in CSS layouts, grid systems, and animations.',
        'Strong TypeScript skills and JavaScript core operations.',
        'Familiarity with Git version control pipelines.'
      ],
      benefits: [
        '100% remote workspace setup budget.',
        'Flexible unlimited vacation policies.',
        'Stock equity grants.'
      ],
      openings: 3,
      questions: ['Link your portfolio or GitHub repositories.', 'Describe your experience with CSS grid models.']
    },
    {
      id: 'job-databridge-da',
      title: 'Data Analyst',
      company: 'DataBridge Systems',
      location: 'Pune',
      packageStr: '₹5.5 LPA',
      packageMinVal: 5.5,
      type: 'Full Time',
      cgpaRequired: 7.0,
      branchRequired: ['CSE', 'IT', 'ECE'],
      skills: ['SQL', 'Excel', 'Python', 'PowerBI'],
      deadline: '08 Sep 2026',
      status: 'Open',
      description: 'Extract, clean, and analyze enterprise metrics databases to support decision-making.',
      responsibilities: [
        'Write SQL scripts to query relational tables.',
        'Develop visual dashboards using PowerBI or Tableau.',
        'Clean raw logs to eliminate duplicate listings.'
      ],
      requirements: [
        'Advanced SQL queries skills (joins, grouping, aggregates).',
        'Basic statistical knowledge (mean, variance, trends).',
        'Good communication skills to explain graphs.'
      ],
      benefits: [
        'Professional data science certifications sponsorships.',
        'Flexible hybrid office routines.',
        'Interest-free laptop financing.'
      ],
      openings: 4,
      questions: ['How do you normalize database tables for analytics?', 'Explain what JOINs are in SQL.']
    },
    {
      id: 'job-nextgen-cloud',
      title: 'Cloud Engineer',
      company: 'NextGen Software',
      location: 'Hyderabad',
      packageStr: '₹10 LPA',
      packageMinVal: 10,
      type: 'Full Time',
      cgpaRequired: 8.0,
      branchRequired: ['CSE', 'IT'],
      skills: ['Docker', 'Kubernetes', 'AWS', 'Terraform'],
      deadline: '10 Sep 2026',
      status: 'Open',
      description: 'Deploy scale containers architectures utilizing Docker and Kubernetes nodes.',
      responsibilities: [
        'Design Terraform scripts to define cloud architectures.',
        'Set up continuous deployment (CI/CD) pipelines.',
        'Maintain Kubernetes cluster setups.'
      ],
      requirements: [
        'Understanding of containerization principles.',
        'Familiarity with cloud security controls (IAM, VPCs).',
        'Basic Java or Go code reading capability.'
      ],
      benefits: [
        'Gym membership allowance.',
        'Relocation support allowances.',
        'Quarterly developer conference passes.'
      ],
      openings: 2,
      questions: ['Describe a containerized system you configured.', 'How do you check cluster status in Kubernetes?']
    },
    {
      id: 'job-aiworks-ml',
      title: 'AI/ML Engineer',
      company: 'AIWorks Technologies',
      location: 'Bangalore',
      packageStr: '₹14 LPA',
      packageMinVal: 14,
      type: 'Full Time',
      cgpaRequired: 8.5,
      branchRequired: ['CSE'],
      skills: ['Python', 'PyTorch', 'Scikit-Learn', 'Math'],
      deadline: '15 Sep 2026',
      status: 'Open',
      description: 'Develop and train neural networks, transformer components, and data pipelines.',
      responsibilities: [
        'Train ML classification and regression models.',
        'Optimize model inference speed and sizes.',
        'Process data pipelines to train neural networks.'
      ],
      requirements: [
        'Solid mathematical background (Linear Algebra, Calculus).',
        'Deep learning modeling skills in PyTorch or TensorFlow.',
        'Advanced Python coding capabilities.'
      ],
      benefits: [
        'Research journals publication grants.',
        'Top-end GPU server cluster access.',
        'Complete medical cover.'
      ],
      openings: 2,
      questions: ['Describe a machine learning model you trained.', 'Explain what overfitting is and how you prevent it.']
    },
    {
      id: 'job-technova-qa',
      title: 'Software Testing Engineer',
      company: 'TechNova Solutions',
      location: 'Hyderabad',
      packageStr: '₹5 LPA',
      packageMinVal: 5,
      type: 'Full Time',
      cgpaRequired: 6.5,
      branchRequired: ['CSE', 'IT', 'ECE'],
      skills: ['Selenium', 'Java', 'JUnit', 'Manual Testing'],
      deadline: '18 Sep 2026',
      status: 'Open',
      description: 'Design test scripts to run end-to-end integration audits on college portal products.',
      responsibilities: [
        'Write Selenium scripts to run web interface audits.',
        'Document bugs, crashes, and regression issues.',
        'Execute test suites on staging systems.'
      ],
      requirements: [
        'Basic Java syntax and object-oriented basics.',
        'Understanding of SDLC and testing methodologies.',
        'Good bug tracking and documentation habits.'
      ],
      benefits: [
        'Testing certification fees refunds.',
        'Standard medical allowance.',
        'Company cab transit services.'
      ],
      openings: 6,
      questions: ['What is the difference between regression and sanity testing?', 'Write a Selenium test selector example.']
    },
    {
      id: 'job-data-ece',
      title: 'Embedded Systems Developer',
      company: 'DataBridge Systems',
      location: 'Bangalore',
      packageStr: '₹9 LPA',
      packageMinVal: 9,
      type: 'Full Time',
      cgpaRequired: 7.5,
      branchRequired: ['ECE'],
      skills: ['C Programming', 'Microcontrollers', 'RTOS'],
      deadline: '20 Sep 2026',
      status: 'Open',
      description: 'Program microcontrollers, driver software, and telemetry protocols.',
      responsibilities: [
        'Write embedded C programs for microcontrollers.',
        'Integrate sensors and diagnostic boards.',
        'Develop real-time operating systems scheduler structures.'
      ],
      requirements: [
        'Strong C programming capabilities.',
        'Knowledge of computer architectures (registers, interrupts).',
        'Familiarity with UART, SPI, or I2C communication.'
      ],
      benefits: [
        'Modern hardware testing setups access.',
        'Relocation support packages.',
        'Annual family wellness grants.'
      ],
      openings: 3,
      questions: ['Explain how UART communication protocol is synchronized.', 'Describe an embedded system project you designed.']
    }
  ],
  applications: [
    {
      id: 'APP-2026-00101',
      jobId: 'job-cloudcore-get',
      company: 'CloudCore Technologies',
      role: 'Graduate Engineer Trainee',
      appliedDate: '14 Aug 2026',
      deadline: '28 Aug 2026',
      status: 'Applied',
      nextStep: 'Aptitude Test on 23 Aug',
      resumeName: 'Aditya_Sharma_Resume.pdf',
      timeline: [
        { date: '14 Aug 2026 11:00 AM', statusText: 'Application Submitted' },
        { date: '14 Aug 2026 04:00 PM', statusText: 'Application Under Review' }
      ]
    }
  ],
  events: [
    {
      id: 'evt-technova-ppt',
      title: 'TechNova Recruitment Drive PPT',
      company: 'TechNova Solutions',
      date: '20 Aug 2026',
      time: '10:00 AM',
      venue: 'Seminar Hall 1',
      type: 'Pre-placement Talk',
      description: 'Corporate overview, software team domains review, compensation benefits summary, and Q&A.',
      eligibility: 'All CSE / IT students eligible.',
      registrationDeadline: '19 Aug 2026',
      isRegistered: false
    },
    {
      id: 'evt-cloudcore-test',
      title: 'CloudCore Aptitude Test',
      company: 'CloudCore Technologies',
      date: '23 Aug 2026',
      time: '02:00 PM',
      venue: 'Computer Lab 3',
      type: 'Aptitude Test',
      description: 'Quantitative aptitude, logical reasoning, and basic coding syntax questions (90 minutes).',
      eligibility: 'Registered applicants for GET role.',
      registrationDeadline: '22 Aug 2026',
      isRegistered: true
    },
    {
      id: 'evt-websphere-inter',
      title: 'WebSphere Technical Interviews',
      company: 'WebSphere Labs',
      date: '27 Aug 2026',
      time: '10:00 AM',
      venue: 'Placement Cell Room 3',
      type: 'Technical Interview',
      description: 'Data structures coding, JavaScript variables scope details, DOM performance, and project review.',
      eligibility: 'Shortlisted candidates in coding round.',
      registrationDeadline: '26 Aug 2026',
      isRegistered: false
    }
  ],
  certifications: [],
  projects: [
    {
      id: 'proj-1',
      name: 'College Service Portal Web App',
      description: 'An online educational framework managing attendance records, schedules, fee UPI payments, and course syllabus Checklists.',
      technologies: 'React, TypeScript, CSS Grid, LocalStorage',
      link: 'github.com/adityasharma/campus-hub'
    }
  ],
  savedJobIds: [],
  skills: ['Java', 'Python', 'JavaScript', 'React', 'Node.js', 'MySQL', 'Git'],
  linkedinUrl: null
};
export default placementsData;
