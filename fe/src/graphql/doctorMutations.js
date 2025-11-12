import { gql } from '@apollo/client';

// Mutation để phản hồi yêu cầu assign bác sĩ
export const RESPOND_TO_DOCTOR_REQUEST = gql`
  mutation RespondToDoctorRequest(
    $requestId: ID!
    $status: RequestStatus!
    $message: String
  ) {
    respondToDoctorRequest(
      requestId: $requestId
      status: $status
      message: $message
    ) {
      requestID
      familyID
      familyName
      requestDate
      status
      message
      responseDate
      responseMessage
    }
  }
`;

// Query để lấy danh sách yêu cầu assign
export const GET_DOCTOR_REQUESTS = gql`
  query GetDoctorRequests($status: RequestStatus) {
    doctorRequests(status: $status) {
      requestID
      familyID
      familyName
      familyAddress
      requestDate
      status
      message
      responseDate
      responseMessage
      headOfFamily {
        fullName
        phoneNumber
        email
      }
      memberCount
    }
  }
`;

// Query để lấy chi tiết yêu cầu
export const GET_DOCTOR_REQUEST_DETAIL = gql`
  query GetDoctorRequestDetail($requestId: ID!) {
    doctorRequestDetail(requestId: $requestId) {
      requestID
      familyID
      familyName
      familyAddress
      requestDate
      status
      message
      responseDate
      responseMessage
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
        dateOfBirth
        gender
        healthStatus
      }
    }
  }
`;
/**
 * Mutation for discontinuing a prescription
 */
export const DISCONTINUE_PRESCRIPTION = gql`
  mutation DiscontinuePrescription($prescriptionId: ID!) {
    discontinuePrescription(prescriptionId: $prescriptionId) {
      prescriptionID
      status
    }
  }
`;

/**
 * Mutation for updating patient medical background
 */
export const UPDATE_PATIENT_BACKGROUND = gql`
  mutation UpdatePatientBackground($memberId: ID!, $input: PatientBackgroundInput!) {
    updatePatientBackground(memberId: $memberId, input: $input) {
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

/**
 * Mutation for adding an underlying condition
 */
export const ADD_UNDERLYING_CONDITION = gql`
  mutation AddUnderlyingCondition($memberId: ID!, $input: UnderlyingConditionInput!) {
    addUnderlyingCondition(memberId: $memberId, input: $input) {
      conditionID
      conditionName
      diagnosisDate
      status
      notes
    }
  }
`;

/**
 * Mutation for adding an allergy
 */
export const ADD_ALLERGY = gql`
  mutation AddAllergy($memberId: ID!, $input: AllergyInput!) {
    addAllergy(memberId: $memberId, input: $input) {
      allergyID
      allergen
      reactionType
      severity
      notes
    }
  }
`;

/**
 * Mutation for adding a surgery record
 */
export const ADD_SURGERY = gql`
  mutation AddSurgery($memberId: ID!, $input: SurgeryInput!) {
    addSurgery(memberId: $memberId, input: $input) {
      surgeryID
      procedureName
      surgeryDate
      hospital
      outcome
      notes
    }
  }
`;

/**
 * Mutation for updating family information
 */
export const UPDATE_FAMILY_INFO = gql`
  mutation UpdateFamilyInfo($familyId: ID!, $input: FamilyInfoInput!) {
    updateFamilyInfo(familyId: $familyId, input: $input) {
      familyID
      familyName
      familyAddress
      notes
    }
  }
`;

/**
 * Mutation for updating family medical background
 */
export const UPDATE_FAMILY_BACKGROUND = gql`
  mutation UpdateFamilyBackground($familyId: ID!, $input: FamilyBackgroundInput!) {
    updateFamilyBackground(familyId: $familyId, input: $input) {
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

/**
 * Mutation for adding a family member
 */
export const ADD_FAMILY_MEMBER = gql`
  mutation AddFamilyMember($familyId: ID!, $input: MemberInput!) {
    addFamilyMember(familyId: $familyId, input: $input) {
      memberID
      fullName
      relationship
      cccd
      dateOfBirth
      gender
      phoneNumber
      email
      healthStatus
    }
  }
`;

/**
 * Mutation for uploading a medical image
 */
export const UPLOAD_MEDICAL_IMAGE = gql`
  mutation UploadMedicalImage($memberId: ID!, $input: MedicalImageInput!) {
    uploadMedicalImage(memberId: $memberId, input: $input) {
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

/**
 * Mutation for creating a test result
 */
export const CREATE_TEST_RESULT = gql`
  mutation CreateTestResult($input: TestResultInput!) {
    createTestResult(input: $input) {
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

/**
 * Mutation for recording a health indicator measurement
 */
export const RECORD_HEALTH_INDICATOR = gql`
  mutation RecordHealthIndicator($memberId: ID!, $input: HealthIndicatorInput!) {
    recordHealthIndicator(memberId: $memberId, input: $input) {
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
