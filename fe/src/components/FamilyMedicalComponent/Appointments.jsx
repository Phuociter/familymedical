
import React, { useState, useEffect, useRef, useMemo } from 'react';
import MemberAPI from '../../api/MemberAPI.js'

const AppointmentMainView = ({ member }) => {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const dateInputRef = useRef(null);

  // Filter States
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterDate, setFilterDate] = useState('');
  const [filterName, setFilterName] = useState('');

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setIsLoading(true);
        // In a real main view, we might fetch for ALL family members associated with the user, 
        // but here we use the passed 'member' or a default context
        const data = await MemberAPI.getAppointmentsByMember(member?.memberID || '123');
        setAppointments(data);
      } catch (error) {
        console.error("Failed to fetch appointments", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAppointments();
  }, [member?.memberID]);

  // Helper: Get Unique Patient Names for Dropdown
  const uniqueNames = useMemo(() => {
      const names = appointments.map(app => app.patientName).filter(Boolean);
      return [...new Set(names)];
  }, [appointments]);

  // Format helpers
  const formatDate = (dateString) => {
    const parts = dateString.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return dateString;
  };

  const formatTime = (timeString) => {
    return timeString.split(':').slice(0, 2).join(':');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'SCHEDULED': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'COMPLETED': return 'bg-green-100 text-green-700 border-green-200';
      case 'CANCELED': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'SCHEDULED': return 'Sắp tới';
      case 'COMPLETED': return 'Đã khám';
      case 'CANCELED': return 'Đã hủy';
      default: return status;
    }
  };

  const handleDateChange = (e) => {
    const val = e.target.value;
    if (!val) {
        setFilterDate('');
        return;
    }
    const [year] = val.split('-');
    if (year.length > 4) return;
    setFilterDate(val);
  };

  const filteredAppointments = useMemo(() => {
    return appointments.filter(app => {
      const matchesStatus = filterStatus === 'ALL' ? true : app.status === filterStatus;
      const matchesDate = filterDate ? app.appointmentDate === filterDate : true;
      const matchesName = filterName ? app.patientName === filterName : true;
      return matchesStatus && matchesDate && matchesName;
    });
  }, [appointments, filterStatus, filterDate, filterName]);

  return (
    <div className="h-full flex flex-col bg-gray-50 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6 flex-shrink-0">
        <h1 className="text-2xl font-bold text-gray-900">Lịch hẹn gia đình</h1>
        <p className="text-sm text-gray-500 mt-1">Quản lý và theo dõi lịch khám cho tất cả thành viên</p>
      </div>

      {/* Controls */}
      <div className="flex-shrink-0 px-8 py-4 bg-white border-b border-gray-200 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             {/* Filter Date */}
             <div 
                className={`bg-white p-2.5 rounded-xl border shadow-sm focus-within:ring-2 focus-within:ring-blue-100 transition-all cursor-pointer flex flex-col justify-center ${filterDate ? 'border-blue-300 ring-1 ring-blue-50' : 'border-gray-200'}`}
                onClick={() => {
                    try { dateInputRef.current?.showPicker(); } 
                    catch { dateInputRef.current?.focus(); }
                }}
            >
                <label className="text-xs font-bold text-gray-500 uppercase mb-0.5 cursor-pointer">Ngày khám</label>
                <input 
                    ref={dateInputRef}
                    type="date" 
                    className="w-full text-sm outline-none text-gray-700 bg-transparent cursor-pointer"
                    value={filterDate}
                    max="9999-12-31"
                    onChange={handleDateChange}
                    onClick={(e) => e.stopPropagation()}
                />
            </div>

            {/* Filter Name */}
            <div className={`bg-white p-2.5 rounded-xl border shadow-sm focus-within:ring-2 focus-within:ring-blue-100 transition-all ${filterName ? 'border-blue-300 ring-1 ring-blue-50' : 'border-gray-200'}`}>
                <label htmlFor="filter-name" className="block text-xs font-bold text-gray-500 uppercase mb-0.5">Người khám</label>
                <select
                    id="filter-name"
                    className="w-full text-sm outline-none text-gray-700 bg-transparent cursor-pointer"
                    value={filterName}
                    onChange={(e) => setFilterName(e.target.value)}
                >
                    <option value="">Tất cả thành viên</option>
                    {uniqueNames.map((name, idx) => (
                        <option key={idx} value={name}>{name}</option>
                    ))}
                </select>
            </div>
        </div>

         {/* Tabs */}
         <div className="flex gap-6 overflow-x-auto pt-2">
            {['ALL', 'SCHEDULED', 'COMPLETED', 'CANCELED'].map((status) => (
            <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex-shrink-0 ${
                filterStatus === status
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
                {status === 'ALL' ? 'Tất cả lịch hẹn' : getStatusLabel(status)}
            </button>
            ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-grow p-8 overflow-y-auto custom-scrollbar">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-gray-300 rounded-xl bg-white">
              <div className="p-4 bg-gray-100 rounded-full mb-4">
                <CalendarIcon className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium text-lg">Không tìm thấy lịch hẹn.</p>
              {(filterDate || filterName || filterStatus !== 'ALL') && (
                  <button 
                    onClick={() => { setFilterDate(''); setFilterName(''); setFilterStatus('ALL'); }}
                    className="mt-2 text-blue-600 hover:underline"
                  >
                      Xóa bộ lọc hiện tại
                  </button>
              )}
            </div>
          ) : (
            <div className="space-y-4 pb-10">
              {filteredAppointments.map((app) => (
                <div key={app.appointmentId} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col md:flex-row">
                  <div className="md:w-36 bg-blue-50/50 p-4 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-100 flex-shrink-0">
                    <span className="text-3xl font-bold text-blue-600">
                      {app.appointmentDate.split('-')[2]}
                    </span>
                    <span className="text-sm font-semibold text-gray-600 uppercase">
                      Tháng {app.appointmentDate.split('-')[1]}
                    </span>
                    <span className="text-xs text-gray-400 mt-1">{app.appointmentDate.split('-')[0]}</span>
                  </div>

                  <div className="flex-grow p-5 flex flex-col justify-between gap-3">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex flex-col">
                             <h3 className="font-bold text-lg text-gray-900">
                              {app.reason || 'Khám bệnh'}
                            </h3>
                            <span className="text-sm font-medium text-blue-600 flex items-center gap-1 mt-1">
                                <UserIcon className="w-4 h-4" />
                                {app.patientName || 'Thành viên'}
                            </span>
                        </div>
                       
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(app.status)}`}>
                          {getStatusLabel(app.status)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-600 mt-3">
                        <div className="flex items-center gap-2">
                          <ClockIcon className="w-4 h-4 text-gray-400" />
                          <span>{formatTime(app.startTime)} - {formatTime(app.endTime)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DoctorIcon className="w-4 h-4 text-gray-400" />
                          <span>{app.doctorName || `Bác sĩ ID: ${app.doctorID}`}</span>
                        </div>
                      </div>

                      {app.notes && (
                         <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-700 italic border border-gray-100">
                           <span className="font-medium not-italic text-gray-500 text-xs block mb-1">Ghi chú:</span>
                           "{app.notes}"
                         </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>
    </div>
  );
};

const CalendarIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const ClockIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const UserIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const DoctorIcon = ({ className = "w-4 h-4" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
    </svg>
);

export default AppointmentMainView;
