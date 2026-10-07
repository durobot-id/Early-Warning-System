export interface FloodStatusConfig {
  name: string;
  min_cm: number;
  color: string;
  icon: string;
  blink?: boolean;
  relay?: boolean;
}

export interface FirebaseConfig {
  calibrate: boolean;
  calibrate_status: 'ok' | 'processing' | 'failed' | 'idle' | string;
  calibrated_at: number;
  history_interval_s: number;
  history_max: number;
  relay_duration_s: number;
  sensor_height_cm: number;
  statuses?: FloodStatusConfig[];
}

export interface FirebaseLive {
  distance_cm: number;
  relay_on: boolean;
  sensor_height_cm: number;
  sensor_ok: boolean;
  status: string;
  status_index: number;
  updated_at: number;
  water_level_cm: number;
  wifi_rssi: number;
}

export interface FirebaseInfo {
  bmkg_adm4: string;
  latitude: number;
  longitude: number;
  region_name: string;
  kemiringan: number;
}

export interface FirebaseHistoryItem {
  distance_cm?: number;
  relay_on?: boolean;
  status?: string;
  status_index?: number;
  ts: number;
  water_level_cm: number;
}

export interface HistoryPoint {
  water_level_cm: number;
  timestamp: number;
  distance_cm?: number;
  status?: string;
}

export type NotificationSeverity = 'info' | 'warning' | 'danger' | 'system';

export interface EWSNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  severity: NotificationSeverity;
  water_level_cm: number;
  timestamp: number;
}

export interface HourlyForecast {
  time: string;
  temp: number;
  condition: string;
  icon: string;
}

export interface WeatherData {
  locationName: string;
  condition: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  rainfall?: number;
  updatedAt: string;
  hourly: HourlyForecast[];
}

export interface PredictionResult {
  direction: 'up' | 'down' | 'stable';
  predictedChangeCm: number;
  predictedLevelCm: number;
  hoursAhead: number;
  confidence: number;
  isAvailable: boolean;
  reason?: string;
}

export type DeviceOnlineState = 'ONLINE' | 'WARNING' | 'OFFLINE';
