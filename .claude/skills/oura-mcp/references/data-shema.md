# Oura API Data Schema Reference

Complete field definitions for all Oura MCP endpoints.

## get_sleep (Detailed Sleep Sessions)

```typescript
{
  id: string;                    // Unique session ID
  day: string;                   // YYYY-MM-DD
  bedtime_start: string;         // ISO timestamp
  bedtime_end: string;           // ISO timestamp
  
  // Durations (all in seconds)
  total_sleep_duration: number;
  deep_sleep_duration: number;
  rem_sleep_duration: number;
  light_sleep_duration: number;
  awake_time: number;
  time_in_bed: number;
  latency: number;               // Time to fall asleep
  
  // Heart metrics
  average_heart_rate: number;    // bpm
  lowest_heart_rate: number;     // bpm
  average_hrv: number;           // ms (RMSSD)
  average_breath: number;        // breaths/min
  
  // Quality metrics
  efficiency: number;            // 0-100 percentage
  restless_periods: number;      // Movement count
  
  // Time series (5-min intervals)
  heart_rate: {
    interval: number;            // 300 (seconds)
    items: number[];             // HR values, null for gaps
    timestamp: string;
  };
  hrv: {
    interval: number;
    items: number[];             // HRV values
    timestamp: string;
  };
  
  // Sleep phases (30-sec resolution)
  // Values: 1=deep, 2=light, 3=REM, 4=awake
  sleep_phase_30_sec: string;    // Encoded string
  sleep_phase_5_min: string;     // Compressed version
  
  // Movement (30-sec resolution)
  // Values: 1=no motion to 4=high motion
  movement_30_sec: string;
  
  // Session metadata
  type: "long_sleep" | "sleep";  // Main sleep vs naps
  period: number;                // 0=main, 1+=additional periods
  
  // Readiness data (embedded)
  readiness: {
    score: number;
    contributors: {
      activity_balance: number;
      body_temperature: number;
      hrv_balance: number;
      previous_day_activity: number;
      previous_night: number;
      recovery_index: number;
      resting_heart_rate: number;
      sleep_balance: number;
    };
    temperature_deviation: number;
    temperature_trend_deviation: number;
  };
}
```

## get_daily_sleep (Sleep Score Summary)

```typescript
{
  id: string;
  day: string;
  score: number;                 // 0-100 overall sleep score
  timestamp: string;
  
  contributors: {
    deep_sleep: number;          // 0-100
    efficiency: number;
    latency: number;
    rem_sleep: number;
    restfulness: number;
    timing: number;              // Sleep schedule consistency
    total_sleep: number;
  };
}
```

## get_daily_readiness

```typescript
{
  id: string;
  day: string;
  score: number;                 // 0-100 readiness score
  timestamp: string;
  
  contributors: {
    activity_balance: number;    // Recent activity vs baseline
    body_temperature: number;    // Deviation from baseline
    hrv_balance: number;         // HRV vs baseline
    previous_day_activity: number;
    previous_night: number;      // Last night's sleep
    recovery_index: number;      // How rested upon waking
    resting_heart_rate: number;  // RHR vs baseline
    sleep_balance: number;       // Sleep debt
    sleep_regularity: number;    // Schedule consistency
  };
  
  temperature_deviation: number;       // °C from baseline
  temperature_trend_deviation: number; // Trend direction
}
```

## get_daily_activity

```typescript
{
  id: string;
  day: string;
  score: number;                 // 0-100 activity score
  timestamp: string;
  
  // Calories
  active_calories: number;       // From activity
  total_calories: number;        // Including BMR
  target_calories: number;       // Daily goal
  
  // Movement
  steps: number;
  equivalent_walking_distance: number;  // meters
  
  // Activity time (seconds)
  high_activity_time: number;    // Vigorous
  medium_activity_time: number;  // Moderate
  low_activity_time: number;     // Light
  sedentary_time: number;
  resting_time: number;
  non_wear_time: number;
  
  // MET minutes
  high_activity_met_minutes: number;
  medium_activity_met_minutes: number;
  low_activity_met_minutes: number;
  
  // Movement tracking
  inactivity_alerts: number;     // "Move" reminders triggered
  average_met_minutes: number;
  
  contributors: {
    meet_daily_targets: number;
    move_every_hour: number;
    recovery_time: number;
    stay_active: number;
    training_frequency: number;
    training_volume: number;
  };
}
```

## get_daily_stress

```typescript
{
  id: string;
  day: string;
  
  stress_high: number;           // Minutes in high stress
  recovery_high: number;         // Minutes in recovery
  day_summary: "restored" | "normal" | "stressful";
}
```

## get_daily_resilience

```typescript
{
  id: string;
  day: string;
  
  level: "limited" | "adequate" | "solid" | "strong" | "exceptional";
  
  contributors: {
    sleep_recovery: number;      // 0-100
    daytime_recovery: number;
    stress: number;
  };
}
```

## get_workout

```typescript
{
  id: string;
  day: string;
  
  activity: string;              // "running", "cycling", etc.
  calories: number;
  distance: number;              // meters
  start_datetime: string;
  end_datetime: string;
  
  intensity: "easy" | "moderate" | "hard";
  label: string | null;          // User-added label
  source: "manual" | "autodetected" | "confirmed";
}
```

## get_daily_spo2

```typescript
{
  id: string;
  day: string;
  
  spo2_percentage: {
    average: number;             // Average SpO2 during sleep
  };
  
  breathing_disturbance_index: number;  // Events per hour
}
```

## get_vO2_max

```typescript
{
  id: string;
  day: string;
  
  vo2_max: number;               // mL/kg/min
}
```

## get_daily_cardiovascular_age

```typescript
{
  id: string;
  day: string;
  
  vascular_age: number;          // Estimated CV age in years
}
```

## Common Patterns

### Pagination
All date-based endpoints return:
```typescript
{
  data: T[];
  next_token: string | null;
}
```

### Time Series Data
HR/HRV arrays may contain `null` for gaps (ring off, poor signal).

### Sleep Phases Encoding
`sleep_phase_30_sec` string values:
- `1` = Deep sleep
- `2` = Light sleep  
- `3` = REM sleep
- `4` = Awake

### Movement Encoding
`movement_30_sec` string values:
- `1` = No movement
- `2` = Low movement
- `3` = Medium movement
- `4` = High movement