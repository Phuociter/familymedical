package com.example.famMedical.exception;

import graphql.GraphQLError;
import graphql.GraphqlErrorBuilder;
import graphql.schema.DataFetchingEnvironment;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import org.springframework.graphql.execution.DataFetcherExceptionResolverAdapter;
import org.springframework.graphql.execution.ErrorType;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.stream.Collectors;

@Component
public class CustomExceptionResolver extends DataFetcherExceptionResolverAdapter {

    @Override
    protected GraphQLError resolveToSingleError(Throwable ex, DataFetchingEnvironment env) {
        if (ex instanceof AuthException) {
            return GraphqlErrorBuilder.newError()
                    .errorType(ErrorType.BAD_REQUEST)
                    .message(ex.getMessage())
                    .path(env.getExecutionStepInfo().getPath())
                    .location(env.getField().getSourceLocation())
                    .build();
        } else if (ex instanceof ConstraintViolationException) {
            // Chuyển đổi các vi phạm ràng buộc thành một Map<String, String>
            Map<String, String> validationErrors = ((ConstraintViolationException) ex).getConstraintViolations().stream()
                    .collect(Collectors.toMap(
                            cv -> {
                                // Lấy đường dẫn thuộc tính, ví dụ: "registerFamily.input.phoneNumber"
                                String path = cv.getPropertyPath().toString();
                                // Trích xuất tên trường cuối cùng, ví dụ: "phoneNumber"
                                return path.substring(path.lastIndexOf('.') + 1);
                            },
                            ConstraintViolation::getMessage,
                            // Trong trường hợp có nhiều lỗi cho cùng một trường, chỉ lấy lỗi đầu tiên
                            (existing, replacement) -> existing
                    ));

            // Xây dựng GraphQLError với thông báo chung và chi tiết lỗi trong extensions
            return GraphqlErrorBuilder.newError()
                    .errorType(ErrorType.BAD_REQUEST)
                    .message("Validation failed") // Thông báo lỗi chung
                    .path(env.getExecutionStepInfo().getPath())
                    .location(env.getField().getSourceLocation())
                    .extensions(Map.of("validationErrors", validationErrors)) // Đặt map lỗi vào extensions
                    .build();
        }
        return null;
    }
}
