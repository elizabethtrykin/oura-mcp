# Sleep & Recovery Analysis Reference

Detailed patterns for analyzing Oura Ring data.

## Sleep Architecture Targets

| Metric | Optimal | Acceptable | Poor |
|--------|---------|------------|------|
| Deep Sleep | >90min (15-20%) | 60-90min | <60min |
| REM Sleep | >90min (20-25%) | 60-90min | <60min |
| Sleep Efficiency | >90% | 85-90% | <85% |
| Sleep Latency | <15min | 15-30min | >30min |
| Restless Periods | <100 | 100-200 | >200 |
| WASO (wake after onset) | <30min | 30-60min | >60min |

## HRV Analysis Framework

### Baseline Establishment
- Calculate 14-day rolling average
- Note personal range (some healthy adults: 20-40ms, others: 60-100ms)
- Morning HRV during sleep is most reliable window

### Deviation Interpretation
| Change from Baseline | Possible Causes |
|---------------------|-----------------|
| +15% or more | Good recovery, adaptation, relaxation |
| -10% to +10% | Normal daily variation |
| -15% to -25% | Training stress, mild illness, poor sleep |
| -25% or more | Significant stress, illness onset, overtraining |

### HRV Trend Patterns
- **Declining over 3+ days**: Accumulating fatigue, reduce training load
- **Rising trend**: Good adaptation, can increase training
- **High variability day-to-day**: Inconsistent recovery, focus on sleep hygiene

## Recovery Readiness Decision Tree

```
Readiness Score:
├── 85+: Green light for high-intensity training
├── 70-84: Moderate training, watch for fatigue
├── 55-69: Light activity only, focus on recovery
└── <55: Rest day recommended

Key Contributors to Check:
1. recovery_index < 50 → Sleep quality issue
2. hrv_balance < 70 → Autonomic stress
3. body_temperature > 0.5°C deviation → Possible illness
4. previous_night < 60 → Poor sleep, prioritize recovery
5. resting_heart_rate elevated → Fatigue/stress accumulation
```

## Sleep Issue Diagnostics

### Pattern: Good Duration, Poor Quality
- Symptoms: 7+ hours total, but low efficiency, high restlessness
- Check: `restless_periods`, `awake_time`, `efficiency`
- Likely causes: Sleep apnea, alcohol, caffeine, stress
- Actions: Sleep study if persistent, eliminate substances

### Pattern: Poor Deep Sleep
- Symptoms: `deep_sleep_duration` < 3600s consistently
- Check: `bedtime_start` timing, activity before bed
- Likely causes: Late exercise, hot room, alcohol
- Actions: Cool room to 18°C, no exercise within 3hrs of bed

### Pattern: Poor REM
- Symptoms: `rem_sleep_duration` < 3600s, often worse end of night
- Check: Early wake times, substance use
- Likely causes: Alcohol (blocks REM), cannabis, early alarm
- Actions: Eliminate substances, allow natural wake

### Pattern: Long Sleep Latency
- Symptoms: `latency` > 1800s (30min)
- Check: Bedtime consistency, evening light exposure
- Likely causes: Irregular schedule, blue light, anxiety
- Actions: Consistent sleep time ±30min, dim lights 2hrs before

### Pattern: Fragmented Sleep
- Symptoms: High `restless_periods` (>200), low `restfulness` score
- Check: Movement data patterns, breathing rate
- Likely causes: Sleep apnea, restless legs, environmental
- Actions: Sleep study, check room conditions

## Correlating Metrics

### Sleep → Next-Day Readiness
Strong predictors of morning readiness:
1. `total_sleep_duration` (strongest)
2. `deep_sleep_duration`
3. `average_hrv` during sleep
4. `efficiency`

### Activity → Sleep Quality
- High activity (steps >12k) generally improves deep sleep
- But late intense exercise can reduce deep sleep
- Optimal: Activity in morning/afternoon, not evening

### Stress → Recovery
- High `daily_stress` correlates with:
  - Lower HRV next night
  - Reduced deep sleep
  - Lower next-day readiness

## Weekly Analysis Template

When analyzing a week of data:

1. **Sleep Consistency**
   - Bedtime range (should be <1hr variation)
   - Wake time range
   - Weekend vs weekday patterns

2. **Recovery Trajectory**
   - Is readiness trending up, down, or stable?
   - Any 2+ day declining trends?

3. **HRV Trend**
   - 7-day average vs 14-day baseline
   - Day-to-day coefficient of variation

4. **Activity-Recovery Balance**
   - High activity days followed by adequate recovery?
   - Signs of cumulative fatigue?

5. **Anomalies**
   - Temperature spikes (illness?)
   - Sudden HRV drops
   - Unusual sleep timing