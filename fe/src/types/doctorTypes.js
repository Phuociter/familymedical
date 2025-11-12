/**
 * @file JSDoc type definitions for Doctor Portal data models
 * This file contains all type definitions for family and patient management
 */

/**
 * @typedef {Object} FamilyDetail
 * @property {string} familyID
 * @property {string} familyName
 * @property {string} familyAddress
 * @property {'active'|'monitoring'|'normal'} status
 * @property {string} lastVisit - ISO date string
 * @property {string} registrationDate - ISO date string
 * @property {string} assignedDoctor
 * @property {number} visitCount
 * @property {HouseholdHead} headOfFamily
 * @property {Member[]} members
 * @property {string} notes
 */

/**
 * @typedef {Object} HouseholdHead
 * @property {string} memberID
 * @property {string} fullName
 * @property {string} phoneNumber
 * @property {string} [email]
 * @property {string} cccd
 * @property {string} dateOfBirth
 */

/**
 * @typedef {Object} Member
 * @property {string} memberID
 * @property {string} fullName
 * @property {string} relationship
 * @property {string} cccd
 * @property {string} dateOfBirth
 * @property {'Nam'|'Nữ'} gender
 * @property {string} [phoneNumber]
 * @property {string} [email]
 * @property {'normal'|'monitoring'|'active'} healthStatus
 * @property {number} recentVisitCount
 * @property {string} [lastVisitDate]
 */

/**
 * @typedef {Object} FamilyBackground
 * @property {string} familyID
 * @property {HereditaryDisease[]} hereditaryDiseases
 * @property {RiskFactor[]} riskFactors
 * @property {string} doctorNotes
 */

/**
 * @typedef {Object} HereditaryDisease
 * @property {string} diseaseID
 * @property {string} diseaseName
 * @property {string[]} affectedMembers - Array of memberIDs
 * @property {string} notes
 */

/**
 * @typedef {Object} RiskFactor
 * @property {string} factorID
 * @property {string} factorName
 * @property {number} prevalence - Percentage
 * @property {string[]} affectedMembers
 */

/**
 * @typedef {Object} PatientDetail
 * @property {string} memberID
 * @property {string} fullName
 * @property {string} dateOfBirth
 * @property {'Nam'|'Nữ'} gender
 * @property {string} cccd
 * @property {string} [phoneNumber]
 * @property {string} [email]
 * @property {string} [photoURL]
 * @property {number} totalVisits
 * @property {string} [lastVisitDate]
 * @property {'normal'|'monitoring'|'active'} currentStatus
 * @property {string} familyID
 * @property {string} relationship
 */

/**
 * @typedef {Object} HealthIndicator
 * @property {string} indicatorID
 * @property {'blood_pressure'|'blood_sugar'|'bmi'|'heart_rate'|'temperature'|'weight'|'height'} indicatorType
 * @property {number|string} value
 * @property {string} unit
 * @property {string} measurementDate
 * @property {'normal'|'warning'|'critical'} status
 * @property {{min: number, max: number}} normalRange
 */

/**
 * @typedef {Object} PatientBackground
 * @property {string} memberID
 * @property {UnderlyingCondition[]} underlyingConditions
 * @property {Allergy[]} allergies
 * @property {Surgery[]} pastSurgeries
 * @property {string} familyMedicalHistory
 */

/**
 * @typedef {Object} UnderlyingCondition
 * @property {string} conditionID
 * @property {string} conditionName
 * @property {string} diagnosisDate
 * @property {'active'|'controlled'|'resolved'} status
 * @property {string} notes
 */

/**
 * @typedef {Object} Allergy
 * @property {string} allergyID
 * @property {string} allergen
 * @property {string} reactionType
 * @property {'mild'|'moderate'|'severe'} severity
 * @property {string} notes
 */

/**
 * @typedef {Object} Surgery
 * @property {string} surgeryID
 * @property {string} procedureName
 * @property {string} surgeryDate
 * @property {string} hospital
 * @property {string} outcome
 * @property {string} notes
 */

/**
 * @typedef {Object} MedicalRecord
 * @property {string} recordID
 * @property {string} memberID
 * @property {string} recordDate
 * @property {string} symptoms
 * @property {string} [clinicalFindings]
 * @property {string} diagnosis
 * @property {string[]} [diagnosisCodes] - ICD-10 codes
 * @property {string} treatmentPlan
 * @property {Prescription[]} prescriptions
 * @property {TestResult[]} [testResults]
 * @property {string} [fileLink]
 * @property {string} doctorID
 * @property {string} doctorName
 * @property {string} [followUpDate]
 * @property {string} notes
 */

/**
 * @typedef {Object} Prescription
 * @property {string} prescriptionID
 * @property {string} recordID
 * @property {string} medicationName
 * @property {string} dosage
 * @property {string} frequency
 * @property {string} duration - e.g., "7 days", "2 weeks"
 * @property {string} startDate
 * @property {string} endDate
 * @property {'active'|'completed'|'discontinued'} status
 * @property {string} instructions
 */

/**
 * @typedef {Object} TestResult
 * @property {string} testResultID
 * @property {string} recordID
 * @property {string} testType
 * @property {string} testName
 * @property {string} testDate
 * @property {TestResultItem[]} results
 * @property {string} interpretation
 * @property {string} [fileLink]
 */

/**
 * @typedef {Object} TestResultItem
 * @property {string} parameterName
 * @property {number|string} value
 * @property {string} unit
 * @property {string} normalRange
 * @property {'normal'|'abnormal'} status
 */

/**
 * @typedef {Object} MedicalImage
 * @property {string} imageID
 * @property {string} memberID
 * @property {string} [recordID]
 * @property {'xray'|'ultrasound'|'ct'|'mri'|'other'} imageType
 * @property {string} imageDate
 * @property {string} imageURL
 * @property {string} thumbnailURL
 * @property {string} description
 * @property {string} notes
 */

/**
 * @typedef {Object} ExaminationForm
 * @property {string} memberID
 * @property {string} symptoms
 * @property {string} clinicalFindings
 * @property {string} diagnosis
 * @property {string[]} diagnosisCodes
 * @property {PrescriptionForm[]} prescriptions
 * @property {string[]} testOrders
 * @property {string} [followUpDate]
 * @property {string} notes
 */

/**
 * @typedef {Object} PrescriptionForm
 * @property {string} medicationName
 * @property {string} dosage
 * @property {string} frequency
 * @property {string} duration
 * @property {string} instructions
 */

/**
 * @typedef {Object} FamilyHealthReport
 * @property {string} familyID
 * @property {string} reportDate
 * @property {{start: string, end: string}} dateRange
 * @property {{totalMembers: number, totalVisits: number, totalCost: number}} familySummary
 * @property {MemberHealthSummary[]} memberHealthStatus
 * @property {DiseaseTrend[]} diseaseTrends
 * @property {CostAnalysis} costAnalysis
 */

/**
 * @typedef {Object} MemberHealthSummary
 * @property {string} memberID
 * @property {string} fullName
 * @property {number} visitCount
 * @property {string[]} mainDiagnoses
 * @property {string} healthStatus
 */

/**
 * @typedef {Object} DiseaseTrend
 * @property {string} diseaseName
 * @property {number} occurrenceCount
 * @property {number} affectedMembers
 * @property {'increasing'|'stable'|'decreasing'} trend
 */

/**
 * @typedef {Object} CostAnalysis
 * @property {number} totalCost
 * @property {Array<{category: string, amount: number}>} costByCategory
 * @property {Array<{memberID: string, fullName: string, amount: number}>} costByMember
 * @property {Array<{month: string, amount: number}>} monthlyTrend
 */

// Export empty object to make this a module
export {};
