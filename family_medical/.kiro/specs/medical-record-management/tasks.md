# Implementation Plan

- [ ] 1. Create DoctorNote entity and repository

  - Create DoctorNote entity class with proper JPA annotations
  - Implement DoctorNoteRepository interface with custom queries
  - Add database migration script for doctor_notes table
  - _Requirements: 5.1, 5.2_

- [ ] 2. Enhance existing MedicalRecord entity
  - [ ] 2.1 Add missing fields to MedicalRecord entity


    - Add originalFileName, recordType, fileSize fields to MedicalRecord
    - Update entity annotations and relationships
    - _Requirements: 2.1, 2.2_
  
  - [ ] 2.2 Create repository methods for medical record access


    - Implement MedicalRecordRepository with doctor-family authorization queries
    - Add methods for finding records by doctor ID and family ID
    - _Requirements: 2.1, 2.2_

- [ ] 3. Implement repository layer for family doctor operations





  - [ ] 3.1 Create FamilyRepository with doctor-specific queries


    - Implement queries to find families assigned to a doctor
    - Add search functionality across family names and head of family
    - Create method to verify doctor-family relationships
    - _Requirements: 1.1, 1.2, 4.1_
  
  - [ ] 3.2 Enhance DoctorRequestRepository


    - Add methods to find pending requests for a specific doctor
    - Implement queries for request status management
    - _Requirements: 3.1, 3.2_
  
  - [ ] 3.3 Create DoctorAssignmentRepository methods


    - Implement authorization check methods for doctor-family access
    - Add queries for active assignments
    - _Requirements: 1.1, 3.3_

- [ ] 4. Implement FamilyDoctorService layer





  - [ ] 4.1 Create family management service methods


    - Implement getMyPatientFamilies with proper authorization
    - Create getFamilyDetails with member and record loading
    - Add searchFamilies functionality
    - _Requirements: 1.1, 1.2, 4.1_
  

  - [ ] 4.2 Implement medical record service methods

    - Create getFamilyMedicalRecords with authorization checks
    - Implement getMedicalRecordDetails with doctor notes
    - Add downloadMedicalRecord method for PDF file access
    - _Requirements: 2.1, 2.2, 2.3_
  
  - [ ] 4.3 Create connection request service methods


    - Implement getPendingConnectionRequests for doctors
    - Create acceptConnectionRequest with DoctorAssignment creation
    - Implement rejectConnectionRequest with status update
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  
  - [ ] 4.4 Implement doctor note service methods


    - Create addDoctorNote with authorization validation
    - Implement updateDoctorNote and deleteDoctorNote
    - Add methods to retrieve notes for medical records
    - _Requirements: 5.1, 5.2, 5.4, 5.5_

- [ ] 5. Create FamilyDoctorSecurityService





  - Implement canAccessFamily method using DoctorAssignment
  - Create canAccessMedicalRecord authorization logic
  - Add audit logging for all access attempts
  - _Requirements: 1.5, 2.5, 3.5, 5.3_

- [ ] 6. Implement GraphQL schema and resolvers



  - [ ] 6.1 Create GraphQL schema definition


    - Define Query type with family and medical record queries
    - Create Mutation type for connection requests and doctor notes
    - Define all necessary GraphQL types (Family, Member, MedicalRecord, etc.)
    - _Requirements: 1.1, 2.1, 3.1, 4.1_
  
  - [ ] 6.2 Implement GraphQL query resolvers


    - Create myPatientFamilies resolver with authentication
    - Implement familyDetails and familyMedicalRecords resolvers
    - Add pendingConnectionRequests and search resolvers
    - _Requirements: 1.1, 1.2, 2.1, 3.1, 4.1_
  
  - [ ] 6.3 Implement GraphQL mutation resolvers


    - Create acceptConnectionRequest and rejectConnectionRequest mutations
    - Implement addDoctorNote, updateDoctorNote, deleteDoctorNote mutations
    - Add proper error handling and validation
    - _Requirements: 3.3, 3.4, 5.1, 5.4, 5.5_

- [ ] 7. Add GraphQL security and authentication
  - [ ] 7.1 Integrate JWT authentication with GraphQL context
    - Configure GraphQL security to extract user from JWT token
    - Implement authentication checks in all resolvers
    - Add role-based authorization for doctor operations
    - _Requirements: 1.5, 2.5, 3.5, 5.3_
  
  - [ ] 7.2 Implement field-level authorization
    - Add authorization checks before accessing family data
    - Implement medical record access validation
    - Create audit logging for all GraphQL operations
    - _Requirements: 1.5, 2.5, 5.3_

- [ ] 8. Implement file handling for medical records
  - [ ] 8.1 Create PDF download functionality
    - Implement secure PDF file access through Cloudinary
    - Add proper content headers for PDF viewing and downloading
    - Create file access logging and authorization
    - _Requirements: 2.3, 2.4_
  
  - [ ] 8.2 Add file metadata handling
    - Implement file size and type validation
    - Create methods to handle original filename display
    - Add file access statistics and logging
    - _Requirements: 2.1, 2.2_

- [ ] 9. Add search and filtering capabilities
  - [ ] 9.1 Implement family search functionality
    - Create full-text search across family names and member names
    - Add filtering by family creation date and activity
    - Implement search result ranking and pagination
    - _Requirements: 4.1, 4.2_
  
  - [ ] 9.2 Create medical record filtering
    - Implement filtering by record type, date range, and family member
    - Add sorting by record date and relevance
    - Create advanced search across record metadata
    - _Requirements: 4.2, 4.3_

- [ ] 10. Add error handling and validation
  - [ ] 10.1 Create custom exception classes
    - Define FamilyNotFoundException and UnauthorizedFamilyAccessException
    - Implement MedicalRecordNotFoundException and validation exceptions
    - Create GraphQL error formatting and response handling
    - _Requirements: 1.5, 2.5, 3.5_
  
  - [ ] 10.2 Implement input validation
    - Add validation for all GraphQL input parameters
    - Create business logic validation for doctor operations
    - Implement data integrity checks and constraints
    - _Requirements: 3.4, 5.1, 5.4_

- [ ]* 11. Write comprehensive tests
  - [ ]* 11.1 Create unit tests for service layer
    - Write tests for FamilyDoctorService methods
    - Test authorization logic and security checks
    - Mock repository dependencies and external services
    - _Requirements: All_
  
  - [ ]* 11.2 Create integration tests for GraphQL
    - Test complete GraphQL queries and mutations
    - Verify authentication and authorization flows
    - Test error handling and edge cases
    - _Requirements: All_
  
  - [ ]* 11.3 Add repository layer tests
    - Create tests for custom JPA queries
    - Test data access and relationship loading
    - Verify database constraints and indexes
    - _Requirements: All_

- [ ] 12. Configure database migrations and indexes
  - [ ] 12.1 Create database migration scripts
    - Add migration for doctor_notes table creation
    - Create indexes for performance optimization
    - Add any missing constraints and foreign keys
    - _Requirements: 5.1_
  
  - [ ]* 12.2 Add performance monitoring
    - Implement query performance logging
    - Create database connection monitoring
    - Add GraphQL query complexity analysis
    - _Requirements: 4.3, 4.5_