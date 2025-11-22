export const View = {
  Family: 'Danh sách Gia Đình',
  Doctors: 'Danh sách Bác sĩ',
  Messages: 'Tin nhắn',
};

export const MedicalRecordTypes = [
    'Chụp X-Quang',
    'Siêu Âm',
    'Chụp CT',
    'Chụp MRI',
    'Chụp Nhũ Ảnh (Mammography)',
    'Chụp PET-CT',
    'Xét Nghiệm Máu',
    'Xét Nghiệm Nước Tiểu',
    'Xét Nghiệm Sinh Hóa Máu',
    'Xét Nghiệm Miễn Dịch Huyết Học',
    'Xét Nghiệm Vi Sinh',
    'Xét Nghiệm Di Truyền',
    'Kết Quả PCR/Antigen COVID-19',
    'Giải Phẫu Bệnh',
    'Điện Tâm Đồ (ECG)',
    'Điện Não Đồ (EEG)',
    'Điện Cơ (EMG)',
    'Đo Chức Năng Hô Hấp (Spirometry)',
    'Holter Điện Tim',
    'Holter Huyết Áp',
    'Phiếu Khám Bệnh',
    'Đơn Thuốc',
    'Giấy Nhập Viện',
    'Giấy Ra Viện',
    'Giấy Chuyển Tuyến',
    'Hồ Sơ Tiêm Chủng',
    'Báo Cáo Phẫu Thuật',
    'Kế Hoạch Điều Trị',
    'Hồ Sơ Nha Khoa',
    'Siêu Âm Sản Khoa',
    'Khám Thị Lực',
    'Khám Thính Lực',
    'Test Dị Ứng'
];

const nameToKeyMap = {};
const keyToNameMap = {};

MedicalRecordTypes.forEach(name => {
    const key = name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // loại bỏ dấu
        .replace(/Đ/g, 'D')
        .replace(/đ/g, 'd')
        .replace(/[^a-zA-Z0-9 ]/g, '') // chỉ giữ a-zA-Z0-9 và space
        .trim()
        .replace(/\s+/g, '_');
    nameToKeyMap[name] = key;
    keyToNameMap[key] = name;
});


// Hàm chuyển tên sang key
export const toKey = (name) => nameToKeyMap[name] || name;

// Hàm chuyển key sang tên
export const fromKey = (key) => keyToNameMap[key] || key;

// Hàm tạo options cho select
export const generateSelectOptions = () => {
    return MedicalRecordTypes.map(name => ({
        label: name,
        value: toKey(name)
    }));
};

