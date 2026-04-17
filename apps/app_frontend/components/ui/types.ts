export interface Machine {
  id: string;
  name: string;
  host: string;
  cpu: string;
  cores: number;
  ram: number; // GB
  storage: number; // GB
  gpu?: string;
  pricePerHour: number;
  status: "online" | "offline" | "busy";
  os: string;
  region: string;
  uptime: number; // hours
}

export interface Session {
  id: string;
  machineId: string;
  machineName: string;
  status: "running" | "stopped" | "error" | "starting";
  startedAt: string;
  duration: number; // minutes
  cost: number;
}

export interface Job {
  id: string;
  sessionId: string;
  command: string;
  status: "queued" | "running" | "completed" | "failed";
  startedAt: string;
  completedAt?: string;
  exitCode?: number;
}

export interface HostMachine {
  id: string;
  name: string;
  cpu: string;
  cores: number;
  ram: number;
  storage: number;
  gpu?: string;
  status: "online" | "offline";
  activeJobs: number;
  cpuUsage: number;
  ramUsage: number;
  storageUsage: number;
  earnings: number;
  uptimeHours: number;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: "info" | "warn" | "error" | "debug";
  message: string;
}

export interface UsageRecord {
  date: string;
  hours: number;
  cost: number;
}
