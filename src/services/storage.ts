import { Employee, AttendanceRecord, Department, AttendanceStatus } from '../types';

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp-101',
    name: 'Carlos Mendoza',
    role: 'Frontend Tech Lead',
    department: 'Engineering',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    carColor: '#38bdf8', // Sky Blue
    carModel: 'Cyber Sedan',
    email: 'carlos.mendoza@company.com',
    joinedDate: '2023-04-15',
  },
  {
    id: 'emp-102',
    name: 'Valentina Soto',
    role: 'Operations Director',
    department: 'Operations',
    avatarUrl: '/src/assets/images/company_employee_badge_avatar_1793668126953.jpg',
    carColor: '#ec4899', // Pink
    carModel: 'Hyper GT',
    email: 'valentina.soto@company.com',
    joinedDate: '2022-09-01',
  },
  {
    id: 'emp-103',
    name: 'Matthew Miller',
    role: 'Senior Sales Account Exec',
    department: 'Sales',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    carColor: '#f59e0b', // Amber
    carModel: 'Eco Cruiser',
    email: 'matthew.miller@company.com',
    joinedDate: '2023-01-10',
  },
  {
    id: 'emp-104',
    name: 'Lucy Navarro',
    role: 'People & Culture Lead',
    department: 'Human Resources',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
    carColor: '#10b981', // Emerald
    carModel: 'Cyber Sedan',
    email: 'lucy.navarro@company.com',
    joinedDate: '2021-11-20',
  },
  {
    id: 'emp-105',
    name: 'Richard Vance',
    role: 'Senior Financial Analyst',
    department: 'Finance',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    carColor: '#a855f7', // Purple
    carModel: 'Turbo Van',
    email: 'richard.vance@company.com',
    joinedDate: '2022-03-14',
  },
  {
    id: 'emp-106',
    name: 'Camila Reyes',
    role: 'Lead UI/UX Product Designer',
    department: 'Design',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80',
    carColor: '#ef4444', // Red
    carModel: 'Hyper GT',
    email: 'camila.reyes@company.com',
    joinedDate: '2024-02-01',
  },
  {
    id: 'emp-107',
    name: 'Andrew Morales',
    role: 'DevOps & Cloud Engineer',
    department: 'Engineering',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80',
    carColor: '#06b6d4', // Cyan
    carModel: 'Eco Cruiser',
    email: 'andrew.morales@company.com',
    joinedDate: '2023-08-18',
  },
  {
    id: 'emp-108',
    name: 'Sophia Clark',
    role: 'Key Enterprise Account Lead',
    department: 'Sales',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
    carColor: '#eab308', // Yellow
    carModel: 'Cyber Sedan',
    email: 'sophia.clark@company.com',
    joinedDate: '2022-06-30',
  }
];

export const DEPARTMENTS: Department[] = [
  'Engineering',
  'Operations',
  'Sales',
  'Human Resources',
  'Finance',
  'Design'
];

export const CAR_MODELS = [
  { id: 'Cyber Sedan', name: 'Cyber Sedan (Aerodynamic & Agile)', boost: 'Responsive handling', color: '#38bdf8' },
  { id: 'Hyper GT', name: 'Hyper GT (Pure Speed)', boost: 'High acceleration', color: '#ec4899' },
  { id: 'Eco Cruiser', name: 'Eco Cruiser (Efficient & Stable)', boost: 'Smooth braking', color: '#10b981' },
  { id: 'Turbo Van', name: 'Turbo Van (Heavy Duty)', boost: 'Durable shield', color: '#f59e0b' }
];

const STORAGE_KEYS = {
  EMPLOYEES: 'autocheck_employees_en_v2',
  RECORDS: 'autocheck_records_en_v2',
  SELECTED_EMP: 'autocheck_current_employee_id_en_v2'
};

export function getInitialRecords(employees: Employee[]): AttendanceRecord[] {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  
  const dates = [
    todayStr,
    new Date(today.getTime() - 86400000).toISOString().split('T')[0],
    new Date(today.getTime() - 86400000 * 2).toISOString().split('T')[0],
  ];

  const records: AttendanceRecord[] = [
    {
      id: 'rec-01',
      employeeId: 'emp-101',
      employeeName: 'Carlos Mendoza',
      employeeRole: 'Frontend Tech Lead',
      department: 'Engineering',
      avatarUrl: employees[0].avatarUrl,
      timestamp: `${dates[0]}T07:48:22`,
      date: dates[0],
      timeString: '07:48 AM',
      scheduledTime: '08:00 AM',
      status: 'ON_TIME',
      minutesLate: 0,
      notes: 'Early check-in. Flawless run with zero obstacle collisions.',
      gameStats: {
        completed: true,
        timeElapsedSec: 60,
        score: 1840,
        obstaclesDodged: 24,
        obstaclesHit: 0,
        maxSpeedKmh: 142,
        avgSpeedKmh: 118,
        distanceTraveledM: 2400,
        competitorsOvertaken: 5,
        finalPosition: 1,
      }
    },
    {
      id: 'rec-02',
      employeeId: 'emp-102',
      employeeName: 'Valentina Soto',
      employeeRole: 'Operations Director',
      department: 'Operations',
      avatarUrl: employees[1].avatarUrl,
      timestamp: `${dates[0]}T07:56:10`,
      date: dates[0],
      timeString: '07:56 AM',
      scheduledTime: '08:00 AM',
      status: 'ON_TIME',
      minutesLate: 0,
      notes: 'Punctual arrival on time before 8:00 AM.',
      gameStats: {
        completed: true,
        timeElapsedSec: 60,
        score: 1620,
        obstaclesDodged: 21,
        obstaclesHit: 1,
        maxSpeedKmh: 136,
        avgSpeedKmh: 112,
        distanceTraveledM: 2400,
        competitorsOvertaken: 4,
        finalPosition: 2,
      }
    },
    {
      id: 'rec-03',
      employeeId: 'emp-103',
      employeeName: 'Matthew Miller',
      employeeRole: 'Senior Sales Account Exec',
      department: 'Sales',
      avatarUrl: employees[2].avatarUrl,
      timestamp: `${dates[0]}T08:14:45`,
      date: dates[0],
      timeString: '08:14 AM',
      scheduledTime: '08:00 AM',
      status: 'LATE',
      minutesLate: 14,
      notes: '14 minutes late past official 8:00 AM cutoff.',
      gameStats: {
        completed: true,
        timeElapsedSec: 60,
        score: 1210,
        obstaclesDodged: 17,
        obstaclesHit: 3,
        maxSpeedKmh: 128,
        avgSpeedKmh: 98,
        distanceTraveledM: 2250,
        competitorsOvertaken: 2,
        finalPosition: 5,
      }
    },
    {
      id: 'rec-04',
      employeeId: 'emp-104',
      employeeName: 'Lucy Navarro',
      employeeRole: 'People & Culture Lead',
      department: 'Human Resources',
      avatarUrl: employees[3].avatarUrl,
      timestamp: `${dates[0]}T07:52:00`,
      date: dates[0],
      timeString: '07:52 AM',
      scheduledTime: '08:00 AM',
      status: 'ON_TIME',
      minutesLate: 0,
      notes: 'Excellent driving, passed 6 coworkers cleanly.',
      gameStats: {
        completed: true,
        timeElapsedSec: 60,
        score: 1950,
        obstaclesDodged: 27,
        obstaclesHit: 0,
        maxSpeedKmh: 148,
        avgSpeedKmh: 122,
        distanceTraveledM: 2400,
        competitorsOvertaken: 6,
        finalPosition: 1,
      }
    },
    {
      id: 'rec-05',
      employeeId: 'emp-105',
      employeeName: 'Richard Vance',
      employeeRole: 'Senior Financial Analyst',
      department: 'Finance',
      avatarUrl: employees[4].avatarUrl,
      timestamp: `${dates[0]}T08:06:12`,
      date: dates[0],
      timeString: '08:06 AM',
      scheduledTime: '08:00 AM',
      status: 'LATE',
      minutesLate: 6,
      notes: '6 minutes delay past entry time.',
      gameStats: {
        completed: true,
        timeElapsedSec: 60,
        score: 1400,
        obstaclesDodged: 19,
        obstaclesHit: 2,
        maxSpeedKmh: 130,
        avgSpeedKmh: 104,
        distanceTraveledM: 2320,
        competitorsOvertaken: 3,
        finalPosition: 4,
      }
    },
    {
      id: 'rec-06',
      employeeId: 'emp-106',
      employeeName: 'Camila Reyes',
      department: 'Design',
      employeeRole: 'Lead UI/UX Product Designer',
      avatarUrl: employees[5].avatarUrl,
      timestamp: `${dates[1]}T07:58:30`,
      date: dates[1],
      timeString: '07:58 AM',
      scheduledTime: '08:00 AM',
      status: 'ON_TIME',
      minutesLate: 0,
      notes: 'Logged right before 8:00 AM bell.',
      gameStats: {
        completed: true,
        timeElapsedSec: 60,
        score: 1750,
        obstaclesDodged: 23,
        obstaclesHit: 1,
        maxSpeedKmh: 140,
        avgSpeedKmh: 115,
        distanceTraveledM: 2400,
        competitorsOvertaken: 4,
        finalPosition: 2,
      }
    },
    {
      id: 'rec-07',
      employeeId: 'emp-107',
      employeeName: 'Andrew Morales',
      department: 'Engineering',
      employeeRole: 'DevOps & Cloud Engineer',
      avatarUrl: employees[6].avatarUrl,
      timestamp: `${dates[1]}T08:22:15`,
      date: dates[1],
      timeString: '08:22 AM',
      scheduledTime: '08:00 AM',
      status: 'LATE',
      minutesLate: 22,
      notes: 'Highway delay reported on morning commute.',
      gameStats: {
        completed: true,
        timeElapsedSec: 60,
        score: 1100,
        obstaclesDodged: 15,
        obstaclesHit: 4,
        maxSpeedKmh: 120,
        avgSpeedKmh: 92,
        distanceTraveledM: 2100,
        competitorsOvertaken: 1,
        finalPosition: 6,
      }
    },
    {
      id: 'rec-08',
      employeeId: 'emp-108',
      employeeName: 'Sophia Clark',
      department: 'Sales',
      employeeRole: 'Key Enterprise Account Lead',
      avatarUrl: employees[7].avatarUrl,
      timestamp: `${dates[2]}T07:44:00`,
      date: dates[2],
      timeString: '07:44 AM',
      scheduledTime: '08:00 AM',
      status: 'ON_TIME',
      minutesLate: 0,
      notes: 'First check-in of the morning shift.',
      gameStats: {
        completed: true,
        timeElapsedSec: 60,
        score: 1910,
        obstaclesDodged: 25,
        obstaclesHit: 0,
        maxSpeedKmh: 146,
        avgSpeedKmh: 120,
        distanceTraveledM: 2400,
        competitorsOvertaken: 5,
        finalPosition: 1,
      }
    }
  ];

  return records;
}

export function loadEmployees(): Employee[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.error('Error loading employees:', err);
  }
  localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(INITIAL_EMPLOYEES));
  return INITIAL_EMPLOYEES;
}

export function saveEmployees(employees: Employee[]): void {
  localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
}

export function loadRecords(employees: Employee[]): AttendanceRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RECORDS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.error('Error loading records:', err);
  }
  const initial = getInitialRecords(employees);
  localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(initial));
  return initial;
}

export function saveRecords(records: AttendanceRecord[]): void {
  localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
}

export function getSavedSelectedEmployeeId(): string | null {
  return localStorage.getItem(STORAGE_KEYS.SELECTED_EMP);
}

export function setSavedSelectedEmployeeId(id: string): void {
  localStorage.setItem(STORAGE_KEYS.SELECTED_EMP, id);
}

/**
 * Calculates punctuality against the strict 8:00 AM entry rule.
 */
export function calculatePunctuality(hour: number, minute: number): {
  status: AttendanceStatus;
  minutesLate: number;
  timeString: string;
} {
  const isPM = hour >= 12;
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  const padMin = minute.toString().padStart(2, '0');
  const padHour = displayHour.toString().padStart(2, '0');
  const ampm = isPM ? 'PM' : 'AM';
  const timeString = `${padHour}:${padMin} ${ampm}`;

  // Official entry threshold is 8:00 AM (8 hours * 60 minutes = 480 minutes)
  const scheduledMinutes = 8 * 60; // 480
  const arrivalMinutes = hour * 60 + minute;

  if (arrivalMinutes <= scheduledMinutes) {
    return {
      status: 'ON_TIME',
      minutesLate: 0,
      timeString
    };
  } else {
    return {
      status: 'LATE',
      minutesLate: arrivalMinutes - scheduledMinutes,
      timeString
    };
  }
}

export function exportAttendanceToCSV(records: AttendanceRecord[]): void {
  const headers = [
    'Record ID',
    'Date',
    'Arrival Time',
    'Scheduled Time',
    'Status',
    'Minutes Late',
    'Employee ID',
    'Employee Name',
    'Department',
    'Role',
    'Race Score',
    'Obstacles Dodged',
    'Collisions',
    'Max Speed (km/h)',
    'Distance (m)',
    'Final Position'
  ];

  const rows = records.map(r => [
    `"${r.id}"`,
    `"${r.date}"`,
    `"${r.timeString}"`,
    `"${r.scheduledTime}"`,
    `"${r.status === 'ON_TIME' ? 'ON TIME' : 'LATE'}"`,
    r.minutesLate,
    `"${r.employeeId}"`,
    `"${r.employeeName}"`,
    `"${r.department}"`,
    `"${r.employeeRole}"`,
    r.gameStats.score,
    r.gameStats.obstaclesDodged,
    r.gameStats.obstaclesHit,
    r.gameStats.maxSpeedKmh,
    r.gameStats.distanceTraveledM,
    r.gameStats.finalPosition || 1
  ]);

  const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `corporate_attendance_report_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
