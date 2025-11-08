# Doctor Registration and Query Workflow

## 1. Register a New Doctor

```graphql
mutation RegisterDoctor {
  registerDoctor(input: {
    fullName: "Dr. Nguyễn Văn A"
    email: "doctor@example.com"
    password: "securepassword123"
    doctorCode: "BS001"
    phoneNumber: "0123456789"
    address: "123 Đường ABC, Quận 1, TP.HCM"
    cccd: "123456789012"
  }) {
    userID
    email
    fullName
    role
    doctorCode
  }
}
```

## 2. Login as Doctor

```graphql
mutation Login {
  login(input: {
    email: "doctor@example.com"
    password: "securepassword123"
  }) {
    token
    user {
      userID
      email
      fullName
      role
      doctorCode
    }
  }
}
```

## 3. Use Doctor Queries (with JWT token in Authorization header)

### Get Patients Family
```graphql
query GetMyPatientsFamily {
  getMyPatientsFamily(familyId: 1) {
    familyID
    familyName
    address
    headOfFamily {
      fullName
      email
    }
  }
}
```

### Get Patient Details
```graphql
query GetDetailPatient {
  getDetailPatient(memberId: 1) {
    memberID
    fullName
    relationship
    cccd
  }
}
```

### Get Doctor Requests
```graphql
query GetRequestForDoctor {
  getRequestForDocter {
    requestID
    familyID
    doctorID
    message
    status
    requestDate
  }
}
```

### Download Medical Record File
```graphql
query DownloadMedicalRecordFile {
  downloadMedicalRecordFile(recordId: "1") {
    fileName
    fileUrl
    contentType
  }
}
```

## Key Features

1. **Validation**: All required fields are validated
2. **Security**: Password is encrypted before storage
3. **Unique Constraints**: Email and doctorCode must be unique
4. **Role Assignment**: Automatically assigns `BacSi` role
5. **JWT Authentication**: Required for accessing doctor queries
6. **Access Control**: Doctors can only access assigned patients

## Error Handling

- **Duplicate Email**: Returns UserAlreadyExistsException
- **Duplicate Doctor Code**: Returns UserAlreadyExistsException  
- **Invalid Input**: Returns validation errors
- **Unauthorized Access**: Returns 403 Forbidden for non-doctor users