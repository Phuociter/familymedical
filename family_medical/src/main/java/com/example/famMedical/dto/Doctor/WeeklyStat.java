package com.example.famMedical.dto.Doctor;

import java.util.Date;

public record WeeklyStat(
    Date date,
    Integer recordsCount,
    Integer consultantCount
) {}