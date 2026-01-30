---
name: oura-mcp
description: Oura Ring health data analysis and interpretation via MCP. Use when users ask about sleep quality, readiness scores, HRV, activity levels, stress, recovery, workouts, or any biometric data from their Oura Ring. Triggers on phrases like "my sleep", "how did I sleep", "my HRV", "readiness score", "activity data", "Oura data", "recovery", "sleep trends", "heart rate during sleep", "deep sleep", "REM sleep", "stress levels", "VO2 max".
---

# Oura MCP Skill

Access and analyze Oura Ring biometric data through MCP tools.

## Available Tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `get_daily_sleep` | Sleep score summaries | startDate, endDate |
| `get_sleep` | Detailed sleep sessions (HR, HRV, phases) | startDate, endDate |
| `get_daily_readiness` | Readiness scores and contributors | startDate, endDate |
| `get_daily_activity` | Activity metrics and calories | startDate, endDate |
| `get_workout` | Workout sessions | startDate, endDate |
| `get_daily_stress` | Stress measurements | startDate, endDate |
| `get_daily_resilience` | Resilience metrics | startDate, endDate |
| `get_daily_spo2` | Blood oxygen levels | startDate, endDate |
| `get_vO2_max` | VO2 max estimates | startDate, endDate |
| `get_daily_cardiovascular_age` | CV age estimates | startDate, endDate |
| `get_session` | Meditation/relaxation sessions | startDate, endDate |
| `get_sleep_time` | Sleep timing data | startDate, endDate |
| `get_rest_mode_period` | Rest mode periods | startDate, endDate |

## Date Format

All dates use `YYYY-MM-DD` format. Example: `2026-01-30`

## Key Data Schemas

### Sleep Data (`get_sleep`)
```
deep_sleep_duration     # seconds
rem_sleep_duration      # seconds  
light_sleep_duration    # seconds
awake_time              # seconds
total_sleep_duration    # seconds
average_heart_rate      # bpm
lowest_heart_rate       # bpm
average_hrv             # ms (RMSSD)
efficiency              # percentage
latency                 # seconds to fall asleep
bedtime_start/end       # ISO timestamps
restless_periods        # count of movements
```

### Daily Sleep Score (`get_daily_sleep`)
```
score                   # 0-100 overall
contributors:
  deep_sleep            # 0-100
  efficiency            # 0-100
  latency               # 0-100
  rem_sleep             # 0-100
  restfulness           # 0-100
  timing                # 0-100
  total_sleep           # 0-100
```

### Readiness (`get_daily_readiness`)
```
score                   # 0-100 overall
contributors:
  activity_balance      # 0-100
  body_temperature      # 0-100
  hrv_balance           # 0-100
  previous_day_activity # 0-100
  previous_night        # 0-100
  recovery_index        # 0-100
  resting_heart_rate    # 0-100
  sleep_balance         # 0-100
temperature_deviation   # °C from baseline
```

### Activity (`get_daily_activity`)
```
score                   # 0-100
active_calories         # kcal
total_calories          # kcal
steps                   # count
equivalent_walking_distance  # meters
high/medium/low_activity_time # seconds
sedentary_time          # seconds
met_min_high/medium/low # MET minutes
```

## Analysis Patterns

### Sleep Quality Assessment
1. Fetch 7-14 days of data for trends
2. Key metrics to evaluate:
   - Deep sleep: >1.5hrs/night optimal
   - REM: >1.5hrs/night optimal  
   - Efficiency: >85% good
   - Restfulness: <50 indicates fragmented sleep
   - Latency: <20min optimal

### Recovery Assessment
1. Compare readiness contributors
2. Low `recovery_index` + low `previous_night` = poor sleep recovery
3. Low `hrv_balance` = autonomic stress
4. Elevated `temperature_deviation` (>0.5°C) = potential illness/stress

### HRV Interpretation
- HRV is highly individual—compare to user's baseline
- Higher HRV = better parasympathetic tone
- Trend matters more than absolute value
- Morning HRV most reliable (during sleep)

## Common Queries

**"How did I sleep last night?"**
→ `get_daily_sleep` + `get_sleep` for yesterday

**"Show my sleep trends"**
→ `get_daily_sleep` for 14-30 days, analyze score trajectory

**"Why is my readiness low?"**
→ `get_daily_readiness` today + `get_sleep` last night, examine contributors

**"Am I recovered enough to train?"**
→ `get_daily_readiness` + `get_daily_activity` + `get_hrv_balance`

**"What's affecting my HRV?"**
→ Correlate `average_hrv` from `get_sleep` with activity, alcohol, stress tags

## Intervention Recommendations

When analyzing sleep issues, correlate findings with evidence-based interventions:

| Finding | Likely Cause | Intervention |
|---------|--------------|--------------|
| Low deep sleep | Late exercise, alcohol, hot room | Cool room (18°C), no alcohol 3hrs before |
| Low REM | Alcohol, cannabis, sleep debt | Avoid substances, consistent schedule |
| High restlessness | Caffeine, stress, sleep apnea | Caffeine cutoff noon, check breathing |
| Poor latency | Irregular schedule, blue light | Consistent bedtime, dim lights 2hrs before |
| Low HRV trend | Overtraining, stress, illness | Deload training, stress management |
| High temp deviation | Illness, hormonal, alcohol | Monitor, reduce training load |

## Data Interpretation Caveats

- Oura HRV uses RMSSD (parasympathetic-weighted)
- Sleep staging has ~80% accuracy vs polysomnography
- Single-night data is noisy—use 7+ day trends
- Temperature requires 2+ weeks baseline calibration
- Activity calories can overestimate for strength training