import React, { useState, useRef, useEffect, useMemo } from 'react';
import { generateSelectOptions } from '../../type.js';
import MemberAPI from '../../api/MemberAPI.js'
import { windowWhen } from 'rxjs';
import ActionAlert from '../ActionAlert.jsx';

const MedicalRecordModal = ({ member, onClose }) => {
  const [records, setRecords] = useState([]);
  const [stagedFiles, setStagedFiles] = useState([]);
  const fileInputRef = useRef(null);
  const modalRef = useRef(null);
  
  // Refs cho ô nhập ngày để gọi showPicker
  const startDateInputRef = useRef(null);
  const endDateInputRef = useRef(null);
  
  const [reload, setReload] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Filter states: Range Date & Type
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterType, setFilterType] = useState('');

  // alert
  const [message, setMessage] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    modalRef.current?.focus();
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  useEffect(() => {
    const fetchRecordList = async () => {
      try {
        setIsLoading(true);
        const recordList = await MemberAPI.getRecordsByMember(member.memberID);
        setRecords(recordList);
      } catch (error) {
        console.error("Failed to fetch records", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecordList();
  }, [member.memberID, reload]);

  // Filter Logic
  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      const rDate = record.recordDate; // Format: YYYY-MM-DD
      
      // Check Start Date
      const isAfterStart = startDate ? rDate >= startDate : true;
      // Check End Date
      const isBeforeEnd = endDate ? rDate <= endDate : true;
      // Check Type
      const matchesType = filterType ? record.fileType === filterType : true;

      return isAfterStart && isBeforeEnd && matchesType;
    });
  }, [records, startDate, endDate, filterType]);

  const handleFileSelect = (event) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files).map(file => ({ file, type: '' }));
      setStagedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleRemoveStagedFile = (index) => {
    setStagedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleStagedFileTypeChange = (index, type) => {
    setStagedFiles(prev => prev.map((item, i) => i === index ? { ...item, type } : item));
  };

  const handleSaveFiles = async () => {
    try {
      setIsLoading(true);
      const newRecords = stagedFiles.map((stagedFile) => ({
        memberID: member.memberID,
        fileLink: stagedFile.file.name, // In real app, this is replaced by API result
        fileType: stagedFile.type,
        recordDate: new Date().toISOString().split('T')[0],
        description: stagedFile.file.name
      }));

      const recordResult = await MemberAPI.createMedicalRecord(stagedFiles, newRecords);
      setStagedFiles([]);

      if (recordResult && recordResult.length > 0) {
        setRecords(prev => [...prev, ...recordResult]);
      }
      setReload(prev => !prev);
      showAlert("Thêm file bệnh án mới thành công");
    } catch (error) {
      console.log("lỗi không thêm được record", error);
      showAlert("Lỗi: Không thể lưu file");
    } finally {
      setIsLoading(false);
    }
  };

  const showAlert = (content) => {
    setMessage(content);
    setIsOpen(true);
  };

  // === HELPER ===
  const formatDateDisplay = (dateString) => {
      if (!dateString) return '';
      // dateString format: YYYY-MM-DD
      const parts = dateString.split('-');
      if (parts.length === 3) {
          return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      return dateString;
  };

  const handleDateChange = (e, setDate) => {
    const val = e.target.value;
    if (!val) {
      setDate('');
      return;
    }
    // Check year length
    const [year] = val.split('-');
    if (year.length > 4) {
        return; // Ignore input if year has more than 4 digits
    }
    setDate(val);
  };

  // === LOGIC XEM VÀ TẢI FILE ===

  const handleViewFile = (link) => {
    if (!link) return;
    // Mở link trong tab mới. Trình duyệt sẽ tự động handle việc hiển thị PDF hoặc Image
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  const handleDownloadFile = async (link, filename) => {
    if (!link) return;

    try {
      // Cách 1: Fetch blob để buộc trình duyệt tải xuống thay vì mở tab mới
      // Lưu ý: Link Cloudinary cần cho phép CORS header nếu fetch từ domain khác
      const response = await fetch(link, {
        method: 'GET',
        headers: {
            // Thêm headers nếu API yêu cầu authentication
        }
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || link.split('/').pop() || 'downloaded-file';
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed, falling back to open new tab", error);
      // Fallback: Mở tab mới nếu fetch thất bại (ví dụ do CORS)
      window.open(link, '_blank');
    }
  };

  const handleDeleteRecord = async (recordID) => {
      if(!confirm("Bạn có chắc chắn muốn xóa bệnh án này?")) return;
      try {
          const r = await MemberAPI.deleteMedicalRecord(recordID);
          setRecords(prev => prev.filter(r => r.recordID !== recordID));
          if(r){
            console.log("Xóa thành công!");
          } else {
            console.log("Xóa thất bại!");
          }
      } catch (error) {
          console.error(error);
          showAlert("Lỗi khi xóa");
      }
  }

  const isSaveDisabled = stagedFiles.length === 0 || stagedFiles.some(f => f.type === '') || isLoading;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-fadeIn"
        onClick={e => e.stopPropagation()}
        tabIndex={-1}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 flex-shrink-0 bg-white">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
                Hồ sơ bệnh án
            </h2>
            <p className="text-sm text-gray-500 mt-1">Bệnh nhân: <span className="font-semibold text-blue-600">{member.fullName}</span></p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto bg-gray-50 flex-grow">
          {/* Filters - 3 Columns Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {/* Start Date */}
            <div 
                className={`bg-white p-3 rounded-xl border shadow-sm focus-within:ring-2 focus-within:ring-blue-100 transition-all cursor-pointer ${startDate ? 'border-blue-300 ring-1 ring-blue-50' : 'border-gray-200'}`}
                onClick={() => {
                    try {
                        startDateInputRef.current?.showPicker();
                    } catch (err) {
                        startDateInputRef.current?.focus();
                    }
                }}
            >
              <label htmlFor="start-date" className="block text-xs font-bold text-gray-500 uppercase mb-1 cursor-pointer">Từ ngày</label>
              <input 
                ref={startDateInputRef}
                type="date" 
                id="start-date" 
                className="w-full text-sm outline-none text-gray-700 bg-transparent cursor-pointer" 
                value={startDate}
                max="9999-12-31"
                onChange={(e) => handleDateChange(e, setStartDate)}
                onClick={(e) => e.stopPropagation()} 
              />
            </div>

            {/* End Date */}
            <div 
                className={`bg-white p-3 rounded-xl border shadow-sm focus-within:ring-2 focus-within:ring-blue-100 transition-all cursor-pointer ${endDate ? 'border-blue-300 ring-1 ring-blue-50' : 'border-gray-200'}`}
                onClick={() => {
                    try {
                        endDateInputRef.current?.showPicker();
                    } catch (err) {
                        endDateInputRef.current?.focus();
                    }
                }}
            >
              <label htmlFor="end-date" className="block text-xs font-bold text-gray-500 uppercase mb-1 cursor-pointer">Đến ngày</label>
              <input 
                ref={endDateInputRef}
                type="date" 
                id="end-date" 
                className="w-full text-sm outline-none text-gray-700 bg-transparent cursor-pointer" 
                value={endDate}
                min={startDate} // Cannot pick end date before start date
                max="9999-12-31"
                onChange={(e) => handleDateChange(e, setEndDate)}
                onClick={(e) => e.stopPropagation()} 
              />
            </div>

            {/* Type Filter */}
            <div className={`bg-white p-3 rounded-xl border shadow-sm focus-within:ring-2 focus-within:ring-blue-100 transition-all ${filterType ? 'border-blue-300 ring-1 ring-blue-50' : 'border-gray-200'}`}>
              <label htmlFor="filter-type" className="block text-xs font-bold text-gray-500 uppercase mb-1">Loại hồ sơ</label>
              <select
                id="filter-type"
                className="w-full text-sm outline-none text-gray-700 bg-transparent cursor-pointer"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="">Tất cả các loại</option>
                {generateSelectOptions().map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
          </div>

          {/* Record List */}
          <div className="space-y-3">
            {isLoading ? (
                 <div className="flex justify-center py-10">
                     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                 </div>
            ) : records.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-gray-300 rounded-xl bg-white">
                <div className="p-3 bg-gray-100 rounded-full mb-3">
                    <FileIcon className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">Chưa có bệnh án nào được thêm.</p>
              </div>
            ) : filteredRecords.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 px-4 border border-gray-200 rounded-xl bg-white">
                    <p className="text-gray-500">Không tìm thấy hồ sơ nào trong khoảng thời gian này.</p>
                    <button 
                        onClick={() => { setStartDate(''); setEndDate(''); setFilterType(''); }}
                        className="mt-2 text-blue-600 text-sm hover:underline"
                    >
                        Xóa bộ lọc
                    </button>
                </div>
            ) : (
              filteredRecords.map(record => (
                <div key={record.recordID} className="group bg-white p-4 rounded-xl shadow-sm hover:shadow-md border border-gray-200 hover:border-blue-300 transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4 overflow-hidden w-full">
                    <div 
                        className="p-3 bg-blue-50 text-blue-600 rounded-lg flex-shrink-0 cursor-pointer hover:bg-blue-100 transition-colors"
                        onClick={() => handleViewFile(record.fileLink)}
                    >
                      <FileIcon className="w-6 h-6" />
                    </div>
                    <div className="flex-grow min-w-0">
                      <h3 
                        className="font-semibold text-gray-900 truncate cursor-pointer hover:text-blue-600 transition-colors"
                        onClick={() => handleViewFile(record.fileLink)}
                        title="Xem chi tiết"
                      >
                          {record.description || "Tài liệu không tên"}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-500">
                        <span className="px-2 py-0.5 bg-gray-100 rounded-md font-medium">{record.fileType}</span>
                        <span>•</span>
                        {/* Format date to dd/mm/yyyy */}
                        <span>{formatDateDisplay(record.recordDate)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 border-gray-100 pt-3 sm:pt-0 mt-2 sm:mt-0">
                    <button 
                        onClick={() => handleViewFile(record.fileLink)}
                        className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        title="Xem trước file"
                    >
                        <EyeIcon className="w-4 h-4" />
                        <span className="hidden sm:inline">Xem</span>
                    </button>
                    
                    <button 
                        onClick={() => handleDownloadFile(record.fileLink, record.description)}
                        className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-green-50 hover:text-green-600 transition-colors"
                        title="Tải file về máy"
                    >
                        <DownloadIcon className="w-4 h-4" />
                        <span className="hidden sm:inline">Tải</span>
                    </button>

                    <div className="w-px h-5 bg-gray-300 mx-1 hidden sm:block"></div>

                    <button 
                        onClick={() => record.recordID && handleDeleteRecord(record.recordID)}
                        className="p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors" 
                        title="Xóa hồ sơ"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer / Upload Area */}
        <div className="p-6 border-t border-gray-100 bg-white flex-shrink-0 z-10">
          <details className="group">
            <summary className="list-none flex items-center justify-between font-medium text-gray-700 cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition-colors select-none">
              <div className="flex items-center gap-2">
                  <div className="bg-blue-100 p-1.5 rounded text-blue-600 group-open:rotate-90 transition-transform duration-200">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <span>Tải lên hồ sơ mới</span>
              </div>
              <span className="text-sm text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">Mở rộng</span>
            </summary>
            <div className="mt-4 space-y-4 animate-slideDown">
              <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept=".pdf,.jpg,.png,.jpeg" multiple className="hidden" />
              
              {stagedFiles.length === 0 && (
                <button onClick={() => fileInputRef.current?.click()} className="w-full flex flex-col items-center justify-center gap-3 px-6 py-8 border-2 border-dashed border-blue-200 rounded-xl bg-blue-50/50 text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 group/btn">
                    <div className="p-3 bg-white rounded-full shadow-sm group-hover/btn:scale-110 transition-transform">
                        <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                        </svg>
                    </div>
                    <div className="text-center">
                        <p className="font-medium">Nhấn để chọn file</p>
                        <p className="text-xs text-blue-400 mt-1">Hỗ trợ PDF, JPG, PNG</p>
                    </div>
                </button>
              )}

              {stagedFiles.length > 0 && (
                <div className="space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                         <span className="text-sm font-semibold text-gray-700">{stagedFiles.length} file được chọn</span>
                         <button onClick={() => fileInputRef.current?.click()} className="text-xs text-blue-600 hover:underline">+ Thêm file khác</button>
                    </div>
                  <div className="max-h-60 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                    {stagedFiles.map((item, index) => (
                      <div key={index} className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="flex-grow flex items-center gap-3 overflow-hidden">
                          <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
                              <FileIcon className="w-5 h-5" />
                          </div>
                          <span className="text-sm font-medium text-gray-700 truncate" title={item.file.name}>{item.file.name}</span>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <select
                            value={item.type}
                            onChange={(e) => handleStagedFileTypeChange(index, e.target.value)}
                            className={`w-full sm:w-48 px-3 py-2 border rounded-lg text-sm bg-white transition outline-none focus:ring-2 focus:ring-blue-100 ${item.type === '' ? 'border-red-300 text-gray-500' : 'border-gray-300 text-gray-900'}`}
                          >
                            <option value="" disabled>-- Chọn loại --</option>
                            {generateSelectOptions().map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                          </select>
                          <button onClick={() => handleRemoveStagedFile(index)} className="p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors" aria-label="Xóa">
                            <TrashIcon className="w-5 h-5"/>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3 pt-2">
                      <button 
                        onClick={() => setStagedFiles([])}
                        className="flex-1 px-4 py-3 text-[#757575] bg-[#F5F5F5] rounded-xl font-medium hover:bg-[#EEEEEE] transition-colors"
                      >
                          Hủy bỏ
                      </button>
                      <button
                        onClick={handleSaveFiles}
                        disabled={isSaveDisabled}
                        className="flex-[2] px-4 py-3 bg-[#1E88E5] text-white rounded-xl font-medium hover:bg-[#1976D2] focus:outline-none focus:ring-4 focus:ring-[#90CAF9] transition-all disabled:bg-[#E0E0E0] disabled:text-[#9E9E9E] disabled:cursor-not-allowed shadow-lg shadow-[#1E88E5 ]/20 disabled:shadow-none flex justify-center items-center gap-2"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                <span>Lưu {stagedFiles.length} hồ sơ</span>
                            </>
                        )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </details>
        </div>
      </div>
      <ActionAlert
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      >
        {message}
      </ActionAlert>
    </div>
  );
};

// Helper Icons
const FileIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
  </svg>
);

const TrashIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
  </svg>
);

const EyeIcon = ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);

const DownloadIcon = ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

export default MedicalRecordModal;