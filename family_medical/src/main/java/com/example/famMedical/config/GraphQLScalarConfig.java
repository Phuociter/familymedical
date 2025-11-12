package com.example.famMedical.config;

import graphql.scalars.ExtendedScalars;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.graphql.execution.RuntimeWiringConfigurer;

@Configuration
public class GraphQLScalarConfig {

    @Bean
    public RuntimeWiringConfigurer runtimeWiringConfigurer() {
        return builder -> builder
                .scalar(ExtendedScalars.DateTime) // ✅ OK
                .scalar(ExtendedScalars.Date)
                .scalar(ExtendedScalars.Url)      // tùy bạn thêm nếu cần
                .scalar(ExtendedScalars.Json);    // tùy bạn thêm nếu cần   
    }
}
