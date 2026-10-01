import express from 'express';
import {
  getAdminStats,
  getUsers, createUser, updateUser, deleteUser,
  getStudents, updateStudent, deleteStudent, getFaculty, updateFaculty, deleteFaculty,
  getDepartments, createDepartment, updateDepartment, deleteDepartment,
  getCourses, createCourse, updateCourse, deleteCourse,
  getAcademicYears, createAcademicYear, updateAcademicYear, deleteAcademicYear,
  getSemesters, createSemester, updateSemester, deleteSemester,
  getSubjects, createSubject, updateSubject, deleteSubject,
  getAllocations, createAllocation, deleteAllocation,
  getSections, createSection, updateSection, deleteSection, getAttendanceStats, getRecentActivities
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Apply auth & admin guard to all routes
router.use(protect);
router.use(authorize('admin'));

// Stats
router.get('/stats', getAdminStats);
router.get('/attendance-stats', getAttendanceStats);
router.get('/activities', getRecentActivities);

// Users
router.route('/users')
  .get(getUsers)
  .post(createUser);

router.route('/users/:id')
  .put(updateUser)
  .delete(deleteUser);

// Students & Faculty
router.route('/students').get(getStudents).post(createUser);
router.route('/students/:id').put(updateStudent).delete(deleteStudent);

router.route('/faculty').get(getFaculty).post(createUser);
router.route('/faculty/:id').put(updateFaculty).delete(deleteFaculty);

// Departments
router.route('/departments')
  .get(getDepartments)
  .post(createDepartment);

router.route('/departments/:id')
  .put(updateDepartment)
  .delete(deleteDepartment);

// Courses
router.route('/courses')
  .get(getCourses)
  .post(createCourse);

router.route('/courses/:id')
  .put(updateCourse)
  .delete(deleteCourse);

// Academic Years
router.route('/academic-years')
  .get(getAcademicYears)
  .post(createAcademicYear);

router.route('/academic-years/:id')
  .put(updateAcademicYear)
  .delete(deleteAcademicYear);

// Semesters
router.route('/semesters')
  .get(getSemesters)
  .post(createSemester);

router.route('/semesters/:id')
  .put(updateSemester)
  .delete(deleteSemester);

// Subjects
router.route('/subjects')
  .get(getSubjects)
  .post(createSubject);

router.route('/subjects/:id')
  .put(updateSubject)
  .delete(deleteSubject);

// Faculty Allocations (assign subjects to faculty)
router.route('/allocations')
  .get(getAllocations)
  .post(createAllocation);

router.route('/allocations/:id')
  .delete(deleteAllocation);

// Sections
router.route('/sections')
  .get(getSections)
  .post(createSection);

router.route('/sections/:id')
  .put(updateSection)
  .delete(deleteSection);

export default router;

