package com.example.famMedical.config;

import graphql.scalars.ExtendedScalars;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.graphql.execution.RuntimeWiringConfigurer;
import graphql.schema.Coercing;
import graphql.schema.CoercingParseLiteralException;
import graphql.schema.CoercingParseValueException;
import graphql.schema.CoercingSerializeException;
import graphql.schema.GraphQLScalarType;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

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

        GraphQLScalarType localDateTimeScalar = GraphQLScalarType.newScalar()
                .name("LocalDateTime")
                .description("LocalDateTime scalar for date and time without timezone")
                .coercing(new Coercing<LocalDateTime, String>() {
                    @Override
                    public String serialize(Object dataFetcherResult) throws CoercingSerializeException {
                        if (dataFetcherResult instanceof LocalDateTime) {
                            return ((LocalDateTime) dataFetcherResult).format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
                        }
                        throw new CoercingSerializeException("Expected LocalDateTime but got: " + dataFetcherResult.getClass());
                    }

                    @Override
                    public LocalDateTime parseValue(Object input) throws CoercingParseValueException {
                        try {
                            if (input instanceof String) {
                                return LocalDateTime.parse((String) input, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
                            }
                            throw new CoercingParseValueException("Expected String but got: " + input.getClass());
                        } catch (DateTimeParseException e) {
                            throw new CoercingParseValueException("Invalid LocalDateTime format: " + input, e);
                        }
                    }

                    @Override
                    public LocalDateTime parseLiteral(Object input) throws CoercingParseLiteralException {
                        try {
                            if (input instanceof String) {
                                return LocalDateTime.parse((String) input, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
                            }
                            throw new CoercingParseLiteralException("Expected String but got: " + input.getClass());
                        } catch (DateTimeParseException e) {
                            throw new CoercingParseLiteralException("Invalid LocalDateTime format: " + input, e);
                        }
                    }
                })
                .build();

        return builder -> builder
                .scalar(ExtendedScalars.DateTime)
                .scalar(ExtendedScalars.Date)
                .scalar(localDateScalar)
                .scalar(localDateTimeScalar)
                .scalar(ExtendedScalars.Url)
                .scalar(ExtendedScalars.Json);
    }
}
