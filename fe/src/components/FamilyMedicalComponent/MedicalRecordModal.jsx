import React, { useState, useRef, useEffect } from 'react';
import { MedicalRecordTypes } from '../../types.js';

const MedicalRecordModal = ({ member, onClose }) => {
  const [records, setRecords] = useState(member.records || []);
  const [stagedFiles, setStagedFiles] = useState([]);
  const fileInputRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    
    // Focus trapping would be ideal here for full accessibility
    modalRef.current?.focus();

    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

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

  const handleSaveFiles = () => {
    const newRecords = stagedFiles.map((stagedFile, index) => ({
      id: Date.now() + index,
      name: stagedFile.file.name,
      type: stagedFile.type,
      date: new Date().toISOString().split('T')[0],
    }));
    setRecords(prev => [...prev, ...newRecords]);
    setStagedFiles([]);
  };

  const isSaveDisabled = stagedFiles.length === 0 || stagedFiles.some(f => f.type === '');

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
    >
      <div 
        ref={modalRef}
        className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
        tabIndex={-1}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 flex-shrink-0">
          <h2 id="modal-title" className="text-2xl font-bold text-gray-800">
            Danh sách bệnh án của <span className="text-blue-600">{member.name}</span>
          </h2>
          <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors" aria-label="Đóng">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
                <label htmlFor="filter-date" className="block text-sm font-medium text-gray-700 mb-1">Lọc theo ngày</label>
                <input type="date" id="filter-date" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition"/>
            </div>
            <div>
                <label htmlFor="filter-type" className="block text-sm font-medium text-gray-700 mb-1">Lọc theo loại</label>
                <select id="filter-type" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition bg-white">
                    <option value="">Tất cả các loại</option>
                    {MedicalRecordTypes.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
            </div>
          </div>

          {/* Record List */}
          <div className="space-y-3">
            {records.length === 0 ? (
                <div className="text-center py-8 px-4 border-2 border-dashed border-gray-300 rounded-lg">
                    <p className="text-gray-500">Chưa có bệnh án nào được thêm.</p>
                </div>
            ) : (
                records.map(record => (
                    <div key={record.id} className="bg-gray-50 p-3 rounded-lg flex items-center justify-between border border-gray-200">
                        <div className="flex items-center gap-3">
                            <FileIcon />
                            <div>
                                <p className="font-medium text-gray-800">{record.name}</p>
                                <p className="text-sm text-gray-500">{record.type} - {record.date}</p>
                            </div>
                        </div>
                        <button className="p-2 rounded-full text-gray-400 hover:bg-red-100 hover:text-red-600 transition-colors" aria-label={`Xóa hồ sơ ${record.name}`}>
                            <TrashIcon />
                        </button>
                    </div>
                ))
            )}
          </div>
        </div>

        {/* Footer / Upload Area */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <details className="group">
            <summary className="list-none flex items-center justify-between font-medium text-gray-700 cursor-pointer hover:text-blue-600 transition">
                <span>Thêm file bệnh án (PDF)</span>
                <svg className="w-5 h-5 transition-transform duration-300 group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </summary>
            <div className="mt-4 space-y-4">
              <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept=".pdf" multiple className="hidden"/>
              <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-blue-600 hover:border-blue-500 hover:bg-blue-50 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                <span>Chọn file PDF</span>
              </button>
              
              {stagedFiles.length > 0 && (
                <div className="space-y-3">
                  {stagedFiles.map((item, index) => (
                    <div key={index} className="bg-white p-3 rounded-lg border border-gray-200 flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="flex-grow flex items-center gap-3">
                          <FileIcon />
                          <span className="text-sm font-medium text-gray-700 truncate">{item.file.name}</span>
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <select 
                            value={item.type} 
                            onChange={(e) => handleStagedFileTypeChange(index, e.target.value)}
                            className={`w-full sm:w-48 px-2 py-1 border rounded-md text-sm bg-white transition ${item.type === '' ? 'border-red-400 text-gray-500' : 'border-gray-300 text-gray-800'}`}
                        >
                          <option value="" disabled>-- Chọn loại hồ sơ --</option>
                          {MedicalRecordTypes.map(type => <option key={type} value={type}>{type}</option>)}
                        </select>
                        <button onClick={() => handleRemoveStagedFile(index)} className="p-2 rounded-full text-gray-400 hover:bg-red-100 hover:text-red-500 transition-colors" aria-label={`Xóa file ${item.file.name}`}>
                           <TrashIcon />
                        </button>
                      </div>
                    </div>
                  ))}
                  <button onClick={handleSaveFiles} disabled={isSaveDisabled} className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
                    Lưu file PDF
                  </button>
                </div>
              )}
            </div>
          </details>
        </div>
      </div>
    </div>
  );
};

const FileIcon = () => (
    <svg className="w-6 h-6 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
);

const TrashIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
);


export default MedicalRecordModal;