package com.example.famMedical.exception;

public class InvalidCredentialsException extends AuthException {
    public InvalidCredentialsException() {
        super("Email hoặc mật khẩu không đúng.");
    }
}
