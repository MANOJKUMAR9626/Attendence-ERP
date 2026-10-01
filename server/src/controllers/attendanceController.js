import Attendance from '../models/Attendance.js';
import AttendanceSession from '../models/AttendanceSession.js';
import Student from '../models/Student.js';
import Settings from '../models/Settings.js';
import Notification from '../models/Notification.js';
import sendEmail from '../utils/sendEmail.js';
import smsService from '../services/sms/smsService.js';
import ActivityLog from '../models/ActivityLog.js';
import User from '../models/User.js';

// @desc    Mark attendance for a session (Bulk)
// @route   POST /api/v1/attendance/mark
// @access  Private (Faculty/Admin)
export const markAttendance = async (req, res, next) => {
  try {
    const demoNotifications = [];
    const { sessionId, records } = req.body;
    // records: [{ student: 'id', status: 'Present', remarks: '' }]

    const session = await AttendanceSession.findById(sessionId).populate('subject');
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

    if (session.isLocked) {
      return res.status(400).json({ success: false, message: 'Attendance for this session is locked' });
    }

    const Faculty = (await import('../models/Faculty.js')).default;
    const facultyRecord = await Faculty.findOne({ user: req.user.id });
    const facultyId = facultyRecord ? facultyRecord._id : req.user.id;

    const attendanceRecords = records.map(r => ({
      session: sessionId,
      student: r.student,
      faculty: facultyId,
      subject: session.subject,
      date: session.date,
      status: r.status,
      remarks: r.remarks,
    }));

    // Upsert records (create if not exists, update if exists)
    const operations = attendanceRecords.map(record => ({
      updateOne: {
        filter: { session: record.session, student: record.student },
        update: { $set: record },
        upsert: true,
      }
    }));

    await Attendance.bulkWrite(operations);
    
    // Update session status
    session.status = 'Conducted';
    await session.save();

    // Log the activity
    const userObj = await User.findById(req.user.id);
    const subjectName = session.subject?.name || session.subject?.code || 'Class';
    const sectionName = session.section?.name || '';
    const classInfo = `${subjectName} ${sectionName}`.trim();
    
    await ActivityLog.create({
      user: req.user.id,
      activityType: 'MARK_ATTENDANCE',
      description: `Attendance marked by ${userObj ? userObj.name : 'Faculty'} for ${classInfo}`
    });

    // Respond instantly to client
    res.status(200).json({ success: true, message: 'Attendance marked successfully', demoNotifications: [] });

    // ─── BACKGROUND PROCESSING: AI RISK & EMAIL ALERT LOGIC ──────────────────────────────────────
    (async () => {
      try {
        let settings = await Settings.findOne();
        const threshold = settings?.attendanceConfig?.warningThreshold || 80;

        // Check if the full day attendance is completed (i.e., Period 4 is conducted)
        let isFullDayCompleted = Number(session.periodNumber) === 4;
        if (!isFullDayCompleted) {
          const p4 = await AttendanceSession.findOne({
            date: session.date,
            section: session.section,
            periodNumber: 4,
            status: 'Conducted'
          });
          if (p4) isFullDayCompleted = true;
        }

        for (const r of records) {
       const allRecords = await Attendance.find({ student: r.student });
       const total = allRecords.length;
       const presentCount = allRecords.filter(x => ['Present', 'Late Entry', 'On Duty', 'Sports', 'Placement', 'Internship', 'Industrial Visit'].includes(x.status)).length;
       const halfDayCount = allRecords.filter(x => x.status === 'Half Day').length;
       const present = presentCount + (halfDayCount * 0.5);
       const percentage = total === 0 ? 0 : Math.round((present / total) * 100);

       // Update student cached attendance summary
       await Student.findByIdAndUpdate(r.student, {
         'attendanceSummary.overallPercentage': percentage,
         'attendanceSummary.totalPresent': present,
         'attendanceSummary.totalAbsent': total - present,
         'attendanceSummary.totalClasses': total,
         'attendanceSummary.lastUpdated': new Date(),
         aiRiskLevel: percentage < (threshold - 10) ? 'Critical' : (percentage < threshold ? 'High' : (percentage < 85 ? 'Medium' : 'Low'))
       });

       const studentObj = await Student.findById(r.student).populate('user').populate({
         path: 'parents',
         populate: { path: 'user' }
       });

        if (percentage < threshold && studentObj && isFullDayCompleted) {
          console.log(`[DEBUG] Condition met for student ${studentObj.user.name}, Percentage: ${percentage}`);
          const riskLevel = percentage < (threshold - 10) ? 'Critical' : 'High';
          
          if (studentObj.parents && studentObj.parents.length > 0) {
            const parent = studentObj.parents[0]; 
            console.log(`[DEBUG] Found parent user phone: ${parent.user?.phone}`);
            if (parent.user) {
              const startOfToday = new Date();
              startOfToday.setHours(0, 0, 0, 0);
              
              if (true) { // User requested email every time 4th period is marked, regardless of previous emails
               const messageHTML = `
                 <div style="font-family: Arial, sans-serif; background-color: #eff2fa; padding: 40px; border-radius: 16px; max-width: 550px; margin: 0 auto; color: #1e293b;">
                   <div style="text-align: center; margin-bottom: 25px;">
                     <h2 style="margin: 0; color: #0f172a; font-size: 24px;">
                       🎓 SmartERP
                     </h2>
                     <p style="margin: 5px 0 0; font-size: 12px; color: #64748b;">BIT Student Attendance Management System</p>
                   </div>
                   
                   <div style="background-color: #ffffff; padding: 32px; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
                     <p style="font-size: 15px; font-weight: bold; margin-top: 0; color: #1e293b;">Dear Parent,</p>
                     
                     <p style="font-size: 14px; line-height: 1.6; color: #334155;">
                       This is to inform you that your ward <strong>${studentObj.user.name}</strong> currently has an attendance percentage of <strong style="color: #ef4444;">${Math.round(percentage)}%</strong>.
                     </p>
                     
                     <p style="font-size: 14px; line-height: 1.6; color: #334155;">
                       The attendance percentage is below the required ${threshold}% threshold.
                     </p>
                     
                     <div style="background-color: #f1f5f9; border-radius: 12px; padding: 24px; margin: 24px 0;">
                       <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                         <tr>
                           <td style="padding: 6px 0; color: #475569; font-weight: 500; text-align: center;">Current Attendance</td>
                           <td style="padding: 6px 0; color: #475569; width: 20px; text-align: center;">:</td>
                           <td style="padding: 6px 0; font-weight: bold; color: #ef4444; text-align: center;">${Math.round(percentage)}%</td>
                         </tr>
                         <tr>
                           <td style="padding: 6px 0; color: #475569; font-weight: 500; text-align: center;">Required Attendance</td>
                           <td style="padding: 6px 0; color: #475569; text-align: center;">:</td>
                           <td style="padding: 6px 0; font-weight: bold; color: #0f172a; text-align: center;">${threshold}%</td>
                         </tr>
                         <tr>
                           <td style="padding: 6px 0; color: #475569; font-weight: 500; text-align: center;">Risk Level</td>
                           <td style="padding: 6px 0; color: #475569; text-align: center;">:</td>
                           <td style="padding: 6px 0; text-align: center;">
                             <span style="background-color: #fee2e2; color: #ef4444; padding: 4px 12px; border-radius: 20px; font-weight: bold; font-size: 12px;">${riskLevel}</span>
                           </td>
                         </tr>
                       </table>
                     </div>
                     
                     <p style="font-size: 14px; line-height: 1.6; color: #334155; margin-bottom: 24px;">
                       Please encourage your ward to attend upcoming classes regularly and improve their attendance.
                     </p>
                     
                     <div style="font-size: 13px; color: #475569; line-height: 1.5;">
                       Regards,<br/>
                       <strong style="color: #0f172a;">SmartERP</strong><br/>
                       BIT Student Attendance Management System
                     </div>
                   </div>
                 </div>
               `;

               // Send email only if parent email exists
               if (parent.user.email) {
                 console.log(
                   `Sending email to ${parent.user.email} for student ${studentObj.user.name} (Percentage: ${percentage}%)`
                 );

                 sendEmail({
                   email: parent.user.email,
                   subject: `Attendance Alert - ${studentObj.user.name}`,
                   html: messageHTML,
                   message: `Attendance is below ${threshold}%`
                 }).catch(e => console.error("Email failed:", e));
               }

               // Get AI Recommendation string matching faculty dashboard
               let rec = 'Improve attendance';
               if (Math.round(percentage) < 65) {
                 rec = 'Mandatory counseling required';
               } else if (Math.round(percentage) < 75) {
                 rec = 'Attend more classes immediately';
               }
               
               const advName = studentObj.classAdvisor?.user?.name || 'Class Advisor';

               // Create notification for parent
               const isDemoMode = process.env.DEMO_SMS_MODE === 'true';
               await Notification.create({
                 recipient: parent.user._id,
                 type: 'Attendance Alert',
                 title: 'AI Attendance Recommendation',
                 message: `Your ward's attendance is ${Math.round(percentage)}%. Recommendation: ${rec}. Please consult your child's class advisor, ${advName}.`,
                 priority: riskLevel === 'Critical' ? 'Urgent' : 'High',
                 deliveryMethods: ['In-App', 'Email', 'SMS'],
                 deliveryStatus: { email: 'Sent', sms: isDemoMode ? 'Sent' : 'Pending' }
               });
             }
             
             // Send SMS (Independent of email)
             if (parent.user?.phone) {
               console.log(
                 `📱 Checking SMS delivery to parent ${parent.user.phone} for ${studentObj.user.name} - ${Math.round(percentage)}%`
               );

               const smsResult = await smsService.sendAttendanceAlert(studentObj, parent, percentage, threshold);

               if (smsResult) {
                 console.log('📨 SMS Result:', smsResult);
                 if (smsResult.isDemo) {
                   demoNotifications.push(smsResult);
                 }
               }
             }
           }
         }
         
         const startOfToday = new Date();
         startOfToday.setHours(0, 0, 0, 0);
         
         // Create notification for student
         const recentStudentNotif = await Notification.findOne({
           recipient: studentObj.user._id,
           type: 'Attendance Alert',
           createdAt: { $gte: startOfToday }
         });

         if (!recentStudentNotif) {
           let recStudent = 'Improve attendance';
           if (Math.round(percentage) < 65) {
             recStudent = 'Mandatory counseling required';
           } else if (Math.round(percentage) < 75) {
             recStudent = 'Attend more classes immediately';
           }
           const advNameStudent = studentObj.classAdvisor?.user?.name || 'Class Advisor';
           
           await Notification.create({
             recipient: studentObj.user._id,
             type: 'Attendance Alert',
             title: 'AI Attendance Recommendation',
             message: `Your overall attendance is ${Math.round(percentage)}%. Recommendation: ${recStudent} by ${advNameStudent}.`,
             priority: riskLevel === 'Critical' ? 'Urgent' : 'High',
             deliveryMethods: ['In-App']
           });
         }
       }

        // Standard "System" Attendance Marked notifications have been removed as requested.
        }
      } catch (backgroundError) {
        console.error('Background processing error in markAttendance:', backgroundError);
      }
    })();

  } catch (error) {
    next(error);
  }
};

// @desc    Get student attendance summary
// @route   GET /api/v1/attendance/summary/:studentId
// @access  Private
export const getStudentSummary = async (req, res, next) => {
  try {
    const records = await Attendance.find({ student: req.params.studentId });
    
    const total = records.length;
    const presentCount = records.filter(r => ['Present', 'Late Entry', 'On Duty', 'Sports', 'Placement', 'Internship', 'Industrial Visit'].includes(r.status)).length;
    const halfDayCount = records.filter(r => r.status === 'Half Day').length;
    const present = presentCount + (halfDayCount * 0.5);
    
    const percentage = total === 0 ? 0 : Math.round((present / total) * 100);

    res.status(200).json({
      success: true,
      data: {
        total,
        present,
        absent: total - present,
        percentage: Number(percentage)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get or create attendance session
// @route   POST /api/v1/attendance/session
// @access  Private (Faculty/Admin)
export const getOrCreateSession = async (req, res, next) => {
  try {
    const { subject, section, date, periodNumber, semester, academicYear } = req.body;
    
    if (!subject || !section || !date || !periodNumber) {
      return res.status(400).json({ success: false, message: 'Missing required fields for session' });
    }

    const sessionDate = new Date(date);
    sessionDate.setHours(0, 0, 0, 0);

    const Faculty = (await import('../models/Faculty.js')).default;
    const facultyRecord = await Faculty.findOne({ user: req.user.id });
    const facultyId = facultyRecord ? facultyRecord._id : req.user.id;

    // Academic Year fallback logic
    let resolvedAcademicYear = academicYear;
    if (!resolvedAcademicYear) {
      const Section = (await import('../models/Section.js')).default;
      const secDoc = await Section.findById(section);
      if (secDoc) {
        resolvedAcademicYear = secDoc.academicYear;
      }
    }

    let session = await AttendanceSession.findOne({
      faculty: facultyId,
      subject,
      section,
      date: sessionDate,
      periodNumber
    });

    let records = [];
    if (!session) {
      session = await AttendanceSession.create({
        faculty: facultyId,
        subject,
        section,
        semester,
        academicYear: resolvedAcademicYear,
        date: sessionDate,
        periodNumber,
        status: 'Scheduled'
      });
    } else {
      records = await Attendance.find({ session: session._id });
    }

    res.status(200).json({ success: true, data: session, records });
  } catch (error) {
    next(error);
  }
};
