import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { 
  UserPlus, 
  Search, 
  Calendar, 
  Clock, 
  Clock3, 
  CheckCircle2, 
  XCircle,
  Users as UsersIcon,
  ChevronRight,
  ClipboardList,
  MoreVertical,
  ShieldCheck,
  User,
  Camera,
  AlertCircle,
  FileText,
  UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Employee, Attendance } from '../types';

export default function Employees() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { employees, attendance, addAttendance, addEmployee } = useData();
  const [activeTab, setActiveTab] = useState<'list' | 'attendance' | 'schedule'>('list');
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [attendanceType, setAttendanceType] = useState<'present' | 'sick' | 'alpha' | null>(null);
  
  // New Employee Form State
  const [newEmployee, setNewEmployee] = useState<Partial<Employee>>({
    name: '',
    role: 'Kasir',
    employeeId: '',
    businessType: user?.businessType || 'Perdagangan',
    schedule: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum']
  });

  // Attendance Form State
  const [inputEmpId, setInputEmpId] = useState('');
  const [medicalProof, setMedicalProof] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmployee.name || !newEmployee.employeeId) return;

    const emp: Employee = {
      id: Math.random().toString(36).substr(2, 9),
      employeeId: newEmployee.employeeId.toUpperCase(),
      name: newEmployee.name,
      role: newEmployee.role || 'Kasir',
      businessType: user?.businessType || 'Perdagangan',
      schedule: newEmployee.schedule || ['Sen', 'Sel', 'Rab', 'Kam', 'Jum']
    };

    addEmployee(emp);
    setShowAddEmployeeModal(false);
    setNewEmployee({
      name: '',
      role: 'Kasir',
      employeeId: '',
      businessType: user?.businessType || 'Perdagangan',
      schedule: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum']
    });
  };

  const handleAttendanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const employee = employees.find(emp => emp.employeeId.toUpperCase() === inputEmpId.toUpperCase());
    
    if (!employee) {
      setError('ID Karyawan tidak terdaftar.');
      return;
    }

    const alreadyCheckedIn = attendance.find(a => a.employeeId === employee.id && a.date === new Date().toLocaleDateString());
    if (alreadyCheckedIn) {
      setError('Karyawan sudah melakukan absensi hari ini.');
      return;
    }

    const now = new Date();
    const clockInTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    // Rule: Late if after 08:30
    const isLate = now.getHours() > 8 || (now.getHours() === 8 && now.getMinutes() > 30);

    const newAttendance: Attendance = {
      id: Math.random().toString(36).substr(2, 9),
      employeeId: employee.id,
      date: now.toLocaleDateString(),
      clockIn: clockInTime,
      status: attendanceType === 'sick' ? 'sick' : (isLate ? 'late' : 'present'),
      medicalProofUrl: medicalProof || undefined
    };

    addAttendance(newAttendance);
    resetForm();
  };

  const manualAlpha = (employeeId: string) => {
    const now = new Date();
    const newAttendance: Attendance = {
      id: Math.random().toString(36).substr(2, 9),
      employeeId: employeeId,
      date: now.toLocaleDateString(),
      clockIn: '--:--',
      status: 'alpha'
    };
    addAttendance(newAttendance);
  };

  const resetForm = () => {
    setShowAttendanceModal(false);
    setAttendanceType(null);
    setInputEmpId('');
    setMedicalProof(null);
    setError('');
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('employees')}</h1>
          <p className="text-gray-500 dark:text-zinc-400">Kelola kehadiran dengan amanah dan transparan.</p>
        </div>
        <div className="flex gap-2">
           <button className="bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-zinc-800 border border-gray-100 dark:border-zinc-800 transition-all">
            <ClipboardList className="size-5" /> Rekap Absen
          </button>
          <button 
            onClick={() => setShowAddEmployeeModal(true)}
            className="bg-primary text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-primary/20"
          >
            <UserPlus className="size-5" /> Tambah Karyawan
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 p-1 bg-gray-100 dark:bg-zinc-800 rounded-2xl w-fit">
        {[
          { id: 'list', name: 'Data Karyawan', icon: UsersIcon },
          { id: 'attendance', name: 'Absensi Hari Ini', icon: Clock },
          { id: 'schedule', name: 'Jadwal Tugas', icon: Calendar },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
              activeTab === tab.id 
                ? 'bg-white dark:bg-zinc-900 text-primary shadow-sm' 
                : 'text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-white'
            }`}
          >
            <tab.icon className="size-4" />
            {tab.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Section */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'list' && (
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden">
               <div className="p-6 border-b border-gray-50 dark:border-zinc-800 flex items-center justify-between">
                 <h3 className="font-bold text-gray-900 dark:text-white">Seluruh Karyawan</h3>
                 <div className="relative">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                   <input type="text" placeholder="Cari..." className="pl-9 pr-4 py-1.5 bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-xl text-xs focus:outline-none dark:text-white" />
                 </div>
               </div>
               <div className="divide-y divide-gray-50 dark:divide-zinc-800">
                 {employees.length === 0 ? (
                   <div className="p-12 text-center text-gray-400">
                     <UsersIcon className="size-12 mx-auto mb-4 opacity-10" />
                     <p className="text-sm font-bold tracking-wide">Belum ada data karyawan.</p>
                   </div>
                 ) : employees.map(emp => {
                   const todayAttendance = attendance.find(a => a.employeeId === emp.id && a.date === new Date().toLocaleDateString());
                   
                   return (
                     <div key={emp.id} className="flex items-center justify-between p-6 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                       <div className="flex items-center gap-4">
                         <div className="w-12 h-12 rounded-2xl bg-primary-light flex items-center justify-center text-primary font-bold">
                           {emp.name.charAt(0)}
                         </div>
                         <div>
                           <div className="flex items-center gap-2">
                             <p className="font-bold text-gray-900 dark:text-white">{emp.name}</p>
                             <span className="text-[10px] bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 px-2 py-0.5 rounded-md font-bold">{emp.employeeId}</span>
                           </div>
                           <p className="text-xs text-gray-400 dark:text-zinc-500">{emp.role} • {emp.businessType}</p>
                         </div>
                       </div>
                       <div className="flex items-center gap-8">
                         <div className="text-right">
                           <p className="text-[10px] uppercase font-bold text-gray-400 dark:text-zinc-500 tracking-widest mb-1">Status Hari Ini</p>
                           {todayAttendance ? (
                             <div className={`flex items-center gap-1.5 font-bold text-xs justify-end ${
                               todayAttendance.status === 'present' ? 'text-green-600' : 
                               todayAttendance.status === 'late' ? 'text-amber-600' :
                               todayAttendance.status === 'sick' ? 'text-blue-600' : 'text-red-600'
                             }`}>
                               {todayAttendance.status === 'present' && <><CheckCircle2 className="size-3.5" /> Hadir</>}
                               {todayAttendance.status === 'late' && <><Clock className="size-3.5" /> Terlambat ({todayAttendance.clockIn})</>}
                               {todayAttendance.status === 'sick' && <><ShieldCheck className="size-3.5" /> Sakit (SKD)</>}
                               {todayAttendance.status === 'alpha' && <><XCircle className="size-3.5" /> Alfa</>}
                             </div>
                           ) : (
                             <button 
                               onClick={() => manualAlpha(emp.id)}
                               className="text-[10px] font-bold text-red-400 hover:text-red-600 underline transition-colors"
                             >
                               Klik Manual Alfa
                             </button>
                           )}
                         </div>
                         <button className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"><MoreVertical className="size-5" /></button>
                       </div>
                     </div>
                   );
                 })}
               </div>
            </div>
          )}

          {activeTab === 'attendance' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => { setAttendanceType('present'); setShowAttendanceModal(true); }}
                  className="bg-white dark:bg-zinc-900 p-8 rounded-[32px] border border-gray-100 dark:border-zinc-800 shadow-sm hover:shadow-xl transition-all group flex flex-col items-center gap-4"
                >
                  <div className="w-16 h-16 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <UserCheck className="size-8" />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-lg dark:text-white">Absen Hadir</p>
                    <p className="text-xs text-gray-400 dark:text-zinc-500">Scan atau Input ID Karyawan</p>
                  </div>
                </button>
                <button 
                   onClick={() => { setAttendanceType('sick'); setShowAttendanceModal(true); }}
                   className="bg-white dark:bg-zinc-900 p-8 rounded-[32px] border border-gray-100 dark:border-zinc-800 shadow-sm hover:shadow-xl transition-all group flex flex-col items-center gap-4"
                >
                  <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ShieldCheck className="size-8" />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-lg dark:text-white">Absen Sakit</p>
                    <p className="text-xs text-gray-400 dark:text-zinc-500">Lampirkan Bukti Foto SKD</p>
                  </div>
                </button>
              </div>

              <div className="bg-white dark:bg-zinc-900 rounded-[32px] border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-50 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/50 font-medium">
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm">Log Absensi Terbaru</h3>
                </div>
                <div className="divide-y divide-gray-50 dark:divide-zinc-800">
                  {attendance.length === 0 ? (
                    <div className="p-12 text-center">
                      <Clock3 className="size-12 mx-auto mb-4 text-gray-200 dark:text-zinc-800" />
                      <p className="text-sm text-gray-400 dark:text-zinc-500">Belum ada absensi untuk hari ini.</p>
                    </div>
                  ) : (
                    attendance.map(a => {
                      const emp = employees.find(e => e.id === a.employeeId);
                      return (
                        <div key={a.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-gray-400 dark:text-zinc-500">
                              <User className="size-5" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900 dark:text-white">{emp?.name}</p>
                              <p className="text-[10px] text-gray-400 dark:text-zinc-500 font-medium">{a.clockIn} • {a.date}</p>
                            </div>
                          </div>
                          <div className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                            a.status === 'present' ? 'bg-green-100 text-green-700 dark:bg-green-900/30' :
                            a.status === 'late' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30' :
                            a.status === 'sick' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30' : 'bg-red-100 text-red-700 dark:bg-red-900/30'
                          }`}>
                            {a.status}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'schedule' && (
            <div className="space-y-4">
               {['Senin', 'Selasa', 'Rabu'].map(day => (
                 <div key={day} className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm flex items-center justify-between">
                   <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-gray-600 dark:text-zinc-400">
                       {day.charAt(0)}
                     </div>
                     <h4 className="font-bold text-gray-900 dark:text-white">{day}</h4>
                   </div>
                   <div className="flex -space-x-2">
                     {[1,2,3].map(i => (
                        <div key={i} className="w-8 h-8 rounded-full bg-primary border-2 border-white dark:border-zinc-900 flex items-center justify-center text-white text-[10px] font-bold">
                          K{i}
                        </div>
                     ))}
                   </div>
                 </div>
               ))}
            </div>
          )}
        </div>

        {/* Sidebar Statistics */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm">
            <h3 className="font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Clock className="size-5 text-primary" /> Ringkasan Absensi
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-green-50 dark:bg-green-900/10 p-4 rounded-2xl border border-green-100 dark:border-green-900/20">
                 <span className="text-sm font-bold text-green-700 dark:text-green-500">Tepat Waktu</span>
                 <span className="text-lg font-bold text-green-700 dark:text-green-500">{attendance.filter(a => a.status === 'present').length}</span>
              </div>
              <div className="flex justify-between items-center bg-red-50 dark:bg-red-900/10 p-4 rounded-2xl border border-red-100 dark:border-red-900/20">
                 <span className="text-sm font-bold text-red-700 dark:text-red-500">Terlambat</span>
                 <span className="text-lg font-bold text-red-700 dark:text-red-500">{attendance.filter(a => a.status === 'late').length}</span>
              </div>
              <div className="flex justify-between items-center bg-gray-50 dark:bg-zinc-800 p-4 rounded-2xl border border-gray-100 dark:border-zinc-700">
                 <span className="text-sm font-bold text-gray-600 dark:text-zinc-400">Izin/Sakit/Alpha</span>
                 <span className="text-lg font-bold text-gray-600 dark:text-zinc-400">{attendance.filter(a => ['sick', 'alpha'].includes(a.status)).length}</span>
              </div>
            </div>
          </div>

          <div className="bg-primary p-6 rounded-3xl text-white shadow-lg shadow-primary/20">
            <h3 className="font-bold mb-2">Pilar Kedisiplinan</h3>
            <p className="text-xs opacity-70 mb-4 font-normal">Ketepatan waktu adalah bentuk amanah kepada sesama manusia dan tanggung jawab kepada Sang Pencipta.</p>
            <div className="w-full bg-white/10 p-4 rounded-2xl flex items-center gap-3">
               <ShieldCheck className="size-6 text-green-300" />
               <p className="text-[10px] font-bold uppercase tracking-widest">Sistem Terverifikasi</p>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Modal */}
      <AnimatePresence>
        {showAttendanceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={resetForm}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative max-w-sm w-full bg-white dark:bg-zinc-900 rounded-[40px] shadow-2xl p-8 border border-gray-100 dark:border-zinc-800"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                   <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${attendanceType === 'sick' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'bg-green-50 dark:bg-green-900/20 text-green-600'}`}>
                     {attendanceType === 'sick' ? <ShieldCheck className="size-6" /> : <UserCheck className="size-6" />}
                   </div>
                   <h3 className="font-bold text-xl dark:text-white">{attendanceType === 'sick' ? 'Absensi Sakit' : 'Absensi Hadir'}</h3>
                </div>
                <button onClick={resetForm} className="text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"><XCircle className="size-6" /></button>
              </div>

              <form onSubmit={handleAttendanceSubmit} className="space-y-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">ID Karyawan</label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Contoh: EMP001"
                      value={inputEmpId}
                      onChange={e => setInputEmpId(e.target.value)}
                      required
                      className="w-full pl-12 pr-6 py-4 bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all font-bold tracking-widest dark:text-white"
                    />
                  </div>
                </div>

                {attendanceType === 'sick' && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Bukti Foto SKD</label>
                    <div className="relative border-2 border-dashed border-gray-200 dark:border-zinc-700 rounded-2xl p-6 text-center group hover:border-primary/50 transition-all cursor-pointer">
                      <input 
                        type="file" 
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            setMedicalProof(URL.createObjectURL(e.target.files[0]));
                          }
                        }}
                      />
                      {medicalProof ? (
                        <div className="flex items-center justify-center gap-2 text-green-600 font-bold text-xs">
                          <CheckCircle2 className="size-4" /> Foto Terlampir
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Camera className="size-8 mx-auto text-gray-300 group-hover:text-primary transition-colors" />
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ambil atau Unggah Foto</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-500 p-4 rounded-2xl flex items-center gap-3 text-xs font-bold leading-tight">
                    <AlertCircle className="size-5 shrink-0" />
                    {error}
                  </div>
                )}

                <button 
                  type="submit"
                  className="w-full bg-primary text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 shadow-lg shadow-primary/20 transition-all"
                >
                  <UserCheck className="size-5" /> Konfirmasi Absensi
                </button>

                <p className="text-[10px] text-gray-400 dark:text-zinc-500 text-center leading-relaxed">
                  Dengan mengonfirmasi, Anda menyatakan bahwa data yang diberikan adalah benar dan jujur.
                </p>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Employee Modal */}
      <AnimatePresence>
        {showAddEmployeeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddEmployeeModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative max-w-md w-full bg-white dark:bg-zinc-900 rounded-[40px] shadow-2xl p-8 border border-gray-100 dark:border-zinc-800"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                   <div className="w-10 h-10 rounded-xl bg-primary-light text-primary flex items-center justify-center">
                     <UserPlus className="size-6" />
                   </div>
                   <h3 className="font-bold text-xl dark:text-white">Tambah Karyawan</h3>
                </div>
                <button onClick={() => setShowAddEmployeeModal(false)} className="text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"><XCircle className="size-6" /></button>
              </div>

              <form onSubmit={handleAddEmployee} className="space-y-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
                  <input 
                    type="text" 
                    placeholder="Contoh: Siti Rahma"
                    value={newEmployee.name}
                    onChange={e => setNewEmployee({...newEmployee, name: e.target.value})}
                    required
                    className="w-full px-6 py-4 bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all font-bold dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">ID Karyawan</label>
                  <input 
                    type="text" 
                    placeholder="Contoh: EMP001"
                    value={newEmployee.employeeId}
                    onChange={e => setNewEmployee({...newEmployee, employeeId: e.target.value})}
                    required
                    className="w-full px-6 py-4 bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all font-bold tracking-widest dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Jabatan</label>
                  <select 
                    value={newEmployee.role}
                    onChange={e => setNewEmployee({...newEmployee, role: e.target.value})}
                    className="w-full px-6 py-4 bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-2xl focus:outline-none font-bold dark:text-white"
                  >
                    <option value="Kasir">Kasir</option>
                    <option value="Staff Gudang">Staff Gudang</option>
                    <option value="Supervisor">Supervisor</option>
                    <option value="Kurir">Kurir</option>
                  </select>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-primary text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 shadow-lg shadow-primary/20 transition-all"
                >
                  Daftarkan Karyawan
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
