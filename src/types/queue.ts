export type QueueDiscipline = 'FIFO' | 'LIFO' | 'PRIORITY';
export type ServiceDistribution = 'exponential' | 'deterministic';
export type KendallModelType = 'M/M/1' | 'M/M/c' | 'M/M/1/K' | 'M/G/1';

export interface Customer {
  id: number;
  arrivalTime: number;
  serviceStartTime?: number;
  completionTime?: number;
  serviceTime: number;
  priority: number;
  status: 'waiting' | 'in_service' | 'completed' | 'balked';
  assignedServerId?: number;
  waitTime: number;
  timeInSystem: number;
}

export interface ServerState {
  id: number;
  name: string;
  isBusy: boolean;
  currentCustomerId?: number;
  serviceStartTime?: number;
  serviceDuration: number;
  totalCustomersServed: number;
  totalBusyTime: number;
}

export interface QueueSystemMetrics {
  trafficIntensity: number; // rho
  avgQueueLength: number; // Lq
  avgSystemLength: number; // L
  avgWaitTime: number; // Wq
  avgTimeInSystem: number; // W
  idleProbability: number; // P0
  waitProbability: number; // P(wait) or Erlang C
  totalArrivals: number;
  totalServed: number;
  totalBalked: number;
  actualUtilization: number;
}
