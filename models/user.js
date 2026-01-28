const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  // Primary Key
  PK_UserId: { type: String, required: true, unique: true, index: true },
  
  // Login Information
  LoginName: { type: String, required: true, unique: true },
  UserName: { type: String, required: true },
  ShortName: { type: String },
  Password: { type: String, required: true },
  
  // Foreign Keys
  FK_UserTypeId: { type: String },
  Fk_EmployeeId: { type: String },
  FK_AuthTypeId: { type: String },
  FK_SubSpecialtyId: { type: String },
  FK_DefaultBranchId: { type: String },
  FK_LoginBranchId: { type: String },
  FK_DeptID: { type: String },
  FK_DefaultServiceDeptID: { type: String },
  
  // User Permissions & Settings
  IsEditableBranch: { type: Boolean, default: false },
  IsPatientTransfer: { type: Boolean, default: false },
  IsActive: { type: Boolean, default: true },
  IsExternal: { type: Boolean, default: false },
  IsCreateUser: { type: Boolean, default: false },
  IsAllowtoCA: { type: Boolean, default: false },
  IsAllowtoFA: { type: Boolean, default: false },
  IsAneasthetist: { type: Boolean, default: false },
  IsOnlineShow: { type: Boolean, default: false },
  IsLockLocation: { type: Boolean, default: false },
  IsUserNameLock: { type: Boolean, default: false },
  IsApprovalAuthorized: { type: Boolean, default: false },
  
  // Room & Schedule
  RoomNo: { type: String },
  DefaultRoomNo: { type: String },
  ScheduleWeekDays: { type: String },
  
  // Login Status
  LoginStatus: { type: String },
  LoginIP: { type: String },
  LoginDateTime: { type: Date },
  
  // Doctor & Specialist Info
  DefaultOptomID: { type: String },
  DoctorPage: { type: String },
  DiagnosisDept: { type: String },
  DoctorWorkupPatternScreen: { type: Boolean, default: false },
  
  // Consultation & Services
  TeleConsultation: { type: Boolean, default: false },
  Discount: { type: Number, default: 0 },
  NetConsultation: { type: Boolean, default: false },
  PRHelpF3: { type: Boolean, default: false },
  
  // Personal Information
  MobileNo: { type: String },
  Email: { type: String },
  DOB: { type: Date },
  Gender: { type: String, enum: ['Male', 'Female', 'Other', ''] },
  NationalID: { type: String },
  RegistrationNo: { type: String },
  ClinicName: { type: String },
  Specialization: { type: String },
  UserType: { type: String },
  
  // Sync
  PK_SynchId: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('UserMaster', UserSchema);
