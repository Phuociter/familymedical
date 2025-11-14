// Validation utility functions
export const validators = {
  required: (value, fieldName) => {
    if (!value || value.toString().trim() === '') {
      return `${fieldName} là bắt buộc`;
    }
    return null;
  },

  email: (value) => {
    if (!value) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return 'Email không hợp lệ';
    }
    return null;
  },

  phone: (value) => {
    if (!value) return null;
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(value.replace(/[\s\-]/g, ''))) {
      return 'Số điện thoại phải có 10-11 chữ số';
    }
    return null;
  },

  cccd: (value) => {
    if (!value) return null;
    const cccdRegex = /^[0-9]{9,12}$/;
    if (!cccdRegex.test(value.replace(/[\s\-]/g, ''))) {
      return 'CCCD phải có 9-12 chữ số';
    }
    return null;
  },

  minLength: (value, min, fieldName) => {
    if (!value) return null;
    if (value.length < min) {
      return `${fieldName} phải có ít nhất ${min} ký tự`;
    }
    return null;
  },

  maxLength: (value, max, fieldName) => {
    if (!value) return null;
    if (value.length > max) {
      return `${fieldName} không được vượt quá ${max} ký tự`;
    }
    return null;
  },

  password: (value) => {
    if (!value) return null;
    if (value.length < 6) {
      return 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    if (!/[A-Za-z]/.test(value) || !/[0-9]/.test(value)) {
      return 'Mật khẩu phải chứa cả chữ cái và số';
    }
    return null;
  },

  date: (value) => {
    if (!value) return null;
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(value)) {
      return 'Ngày không đúng định dạng (YYYY-MM-DD)';
    }
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return 'Ngày không hợp lệ';
    }
    const today = new Date();
    if (date > today) {
      return 'Ngày không được lớn hơn ngày hiện tại';
    }
    return null;
  },

  positiveNumber: (value, fieldName) => {
    if (!value) return null;
    const num = parseFloat(value);
    if (isNaN(num) || num <= 0) {
      return `${fieldName} phải là số dương`;
    }
    return null;
  },

  number: (value, fieldName) => {
    if (!value) return null;
    const num = parseFloat(value);
    if (isNaN(num)) {
      return `${fieldName} phải là số`;
    }
    return null;
  },

  url: (value) => {
    if (!value) return null;
    try {
      new URL(value);
      return null;
    } catch {
      return 'URL không hợp lệ';
    }
  },
};

export const validateField = (value, rules, fieldName) => {
  for (const rule of rules) {
    if (typeof rule === 'function') {
      const error = rule(value, fieldName);
      if (error) return error;
    } else if (typeof rule === 'object' && rule.type) {
      const error = validators[rule.type](value, rule.params || fieldName, ...(rule.params || []));
      if (error) return error;
    }
  }
  return null;
};

export const validateForm = (formData, validationRules) => {
  const errors = {};
  for (const field in validationRules) {
    const rules = validationRules[field];
    const value = formData[field];
    const error = validateField(value, rules, field);
    if (error) {
      errors[field] = error;
    }
  }
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

