import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Employee, AttendanceRecord, Obstacle, CompetitorCar, FallingObject, GameState } from '../../types';
import { sounds } from '../../services/sound';
import { calculatePunctuality } from '../../services/storage';
import { GameHUD } from './GameHUD';
import { GameControlsOverlay } from './GameControlsOverlay';
import { Play, FastForward, Info, Users, AlertTriangle } from 'lucide-react';

interface CarRacingGameProps {
  employee: Employee;
  simulatedTime: { hour: number; minute: number; useRealTime: boolean };
  onFinishRace: (record: AttendanceRecord) => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

const TOTAL_RACE_TIME_SEC = 60; // 1-minute time limit
const TOTAL_DISTANCE_METERS = 2400;
const CANVAS_WIDTH = 640;
const CANVAS_HEIGHT = 800;
const ROAD_LANES = 3;

// Initial competitors on the highway
const RIVAL_PROFILES = [
  { name: 'David R.', dept: 'Operations', color: '#f97316' },
  { name: 'Laura M.', dept: 'Finance', color: '#a855f7' },
  { name: 'Steve V.', dept: 'Sales', color: '#eab308' },
  { name: 'Danny P.', dept: 'Engineering', color: '#06b6d4' },
  { name: 'Gabriel T.', dept: 'Design', color: '#ec4899' },
  { name: 'Andrea S.', dept: 'Human Resources', color: '#10b981' },
  { name: 'Marcus B.', dept: 'Engineering', color: '#6366f1' },
];

export const CarRacingGame: React.FC<CarRacingGameProps> = ({
  employee,
  simulatedTime,
  onFinishRace,
  isMuted,
  onToggleMute,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // High-level state
  const [gameState, setGameState] = useState<GameState>('LOBBY');
  const [countdownNum, setCountdownNum] = useState<number | string>(3);
  const [timeLeftSec, setTimeLeftSec] = useState<number>(TOTAL_RACE_TIME_SEC);
  const [distanceRemaining, setDistanceRemaining] = useState<number>(TOTAL_DISTANCE_METERS);
  const [speedKmh, setSpeedKmh] = useState<number>(100);
  const [score, setScore] = useState<number>(0);
  const [obstaclesDodged, setObstaclesDodged] = useState<number>(0);
  const [health, setHealth] = useState<number>(100);
  const [position, setPosition] = useState<number>(4);
  const [hasSkyWarning, setHasSkyWarning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Road geometry
  const roadLeft = 110;
  const roadRight = CANVAS_WIDTH - 110;
  const roadWidth = roadRight - roadLeft;
  const laneWidth = roadWidth / ROAD_LANES;

  const getLaneCenterX = useCallback((laneIndex: number) => {
    return roadLeft + laneWidth * laneIndex + laneWidth / 2;
  }, [laneWidth, roadLeft]);

  // Mutable game simulation refs
  const gameRef = useRef({
    playerX: CANVAS_WIDTH / 2,
    playerY: CANVAS_HEIGHT - 130,
    carWidth: 44,
    carHeight: 76,
    speed: 8,
    baseSpeed: 8,
    maxSpeed: 15,
    minSpeed: 4,
    currentSpeedKmh: 100,
    maxRecordedKmh: 100,
    speedSum: 100,
    speedSamples: 1,
    timeRemaining: TOTAL_RACE_TIME_SEC,
    distanceLeft: TOTAL_DISTANCE_METERS,
    roadOffset: 0,
    score: 0,
    obstaclesDodged: 0,
    obstaclesHit: 0,
    competitorsOvertaken: 0,
    health: 100,
    isBoosting: false,
    isBraking: false,
    isSkidding: 0,
    invincibleTimer: 0,
    screenShake: 0,
    position: 4,
    totalCompetitors: RIVAL_PROFILES.length + 1,
    obstacles: [] as Obstacle[],
    competitors: [] as CompetitorCar[],
    fallingObjects: [] as FallingObject[],
    particles: [] as Array<{ x: number; y: number; vx: number; vy: number; color: string; size: number; alpha: number }>,
    lastObstacleSpawn: 0,
    lastSkySpawn: 0,
    finishArchY: -500,
    hasCrossedFinish: false,
    lastSecBeep: 0,
    keys: {
      left: false,
      right: false,
      up: false,
      down: false,
    },
  });

  // Handle Finish Trigger
  const handleCompleteRace = useCallback(() => {
    setGameState('FINISHED');
    sounds.stopEngine();

    const g = gameRef.current;
    const now = new Date();
    const targetHour = simulatedTime.useRealTime ? now.getHours() : simulatedTime.hour;
    const targetMinute = simulatedTime.useRealTime ? now.getMinutes() : simulatedTime.minute;

    const punctuality = calculatePunctuality(targetHour, targetMinute);
    const avgSpeed = Math.round(g.speedSum / Math.max(1, g.speedSamples));

    const finalRecord: AttendanceRecord = {
      id: `rec-${Date.now()}`,
      employeeId: employee.id,
      employeeName: employee.name,
      employeeRole: employee.role,
      department: employee.department,
      avatarUrl: employee.avatarUrl,
      timestamp: new Date().toISOString(),
      date: new Date().toISOString().split('T')[0],
      timeString: punctuality.timeString,
      scheduledTime: '08:00 AM',
      status: punctuality.status,
      minutesLate: punctuality.minutesLate,
      notes: punctuality.status === 'ON_TIME' 
        ? `Punctual check-in in 1 min (Finished #${g.position}).` 
        : `Logged with ${punctuality.minutesLate} min delay (Finished #${g.position}).`,
      gameStats: {
        completed: true,
        timeElapsedSec: Math.round(TOTAL_RACE_TIME_SEC - g.timeRemaining),
        score: g.score,
        obstaclesDodged: g.obstaclesDodged,
        obstaclesHit: g.obstaclesHit,
        maxSpeedKmh: Math.round(g.maxRecordedKmh),
        avgSpeedKmh: avgSpeed,
        distanceTraveledM: Math.round(TOTAL_DISTANCE_METERS - Math.max(0, g.distanceLeft)),
        competitorsOvertaken: g.competitorsOvertaken,
        finalPosition: g.position,
      },
    };

    sounds.playFinish(punctuality.status === 'ON_TIME');
    onFinishRace(finalRecord);
  }, [employee, onFinishRace, simulatedTime]);

  // Fast-Forward to finish for evaluation
  const handleFastForwardToFinish = () => {
    if (gameState !== 'RACING') return;
    const g = gameRef.current;
    g.timeRemaining = 2;
    g.distanceLeft = 100;
    g.finishArchY = 100;
  };

  // Start Race Sequence
  const handleStartRace = () => {
    setGameState('COUNTDOWN');
    setCountdownNum(3);
    sounds.playCountdownBeep(false);

    let count = 3;
    const timer = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdownNum(count);
        sounds.playCountdownBeep(false);
      } else if (count === 0) {
        setCountdownNum('GO!');
        sounds.playCountdownBeep(true);
      } else {
        clearInterval(timer);
        // Reset game state
        const g = gameRef.current;
        g.playerX = getLaneCenterX(1);
        g.speed = g.baseSpeed;
        g.timeRemaining = TOTAL_RACE_TIME_SEC;
        g.distanceLeft = TOTAL_DISTANCE_METERS;
        g.score = 0;
        g.obstaclesDodged = 0;
        g.obstaclesHit = 0;
        g.competitorsOvertaken = 0;
        g.health = 100;
        g.obstacles = [];
        g.fallingObjects = [];
        g.particles = [];
        g.finishArchY = -1000;
        g.hasCrossedFinish = false;
        g.lastSecBeep = 0;
        g.speedSum = 100;
        g.speedSamples = 1;
        g.maxRecordedKmh = 100;
        g.position = 5;

        // Initialize competitor rival cars on highway
        g.competitors = RIVAL_PROFILES.map((rival, index) => {
          const lane = index % ROAD_LANES;
          return {
            id: `rival-${index}`,
            name: rival.name,
            department: rival.dept as Employee['department'],
            color: rival.color,
            x: getLaneCenterX(lane),
            y: -120 - index * 180,
            lane,
            targetLane: lane,
            baseSpeed: 5.5 + Math.random() * 3.5,
            speed: 6.0,
            width: 44,
            height: 76,
            overtaken: false,
            laneChangeTimer: 3 + Math.random() * 4,
          };
        });

        setGameState('RACING');
        sounds.startEngine();
      }
    }, 900);
  };

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'RACING') return;
      const k = gameRef.current.keys;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        k.left = true;
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        k.right = true;
      } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        k.up = true;
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        k.down = true;
      } else if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
        setIsPaused((prev) => !prev);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const k = gameRef.current.keys;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        k.left = false;
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        k.right = false;
      } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        k.up = false;
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        k.down = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState]);

  // Main Canvas Animation and Physics Loop
  useEffect(() => {
    let animId: number;
    let lastTimestamp = performance.now();

    const loop = (timestamp: number) => {
      const dt = Math.min((timestamp - lastTimestamp) / 1000, 0.1);
      lastTimestamp = timestamp;

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      const g = gameRef.current;

      if (ctx && canvas) {
        // Clear frame
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Update physics if RACING and not paused
        if (gameState === 'RACING' && !isPaused) {
          // Strict Time Countdown: 60 seconds (1-minute limit)
          g.timeRemaining -= dt;

          // Audio tension cues for the final 5 seconds of the 1-minute limit
          const currentSecCeil = Math.ceil(g.timeRemaining);
          if (currentSecCeil <= 5 && currentSecCeil > 0 && g.lastSecBeep !== currentSecCeil) {
            g.lastSecBeep = currentSecCeil;
            sounds.playCountdownBeep(currentSecCeil === 1);
          }

          // Strict 1-Minute Time Limit Enforced
          if (g.timeRemaining <= 0) {
            g.timeRemaining = 0;
            g.distanceLeft = 0;
            if (!g.hasCrossedFinish) {
              g.hasCrossedFinish = true;
              handleCompleteRace();
            }
          }

          // Distance decrement
          const metersTraveled = (g.currentSpeedKmh * (1000 / 3600)) * dt;
          g.distanceLeft = Math.max(0, g.distanceLeft - metersTraveled);

          // Speed dynamics
          let targetSpeed = g.baseSpeed;
          if (g.keys.up || g.isBoosting) {
            targetSpeed = g.maxSpeed;
          } else if (g.keys.down || g.isBraking) {
            targetSpeed = g.minSpeed;
          }
          if (g.isSkidding > 0) {
            g.isSkidding -= dt;
            targetSpeed = Math.min(targetSpeed, 4);
          }

          g.speed += (targetSpeed - g.speed) * dt * 4;
          g.currentSpeedKmh = Math.round(50 + (g.speed / g.maxSpeed) * 110);
          if (g.currentSpeedKmh > g.maxRecordedKmh) {
            g.maxRecordedKmh = g.currentSpeedKmh;
          }
          g.speedSum += g.currentSpeedKmh;
          g.speedSamples += 1;

          sounds.updateEnginePitch((g.speed - g.minSpeed) / (g.maxSpeed - g.minSpeed));

          // Lateral movement
          const lateralSpeed = 340 * dt;
          if (g.keys.left) g.playerX -= lateralSpeed;
          if (g.keys.right) g.playerX += lateralSpeed;

          // Road boundaries
          const minX = roadLeft + g.carWidth / 2 + 5;
          const maxX = roadRight - g.carWidth / 2 - 5;
          g.playerX = Math.max(minX, Math.min(maxX, g.playerX));

          // Road offset scroll
          g.roadOffset = (g.roadOffset + g.speed * 42 * dt) % 80;

          if (g.invincibleTimer > 0) g.invincibleTimer -= dt;
          if (g.screenShake > 0) g.screenShake -= dt * 3;

          g.score += Math.round(g.currentSpeedKmh * dt * 0.5);

          // Finish Line Arch enters as 1-minute limit approaches (at <= 7 seconds or distance)
          if ((g.timeRemaining <= 7 || g.distanceLeft <= 140) && g.finishArchY < 0) {
            g.finishArchY = -80;
          }

          if (g.finishArchY >= -100 && !g.hasCrossedFinish) {
            g.finishArchY += g.speed * 42 * dt;
            if (g.finishArchY >= g.playerY) {
              g.hasCrossedFinish = true;
              handleCompleteRace();
            }
          }

          // ================= RIVAL COMPETITOR CARS PHYSICS =================
          let aheadCount = 0;
          for (let i = 0; i < g.competitors.length; i++) {
            const rival = g.competitors[i];

            rival.y += (g.speed * 42 - rival.baseSpeed * 40) * dt;

            rival.laneChangeTimer -= dt;
            if (rival.laneChangeTimer <= 0) {
              rival.laneChangeTimer = 3 + Math.random() * 5;
              const dir = Math.random() > 0.5 ? 1 : -1;
              const nextLane = Math.max(0, Math.min(ROAD_LANES - 1, rival.lane + dir));
              rival.targetLane = nextLane;
            }

            const targetX = getLaneCenterX(rival.targetLane);
            rival.x += (targetX - rival.x) * dt * 2.5;
            rival.lane = Math.round((rival.x - roadLeft - laneWidth / 2) / laneWidth);

            if (rival.y < g.playerY) {
              aheadCount++;
            } else if (!rival.overtaken) {
              rival.overtaken = true;
              g.competitorsOvertaken++;
              g.score += 100;
            }

            if (rival.y > CANVAS_HEIGHT + 200) {
              rival.y = -300 - Math.random() * 200;
              rival.targetLane = Math.floor(Math.random() * ROAD_LANES);
              rival.x = getLaneCenterX(rival.targetLane);
              rival.overtaken = false;
            } else if (rival.y < -500) {
              rival.y = CANVAS_HEIGHT + 100;
            }

            // Collision check
            const playerLeft = g.playerX - g.carWidth / 2;
            const playerRight = g.playerX + g.carWidth / 2;
            const playerTop = g.playerY;
            const playerBottom = g.playerY + g.carHeight;

            const rivalLeft = rival.x - rival.width / 2;
            const rivalRight = rival.x + rival.width / 2;
            const rivalTop = rival.y;
            const rivalBottom = rival.y + rival.height;

            const isColliding =
              playerRight > rivalLeft &&
              playerLeft < rivalRight &&
              playerBottom > rivalTop &&
              playerTop < rivalBottom;

            if (isColliding && g.invincibleTimer <= 0) {
              sounds.playCrash();
              sounds.playHorn();
              g.obstaclesHit += 1;
              g.health = Math.max(20, g.health - 8);
              g.speed = Math.max(4, g.speed - 3);
              g.invincibleTimer = 0.8;

              if (g.playerX < rival.x) {
                g.playerX -= 25;
                rival.x += 20;
              } else {
                g.playerX += 25;
                rival.x -= 20;
              }

              for (let p = 0; p < 12; p++) {
                g.particles.push({
                  x: (g.playerX + rival.x) / 2,
                  y: (g.playerY + rival.y) / 2,
                  vx: (Math.random() - 0.5) * 100,
                  vy: (Math.random() - 0.5) * 100,
                  color: '#fef08a',
                  size: Math.random() * 4 + 2,
                  alpha: 1,
                });
              }
            }
          }

          g.position = Math.max(1, aheadCount + 1);

          // ================= FALLING HAZARDS =================
          g.lastSkySpawn += dt;
          if (g.lastSkySpawn > 7 && g.finishArchY < 0) {
            g.lastSkySpawn = 0;
            const targetLane = Math.floor(Math.random() * ROAD_LANES);
            const targetX = getLaneCenterX(targetLane);
            const targetY = g.playerY - 80 - Math.random() * 120;
            const types: Array<FallingObject['type']> = ['meteor', 'crate', 'girder'];
            const chosenType = types[Math.floor(Math.random() * types.length)];

            g.fallingObjects.push({
              id: Date.now() + Math.random(),
              type: chosenType,
              targetX,
              targetY,
              heightFromGround: 480,
              fallSpeed: 380 + Math.random() * 120,
              size: chosenType === 'meteor' ? 40 : 36,
              hasImpacted: false,
              impactDuration: 0,
              hitPlayer: false,
            });

            sounds.playSkyWarning();
          }

          let activeSkyWarning = false;
          for (let i = g.fallingObjects.length - 1; i >= 0; i--) {
            const fo = g.fallingObjects[i];

            fo.targetY += g.speed * 42 * dt;

            if (!fo.hasImpacted) {
              activeSkyWarning = true;
              fo.heightFromGround -= fo.fallSpeed * dt;

              if (fo.heightFromGround <= 0) {
                fo.heightFromGround = 0;
                fo.hasImpacted = true;
                sounds.playImpact();
                g.screenShake = 0.25;

                const particleCount = fo.type === 'meteor' ? 24 : 16;
                for (let p = 0; p < particleCount; p++) {
                  g.particles.push({
                    x: fo.targetX,
                    y: fo.targetY,
                    vx: (Math.random() - 0.5) * 160,
                    vy: (Math.random() - 0.5) * 160,
                    color: fo.type === 'meteor' ? '#f97316' : '#94a3b8',
                    size: Math.random() * 5 + 3,
                    alpha: 1,
                  });
                }

                const distToPlayer = Math.hypot(g.playerX - fo.targetX, g.playerY - fo.targetY);
                if (distToPlayer < 50 && g.invincibleTimer <= 0) {
                  g.health = Math.max(15, g.health - 18);
                  g.speed = Math.max(3, g.speed - 5);
                  g.invincibleTimer = 1.2;
                  g.obstaclesHit += 1;
                }
              }
            } else {
              fo.impactDuration += dt;
              if (fo.targetY > CANVAS_HEIGHT + 100 || fo.impactDuration > 3) {
                g.fallingObjects.splice(i, 1);
              }
            }
          }
          setHasSkyWarning(activeSkyWarning);

          // ================= ROAD OBSTACLES =================
          g.lastObstacleSpawn += dt;
          if (g.lastObstacleSpawn > 1.2 && g.finishArchY < 0) {
            g.lastObstacleSpawn = 0;
            const lane = Math.floor(Math.random() * ROAD_LANES);
            const obstacleTypes: Array<Obstacle['type']> = ['cone', 'pothole', 'truck', 'oil', 'boost'];
            const chosenType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];

            g.obstacles.push({
              id: Date.now() + Math.random(),
              type: chosenType,
              lane,
              y: -80,
              speed: chosenType === 'truck' ? 2 : 0,
              width: chosenType === 'truck' ? 48 : chosenType === 'oil' ? 52 : 36,
              height: chosenType === 'truck' ? 84 : chosenType === 'oil' ? 36 : 36,
              passed: false,
            });
          }

          // Update road obstacles
          for (let i = g.obstacles.length - 1; i >= 0; i--) {
            const obs = g.obstacles[i];
            obs.y += (g.speed * 42 - obs.speed * 20) * dt;

            if (!obs.passed && obs.y > g.playerY + g.carHeight) {
              obs.passed = true;
              if (obs.type !== 'boost') {
                g.obstaclesDodged += 1;
                g.score += 50;
              }
            }

            const obsCenterX = getLaneCenterX(obs.lane);
            const playerLeft = g.playerX - g.carWidth / 2;
            const playerRight = g.playerX + g.carWidth / 2;
            const playerTop = g.playerY;
            const playerBottom = g.playerY + g.carHeight;

            const obsLeft = obsCenterX - obs.width / 2;
            const obsRight = obsCenterX + obs.width / 2;
            const obsTop = obs.y;
            const obsBottom = obs.y + obs.height;

            const isColliding =
              playerRight > obsLeft &&
              playerLeft < obsRight &&
              playerBottom > obsTop &&
              playerTop < obsBottom;

            if (isColliding && g.invincibleTimer <= 0) {
              if (obs.type === 'boost') {
                sounds.playBoost();
                g.speed = g.maxSpeed + 2;
                g.score += 150;
                for (let p = 0; p < 12; p++) {
                  g.particles.push({
                    x: g.playerX,
                    y: g.playerY + g.carHeight,
                    vx: (Math.random() - 0.5) * 60,
                    vy: Math.random() * 40 + 20,
                    color: '#fbbf24',
                    size: Math.random() * 5 + 3,
                    alpha: 1,
                  });
                }
                g.obstacles.splice(i, 1);
                continue;
              } else if (obs.type === 'oil') {
                sounds.playSkid();
                g.isSkidding = 1.2;
                g.playerX += (Math.random() - 0.5) * 40;
                g.invincibleTimer = 0.5;
              } else {
                sounds.playCrash();
                g.obstaclesHit += 1;
                g.health = Math.max(20, g.health - 10);
                g.speed = Math.max(3, g.speed - 3.5);
                g.invincibleTimer = 1.0;
                for (let p = 0; p < 12; p++) {
                  g.particles.push({
                    x: obsCenterX,
                    y: obsTop + obs.height / 2,
                    vx: (Math.random() - 0.5) * 120,
                    vy: (Math.random() - 0.5) * 120,
                    color: obs.type === 'cone' ? '#f97316' : '#94a3b8',
                    size: Math.random() * 4 + 2,
                    alpha: 1,
                  });
                }
              }
            }

            if (obs.y > CANVAS_HEIGHT + 100) {
              g.obstacles.splice(i, 1);
            }
          }

          // Particles
          if (Math.random() < 0.6) {
            g.particles.push({
              x: g.playerX - 12 + (Math.random() - 0.5) * 6,
              y: g.playerY + g.carHeight - 4,
              vx: (Math.random() - 0.5) * 15,
              vy: Math.random() * 30 + 40,
              color: g.keys.up || g.isBoosting ? '#f59e0b' : '#64748b',
              size: Math.random() * 4 + 2,
              alpha: 0.8,
            });
            g.particles.push({
              x: g.playerX + 12 + (Math.random() - 0.5) * 6,
              y: g.playerY + g.carHeight - 4,
              vx: (Math.random() - 0.5) * 15,
              vy: Math.random() * 30 + 40,
              color: g.keys.up || g.isBoosting ? '#f59e0b' : '#64748b',
              size: Math.random() * 4 + 2,
              alpha: 0.8,
            });
          }

          for (let p = g.particles.length - 1; p >= 0; p--) {
            const part = g.particles[p];
            part.x += part.vx * dt;
            part.y += part.vy * dt;
            part.alpha -= dt * 1.8;
            if (part.alpha <= 0) {
              g.particles.splice(p, 1);
            }
          }

          // React state sync
          setTimeLeftSec(Math.max(0, g.timeRemaining));
          setDistanceRemaining(Math.max(0, g.distanceLeft));
          setSpeedKmh(g.currentSpeedKmh);
          setScore(g.score);
          setObstaclesDodged(g.obstaclesDodged);
          setHealth(g.health);
          setPosition(g.position);
        }

        // ================= DRAWING ROUTINE =================
        ctx.save();
        if (g.screenShake > 0) {
          const shakeMag = g.screenShake * 12;
          ctx.translate((Math.random() - 0.5) * shakeMag, (Math.random() - 0.5) * shakeMag);
        }

        // Background
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Green borders
        ctx.fillStyle = '#064e3b';
        ctx.fillRect(0, 0, roadLeft, CANVAS_HEIGHT);
        ctx.fillRect(roadRight, 0, CANVAS_WIDTH - roadRight, CANVAS_HEIGHT);

        // Curbs
        const curbWidth = 14;
        const stripeLen = 30;
        for (let y = -stripeLen; y < CANVAS_HEIGHT + stripeLen; y += stripeLen) {
          const shiftedY = y + (g.roadOffset % (stripeLen * 2));
          const isRed = Math.floor(shiftedY / stripeLen) % 2 === 0;
          ctx.fillStyle = isRed ? '#ef4444' : '#ffffff';
          ctx.fillRect(roadLeft - curbWidth, shiftedY, curbWidth, stripeLen);
          ctx.fillRect(roadRight, shiftedY, curbWidth, stripeLen);
        }

        // Road Asphalt
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(roadLeft, 0, roadWidth, CANVAS_HEIGHT);

        // Dashed Lane Dividers
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#f8fafc';
        ctx.setLineDash([35, 30]);
        ctx.lineDashOffset = -g.roadOffset;

        for (let l = 1; l < ROAD_LANES; l++) {
          const lineX = roadLeft + laneWidth * l;
          ctx.beginPath();
          ctx.moveTo(lineX, 0);
          ctx.lineTo(lineX, CANVAS_HEIGHT);
          ctx.stroke();
        }
        ctx.setLineDash([]);

        // Decor roadside
        const decorGap = 160;
        for (let y = -decorGap; y < CANVAS_HEIGHT + decorGap; y += decorGap) {
          const shiftedY = y + (g.roadOffset * 2 % decorGap);
          ctx.fillStyle = '#10b981';
          ctx.beginPath();
          ctx.arc(roadLeft - 35, shiftedY, 14, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.arc(roadRight + 35, shiftedY + 40, 6, 0, Math.PI * 2);
          ctx.fill();
        }

        // ================= DRAW ROAD OBSTACLES =================
        g.obstacles.forEach((obs) => {
          const obsX = getLaneCenterX(obs.lane);

          if (obs.type === 'cone') {
            ctx.fillStyle = '#f97316';
            ctx.beginPath();
            ctx.moveTo(obsX, obs.y);
            ctx.lineTo(obsX - obs.width / 2, obs.y + obs.height);
            ctx.lineTo(obsX + obs.width / 2, obs.y + obs.height);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = '#ffffff';
            ctx.fillRect(obsX - obs.width / 4, obs.y + obs.height * 0.4, obs.width / 2, 6);
            ctx.fillRect(obsX - obs.width / 3, obs.y + obs.height * 0.7, (obs.width * 2) / 3, 6);
          } else if (obs.type === 'pothole') {
            ctx.fillStyle = '#090d16';
            ctx.beginPath();
            ctx.ellipse(obsX, obs.y + obs.height / 2, obs.width / 2, obs.height / 3, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#475569';
            ctx.lineWidth = 2;
            ctx.stroke();
          } else if (obs.type === 'truck') {
            ctx.fillStyle = '#475569';
            ctx.fillRect(obsX - obs.width / 2, obs.y, obs.width, obs.height);
            ctx.fillStyle = '#94a3b8';
            ctx.fillRect(obsX - obs.width / 2 + 6, obs.y + 10, obs.width - 12, 16);
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(obsX - obs.width / 2 + 4, obs.y + obs.height - 6, 8, 4);
            ctx.fillRect(obsX + obs.width / 2 - 12, obs.y + obs.height - 6, 8, 4);
          } else if (obs.type === 'oil') {
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.ellipse(obsX, obs.y + obs.height / 2, obs.width / 2, obs.height / 2, 0.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#6366f1';
            ctx.beginPath();
            ctx.ellipse(obsX - 5, obs.y + obs.height / 2 - 2, obs.width / 4, obs.height / 4, 0.4, 0, Math.PI * 2);
            ctx.fill();
          } else if (obs.type === 'boost') {
            ctx.fillStyle = '#10b981';
            ctx.beginPath();
            ctx.moveTo(obsX, obs.y);
            ctx.lineTo(obsX + 16, obs.y + 18);
            ctx.lineTo(obsX + 8, obs.y + 18);
            ctx.lineTo(obsX + 8, obs.y + 30);
            ctx.lineTo(obsX - 8, obs.y + 30);
            ctx.lineTo(obsX - 8, obs.y + 18);
            ctx.lineTo(obsX - 16, obs.y + 18);
            ctx.closePath();
            ctx.fill();
          }
        });

        // ================= DRAW COMPETITOR CARS =================
        g.competitors.forEach((rival) => {
          if (rival.y > -100 && rival.y < CANVAS_HEIGHT + 100) {
            const rx = rival.x;
            const ry = rival.y;
            const rw = rival.width;
            const rh = rival.height;

            // Shadow
            ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
            ctx.beginPath();
            ctx.ellipse(rx, ry + rh / 2 + 4, rw / 2 + 5, rh / 2 + 2, 0, 0, Math.PI * 2);
            ctx.fill();

            // Wheels
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(rx - rw / 2 - 3, ry + 10, 5, 16);
            ctx.fillRect(rx + rw / 2 - 2, ry + 10, 5, 16);
            ctx.fillRect(rx - rw / 2 - 3, ry + rh - 26, 5, 16);
            ctx.fillRect(rx + rw / 2 - 2, ry + rh - 26, 5, 16);

            // Car Body
            ctx.fillStyle = rival.color;
            ctx.beginPath();
            ctx.roundRect(rx - rw / 2, ry, rw, rh, [10, 10, 5, 5]);
            ctx.fill();

            // Cockpit
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.roundRect(rx - rw / 2 + 5, ry + 20, rw - 10, 32, 5);
            ctx.fill();

            // Windshield
            ctx.fillStyle = '#94a3b8';
            ctx.beginPath();
            ctx.roundRect(rx - rw / 2 + 7, ry + 22, rw - 14, 12, 3);
            ctx.fill();

            // Headlights & Taillights
            ctx.fillStyle = '#fef08a';
            ctx.fillRect(rx - rw / 2 + 4, ry + 2, 6, 4);
            ctx.fillRect(rx + rw / 2 - 10, ry + 2, 6, 4);

            ctx.fillStyle = '#ef4444';
            ctx.fillRect(rx - rw / 2 + 4, ry + rh - 4, 8, 3);
            ctx.fillRect(rx + rw / 2 - 12, ry + rh - 4, 8, 3);

            // Name Tag above car
            ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
            ctx.fillRect(rx - 38, ry - 22, 76, 18);
            ctx.strokeStyle = rival.color;
            ctx.lineWidth = 1;
            ctx.strokeRect(rx - 38, ry - 22, 76, 18);

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 9px Plus Jakarta Sans, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(rival.name, rx, ry - 10);
          }
        });

        // ================= DRAW FALLING OBJECTS & WARNING SHADOWS =================
        g.fallingObjects.forEach((fo) => {
          if (!fo.hasImpacted) {
            const warnProgress = 1 - fo.heightFromGround / 480;
            const circleRadius = 15 + warnProgress * 25;

            ctx.strokeStyle = 'rgba(239, 68, 68, 0.85)';
            ctx.lineWidth = 3;
            ctx.setLineDash([6, 6]);
            ctx.beginPath();
            ctx.arc(fo.targetX, fo.targetY, circleRadius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);

            ctx.fillStyle = '#ef4444';
            ctx.font = 'bold 12px Plus Jakarta Sans, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('⚠️ CAUTION', fo.targetX, fo.targetY - circleRadius - 4);

            ctx.fillStyle = `rgba(0, 0, 0, ${0.2 + warnProgress * 0.5})`;
            ctx.beginPath();
            ctx.ellipse(fo.targetX, fo.targetY, circleRadius * 0.7, circleRadius * 0.35, 0, 0, Math.PI * 2);
            ctx.fill();

            const airY = fo.targetY - fo.heightFromGround;
            const objScale = 0.5 + warnProgress * 0.7;

            if (fo.type === 'meteor') {
              ctx.fillStyle = '#f97316';
              ctx.beginPath();
              ctx.arc(fo.targetX, airY, 18 * objScale, 0, Math.PI * 2);
              ctx.fill();

              ctx.fillStyle = 'rgba(234, 88, 12, 0.6)';
              ctx.beginPath();
              ctx.moveTo(fo.targetX - 10 * objScale, airY);
              ctx.lineTo(fo.targetX, airY - 35 * objScale);
              ctx.lineTo(fo.targetX + 10 * objScale, airY);
              ctx.closePath();
              ctx.fill();
            } else if (fo.type === 'crate') {
              const cw = 32 * objScale;
              ctx.fillStyle = '#b45309';
              ctx.fillRect(fo.targetX - cw / 2, airY - cw / 2, cw, cw);
              ctx.strokeStyle = '#fef08a';
              ctx.lineWidth = 2;
              ctx.strokeRect(fo.targetX - cw / 2, airY - cw / 2, cw, cw);
            } else {
              const gw = 44 * objScale;
              ctx.fillStyle = '#94a3b8';
              ctx.fillRect(fo.targetX - gw / 2, airY - 8 * objScale, gw, 16 * objScale);
            }
          } else {
            ctx.fillStyle = '#090d16';
            ctx.beginPath();
            ctx.ellipse(fo.targetX, fo.targetY, 24, 12, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#475569';
            ctx.fillRect(fo.targetX - 12, fo.targetY - 8, 24, 12);
          }
        });

        // ================= DRAW PARTICLES =================
        g.particles.forEach((p) => {
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.globalAlpha = 1.0;

        // ================= DRAW PLAYER CAR =================
        const shouldDrawPlayer = g.invincibleTimer <= 0 || Math.floor(Date.now() / 80) % 2 === 0;

        if (shouldDrawPlayer) {
          const cx = g.playerX;
          const cy = g.playerY;
          const w = g.carWidth;
          const h = g.carHeight;

          // Shadow
          ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
          ctx.beginPath();
          ctx.ellipse(cx, cy + h / 2 + 4, w / 2 + 6, h / 2 + 2, 0, 0, Math.PI * 2);
          ctx.fill();

          // Wheels
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(cx - w / 2 - 3, cy + 10, 5, 16);
          ctx.fillRect(cx + w / 2 - 2, cy + 10, 5, 16);
          ctx.fillRect(cx - w / 2 - 3, cy + h - 26, 5, 16);
          ctx.fillRect(cx + w / 2 - 2, cy + h - 26, 5, 16);

          // Car Body
          ctx.fillStyle = employee.carColor || '#38bdf8';
          ctx.beginPath();
          ctx.roundRect(cx - w / 2, cy, w, h, [12, 12, 6, 6]);
          ctx.fill();

          // Roof / Cockpit
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.roundRect(cx - w / 2 + 5, cy + 20, w - 10, 32, 6);
          ctx.fill();

          // Front Windshield
          ctx.fillStyle = '#94a3b8';
          ctx.beginPath();
          ctx.roundRect(cx - w / 2 + 7, cy + 22, w - 14, 12, 3);
          ctx.fill();

          // Rear Window
          ctx.fillStyle = '#475569';
          ctx.beginPath();
          ctx.roundRect(cx - w / 2 + 7, cy + 38, w - 14, 8, 2);
          ctx.fill();

          // Headlights
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(cx - w / 2 + 4, cy + 2, 6, 4);
          ctx.fillRect(cx + w / 2 - 10, cy + 2, 6, 4);

          // Taillights
          ctx.fillStyle = g.keys.down || g.isBraking ? '#ff0033' : '#b91c1c';
          ctx.fillRect(cx - w / 2 + 4, cy + h - 4, 8, 3);
          ctx.fillRect(cx + w / 2 - 12, cy + h - 4, 8, 3);

          // Headlight Beams
          ctx.fillStyle = 'rgba(254, 240, 138, 0.08)';
          ctx.beginPath();
          ctx.moveTo(cx - 15, cy);
          ctx.lineTo(cx - 50, cy - 140);
          ctx.lineTo(cx + 50, cy - 140);
          ctx.lineTo(cx + 15, cy);
          ctx.closePath();
          ctx.fill();

          // Player Name Tag
          ctx.fillStyle = 'rgba(245, 158, 11, 0.9)';
          ctx.fillRect(cx - 40, cy - 20, 80, 16);
          ctx.fillStyle = '#0f172a';
          ctx.font = 'bold 9px Plus Jakarta Sans, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(employee.name.split(' ')[0] + ' (You)', cx, cy - 8);
        }

        // ================= DRAW CORPORATE FINISH ARCH =================
        if (g.finishArchY > -200) {
          const archY = g.finishArchY;
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(roadLeft - 20, archY - 30, roadWidth + 40, 32);

          const checkSize = 16;
          for (let x = roadLeft - 20; x < roadRight + 20; x += checkSize) {
            const isAlt = Math.floor(x / checkSize) % 2 === 0;
            ctx.fillStyle = isAlt ? '#f59e0b' : '#000000';
            ctx.fillRect(x, archY + 2, checkSize, 14);
          }

          ctx.fillStyle = '#334155';
          ctx.fillRect(roadLeft - 20, archY - 30, 18, 120);
          ctx.fillRect(roadRight + 2, archY - 30, 18, 120);

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 15px Plus Jakarta Sans, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('HEADQUARTERS ENTRANCE — 08:00 AM CUTOFF', CANVAS_WIDTH / 2, archY - 10);
        }

        ctx.restore();
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [gameState, isPaused, getLaneCenterX, handleCompleteRace, employee.carColor, employee.name, laneWidth]);

  return (
    <div className="relative w-full max-w-2xl mx-auto rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl flex flex-col items-center">
      {/* Canvas Viewport */}
      <div className="relative w-full aspect-[4/5] max-h-[720px] flex items-center justify-center bg-slate-950">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="w-full h-full object-contain"
        />

        {/* HUD Overlay when racing or paused */}
        {(gameState === 'RACING' || gameState === 'PAUSED') && (
          <>
            <GameHUD
              timeLeftSec={timeLeftSec}
              totalTimeSec={TOTAL_RACE_TIME_SEC}
              distanceRemainingM={distanceRemaining}
              totalDistanceM={TOTAL_DISTANCE_METERS}
              speedKmh={speedKmh}
              score={score}
              obstaclesDodged={obstaclesDodged}
              health={health}
              position={position}
              totalRacers={RIVAL_PROFILES.length + 1}
              hasSkyWarning={hasSkyWarning}
              isMuted={isMuted}
              onToggleMute={onToggleMute}
              isPaused={isPaused}
              onTogglePause={() => setIsPaused(!isPaused)}
              employeeName={employee.name}
            />

            <GameControlsOverlay
              onSteerLeftStart={() => {
                gameRef.current.keys.left = true;
              }}
              onSteerLeftEnd={() => {
                gameRef.current.keys.left = false;
              }}
              onSteerRightStart={() => {
                gameRef.current.keys.right = true;
              }}
              onSteerRightEnd={() => {
                gameRef.current.keys.right = false;
              }}
              onBoostStart={() => {
                gameRef.current.isBoosting = true;
              }}
              onBoostEnd={() => {
                gameRef.current.isBoosting = false;
              }}
              onBrakeStart={() => {
                gameRef.current.isBraking = true;
              }}
              onBrakeEnd={() => {
                gameRef.current.isBraking = false;
              }}
            />

            {/* Quick Testing Fast-Forward Button */}
            <div className="absolute top-20 right-3 z-30 pointer-events-auto">
              <button
                type="button"
                onClick={handleFastForwardToFinish}
                className="px-2.5 py-1 rounded bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-[11px] text-amber-300 flex items-center gap-1 backdrop-blur-xs transition-colors shadow-sm"
                title="Immediately jump to the finish gate to test check-in"
              >
                <FastForward className="w-3.5 h-3.5" />
                <span>Skip to Goal</span>
              </button>
            </div>
          </>
        )}

        {/* Countdown Screen */}
        {gameState === 'COUNTDOWN' && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/60 backdrop-blur-xs">
            <span className="text-7xl sm:text-8xl font-black text-amber-400 font-mono animate-bounce drop-shadow-lg">
              {countdownNum}
            </span>
            <span className="text-sm font-semibold text-slate-300 mt-4 tracking-wide uppercase">
              1-Minute Race to Corporate Office!
            </span>
          </div>
        )}

        {/* Pause Screen */}
        {isPaused && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/75 backdrop-blur-sm">
            <h3 className="text-2xl font-bold text-white mb-2">Game Paused</h3>
            <p className="text-xs text-slate-400 mb-4">The race clock is temporarily suspended.</p>
            <button
              onClick={() => setIsPaused(false)}
              className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>Resume Race</span>
            </button>
          </div>
        )}

        {/* Lobby Start Screen */}
        {gameState === 'LOBBY' && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950/85 p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shadow-lg">
              <Play className="w-8 h-8 text-amber-400 fill-amber-400 translate-x-0.5" />
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-extrabold text-white tracking-tight">
                Grand Attendance Race (1 Minute)
              </h3>
              <p className="text-xs text-slate-400 max-w-sm">
                Race against coworkers, dodge falling sky hazards and road obstacles to clock in on time (Cutoff: 8:00 AM).
              </p>
            </div>

            {/* Competitors & Hazards preview */}
            <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl text-left text-xs text-slate-300 space-y-1.5 max-w-sm w-full">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-sky-400" />
                  <span>Rivals on track:</span>
                </span>
                <span className="font-semibold text-white">7 coworkers competing</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  <span>Aerial Hazard:</span>
                </span>
                <span className="font-semibold text-rose-400">Objects falling from sky</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Time Limit:</span>
                <span className="font-mono text-amber-400 font-bold">1:00 min exact</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleStartRace}
              className="w-full max-w-xs py-3 px-6 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>Start 1-Minute Race</span>
            </button>

            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <Info className="w-3.5 h-3.5" />
              <span>Use A / D or arrow keys to steer, pass coworkers, and dodge debris.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
