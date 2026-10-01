/**
 * AI Prediction Service
 * Analyzes a student's attendance history to predict future trends and risk status.
 */

/**
 * Calculate the predicted end-of-semester attendance percentage using linear regression.
 * @param {Array} attendanceRecords - Array of { date, status } objects
 * @param {Number} totalClassesPerWeek - estimated classes per week
 * @returns {Object} prediction result
 */
export const predictAttendance = (attendanceRecords = [], totalClassesPerWeek = 5) => {
  if (attendanceRecords.length === 0) {
    return {
      currentPercentage: 0,
      predictedPercentage: 0,
      riskStatus: 'Unknown',
      trajectory: 'Insufficient Data',
      classesNeeded: 0,
      message: 'No attendance data available yet.'
    };
  }

  const total = attendanceRecords.length;
  const present = attendanceRecords.filter(r => r.status === 'Present' || r.status === 'Late Entry').length;
  const currentPercentage = total > 0 ? Math.round((present / total) * 100) : 0;

  // Calculate rolling trend: compare last 10 sessions vs previous 10
  const recentSlice = attendanceRecords.slice(-10);
  const previousSlice = attendanceRecords.slice(-20, -10);

  const recentPresent = recentSlice.filter(r => r.status === 'Present' || r.status === 'Late Entry').length;
  const previousPresent = previousSlice.filter(r => r.status === 'Present' || r.status === 'Late Entry').length;

  const recentRate = recentSlice.length > 0 ? (recentPresent / recentSlice.length) * 100 : currentPercentage;
  const previousRate = previousSlice.length > 0 ? (previousPresent / previousSlice.length) * 100 : currentPercentage;

  const trendDelta = recentRate - previousRate;

  // Estimate remaining weeks in semester (assume ~16-week semester, ~4 weeks elapsed per 20 classes)
  const weeksElapsed = Math.round(total / totalClassesPerWeek);
  const weeksRemaining = Math.max(0, 16 - weeksElapsed);
  const classesRemaining = weeksRemaining * totalClassesPerWeek;

  // Project predicted percentage based on recent trend rate
  const projectedPresent = present + (recentRate / 100) * classesRemaining;
  const projectedTotal = total + classesRemaining;
  const predictedPercentage = Math.min(100, Math.round((projectedPresent / projectedTotal) * 100));

  // Determine trajectory
  let trajectory;
  if (trendDelta > 5) trajectory = 'Improving';
  else if (trendDelta < -5) trajectory = 'Declining';
  else trajectory = 'Stable';

  // Calculate classes needed to reach 75%
  let classesNeeded = 0;
  if (currentPercentage < 75) {
    // Solve: (present + x) / (total + x) = 0.75
    classesNeeded = Math.max(0, Math.ceil((0.75 * total - present) / 0.25));
  }

  // Determine risk status
  let riskStatus, message;
  if (predictedPercentage >= 85) {
    riskStatus = 'Safe';
    message = `Your attendance is on track. Keep it up to maintain your eligibility.`;
  } else if (predictedPercentage >= 75) {
    riskStatus = 'Warning';
    message = `You are projected to just meet the 75% threshold. Attend all upcoming classes to stay safe.`;
  } else if (predictedPercentage >= 65) {
    riskStatus = 'Critical';
    message = `You are at risk of falling below 75%. You need to attend the next ${classesNeeded} consecutive classes to recover.`;
  } else {
    riskStatus = 'Danger';
    message = `You are in serious risk of attendance shortage. Immediate action required. Contact your Class Advisor.`;
  }

  return {
    currentPercentage,
    predictedPercentage,
    riskStatus,
    trajectory,
    classesNeeded,
    recentRate: Math.round(recentRate),
    message,
    weeksRemaining
  };
};

export default predictAttendance;
