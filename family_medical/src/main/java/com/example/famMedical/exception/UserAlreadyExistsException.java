package com.example.famMedical.exception;

public class UserAlreadyExistsException extends AuthException {
    public UserAlreadyExistsException(String email) {
        super("Tài khoản với email '" + email + "' đã tồn tại.");
    }

    public UserAlreadyExistsException(String code, String type) {
        super(type + " '" + code + "' đã được sử dụng.");
    }
}
