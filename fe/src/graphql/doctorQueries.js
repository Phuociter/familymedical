import { gql } from '@apollo/client';

// Existing queries
export const GET_ASSIGNED_FAMILIES = gql`
  query GetAssignedFamilies($search: String) {
    doctorAssignedFamilies(search: $search) {
      familyID
      familyName
      familyAddress
      status
      lastVisit
      headOfFamily {
        fullName
        phoneNumber
      }
      members {
        memberID
        fullName
      }
    }
  }
`;

export const GET_FAMILY_MEMBERS = gql`
  query GetFamilyMembers($familyId: ID!) {
    familyMembers(familyId: $familyId) {
      memberID
      fullName
      relationship
      cccd
    }
  }
`;

export const GET_MEMBER_MEDICAL_RECORDS = gql`
  query GetMemberMedicalRecords($memberId: ID!) {
    memberMedicalRecords(memberId: $memberId) {
      recordID
      symptoms
      diagnosis
      treatmentPlan
      recordDate
      fileLink
    }
  }
`;

// New enhanced queries for family details
export const GET_FAMILY_DETAIL = gql`
  query GetFamilyDetail($familyId: ID!) {
    familyDetail(familyId: $familyId) {
      familyID
      familyName
      familyAddress
      status
      lastVisit
      registrationDate
      assignedDoctor
      visitCount
      notes
      headOfFamily {
        memberID
        fullName
        phoneNumber
        email
        cccd
        dateOfBirth
      }
      members {
        memberID
        fullName
        relationship
        cccd
        dateOfBirth
        gender
        phoneNumber
        email
        healthStatus
        recentVisitCount
        lastVisitDate
      }
    }
  }
`;

// Query for patient detail information
export const GET_PATIENT_DETAIL = gql`
  query GetPatientDetail($memberId: ID!) {
    patientDetail(memberId: $memberId) {
      memberID
      fullName
      dateOfBirth
      gender
      cccd
      phoneNumber
      email
      photoURL
      totalVisits
      lastVisitDate
      currentStatus
      familyID
      relationship
    }
  }
`;

// Query for patient medical history with filters
export const GET_PATIENT_MEDICAL_HISTORY = gql`
  query GetPatientMedicalHistory(
    $memberId: ID!
    $startDate: String
    $endDate: String
    $diseaseType: String
  ) {
    patientMedicalHistory(
      memberId: $memberId
      startDate: $startDate
      endDate: $endDate
      diseaseType: $diseaseType
    ) {
      recordID
      memberID
      recordDate
      symptoms
      clinicalFindings
      diagnosis
      diagnosisCodes
      treatmentPlan
      fileLink
      doctorID
      doctorName
      followUpDate
      notes
      prescriptions {
        prescriptionID
        medicationName
        dosage
        frequency
        duration
        status
      }
      testResults {
        testResultID
        testType
        testName
        testDate
        interpretation
      }
    }
  }
`;

// Query for patient prescriptions
export const GET_PATIENT_PRESCRIPTIONS = gql`
  query GetPatientPrescriptions($memberId: ID!, $status: String) {
    patientPrescriptions(memberId: $memberId, status: $status) {
      prescriptionID
      recordID
      medicationName
      dosage
      frequency
      duration
      startDate
      endDate
      status
      instructions
    }
  }
`;

// Query for patient test results
export const GET_PATIENT_TEST_RESULTS = gql`
  query GetPatientTestResults($memberId: ID!, $testType: String) {
    patientTestResults(memberId: $memberId, testType: $testType) {
      testResultID
      recordID
      testType
      testName
      testDate
      interpretation
      fileLink
      results {
        parameterName
        value
        unit
        normalRange
        status
      }
    }
  }
`;

// Query for patient health indicators
export const GET_PATIENT_HEALTH_INDICATORS = gql`
  query GetPatientHealthIndicators($memberId: ID!, $indicatorType: String) {
    patientHealthIndicators(memberId: $memberId, indicatorType: $indicatorType) {
      indicatorID
      indicatorType
      value
      unit
      measurementDate
      status
      normalRange {
        min
        max
      }
    }
  }
`;

// Query for patient medical images
export const GET_PATIENT_MEDICAL_IMAGES = gql`
  query GetPatientMedicalImages($memberId: ID!, $imageType: String) {
    patientMedicalImages(memberId: $memberId, imageType: $imageType) {
      imageID
      memberID
      recordID
      imageType
      imageDate
      imageURL
      thumbnailURL
      description
      notes
    }
  }
`;

// Query for patient medical background
export const GET_PATIENT_BACKGROUND = gql`
  query GetPatientBackground($memberId: ID!) {
    patientBackground(memberId: $memberId) {
      memberID
      familyMedicalHistory
      underlyingConditions {
        conditionID
        conditionName
        diagnosisDate
        status
        notes
      }
      allergies {
        allergyID
        allergen
        reactionType
        severity
        notes
      }
      pastSurgeries {
        surgeryID
        procedureName
        surgeryDate
        hospital
        outcome
        notes
      }
    }
  }
`;

// Query for family medical background
export const GET_FAMILY_BACKGROUND = gql`
  query GetFamilyBackground($familyId: ID!) {
    familyBackground(familyId: $familyId) {
      familyID
      doctorNotes
      hereditaryDiseases {
        diseaseID
        diseaseName
        affectedMembers
        notes
      }
      riskFactors {
        factorID
        factorName
        prevalence
        affectedMembers
      }
    }
  }
`;

// Query for family medical history timeline
export const GET_FAMILY_MEDICAL_HISTORY = gql`
  query GetFamilyMedicalHistory(
    $familyId: ID!
    $memberId: String
    $startDate: String
    $endDate: String
  ) {
    familyMedicalHistory(
      familyId: $familyId
      memberId: $memberId
      startDate: $startDate
      endDate: $endDate
    ) {
      recordID
      memberID
      memberName
      recordDate
      symptoms
      diagnosis
      treatmentPlan
      doctorName
    }
  }
`;

// Query for family health report
export const GET_FAMILY_HEALTH_REPORT = gql`
  query GetFamilyHealthReport($familyId: ID!, $startDate: String!, $endDate: String!) {
    familyHealthReport(familyId: $familyId, startDate: $startDate, endDate: $endDate) {
      familyID
      reportDate
      dateRange {
        start
        end
      }
      familySummary {
        totalMembers
        totalVisits
        totalCost
      }
      memberHealthStatus {
        memberID
        fullName
        visitCount
        mainDiagnoses
        healthStatus
      }
      diseaseTrends {
        diseaseName
        occurrenceCount
        affectedMembers
        trend
      }
      costAnalysis {
        totalCost
        costByCategory {
          category
          amount
        }
        costByMember {
          memberID
          fullName
          amount
        }
        monthlyTrend {
          month
          amount
        }
      }
    }
  }
`;