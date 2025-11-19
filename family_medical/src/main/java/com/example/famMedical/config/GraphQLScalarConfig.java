package com.example.famMedical.config;

import graphql.scalars.ExtendedScalars;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.graphql.execution.RuntimeWiringConfigurer;
import graphql.schema.Coercing;
import graphql.schema.GraphQLScalarType;
import java.time.LocalDate;

@Configuration
public class GraphQLScalarConfig {

    @Bean
    public RuntimeWiringConfigurer runtimeWiringConfigurer() {
        Coercing<?, ?> localDateCoercing = ExtendedScalars.Date.getCoercing();
        GraphQLScalarType localDateScalar = GraphQLScalarType.newScalar()
       .name("LocalDate")
       .description("Local Date type")
       .coercing(localDateCoercing)
       .build();
        return builder -> builder
                .scalar(ExtendedScalars.DateTime) // ✅ OK
                .scalar(ExtendedScalars.Date)
                .scalar(localDateScalar)
                .scalar(ExtendedScalars.Url)      // tùy bạn thêm nếu cần
                .scalar(ExtendedScalars.Json);    // tùy bạn thêm nếu cần   
    }
}
