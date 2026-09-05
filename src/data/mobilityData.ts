export interface HostelRoommate {
  id: string;
  name: string;
  department: string;
  year: string;
  avatarText: string;
}

export interface HostelAnnouncement {
  id: string;
  title: string;
  category: 'Maintenance' | 'Inspection' | 'Dining' | 'General';
  date: string;
  description: string;
}

export interface HostelRequest {
  id: string;
  type: string;
  subject: string;
  description: string;
  createdDate: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Submitted' | 'Under Review' | 'Assigned' | 'Resolved' | 'Rejected';
  lastUpdated: string;
  assignedTo?: string;
  timeline: { date: string; statusText: string }[];
}

export interface MealDetail {
  menuItems: string;
  timing: string;
}

export interface DayMenu {
  day: string;
  Breakfast: MealDetail;
  Lunch: MealDetail;
  Snacks: MealDetail;
  Dinner: MealDetail;
}

export interface MessFeedback {
  id: string;
  date: string;
  meal: string;
  rating: number;
  comments: string;
}

export interface TransportRoute {
  routeNumber: string;
  startingPoint: string;
  destination: string;
  stops: string[];
  pickupTime: string;
  dropTime: string;
  busNumber: string;
  driverName: string;
  driverPhone: string;
  status: 'On Time' | 'Delayed' | 'Cancelled' | 'Completed';
  delayMinutes?: number;
}

export interface TransportPassData {
  studentName: string;
  studentId: string;
  routeNumber: string;
  busNumber: string;
  validUntil: string;
  status: 'Active' | 'Expired';
}

export interface MobilityData {
  roommates: HostelRoommate[];
  announcements: HostelAnnouncement[];
  requests: HostelRequest[];
  weeklyMenu: DayMenu[];
  feedbacks: MessFeedback[];
  routes: TransportRoute[];
  pass: TransportPassData;
}

export const mobilityData: MobilityData = {
  roommates: [
    { id: 'rm-1', name: 'Arun Kumar', department: 'CSE', year: 'IV Year', avatarText: 'AK' },
    { id: 'rm-2', name: 'Rahul Kumar', department: 'ECE', year: 'IV Year', avatarText: 'RK' },
    { id: 'rm-3', name: 'Amit Patel', department: 'CSE', year: 'IV Year', avatarText: 'AP' }
  ],
  announcements: [
    { id: 'ha-1', title: 'Water Maintenance Scheduled', category: 'Maintenance', date: '17 Aug 2026', description: 'Water supply will be suspended in Krishna Hostel on 18th Aug between 10:00 AM and 01:00 PM for pipeline repairs.' },
    { id: 'ha-2', title: 'Hostel Room Inspection', category: 'Inspection', date: '16 Aug 2026', description: 'Monthly discipline and cleanliness inspection is scheduled for this Saturday at 04:00 PM.' },
    { id: 'ha-3', title: 'Wi-Fi Maintenance Tonight', category: 'Maintenance', date: '15 Aug 2026', description: 'Campus routers will undergo software upgrades tonight between 12:00 AM and 02:00 AM. Expect brief latency logs.' },
    { id: 'ha-4', title: 'Mess Timings Updated', category: 'Dining', date: '14 Aug 2026', description: 'Mess dinner timing is extended by 30 minutes on exam days (7:30 PM - 9:30 PM) starting next week.' }
  ],
  requests: [
    {
      id: 'HOSTEL-REQ-1001',
      type: 'Plumbing Complaint',
      subject: 'Bathroom tap leakage',
      description: 'The tap in bathroom B-2 is continuously leaking, causing water pooling on the floor.',
      createdDate: '15 Aug 2026',
      priority: 'Medium',
      status: 'Resolved',
      lastUpdated: '18 Aug 2026',
      assignedTo: 'Suresh Kumar (Plumber)',
      timeline: [
        { date: '15 Aug 2026 10:00 AM', statusText: 'Request submitted' },
        { date: '16 Aug 2026 09:00 AM', statusText: 'Request assigned to Suresh' },
        { date: '17 Aug 2026 11:30 AM', statusText: 'Technician dispatched' },
        { date: '18 Aug 2026 03:00 PM', statusText: 'Issue resolved: Tap cartridge replaced' }
      ]
    }
  ],
  weeklyMenu: [
    {
      day: 'Monday',
      Breakfast: { menuItems: 'Idli, Sambar, Coconut Chutney, Tea/Coffee', timing: '7:30 AM – 9:00 AM' },
      Lunch: { menuItems: 'Veg Biryani, Raita, Mixed Veg Curry, Rice, Sambar', timing: '12:30 PM – 2:00 PM' },
      Snacks: { menuItems: 'Samosa, Mint Chutney, Tea/Milk', timing: '4:30 PM – 5:30 PM' },
      Dinner: { menuItems: 'Roti, Paneer Butter Masala, Dal Tadka, Rice, Curd', timing: '7:30 PM – 9:00 PM' }
    },
    {
      day: 'Tuesday',
      Breakfast: { menuItems: 'Puri, Aloo Masala, Tea/Coffee', timing: '7:30 AM – 9:00 AM' },
      Lunch: { menuItems: 'Roti, Dal Fry, Aloo Gobi, Rice, Rasam, Curd', timing: '12:30 PM – 2:00 PM' },
      Snacks: { menuItems: 'Onion Pakoda, Tea/Coffee', timing: '4:30 PM – 5:30 PM' },
      Dinner: { menuItems: 'Roti, Chicken Curry (or Kadai Paneer for Veg), Rice, Dal', timing: '7:30 PM – 9:00 PM' }
    },
    {
      day: 'Wednesday',
      Breakfast: { menuItems: 'Aloo Paratha, Butter, Pickle, Tea/Coffee', timing: '7:30 AM – 9:00 AM' },
      Lunch: { menuItems: 'Roti, Egg Masala (or Paneer Tikka), Jeera Rice, Dal, Curd', timing: '12:30 PM – 2:00 PM' },
      Snacks: { menuItems: 'Veg Cutlet, Tea/Milk', timing: '4:30 PM – 5:30 PM' },
      Dinner: { menuItems: 'Roti, Mixed Veg Sabzi, Dal Makhani, Rice, Curd', timing: '7:30 PM – 9:00 PM' }
    },
    {
      day: 'Thursday',
      Breakfast: { menuItems: 'Mysore Bajji, Ginger Chutney, Tea/Coffee', timing: '7:30 AM – 9:00 AM' },
      Lunch: { menuItems: 'Rice, Sambar, Ladies Finger Fry, Dal, Papad, Curd', timing: '12:30 PM – 2:00 PM' },
      Snacks: { menuItems: 'Biscuits, Tea/Milk', timing: '4:30 PM – 5:30 PM' },
      Dinner: { menuItems: 'Roti, Egg Bhurji (or Paneer Bhurji), Dal, Rice, Curd', timing: '7:30 PM – 9:00 PM' }
    },
    {
      day: 'Friday',
      Breakfast: { menuItems: 'Poha, Sev, Chutney, Tea/Coffee', timing: '7:30 AM – 9:00 AM' },
      Lunch: { menuItems: 'Roti, Chana Masala, Veg Pulao, Dal, Curd', timing: '12:30 PM – 2:00 PM' },
      Snacks: { menuItems: 'Kachori, Tea/Coffee', timing: '4:30 PM – 5:30 PM' },
      Dinner: { menuItems: 'Roti, Chicken Biryani (or Paneer Biryani), Raita, Sweets', timing: '7:30 PM – 9:00 PM' }
    },
    {
      day: 'Saturday',
      Breakfast: { menuItems: 'Dosa, Sambar, Peanut Chutney, Tea/Coffee', timing: '7:30 AM – 9:00 AM' },
      Lunch: { menuItems: 'Roti, Bhindi Masala, Dal, Rice, Rasam, Curd', timing: '12:30 PM – 2:00 PM' },
      Snacks: { menuItems: 'Bread Butter Toast, Tea/Milk', timing: '4:30 PM – 5:30 PM' },
      Dinner: { menuItems: 'Roti, Aloo Palak, Dal Tadka, Rice, Curd', timing: '7:30 PM – 9:00 PM' }
    },
    {
      day: 'Sunday',
      Breakfast: { menuItems: 'Bread, Omelette (or Jam), Fruit Juice, Tea/Coffee', timing: '7:30 AM – 9:00 AM' },
      Lunch: { menuItems: 'Special Veg Thali, Puri, Paneer, Rice, Dal, Sweet Lassi', timing: '12:30 PM – 2:00 PM' },
      Snacks: { menuItems: 'Pani Puri / Chat, Tea/Milk', timing: '4:30 PM – 5:30 PM' },
      Dinner: { menuItems: 'Roti, Dum Aloo, Dal Fry, Rice, Ice Cream', timing: '7:30 PM – 9:00 PM' }
    }
  ],
  feedbacks: [],
  routes: [
    {
      routeNumber: 'Route 12',
      startingPoint: 'Miyapur',
      destination: 'Campus',
      stops: ['Miyapur', 'JNTU Metro', 'KPHB Colony', 'Kukatpally Y-Junction', 'Moosapet', 'Campus Gate'],
      pickupTime: '08:05 AM',
      dropTime: '05:30 PM',
      busNumber: 'AP 39 AB 1234',
      driverName: 'Ramesh Singh',
      driverPhone: '+91 9440123456',
      status: 'On Time'
    },
    {
      routeNumber: 'Route 01',
      startingPoint: 'Madhapur',
      destination: 'Campus',
      stops: ['Madhapur PS', 'Hitech City', 'Kondapur', 'Hafeezpet', 'Campus Gate'],
      pickupTime: '08:15 AM',
      dropTime: '05:25 PM',
      busNumber: 'AP 28 BC 5678',
      driverName: 'J. Srinivas',
      driverPhone: '+91 9440987654',
      status: 'Delayed',
      delayMinutes: 15
    },
    {
      routeNumber: 'Route 08',
      startingPoint: 'Gachibowli',
      destination: 'Campus',
      stops: ['Gachibowli Outer Ring', 'DLF Phase 1', 'Tolichowki', 'Mehdipatnam', 'Campus Gate'],
      pickupTime: '08:00 AM',
      dropTime: '05:40 PM',
      busNumber: 'AP 11 CD 9012',
      driverName: 'Mohd. Ali',
      driverPhone: '+91 9440555666',
      status: 'On Time'
    }
  ],
  pass: {
    studentName: 'Aditya Sharma',
    studentId: '236F1A0551',
    routeNumber: 'Route 12',
    busNumber: 'AP 39 AB 1234',
    validUntil: '30 June 2027',
    status: 'Active'
  }
};

export const getHostelRequests = (): HostelRequest[] => {
  try {
    const stored = localStorage.getItem('campushub_hostel_requests');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    }
    return mobilityData.requests;
  } catch {
    return mobilityData.requests;
  }
};

export const saveHostelRequests = (requests: HostelRequest[]) => {
  try {
    localStorage.setItem('campushub_hostel_requests', JSON.stringify(requests));
  } catch (err) {
    console.warn('Error saving hostel requests:', err);
  }
};

export const getMessFeedbacks = (): MessFeedback[] => {
  try {
    const stored = localStorage.getItem('campushub_mess_feedbacks');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    }
    return mobilityData.feedbacks;
  } catch {
    return mobilityData.feedbacks;
  }
};

export const saveMessFeedbacks = (feedbacks: MessFeedback[]) => {
  try {
    localStorage.setItem('campushub_mess_feedbacks', JSON.stringify(feedbacks));
  } catch (err) {
    console.warn('Error saving mess feedbacks:', err);
  }
};

export default mobilityData;

