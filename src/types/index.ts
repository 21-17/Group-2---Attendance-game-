export type Department = 
  | 'Engineering' 
  | 'Operations' 
  | 'Sales' 
  | 'Human Resources' 
  | 'Finance' 
  | 'Design';

export interface Employee {
  id: string;
  name: string;
  role: string;
  department: Department;
  avatarUrl: string;
  carColor: string;
  carModel: string;
  email: string;
  joinedDate: string;
}

export type AttendanceStatus = 'ON_TIME' | 'LATE';

export interface GameStats {
  completed: boolean;
  timeElapsedSec: number;
  score: number;
  obstaclesDodged: number;
  obstaclesHit: number;
  maxSpeedKmh: number;
  avgSpeedKmh: number;
  distanceTraveledM: number;
  competitorsOvertaken?: number;
  finalPosition?: number;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeRole: string;
  department: Department;
  avatarUrl: string;
  timestamp: string; // ISO string
  date: string; // YYYY-MM-DD
  timeString: string; // e.g. "07:54 AM" or "08:14 AM"
  scheduledTime: string; // "08:00 AM"
  status: AttendanceStatus;
  minutesLate: number; // 0 if on time, >0 if late
  notes?: string;
  gameStats: GameStats;
}

export interface Obstacle {
  id: number;
  type: 'cone' | 'pothole' | 'truck' | 'oil' | 'barrier' | 'boost';
  lane: number; // 0, 1, 2
  y: number; // distance down the road (-100 to canvas height)
  speed: number;
  width: number;
  height: number;
  passed: boolean;
}

export interface CompetitorCar {
  id: string;
  name: string;
  department: Department;
  color: string;
  x: number;
  y: number;
  lane: number;
  targetLane: number;
  baseSpeed: number;
  speed: number;
  width: number;
  height: number;
  overtaken: boolean;
  laneChangeTimer: number;
}

export interface FallingObject {
  id: number;
  type: 'meteor' | 'crate' | 'girder';
  targetX: number;
  targetY: number;
  heightFromGround: number; // starts at e.g. 500, descends to 0
  fallSpeed: number;
  size: number;
  hasImpacted: boolean;
  impactDuration: number;
  hitPlayer: boolean;
}

export type GameState = 'LOBBY' | 'COUNTDOWN' | 'RACING' | 'FINISHED' | 'PAUSED';

export type ActiveTab = 'PLAY_RACE' | 'ATTENDANCE_REPORTS' | 'EMPLOYEES';

export interface TimeSimulationConfig {
  useRealTime: boolean;
  simulatedHour: number; // 0 - 23
  simulatedMinute: number; // 0 - 59
}
