# AI ROI Calculator - Calculation Documentation

## Overview

This document provides comprehensive documentation of all calculations used in the AI ROI Calculator application. All calculations are based on industry research and benchmarks for AI automation potential.

---

## 1. AI Potential Score (0-100%)

### Purpose
Estimates how well a task can be automated or assisted by AI tools.

### Formula
```
AI Potential = (Category Base × 0.6) + (Repetition Factor × 0.25) + (Time Factor × 0.15)
```

### Components

#### Category Base (0-85 points)
Base score based on task category. Represents AI's natural aptitude for that type of work.

| Category | Base Score | Rationale |
|----------|------------|-----------|
| Email & Communication | 85 | LLMs excel at drafting, summarizing, and responding to emails |
| Report Writing & Documentation | 80 | AI strong at generating reports and documentation |
| Scheduling & Calendar Management | 80 | AI assistants handle scheduling well |
| Data Analysis & Reporting | 75 | AI tools can analyze data and generate insights |
| Research & Information Gathering | 75 | AI-powered search excels at research tasks |
| Meeting Preparation & Follow-up | 70 | AI can summarize meetings and prepare agendas |
| Social Media & Content Creation | 70 | AI generates content drafts effectively |
| Presentation Creation | 65 | AI can create slide content and structure |
| Code Development & Technical Tasks | 60 | AI assists coding but requires human oversight |
| Project Management | 50 | AI provides suggestions but human judgment critical |
| Creative & Design Work | 45 | AI supports but doesn't replace human creativity |

#### Repetition Factor (5-50 points)
Calculated as: `repetitiveness (1-10) × 5`

Higher repetitiveness = higher AI potential because AI excels at repetitive tasks.

| Repetitiveness | Factor | Description |
|---------------|--------|-------------|
| 1 | 5 | Highly unique, varies significantly each time |
| 3 | 15 | Some repetitive elements but lots of variation |
| 5 | 25 | Moderate repetition with some variation |
| 7 | 35 | Mostly repetitive with occasional changes |
| 10 | 50 | Highly repetitive, consistent patterns |

#### Time Factor (0-30 points)
Calculated as: `weeklyHours × 5`, capped at 30

More time invested = higher priority for automation (with diminishing returns).

| Weekly Hours | Factor | Rationale |
|--------------|--------|-----------|
| 0-1 | 0-5 | Low priority for automation |
| 2-4 | 10-20 | Moderate priority |
| 5-6 | 25-30 | High priority |
| 7+ | 30 (capped) | Maximum priority |

### Weighting Rationale
- **60% Category**: Most important - some tasks are naturally better suited for AI
- **25% Repetition**: Second most important - AI excels at repetitive work
- **15% Time**: Third priority - time invested matters but is secondary to suitability

### Example Calculation
**Task**: Email correspondence, 5 hours/week, repetitiveness 7

```
Category Base: 85 × 0.6 = 51
Repetition Factor: (7 × 5) × 0.25 = 35 × 0.25 = 8.75
Time Factor: (5 × 5) × 0.15 = 25 × 0.15 = 3.75

AI Potential = 51 + 8.75 + 3.75 = 63.5 → 64%
```

---

## 2. Estimated Time Savings Percentage

### Purpose
Estimates what percentage of a task's time could be saved with AI assistance, based on AI Potential score.

### Formula
Uses a tiered bracket system based on industry estimates:

| AI Potential | Time Savings | Description |
|--------------|--------------|-------------|
| ≥ 80% | 60% | Excellent AI candidate - tasks highly automatable |
| ≥ 65% | 45% | Strong AI potential - major time savings possible |
| ≥ 50% | 30% | Moderate AI benefit - partial automation achievable |
| ≥ 35% | 15% | Limited AI assistance - minor time savings |
| < 35% | 5% | Minimal AI impact - human work remains primary |

### Rationale
These percentages are conservative estimates based on:
- McKinsey research on AI automation potential
- Case studies of AI tool adoption
- Real-world implementation results

### Example
**Task**: 75% AI Potential → 30% time savings

If spending 10 hours/week on this task:
```
Time Saved = 10 × 0.30 = 3 hours/week
```

---

## 3. Financial Savings Calculations

### 3.1 Weekly Hours Saved

#### Formula
```
Hours Saved = (Weekly Hours × Time Savings %) ÷ 100
```

#### Example
Task: 10 hours/week, 30% AI savings
```
Hours Saved = (10 × 30) ÷ 100 = 3 hours/week
```

### 3.2 Weekly Cost Saved

#### Formula
```
Weekly Cost Saved = Hours Saved × Hourly Rate
```

#### Example
Task: 3 hours saved/week, $100/hour rate
```
Weekly Cost Saved = 3 × $100 = $300/week
```

### 3.3 Annual Savings

#### Formula
```
Annual Savings = Weekly Cost Saved × 52 weeks
```

#### Example
Weekly savings: $300
```
Annual Savings = $300 × 52 = $15,600/year
```

---

## 4. Total Aggregation

### 4.1 Total Weekly Hours Saved

#### Formula
```
Total Hours Saved = Σ (Each Task's Hours Saved)
```

#### Example
```
Task 1: 2.5 hours/week
Task 2: 1.8 hours/week
Task 3: 0.5 hours/week

Total Hours Saved = 2.5 + 1.8 + 0.5 = 4.8 hours/week
```

### 4.2 Total Annual Savings

#### Formula
```
Total Annual Savings = Σ (Each Task's Annual Savings)
OR
Total Annual Savings = Total Weekly Cost Saved × 52
```

---

## 5. High Impact Task Classification

### Definition
Tasks with AI Potential ≥ 70% are classified as "High Impact"

### Rationale
- 70%+ represents excellent AI candidates
- These should be prioritized for AI implementation
- Likely to deliver substantial time and cost savings

### Usage
- Highlighted in Analysis and Reports
- Used for strategic prioritization
- Triggers specific UI elements and badges

---

## 6. Data Sources & References

### Primary Sources
1. **McKinsey Global Institute** - "The economic potential of generative AI" (2023)
2. **Deloitte** - "State of AI in the Enterprise" studies
3. **Harvard Business Review** - AI adoption case studies
4. **Forrester Research** - AI automation ROI studies

### Key Insights from Research
- AI automation can reduce 30-60% of time on suitable tasks
- Email, documentation, and data analysis show highest automation potential
- Adoption effort significantly impacts time-to-value
- Training and integration time can reduce initial savings

---

## 7. Assumptions & Limitations

### What These Calculations Do
- ✓ Provide data-driven estimates based on AI capabilities
- ✓ Help prioritize tasks for AI implementation
- ✓ Give a baseline for ROI conversations
- ✓ Account for task characteristics and frequency

### What These Calculations Do NOT Do
- ✗ Guarantee actual savings (results vary by tool quality and implementation)
- ✗ Account for learning curve or adoption time
- ✗ Consider organizational changes or process improvements
- ✗ Include AI tool subscription costs in savings
- ✗ Factor in quality improvements beyond time savings

### Factors Not Considered
1. **Learning Curve**: Time to become proficient with AI tools
2. **Tool Quality**: Variations between different AI tools
3. **Implementation Quality**: How well tools are integrated into workflows
4. **Context Changes**: How task requirements may evolve
5. **Collaboration Overhead**: Coordination costs of team AI adoption
6. **Quality Trade-offs**: Potential differences in output quality

---

## 8. Best Practices for Using These Calculations

### For Individuals
1. **Start conservative**: Use estimates as baselines, not guarantees
2. **Track actual results**: Compare estimated vs. actual savings
3. **Iterate**: Refine estimates based on real-world experience
4. **Prioritize**: Focus on high-impact, low-effort opportunities first

### For Organizations
1. **Pilot programs**: Test calculations on small-scale implementations
2. **Aggregate data**: Compare estimates across multiple users/tasks
3. **Factor in overhead**: Include training, adoption, and coordination costs
4. **Consider non-monetary benefits**: Quality, consistency, speed improvements

---

## 9. Calculation Examples

### Example 1: Email Management
- **Task**: Managing email correspondence
- **Category**: Email & Communication (85 base)
- **Hours/Week**: 8
- **Repetitiveness**: 7
- **Hourly Rate**: $100

**Calculations**:
```
AI Potential = (85 × 0.6) + ((7 × 5) × 0.25) + ((8 × 5 × 0.15))
            = 51 + 8.75 + 6
            = 65.75 → 66%

Time Savings = 45% (from 66% AI Potential)
Hours Saved = 8 × 0.45 = 3.6 hours/week
Weekly Savings = 3.6 × $100 = $360/week
Annual Savings = $360 × 52 = $18,720/year
```

### Example 2: Report Writing
- **Task**: Creating weekly reports
- **Category**: Report Writing & Documentation (80 base)
- **Hours/Week**: 4
- **Repetitiveness**: 6
- **Hourly Rate**: $75

**Calculations**:
```
AI Potential = (80 × 0.6) + ((6 × 5) × 0.25) + ((4 × 5 × 0.15))
            = 48 + 7.5 + 3
            = 58.5 → 59%

Time Savings = 30% (from 59% AI Potential)
Hours Saved = 4 × 0.30 = 1.2 hours/week
Weekly Savings = 1.2 × $75 = $90/week
Annual Savings = $90 × 52 = $4,680/year
```

### Example 3: Creative Design
- **Task**: Creating marketing graphics
- **Category**: Creative & Design Work (45 base)
- **Hours/Week**: 5
- **Repetitiveness**: 3
- **Hourly Rate**: $80

**Calculations**:
```
AI Potential = (45 × 0.6) + ((3 × 5) × 0.25) + ((5 × 5 × 0.15))
            = 27 + 3.75 + 3.75
            = 34.5 → 35%

Time Savings = 15% (from 35% AI Potential)
Hours Saved = 5 × 0.15 = 0.75 hours/week
Weekly Savings = 0.75 × $80 = $60/week
Annual Savings = $60 × 52 = $3,120/year
```

---

## 10. FAQ

### Q: Why are the time savings percentages conservative?
A: Real-world implementations often fall short of ideal scenarios. Conservative estimates help set realistic expectations and avoid disappointment.

### Q: How do I adjust these calculations for my situation?
A: Consider factors like:
- Your experience with AI tools
- Quality of tools you're considering
- Complexity of your specific workflows
- Team adoption and training needs

### Q: Should I include AI tool costs in these calculations?
A: This calculator focuses on time-based savings. For complete ROI analysis, subtract tool subscription costs from the savings figures.

### Q: How often should I recalculate?
A: Recalculate when:
- Adding new tasks to track
- Changing hourly rates
- Updating task characteristics
- After implementing AI tools (compare actual vs. estimated)

### Q: What if my actual savings differ significantly?
A: This is expected! Use the difference as a learning opportunity:
- Lower than expected: Identify barriers to adoption
- Higher than expected: Document best practices to share

---

## Contact & Support

For questions about these calculations or to suggest improvements:
- Review the Calculation Guide in the application
- Hover over calculation values for tooltips
- Check the application's help documentation

**Last Updated**: April 2026
**Version**: 1.0