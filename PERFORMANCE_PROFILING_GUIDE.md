# Next.js Performance Profiling Guide
## Comprehensive Dynamic Performance Analysis

This guide will help you perform deep, dynamic performance analysis of your Next.js application to identify real bottlenecks and create data-driven optimization strategies.

---

## 1. Profiling React Components with React Developer Tools

### Prerequisites
- Install [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi) Chrome extension
- Ensure your app is running in development mode or has profiling enabled

### Step-by-Step Profiling Process

#### 1.1 Start Profiling
1. Open your app in Chrome
2. Open DevTools (F12)
3. Go to the **Components** tab
4. Click the **Profiler** tab (clock icon)
5. Click the **Record** button (circle) to start profiling

#### 1.2 Profile Your Target Scenarios
Focus on these specific interactions in your app:

**Storyboard Page Loading:**
- Navigate to the storyboard page
- Wait for full page load
- Stop profiler

**Task Dragging Interaction:**
- Start profiler
- Drag a task from one column to another
- Perform 3-4 drag operations
- Stop profiler

**Component Re-rendering:**
- Start profiler
- Open/close dialogs
- Change filters or search terms
- Stop profiler

#### 1.3 Understanding the Flamegraph

**Bar Width Meaning:**
- **Wide bars** = Components that took longer to render
- **Narrow bars** = Fast-rendering components
- **Stacked bars** = Component hierarchy and render time distribution

**Color Coding:**
- **Green** = Fast rendering (< 1ms)
- **Yellow** = Medium rendering (1-10ms)
- **Red** = Slow rendering (> 10ms)
- **Gray** = Component didn't render

**Identifying Re-rendering Issues:**
- Look for components that appear multiple times in the same commit
- Components with wide bars in multiple commits indicate performance issues
- Check if parent re-renders are causing unnecessary child re-renders

#### 1.4 Analyzing Commits

**What are Commits?**
- Commits represent batches of React updates
- Each commit shows what changed and how long it took
- Commits are numbered sequentially during profiling

**Commit Analysis:**
1. **Commit Duration**: Total time for the batch
2. **Component Count**: How many components rendered
3. **Interaction**: What triggered the commit (user action, state change, etc.)

**Red Flags to Look For:**
- Commits taking > 16ms (causing frame drops)
- Many components re-rendering in a single commit
- Components re-rendering without visible changes

---

## 2. Runtime Performance Analysis with Chrome DevTools

### 2.1 Setting Up Performance Recording

#### Prepare Your Test Environment
1. Close other tabs and applications
2. Clear browser cache and data
3. Disable browser extensions temporarily
4. Set CPU throttling to 4x slowdown (DevTools → Performance → CPU)

#### Recording Performance Profile
1. Open DevTools → **Performance** tab
2. Click the **Record** button (circle)
3. Perform your test scenario:
   - Navigate to storyboard page
   - Wait for full load
   - Drag tasks around
   - Open/close dialogs
4. Click **Stop** recording

### 2.2 Understanding the Performance Timeline

#### Main Thread Sections

**Scripting (Yellow):**
- JavaScript execution time
- Event handlers, React rendering, state updates
- Look for long yellow bars indicating slow JS execution

**Rendering (Purple):**
- Layout calculations and style recalculations
- DOM updates and reflows
- Wide purple bars suggest layout thrashing

**Painting (Green):**
- Actual pixel drawing to screen
- Canvas operations, image rendering
- Usually fast, but can indicate rendering bottlenecks

**System (Gray):**
- Browser internal operations
- Usually not actionable for app optimization

#### Identifying Performance Issues

**Long Tasks (>50ms):**
- Red bars in the timeline
- Cause frame drops and jank
- Look for patterns in what triggers them

**JavaScript Bottlenecks:**
- Long yellow bars in Scripting section
- Hover over bars to see function names
- Check the **Bottom-Up** tab for function-level analysis

**Layout Thrashing:**
- Multiple purple bars close together
- Indicates forced reflows
- Common with DOM queries in loops

### 2.3 Analyzing Function Performance

#### Bottom-Up Tab Analysis
1. Go to **Bottom-Up** tab after recording
2. Sort by **Self Time** to see most expensive functions
3. Look for:
   - React component functions
   - Event handlers
   - State update functions
   - API calls

#### Call Tree Analysis
1. Go to **Call Tree** tab
2. Expand the main execution path
3. Identify the call chain causing performance issues
4. Look for repeated function calls

---

## 3. Creating Performance Baselines

### 3.1 Standardized Test Scenarios

#### Test 1: Page Load Performance
**Setup:**
- Fresh browser session
- Clear cache and data
- CPU throttling: 4x slowdown
- Network throttling: Fast 3G

**Test Steps:**
1. Start performance recording
2. Navigate to storyboard page
3. Wait for full page load (all images, data loaded)
4. Stop recording

**Metrics to Record:**
- Time to First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Total page load time
- Main thread blocking time

#### Test 2: Interactive Performance
**Setup:**
- Same environment as Test 1
- Page already loaded

**Test Steps:**
1. Start performance recording
2. Drag a task from "To Do" to "In Progress"
3. Drag another task between columns
4. Open Create Story dialog
5. Close dialog
6. Stop recording

**Metrics to Record:**
- Interaction to Next Paint (INP)
- Total script execution time
- Longest task duration
- Number of layout recalculations

#### Test 3: Memory Usage
**Setup:**
- Same environment
- Page loaded

**Test Steps:**
1. Open Memory tab in DevTools
2. Take heap snapshot
3. Perform 10 task drags
4. Take another heap snapshot
5. Compare snapshots

**Metrics to Record:**
- Memory usage before/after
- Object count changes
- Potential memory leaks

### 3.2 Recording and Documenting Results

#### Create a Performance Log
```
Date: [Date]
Environment: [Browser, OS, CPU throttling]
Test: [Test name]

Metrics:
- FCP: [time]ms
- LCP: [time]ms
- INP: [time]ms
- Total JS time: [time]ms
- Longest task: [time]ms
- Memory usage: [MB]

Observations:
- [What you noticed during testing]
- [Any visual glitches or delays]
- [Components that seemed slow]

Screenshots:
- [Attach profiler flamegraphs]
- [Performance timeline screenshots]
- [Memory snapshot comparisons]
```

---

## 4. Interpreting Results and Next Steps

### 4.1 Performance Thresholds

**Good Performance:**
- FCP: < 1.8s
- LCP: < 2.5s
- INP: < 200ms
- Long tasks: < 50ms

**Needs Optimization:**
- FCP: > 2.5s
- LCP: > 4s
- INP: > 500ms
- Long tasks: > 100ms

### 4.2 Common Issues to Look For

**React-Specific:**
- Unnecessary re-renders
- Missing React.memo or useMemo
- Expensive calculations in render
- Large component trees

**JavaScript Performance:**
- Long-running loops
- Expensive DOM queries
- Memory leaks
- Event handler inefficiencies

**Layout Issues:**
- Forced reflows
- Layout thrashing
- Expensive CSS calculations
- Large DOM trees

---

## 5. Action Plan After Profiling

### 5.1 Immediate Actions
1. **Document all findings** in the performance log
2. **Take screenshots** of profiler results
3. **Identify top 3 bottlenecks** based on data
4. **Measure impact** of each issue (time saved if fixed)

### 5.2 Optimization Strategy
1. **Start with high-impact, low-effort fixes**
2. **Focus on user-facing performance** (INP, LCP)
3. **Create before/after benchmarks** for each fix
4. **Test optimizations** in the same environment

---

## Next Steps

After completing this profiling:

1. **Run all three test scenarios** multiple times
2. **Document results** in the performance log
3. **Take screenshots** of profiler graphs and timelines
4. **Share the data** with me for analysis
5. **We'll create a data-driven optimization plan** based on real bottlenecks

This systematic approach will give us concrete data to work with, moving beyond assumptions to evidence-based optimization strategies.
