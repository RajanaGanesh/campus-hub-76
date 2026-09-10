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
  calories?: number;
  protein?: string;
  dietType?: 'Veg' | 'Non-Veg' | 'Egg' | 'Jain';
  allergens?: string[];
  isSpecial?: boolean;
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
  studentName?: string;
  date: string;
  meal: 'Breakfast' | 'Lunch' | 'Snacks' | 'Dinner';
  rating: number;
  tags?: string[];
  comments: string;
  response?: string;
  isAnonymous?: boolean;
}

export interface MessRebateRequest {
  id: string;
  studentName: string;
  studentId: string;
  hostelBlock: string;
  roomNumber: string;
  startDate: string;
  endDate: string;
  daysCount: number;
  rebatePerDay: number;
  totalRebate: number;
  reason: string;
  status: 'Approved' | 'Under Review' | 'Credited' | 'Rejected';
  submittedDate: string;
  remarks?: string;
}

export interface DietaryProfile {
  primaryDiet: 'Pure Vegetarian' | 'Non-Vegetarian' | 'Eggitarian' | 'Jain (No Onion/Garlic)' | 'Vegan';
  spiceLevel: 'Mild' | 'Medium' | 'Spicy';
  allergies: string[];
  sickDietActive: boolean;
  sickDietMeal?: 'Khichdi & Curd' | 'Clear Soup & Toast' | 'Boiled Rice & Dal' | 'Custom';
  sickDietRoomDelivery: boolean;
  sickDietNotes?: string;
}

export interface DiningHallInfo {
  id: string;
  name: string;
  location: string;
  activeMeal: string;
  currentCapacity: number;
  maxCapacity: number;
  status: 'Open - Normal' | 'Peak Crowded' | 'Closing Soon' | 'Closed';
  chefToday: string;
}

export interface MealAttendanceRecord {
  date: string;
  breakfast: boolean;
  lunch: boolean;
  snacks: boolean;
  dinner: boolean;
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
  rebates: MessRebateRequest[];
  diningHalls: DiningHallInfo[];
  dietaryProfile: DietaryProfile;
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
      Breakfast: { menuItems: 'Idli, Sambar, Coconut Chutney, Tomato Chutney, Tea / Coffee', timing: '7:30 AM – 9:00 AM', calories: 420, protein: '12g', dietType: 'Veg', allergens: ['Mustard'] },
      Lunch: { menuItems: 'Hyderabadi Veg Biryani, Mirchi Ka Salan, Raita, Mixed Veg Curry, Steamed Rice, Sambar', timing: '12:30 PM – 2:00 PM', calories: 680, protein: '18g', dietType: 'Veg', allergens: ['Dairy'], isSpecial: true },
      Snacks: { menuItems: 'Hot Crispy Samosa (2 pcs), Sweet Mint Chutney, Masala Chai / Milk', timing: '4:30 PM – 5:30 PM', calories: 290, protein: '6g', dietType: 'Veg', allergens: ['Gluten'] },
      Dinner: { menuItems: 'Butter Roti, Paneer Butter Masala, Dal Tadka, Jeera Rice, Fresh Curd, Gulab Jamun', timing: '7:30 PM – 9:00 PM', calories: 720, protein: '22g', dietType: 'Veg', allergens: ['Dairy', 'Gluten'] }
    },
    {
      day: 'Tuesday',
      Breakfast: { menuItems: 'Hot Puri (3 pcs), Aloo Masala Bhaji, Suji Halwa, Tea / Coffee', timing: '7:30 AM – 9:00 AM', calories: 510, protein: '10g', dietType: 'Veg', allergens: ['Gluten'] },
      Lunch: { menuItems: 'Phulka Roti, Dal Fry, Aloo Gobi Masala, Steamed Rice, Andhra Rasam, Fresh Curd', timing: '12:30 PM – 2:00 PM', calories: 610, protein: '16g', dietType: 'Veg', allergens: ['Gluten', 'Dairy'] },
      Snacks: { menuItems: 'Crispy Onion Pakoda, Green Chutney, Filter Coffee / Tea', timing: '4:30 PM – 5:30 PM', calories: 260, protein: '5g', dietType: 'Veg', allergens: [] },
      Dinner: { menuItems: 'Tawa Roti, Chettinad Chicken Curry / Kadai Paneer (Veg Option), Steamed Rice, Dal, Onion Salad', timing: '7:30 PM – 9:00 PM', calories: 750, protein: '34g', dietType: 'Non-Veg', allergens: ['Dairy', 'Gluten'], isSpecial: true }
    },
    {
      day: 'Wednesday',
      Breakfast: { menuItems: 'Stuffed Aloo Paratha with Amul Butter, Mango Pickle, Sweet Curd, Tea / Coffee', timing: '7:30 AM – 9:00 AM', calories: 540, protein: '12g', dietType: 'Veg', allergens: ['Dairy', 'Gluten'] },
      Lunch: { menuItems: 'Tandoori Roti, Mughlai Egg Masala (or Shahi Paneer for Veg), Jeera Rice, Yellow Dal, Curd', timing: '12:30 PM – 2:00 PM', calories: 690, protein: '26g', dietType: 'Egg', allergens: ['Egg', 'Dairy', 'Gluten'] },
      Snacks: { menuItems: 'Crispy Veg Cutlet (2 pcs), Tomato Ketchup, Cardamom Tea / Milk', timing: '4:30 PM – 5:30 PM', calories: 240, protein: '5g', dietType: 'Veg', allergens: ['Gluten'] },
      Dinner: { menuItems: 'Soft Rotis, Dal Makhani, Mixed Seasonal Vegetable Sabzi, Steamed Rice, Curd, Fruit Custard', timing: '7:30 PM – 9:00 PM', calories: 680, protein: '19g', dietType: 'Veg', allergens: ['Dairy', 'Gluten'] }
    },
    {
      day: 'Thursday',
      Breakfast: { menuItems: 'Mysore Bonda / Bajji (4 pcs), Allam Ginger Chutney, Sambar, Tea / Coffee', timing: '7:30 AM – 9:00 AM', calories: 480, protein: '9g', dietType: 'Veg', allergens: ['Gluten'] },
      Lunch: { menuItems: 'Steamed Rice, Drumstick Sambar, Crispy Bhindi Fry, Tomato Dal, Appalam Papad, Curd', timing: '12:30 PM – 2:00 PM', calories: 590, protein: '15g', dietType: 'Veg', allergens: ['Dairy'] },
      Snacks: { menuItems: 'Cream Biscuits & Roasted Peanut Mixture, Special Ginger Chai / Milk', timing: '4:30 PM – 5:30 PM', calories: 220, protein: '4g', dietType: 'Veg', allergens: ['Peanuts', 'Gluten'] },
      Dinner: { menuItems: 'Butter Naan / Roti, Spicy Egg Bhurji (or Paneer Bhurji for Veg), Moong Dal, Jeera Rice, Curd', timing: '7:30 PM – 9:00 PM', calories: 710, protein: '28g', dietType: 'Egg', allergens: ['Egg', 'Dairy', 'Gluten'] }
    },
    {
      day: 'Friday',
      Breakfast: { menuItems: 'Indori Poha with Nylon Sev, Lemon wedges, Fried Green Chillies, Tea / Coffee', timing: '7:30 AM – 9:00 AM', calories: 380, protein: '8g', dietType: 'Veg', allergens: ['Mustard', 'Peanuts'] },
      Lunch: { menuItems: 'Soft Roti, Amritsari Chana Masala, Vegetable Pulao, Boondi Raita, Dal Tadka', timing: '12:30 PM – 2:00 PM', calories: 650, protein: '20g', dietType: 'Veg', allergens: ['Dairy', 'Gluten'] },
      Snacks: { menuItems: 'Khasta Moong Dal Kachori, Sweet Tamarind Chutney, Tea / Coffee', timing: '4:30 PM – 5:30 PM', calories: 280, protein: '6g', dietType: 'Veg', allergens: ['Gluten'] },
      Dinner: { menuItems: 'Special Dum Biryani (Chicken or Paneer), Mirchi Salan, Onion Raita, Double Ka Meetha sweet', timing: '7:30 PM – 9:00 PM', calories: 820, protein: '36g', dietType: 'Non-Veg', allergens: ['Dairy', 'Gluten'], isSpecial: true }
    },
    {
      day: 'Saturday',
      Breakfast: { menuItems: 'Crispy Masala Dosa, Potato Masala, Drumstick Sambar, Peanut Chutney, Filter Coffee', timing: '7:30 AM – 9:00 AM', calories: 460, protein: '11g', dietType: 'Veg', allergens: ['Peanuts'] },
      Lunch: { menuItems: 'Phulka Roti, Rajma Masala, Steamed Basmati Rice, Pepper Rasam, Roasted Papad, Curd', timing: '12:30 PM – 2:00 PM', calories: 630, protein: '21g', dietType: 'Veg', allergens: ['Dairy', 'Gluten'] },
      Snacks: { menuItems: 'Grilled Veg Sandwich / Butter Toast, Hot Chocolate / Masala Chai', timing: '4:30 PM – 5:30 PM', calories: 270, protein: '7g', dietType: 'Veg', allergens: ['Dairy', 'Gluten'] },
      Dinner: { menuItems: 'Soft Roti, Aloo Palak, Gujarati Sweet Dal, Rice, Fresh Curd, Rasgulla (1 pc)', timing: '7:30 PM – 9:00 PM', calories: 660, protein: '17g', dietType: 'Veg', allergens: ['Dairy', 'Gluten'] }
    },
    {
      day: 'Sunday',
      Breakfast: { menuItems: 'Fluffy Masala Omelette (or Vegetable Cutlet), Butter Toast, Banana, Mixed Fruit Juice', timing: '7:30 AM – 9:00 AM', calories: 490, protein: '18g', dietType: 'Egg', allergens: ['Egg', 'Gluten', 'Dairy'], isSpecial: true },
      Lunch: { menuItems: 'Grand Sunday Feast: Bhature & Pindi Chole, Paneer Tikka, Veg Biryani, Sweet Mango Lassi', timing: '12:30 PM – 2:00 PM', calories: 880, protein: '25g', dietType: 'Veg', allergens: ['Dairy', 'Gluten'], isSpecial: true },
      Snacks: { menuItems: 'Crispy Sev Puri / Bhel Puri chat, Cold Lemonade / Filter Coffee', timing: '4:30 PM – 5:30 PM', calories: 230, protein: '4g', dietType: 'Veg', allergens: ['Gluten', 'Peanuts'] },
      Dinner: { menuItems: 'Butter Roti, Kashmiri Dum Aloo, Dal Fry, Jeera Rice, Vanilla Ice Cream with Choco Syrup', timing: '7:30 PM – 9:00 PM', calories: 710, protein: '15g', dietType: 'Veg', allergens: ['Dairy', 'Gluten'] }
    }
  ],
  feedbacks: [
    {
      id: 'FB-201',
      studentName: 'Rajana Ganesh',
      date: '16 Aug 2026',
      meal: 'Lunch',
      rating: 5,
      tags: ['Great Taste', 'Hot & Fresh', 'Adequate Portions'],
      comments: 'The Hyderabadi Dum Biryani and Mirchi Salan were exceptional today. Great improvement in flavor balance!',
      response: 'Thank you for the review! Chef Ramu was pleased to hear your positive feedback.'
    },
    {
      id: 'FB-202',
      studentName: 'Rajana Ganesh',
      date: '14 Aug 2026',
      meal: 'Breakfast',
      rating: 4,
      tags: ['Quick Service', 'Good Hygiene'],
      comments: 'Sambar was slightly less spicy than usual, but dosas were hot and crispy.',
      response: 'Noted with the breakfast team. Spice consistency will be maintained.'
    }
  ],
  rebates: [
    {
      id: 'MESS-REB-2026-089',
      studentName: 'Rajana Ganesh',
      studentId: '236F1A0551',
      hostelBlock: 'Krishna Block',
      roomNumber: 'B-304',
      startDate: '2026-08-08',
      endDate: '2026-08-11',
      daysCount: 4,
      rebatePerDay: 140,
      totalRebate: 560,
      reason: 'Attending Inter-College Hackathon at Bangalore Tech Summit',
      status: 'Credited',
      submittedDate: '04 Aug 2026',
      remarks: 'Rebate amount ₹560 credited to next month hostel mess invoice ledger.'
    },
    {
      id: 'MESS-REB-2026-094',
      studentName: 'Rajana Ganesh',
      studentId: '236F1A0551',
      hostelBlock: 'Krishna Block',
      roomNumber: 'B-304',
      startDate: '2026-08-25',
      endDate: '2026-08-28',
      daysCount: 4,
      rebatePerDay: 140,
      totalRebate: 560,
      reason: 'Home visit for family festival celebration (Raksha Bandhan)',
      status: 'Approved',
      submittedDate: '18 Aug 2026',
      remarks: 'Warden approval granted. Gate-pass entry mapped.'
    }
  ],
  diningHalls: [
    {
      id: 'hall-1',
      name: 'Kaveri Central Dining Hall',
      location: 'Ground Floor, Student Activity Centre',
      activeMeal: 'Lunch',
      currentCapacity: 165,
      maxCapacity: 250,
      status: 'Open - Normal',
      chefToday: 'Chef R. Ramu (Executive Caterer)'
    },
    {
      id: 'hall-2',
      name: 'Godavari North Dining Wing',
      location: 'First Floor, Hostel Block C',
      activeMeal: 'Lunch',
      currentCapacity: 78,
      maxCapacity: 180,
      status: 'Open - Normal',
      chefToday: 'Chef S. Venkat'
    }
  ],
  dietaryProfile: {
    primaryDiet: 'Pure Vegetarian',
    spiceLevel: 'Medium',
    allergies: ['Peanuts'],
    sickDietActive: false,
    sickDietMeal: 'Khichdi & Curd',
    sickDietRoomDelivery: false,
    sickDietNotes: ''
  },
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

export const getMessRebates = (): MessRebateRequest[] => {
  try {
    const stored = localStorage.getItem('campushub_mess_rebates');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    }
    return mobilityData.rebates;
  } catch {
    return mobilityData.rebates;
  }
};

export const saveMessRebates = (rebates: MessRebateRequest[]) => {
  try {
    localStorage.setItem('campushub_mess_rebates', JSON.stringify(rebates));
  } catch (err) {
    console.warn('Error saving mess rebates:', err);
  }
};

export const getDietaryProfile = (): DietaryProfile => {
  try {
    const stored = localStorage.getItem('campushub_dietary_profile');
    if (stored) {
      return JSON.parse(stored);
    }
    return mobilityData.dietaryProfile;
  } catch {
    return mobilityData.dietaryProfile;
  }
};

export const saveDietaryProfile = (profile: DietaryProfile) => {
  try {
    localStorage.setItem('campushub_dietary_profile', JSON.stringify(profile));
  } catch (err) {
    console.warn('Error saving dietary profile:', err);
  }
};

export const getMealAttendance = (): MealAttendanceRecord => {
  const todayStr = new Date().toISOString().split('T')[0];
  try {
    const stored = localStorage.getItem(`campushub_meal_att_${todayStr}`);
    if (stored) {
      return JSON.parse(stored);
    }
    return {
      date: todayStr,
      breakfast: true,
      lunch: false,
      snacks: false,
      dinner: false
    };
  } catch {
    return {
      date: todayStr,
      breakfast: true,
      lunch: false,
      snacks: false,
      dinner: false
    };
  }
};

export const saveMealAttendance = (att: MealAttendanceRecord) => {
  try {
    localStorage.setItem(`campushub_meal_att_${att.date}`, JSON.stringify(att));
  } catch (err) {
    console.warn('Error saving meal attendance:', err);
  }
};

export default mobilityData;


