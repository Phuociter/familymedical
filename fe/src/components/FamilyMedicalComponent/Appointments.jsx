
import React, { useState, useEffect, useRef, useMemo } from 'react';
import MemberAPI from '../../api/MemberAPI.js'

const AppointmentMainView = ({  }) => {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const dateInputRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('user'));

  // Filter States
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterDate, setFilterDate] = useState('');
  const [filterName, setFilterName] = useState('');

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setIsLoading(true);

        const data = await MemberAPI.getAllAppointmentsByChuHo(user?.userID);
        setAppointments(data);
      } catch (error) {
        console.error("Failed to fetch appointments", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAppointments();
  }, [user?.userID]);

  // Helper: Get Unique Patient Names for Dropdown
  const uniqueNames = useMemo(() => {
      const names = appointments
        .map(app => app.member?.fullName || app.patientName)
        .filter(Boolean);
      return [...new Set(names)];
  }, [appointments]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'SCHEDULED': return 'bg-[#BBDEFB] text-[#1976D2] border-[#90CAF9]';
      case 'COMPLETED': return 'bg-[#C8E6C9] text-[#388E3C] border-[#A5D6A7]';
      case 'CANCELLED': return 'bg-[#FFCDD2] text-[#D32F2F] border-[#EF9A9A]';
      default: return 'bg-[#F5F5F5] text-[#B0BEC5] border-[#E0E0E0]';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'SCHEDULED': return 'Sắp tới';
      case 'COMPLETED': return 'Đã khám';
      case 'CANCELLED': return 'Đã hủy';
      default: return status;
    }
  };

  const normalizeDateTime = (dt) => dt?.replace(' ', 'T') ?? '';

  const getTimePart = (dateTimeString) => {
    const normalized = normalizeDateTime(dateTimeString);
    const timePart = normalized.split('T')[1];
    return timePart ? timePart.slice(0, 5) : '';
  };
  
  const getDatePart = (dateTimeString) => {
    const normalized = normalizeDateTime(dateTimeString);
    return normalized.split('T')[0] || '';
  };

  const formatDateForFilter = (dateTimeString) => {
    const datePart = getDatePart(dateTimeString);
    if (!datePart) return '';
    const [year, month, day] = datePart.split('-');
    if (!year || !month || !day) return '';
    return `${day}-${month}-${year}`;
  };

  const formatInputDate = (value) => {
    if (!value) return '';
    const [year, month, day] = value.split('-');
    if (!year || !month || !day) return '';
    return `${day}-${month}-${year}`;
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
    const formattedFilterDate = formatInputDate(filterDate);
    return appointments.filter(app => {
      const matchesStatus = filterStatus === 'ALL' ? true : app.status === filterStatus;
      const matchesDate = formattedFilterDate
        ? formatDateForFilter(app.appointmentDateTime) === formattedFilterDate
        : true;
      const patientName = app.member?.fullName || app.patientName;
      const matchesName = filterName ? patientName === filterName : true;
      return matchesStatus && matchesDate && matchesName;
    });
  }, [appointments, filterStatus, filterDate, filterName]);

  return (
    <div className="h-full flex flex-col bg-[#F9FAFB] overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-[#E0E0E0] px-8 py-6 flex-shrink-0">
        <h1 className="text-2xl font-bold text-[#111827]">Lịch hẹn gia đình</h1>
        <p className="text-sm text-[#6B7280] mt-1">Quản lý và theo dõi lịch khám cho tất cả thành viên</p>
      </div>

      {/* Controls */}
      <div className="flex-shrink-0 px-8 py-4 bg-white border-b border-[#E0E0E0] space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             {/* Filter Date */}
             <div 
                className={`bg-white p-2.5 rounded-xl border shadow-sm focus-within:ring-2 focus-within:ring-[#BBDEFB] transition-all cursor-pointer flex flex-col justify-center ${filterDate ? 'border-[#64B5F6] ring-1 ring-[#BBDEFB]' : 'border-[#EEEEEE]'}`}
                onClick={() => {
                    try { dateInputRef.current?.showPicker(); } 
                    catch { dateInputRef.current?.focus(); }
                }}
            >
                <label className="text-xs font-bold text-[#9E9E9E] uppercase mb-0.5 cursor-pointer">Ngày khám</label>
                <input 
                    ref={dateInputRef}
                    type="date" 
                    className="w-full text-sm outline-none text-[#616161] bg-transparent cursor-pointer"
                    value={filterDate}
                    max="9999-12-31"
                    onChange={handleDateChange}
                    onClick={(e) => e.stopPropagation()}
                />
            </div>

            {/* Filter Name */}
            <div className={`bg-white p-2.5 rounded-xl border shadow-sm focus-within:ring-2 focus-within:ring-[#BBDEFB] transition-all ${filterName ? 'border-[#64B5F6] ring-1 ring-[#BBDEFB]' : 'border-[#EEEEEE]'}`}>
                <label htmlFor="filter-name" className="block text-xs font-bold text-[#9E9E9E] uppercase mb-0.5">Người khám</label>
                <select
                    id="filter-name"
                    className="w-full text-sm outline-none text-[#616161] bg-transparent cursor-pointer"
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
            {['ALL', 'SCHEDULED', 'COMPLETED', 'CANCELLED'].map((status) => (
            <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex-shrink-0 ${
                filterStatus === status
                    ? 'border-[#1E88E5] text-[#1E88E5]'
                    : 'border-transparent text-[#9E9E9E] hover:text-[#616161] hover:border-[#E0E0E0]'
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
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1E88E5]"></div>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-[#E0E0E0] rounded-xl bg-white">
              <div className="p-4 bg-[#F5F5F5] rounded-full mb-4">
                <CalendarIcon className="w-10 h-10 text-[#BDBDBD]" />
              </div>
              <p className="text-[#9E9E9E] font-medium text-lg">Không tìm thấy lịch hẹn.</p>
              {(filterDate || filterName || filterStatus !== 'ALL') && (
                  <button 
                    onClick={() => { setFilterDate(''); setFilterName(''); setFilterStatus('ALL'); }}
                    className="mt-2 text-[#1E88E5] hover:underline"
                  >
                      Xóa bộ lọc hiện tại
                  </button>
              )}
            </div>
          ) : (
            <div className="space-y-4 pb-10">
              {filteredAppointments.map((app) => {
                const datePart = getDatePart(app.appointmentDateTime);
                const timePart = getTimePart(app.appointmentDateTime);
                const [year, month, day] = datePart ? datePart.split('-') : [];
                const patientName = app.member?.fullName || app.patientName || 'Thành viên';
                const doctorName = app.doctor?.fullName
                  || app.doctorName
                  || (app.doctor?.userID ? `Bác sĩ ID: ${app.doctor.userID}` : app.doctorID ? `Bác sĩ ID: ${app.doctorID}` : 'Bác sĩ');

                return (
                  <div
                    key={app.appointmentID || app.appointmentId}
                    className="bg-white rounded-xl border border-[#EEEEEE] shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col md:flex-row"
                  >
                    <div className="md:w-32 bg-[#E3F2FD] p-4 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-[#F5F5F5]">
                      <span className="text-2xl font-bold text-[#1E88E5]">
                        {day || '--'}
                      </span>
                      <span className="text-sm font-semibold text-[#757575] uppercase">
                        Tháng {month || '--'}
                      </span>
                      <span className="text-xs text-[#BDBDBD] mt-1">{year || '----'}</span>
                    </div>

                    <div className="flex-grow p-4 flex flex-col justify-between gap-3">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex flex-col">
                            <h3 className="font-bold text-lg text-[#212121]">
                              {app.reason || 'Khám bệnh'}
                            </h3>
                            <span className="text-sm font-medium text-[#1E88E5] flex items-center gap-1 mt-0.5">
                              <UserIcon className="w-3.5 h-3.5" />
                              {patientName}
                            </span>
                          </div>

                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusColor(app.status)}`}>
                            {getStatusLabel(app.status)}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm text-[#757575] mt-2">
                          <div className="flex items-center gap-2">
                            <ClockIcon className="w-4 h-4 text-[#BDBDBD]" />
                            <span>{timePart || '--:--'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DoctorIcon className="w-4 h-4 text-[#BDBDBD]" />
                            <span>{doctorName}</span>
                          </div>
                        </div>

                        {app.notes && (
                          <div className="mt-3 p-3 bg-[#FAFAFA] rounded-lg text-sm text-[#616161] italic border border-[#F5F5F5]">
                            <span className="font-medium not-italic text-[#9E9E9E] text-xs block mb-1">Ghi chú:</span>
                            "{app.notes}"
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
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
