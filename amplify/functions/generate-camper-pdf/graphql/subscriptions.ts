/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "./API";
type GeneratedSubscription<InputType, OutputType> = string & {
  __generatedSubscriptionInput: InputType;
  __generatedSubscriptionOutput: OutputType;
};

export const onCreateCamp = /* GraphQL */ `subscription OnCreateCamp($filter: ModelSubscriptionCampFilterInput) {
  onCreateCamp(filter: $filter) {
    applicationDeadline
    camperProfiles {
      nextToken
      __typename
    }
    createdAt
    documentTemplates {
      nextToken
      __typename
    }
    endDate
    filterState {
      acceptedCampers
      applicationComplete
      confirmedCampers
      documentsComplete
      profileComplete
      rejectedCampers
      __typename
    }
    id
    medicalFormDeadline
    startDate
    updatedAt
    viewState {
      address
      applicationComplete
      applicationFilepath
      arrivedAtCamp
      attendanceConfirmations
      birthdate
      camp
      campId
      city
      createdAt
      dietaryRestrictions
      dietaryRestrictionsNotes
      documents
      documentsComplete
      email
      emergencyContactName
      emergencyContactPhone
      emergencyContactRelationship
      firstName
      gender
      guidanceCounselorEmail
      guidanceCounselorName
      guidanceCounselorPhone
      highSchool
      identityId
      lastName
      middleInitial
      nickname
      parent1Email
      parent1FirstName
      parent1LastName
      parent1Phone
      parent2Email
      parent2FirstName
      parent2LastName
      parent2Phone
      phone
      profileComplete
      recommendation
      rotarianReview
      rotaryClub
      rotaryClubId
      state
      userSub
      zipcode
      __typename
    }
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnCreateCampSubscriptionVariables,
  APITypes.OnCreateCampSubscription
>;
export const onCreateCamperDocument = /* GraphQL */ `subscription OnCreateCamperDocument(
  $filter: ModelSubscriptionCamperDocumentFilterInput
  $owner: String
) {
  onCreateCamperDocument(filter: $filter, owner: $owner) {
    approved
    camper {
      address
      applicationComplete
      applicationFilepath
      arrivedAtCamp
      attendanceConfirmations
      birthdate
      campId
      city
      createdAt
      dietaryRestrictions
      dietaryRestrictionsNotes
      documentsComplete
      email
      emergencyContactName
      emergencyContactPhone
      emergencyContactRelationship
      firstName
      gender
      guidanceCounselorEmail
      guidanceCounselorName
      guidanceCounselorPhone
      highSchool
      identityId
      lastName
      middleInitial
      nickname
      owner
      parent1Email
      parent1FirstName
      parent1LastName
      parent1Phone
      parent2Email
      parent2FirstName
      parent2LastName
      parent2Phone
      phone
      profileComplete
      rotaryClubId
      state
      updatedAt
      userSub
      zipcode
      __typename
    }
    camperUserSub
    createdAt
    filepath
    owner
    received
    template {
      campId
      createdAt
      filepath
      id
      name
      required
      type
      updatedAt
      __typename
    }
    templateId
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnCreateCamperDocumentSubscriptionVariables,
  APITypes.OnCreateCamperDocumentSubscription
>;
export const onCreateCamperProfile = /* GraphQL */ `subscription OnCreateCamperProfile(
  $filter: ModelSubscriptionCamperProfileFilterInput
  $owner: String
) {
  onCreateCamperProfile(filter: $filter, owner: $owner) {
    address
    applicationComplete
    applicationFilepath
    arrivedAtCamp
    attendanceConfirmations
    birthdate
    camp {
      applicationDeadline
      createdAt
      endDate
      id
      medicalFormDeadline
      startDate
      updatedAt
      __typename
    }
    campId
    city
    createdAt
    dietaryRestrictions
    dietaryRestrictionsNotes
    documents {
      nextToken
      __typename
    }
    documentsComplete
    email
    emergencyContactName
    emergencyContactPhone
    emergencyContactRelationship
    firstName
    gender
    guidanceCounselorEmail
    guidanceCounselorName
    guidanceCounselorPhone
    highSchool
    identityId
    lastName
    middleInitial
    nickname
    owner
    parent1Email
    parent1FirstName
    parent1LastName
    parent1Phone
    parent2Email
    parent2FirstName
    parent2LastName
    parent2Phone
    phone
    profileComplete
    recommendation {
      nextToken
      __typename
    }
    rotarianReview {
      camperUserSub
      createdAt
      owner
      review
      updatedAt
      __typename
    }
    rotaryClub {
      createdAt
      id
      name
      requiresApplication
      requiresLetterOfRecommendation
      updatedAt
      __typename
    }
    rotaryClubId
    state
    updatedAt
    userSub
    zipcode
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnCreateCamperProfileSubscriptionVariables,
  APITypes.OnCreateCamperProfileSubscription
>;
export const onCreateDocumentTemplate = /* GraphQL */ `subscription OnCreateDocumentTemplate(
  $filter: ModelSubscriptionDocumentTemplateFilterInput
) {
  onCreateDocumentTemplate(filter: $filter) {
    camp {
      applicationDeadline
      createdAt
      endDate
      id
      medicalFormDeadline
      startDate
      updatedAt
      __typename
    }
    campId
    camperDocuments {
      nextToken
      __typename
    }
    createdAt
    filepath
    id
    name
    required
    type
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnCreateDocumentTemplateSubscriptionVariables,
  APITypes.OnCreateDocumentTemplateSubscription
>;
export const onCreateRecommendation = /* GraphQL */ `subscription OnCreateRecommendation(
  $filter: ModelSubscriptionRecommendationFilterInput
  $owner: String
) {
  onCreateRecommendation(filter: $filter, owner: $owner) {
    camper {
      address
      applicationComplete
      applicationFilepath
      arrivedAtCamp
      attendanceConfirmations
      birthdate
      campId
      city
      createdAt
      dietaryRestrictions
      dietaryRestrictionsNotes
      documentsComplete
      email
      emergencyContactName
      emergencyContactPhone
      emergencyContactRelationship
      firstName
      gender
      guidanceCounselorEmail
      guidanceCounselorName
      guidanceCounselorPhone
      highSchool
      identityId
      lastName
      middleInitial
      nickname
      owner
      parent1Email
      parent1FirstName
      parent1LastName
      parent1Phone
      parent2Email
      parent2FirstName
      parent2LastName
      parent2Phone
      phone
      profileComplete
      rotaryClubId
      state
      updatedAt
      userSub
      zipcode
      __typename
    }
    camperName
    camperUserSub
    createdAt
    emailAddress
    filepath
    id
    owner
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnCreateRecommendationSubscriptionVariables,
  APITypes.OnCreateRecommendationSubscription
>;
export const onCreateRotarianProfile = /* GraphQL */ `subscription OnCreateRotarianProfile(
  $filter: ModelSubscriptionRotarianProfileFilterInput
  $owner: String
) {
  onCreateRotarianProfile(filter: $filter, owner: $owner) {
    approved
    createdAt
    email
    firstName
    lastName
    owner
    rotaryClub {
      createdAt
      id
      name
      requiresApplication
      requiresLetterOfRecommendation
      updatedAt
      __typename
    }
    rotaryClubId
    updatedAt
    userSub
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnCreateRotarianProfileSubscriptionVariables,
  APITypes.OnCreateRotarianProfileSubscription
>;
export const onCreateRotarianReview = /* GraphQL */ `subscription OnCreateRotarianReview(
  $filter: ModelSubscriptionRotarianReviewFilterInput
  $owner: String
) {
  onCreateRotarianReview(filter: $filter, owner: $owner) {
    camper {
      address
      applicationComplete
      applicationFilepath
      arrivedAtCamp
      attendanceConfirmations
      birthdate
      campId
      city
      createdAt
      dietaryRestrictions
      dietaryRestrictionsNotes
      documentsComplete
      email
      emergencyContactName
      emergencyContactPhone
      emergencyContactRelationship
      firstName
      gender
      guidanceCounselorEmail
      guidanceCounselorName
      guidanceCounselorPhone
      highSchool
      identityId
      lastName
      middleInitial
      nickname
      owner
      parent1Email
      parent1FirstName
      parent1LastName
      parent1Phone
      parent2Email
      parent2FirstName
      parent2LastName
      parent2Phone
      phone
      profileComplete
      rotaryClubId
      state
      updatedAt
      userSub
      zipcode
      __typename
    }
    camperUserSub
    createdAt
    owner
    review
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnCreateRotarianReviewSubscriptionVariables,
  APITypes.OnCreateRotarianReviewSubscription
>;
export const onCreateRotaryClub = /* GraphQL */ `subscription OnCreateRotaryClub(
  $filter: ModelSubscriptionRotaryClubFilterInput
) {
  onCreateRotaryClub(filter: $filter) {
    camperProfiles {
      nextToken
      __typename
    }
    createdAt
    id
    name
    requiresApplication
    requiresLetterOfRecommendation
    rotarians {
      nextToken
      __typename
    }
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnCreateRotaryClubSubscriptionVariables,
  APITypes.OnCreateRotaryClubSubscription
>;
export const onDeleteCamp = /* GraphQL */ `subscription OnDeleteCamp($filter: ModelSubscriptionCampFilterInput) {
  onDeleteCamp(filter: $filter) {
    applicationDeadline
    camperProfiles {
      nextToken
      __typename
    }
    createdAt
    documentTemplates {
      nextToken
      __typename
    }
    endDate
    filterState {
      acceptedCampers
      applicationComplete
      confirmedCampers
      documentsComplete
      profileComplete
      rejectedCampers
      __typename
    }
    id
    medicalFormDeadline
    startDate
    updatedAt
    viewState {
      address
      applicationComplete
      applicationFilepath
      arrivedAtCamp
      attendanceConfirmations
      birthdate
      camp
      campId
      city
      createdAt
      dietaryRestrictions
      dietaryRestrictionsNotes
      documents
      documentsComplete
      email
      emergencyContactName
      emergencyContactPhone
      emergencyContactRelationship
      firstName
      gender
      guidanceCounselorEmail
      guidanceCounselorName
      guidanceCounselorPhone
      highSchool
      identityId
      lastName
      middleInitial
      nickname
      parent1Email
      parent1FirstName
      parent1LastName
      parent1Phone
      parent2Email
      parent2FirstName
      parent2LastName
      parent2Phone
      phone
      profileComplete
      recommendation
      rotarianReview
      rotaryClub
      rotaryClubId
      state
      userSub
      zipcode
      __typename
    }
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnDeleteCampSubscriptionVariables,
  APITypes.OnDeleteCampSubscription
>;
export const onDeleteCamperDocument = /* GraphQL */ `subscription OnDeleteCamperDocument(
  $filter: ModelSubscriptionCamperDocumentFilterInput
  $owner: String
) {
  onDeleteCamperDocument(filter: $filter, owner: $owner) {
    approved
    camper {
      address
      applicationComplete
      applicationFilepath
      arrivedAtCamp
      attendanceConfirmations
      birthdate
      campId
      city
      createdAt
      dietaryRestrictions
      dietaryRestrictionsNotes
      documentsComplete
      email
      emergencyContactName
      emergencyContactPhone
      emergencyContactRelationship
      firstName
      gender
      guidanceCounselorEmail
      guidanceCounselorName
      guidanceCounselorPhone
      highSchool
      identityId
      lastName
      middleInitial
      nickname
      owner
      parent1Email
      parent1FirstName
      parent1LastName
      parent1Phone
      parent2Email
      parent2FirstName
      parent2LastName
      parent2Phone
      phone
      profileComplete
      rotaryClubId
      state
      updatedAt
      userSub
      zipcode
      __typename
    }
    camperUserSub
    createdAt
    filepath
    owner
    received
    template {
      campId
      createdAt
      filepath
      id
      name
      required
      type
      updatedAt
      __typename
    }
    templateId
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnDeleteCamperDocumentSubscriptionVariables,
  APITypes.OnDeleteCamperDocumentSubscription
>;
export const onDeleteCamperProfile = /* GraphQL */ `subscription OnDeleteCamperProfile(
  $filter: ModelSubscriptionCamperProfileFilterInput
  $owner: String
) {
  onDeleteCamperProfile(filter: $filter, owner: $owner) {
    address
    applicationComplete
    applicationFilepath
    arrivedAtCamp
    attendanceConfirmations
    birthdate
    camp {
      applicationDeadline
      createdAt
      endDate
      id
      medicalFormDeadline
      startDate
      updatedAt
      __typename
    }
    campId
    city
    createdAt
    dietaryRestrictions
    dietaryRestrictionsNotes
    documents {
      nextToken
      __typename
    }
    documentsComplete
    email
    emergencyContactName
    emergencyContactPhone
    emergencyContactRelationship
    firstName
    gender
    guidanceCounselorEmail
    guidanceCounselorName
    guidanceCounselorPhone
    highSchool
    identityId
    lastName
    middleInitial
    nickname
    owner
    parent1Email
    parent1FirstName
    parent1LastName
    parent1Phone
    parent2Email
    parent2FirstName
    parent2LastName
    parent2Phone
    phone
    profileComplete
    recommendation {
      nextToken
      __typename
    }
    rotarianReview {
      camperUserSub
      createdAt
      owner
      review
      updatedAt
      __typename
    }
    rotaryClub {
      createdAt
      id
      name
      requiresApplication
      requiresLetterOfRecommendation
      updatedAt
      __typename
    }
    rotaryClubId
    state
    updatedAt
    userSub
    zipcode
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnDeleteCamperProfileSubscriptionVariables,
  APITypes.OnDeleteCamperProfileSubscription
>;
export const onDeleteDocumentTemplate = /* GraphQL */ `subscription OnDeleteDocumentTemplate(
  $filter: ModelSubscriptionDocumentTemplateFilterInput
) {
  onDeleteDocumentTemplate(filter: $filter) {
    camp {
      applicationDeadline
      createdAt
      endDate
      id
      medicalFormDeadline
      startDate
      updatedAt
      __typename
    }
    campId
    camperDocuments {
      nextToken
      __typename
    }
    createdAt
    filepath
    id
    name
    required
    type
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnDeleteDocumentTemplateSubscriptionVariables,
  APITypes.OnDeleteDocumentTemplateSubscription
>;
export const onDeleteRecommendation = /* GraphQL */ `subscription OnDeleteRecommendation(
  $filter: ModelSubscriptionRecommendationFilterInput
  $owner: String
) {
  onDeleteRecommendation(filter: $filter, owner: $owner) {
    camper {
      address
      applicationComplete
      applicationFilepath
      arrivedAtCamp
      attendanceConfirmations
      birthdate
      campId
      city
      createdAt
      dietaryRestrictions
      dietaryRestrictionsNotes
      documentsComplete
      email
      emergencyContactName
      emergencyContactPhone
      emergencyContactRelationship
      firstName
      gender
      guidanceCounselorEmail
      guidanceCounselorName
      guidanceCounselorPhone
      highSchool
      identityId
      lastName
      middleInitial
      nickname
      owner
      parent1Email
      parent1FirstName
      parent1LastName
      parent1Phone
      parent2Email
      parent2FirstName
      parent2LastName
      parent2Phone
      phone
      profileComplete
      rotaryClubId
      state
      updatedAt
      userSub
      zipcode
      __typename
    }
    camperName
    camperUserSub
    createdAt
    emailAddress
    filepath
    id
    owner
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnDeleteRecommendationSubscriptionVariables,
  APITypes.OnDeleteRecommendationSubscription
>;
export const onDeleteRotarianProfile = /* GraphQL */ `subscription OnDeleteRotarianProfile(
  $filter: ModelSubscriptionRotarianProfileFilterInput
  $owner: String
) {
  onDeleteRotarianProfile(filter: $filter, owner: $owner) {
    approved
    createdAt
    email
    firstName
    lastName
    owner
    rotaryClub {
      createdAt
      id
      name
      requiresApplication
      requiresLetterOfRecommendation
      updatedAt
      __typename
    }
    rotaryClubId
    updatedAt
    userSub
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnDeleteRotarianProfileSubscriptionVariables,
  APITypes.OnDeleteRotarianProfileSubscription
>;
export const onDeleteRotarianReview = /* GraphQL */ `subscription OnDeleteRotarianReview(
  $filter: ModelSubscriptionRotarianReviewFilterInput
  $owner: String
) {
  onDeleteRotarianReview(filter: $filter, owner: $owner) {
    camper {
      address
      applicationComplete
      applicationFilepath
      arrivedAtCamp
      attendanceConfirmations
      birthdate
      campId
      city
      createdAt
      dietaryRestrictions
      dietaryRestrictionsNotes
      documentsComplete
      email
      emergencyContactName
      emergencyContactPhone
      emergencyContactRelationship
      firstName
      gender
      guidanceCounselorEmail
      guidanceCounselorName
      guidanceCounselorPhone
      highSchool
      identityId
      lastName
      middleInitial
      nickname
      owner
      parent1Email
      parent1FirstName
      parent1LastName
      parent1Phone
      parent2Email
      parent2FirstName
      parent2LastName
      parent2Phone
      phone
      profileComplete
      rotaryClubId
      state
      updatedAt
      userSub
      zipcode
      __typename
    }
    camperUserSub
    createdAt
    owner
    review
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnDeleteRotarianReviewSubscriptionVariables,
  APITypes.OnDeleteRotarianReviewSubscription
>;
export const onDeleteRotaryClub = /* GraphQL */ `subscription OnDeleteRotaryClub(
  $filter: ModelSubscriptionRotaryClubFilterInput
) {
  onDeleteRotaryClub(filter: $filter) {
    camperProfiles {
      nextToken
      __typename
    }
    createdAt
    id
    name
    requiresApplication
    requiresLetterOfRecommendation
    rotarians {
      nextToken
      __typename
    }
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnDeleteRotaryClubSubscriptionVariables,
  APITypes.OnDeleteRotaryClubSubscription
>;
export const onUpdateCamp = /* GraphQL */ `subscription OnUpdateCamp($filter: ModelSubscriptionCampFilterInput) {
  onUpdateCamp(filter: $filter) {
    applicationDeadline
    camperProfiles {
      nextToken
      __typename
    }
    createdAt
    documentTemplates {
      nextToken
      __typename
    }
    endDate
    filterState {
      acceptedCampers
      applicationComplete
      confirmedCampers
      documentsComplete
      profileComplete
      rejectedCampers
      __typename
    }
    id
    medicalFormDeadline
    startDate
    updatedAt
    viewState {
      address
      applicationComplete
      applicationFilepath
      arrivedAtCamp
      attendanceConfirmations
      birthdate
      camp
      campId
      city
      createdAt
      dietaryRestrictions
      dietaryRestrictionsNotes
      documents
      documentsComplete
      email
      emergencyContactName
      emergencyContactPhone
      emergencyContactRelationship
      firstName
      gender
      guidanceCounselorEmail
      guidanceCounselorName
      guidanceCounselorPhone
      highSchool
      identityId
      lastName
      middleInitial
      nickname
      parent1Email
      parent1FirstName
      parent1LastName
      parent1Phone
      parent2Email
      parent2FirstName
      parent2LastName
      parent2Phone
      phone
      profileComplete
      recommendation
      rotarianReview
      rotaryClub
      rotaryClubId
      state
      userSub
      zipcode
      __typename
    }
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnUpdateCampSubscriptionVariables,
  APITypes.OnUpdateCampSubscription
>;
export const onUpdateCamperDocument = /* GraphQL */ `subscription OnUpdateCamperDocument(
  $filter: ModelSubscriptionCamperDocumentFilterInput
  $owner: String
) {
  onUpdateCamperDocument(filter: $filter, owner: $owner) {
    approved
    camper {
      address
      applicationComplete
      applicationFilepath
      arrivedAtCamp
      attendanceConfirmations
      birthdate
      campId
      city
      createdAt
      dietaryRestrictions
      dietaryRestrictionsNotes
      documentsComplete
      email
      emergencyContactName
      emergencyContactPhone
      emergencyContactRelationship
      firstName
      gender
      guidanceCounselorEmail
      guidanceCounselorName
      guidanceCounselorPhone
      highSchool
      identityId
      lastName
      middleInitial
      nickname
      owner
      parent1Email
      parent1FirstName
      parent1LastName
      parent1Phone
      parent2Email
      parent2FirstName
      parent2LastName
      parent2Phone
      phone
      profileComplete
      rotaryClubId
      state
      updatedAt
      userSub
      zipcode
      __typename
    }
    camperUserSub
    createdAt
    filepath
    owner
    received
    template {
      campId
      createdAt
      filepath
      id
      name
      required
      type
      updatedAt
      __typename
    }
    templateId
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnUpdateCamperDocumentSubscriptionVariables,
  APITypes.OnUpdateCamperDocumentSubscription
>;
export const onUpdateCamperProfile = /* GraphQL */ `subscription OnUpdateCamperProfile(
  $filter: ModelSubscriptionCamperProfileFilterInput
  $owner: String
) {
  onUpdateCamperProfile(filter: $filter, owner: $owner) {
    address
    applicationComplete
    applicationFilepath
    arrivedAtCamp
    attendanceConfirmations
    birthdate
    camp {
      applicationDeadline
      createdAt
      endDate
      id
      medicalFormDeadline
      startDate
      updatedAt
      __typename
    }
    campId
    city
    createdAt
    dietaryRestrictions
    dietaryRestrictionsNotes
    documents {
      nextToken
      __typename
    }
    documentsComplete
    email
    emergencyContactName
    emergencyContactPhone
    emergencyContactRelationship
    firstName
    gender
    guidanceCounselorEmail
    guidanceCounselorName
    guidanceCounselorPhone
    highSchool
    identityId
    lastName
    middleInitial
    nickname
    owner
    parent1Email
    parent1FirstName
    parent1LastName
    parent1Phone
    parent2Email
    parent2FirstName
    parent2LastName
    parent2Phone
    phone
    profileComplete
    recommendation {
      nextToken
      __typename
    }
    rotarianReview {
      camperUserSub
      createdAt
      owner
      review
      updatedAt
      __typename
    }
    rotaryClub {
      createdAt
      id
      name
      requiresApplication
      requiresLetterOfRecommendation
      updatedAt
      __typename
    }
    rotaryClubId
    state
    updatedAt
    userSub
    zipcode
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnUpdateCamperProfileSubscriptionVariables,
  APITypes.OnUpdateCamperProfileSubscription
>;
export const onUpdateDocumentTemplate = /* GraphQL */ `subscription OnUpdateDocumentTemplate(
  $filter: ModelSubscriptionDocumentTemplateFilterInput
) {
  onUpdateDocumentTemplate(filter: $filter) {
    camp {
      applicationDeadline
      createdAt
      endDate
      id
      medicalFormDeadline
      startDate
      updatedAt
      __typename
    }
    campId
    camperDocuments {
      nextToken
      __typename
    }
    createdAt
    filepath
    id
    name
    required
    type
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnUpdateDocumentTemplateSubscriptionVariables,
  APITypes.OnUpdateDocumentTemplateSubscription
>;
export const onUpdateRecommendation = /* GraphQL */ `subscription OnUpdateRecommendation(
  $filter: ModelSubscriptionRecommendationFilterInput
  $owner: String
) {
  onUpdateRecommendation(filter: $filter, owner: $owner) {
    camper {
      address
      applicationComplete
      applicationFilepath
      arrivedAtCamp
      attendanceConfirmations
      birthdate
      campId
      city
      createdAt
      dietaryRestrictions
      dietaryRestrictionsNotes
      documentsComplete
      email
      emergencyContactName
      emergencyContactPhone
      emergencyContactRelationship
      firstName
      gender
      guidanceCounselorEmail
      guidanceCounselorName
      guidanceCounselorPhone
      highSchool
      identityId
      lastName
      middleInitial
      nickname
      owner
      parent1Email
      parent1FirstName
      parent1LastName
      parent1Phone
      parent2Email
      parent2FirstName
      parent2LastName
      parent2Phone
      phone
      profileComplete
      rotaryClubId
      state
      updatedAt
      userSub
      zipcode
      __typename
    }
    camperName
    camperUserSub
    createdAt
    emailAddress
    filepath
    id
    owner
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnUpdateRecommendationSubscriptionVariables,
  APITypes.OnUpdateRecommendationSubscription
>;
export const onUpdateRotarianProfile = /* GraphQL */ `subscription OnUpdateRotarianProfile(
  $filter: ModelSubscriptionRotarianProfileFilterInput
  $owner: String
) {
  onUpdateRotarianProfile(filter: $filter, owner: $owner) {
    approved
    createdAt
    email
    firstName
    lastName
    owner
    rotaryClub {
      createdAt
      id
      name
      requiresApplication
      requiresLetterOfRecommendation
      updatedAt
      __typename
    }
    rotaryClubId
    updatedAt
    userSub
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnUpdateRotarianProfileSubscriptionVariables,
  APITypes.OnUpdateRotarianProfileSubscription
>;
export const onUpdateRotarianReview = /* GraphQL */ `subscription OnUpdateRotarianReview(
  $filter: ModelSubscriptionRotarianReviewFilterInput
  $owner: String
) {
  onUpdateRotarianReview(filter: $filter, owner: $owner) {
    camper {
      address
      applicationComplete
      applicationFilepath
      arrivedAtCamp
      attendanceConfirmations
      birthdate
      campId
      city
      createdAt
      dietaryRestrictions
      dietaryRestrictionsNotes
      documentsComplete
      email
      emergencyContactName
      emergencyContactPhone
      emergencyContactRelationship
      firstName
      gender
      guidanceCounselorEmail
      guidanceCounselorName
      guidanceCounselorPhone
      highSchool
      identityId
      lastName
      middleInitial
      nickname
      owner
      parent1Email
      parent1FirstName
      parent1LastName
      parent1Phone
      parent2Email
      parent2FirstName
      parent2LastName
      parent2Phone
      phone
      profileComplete
      rotaryClubId
      state
      updatedAt
      userSub
      zipcode
      __typename
    }
    camperUserSub
    createdAt
    owner
    review
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnUpdateRotarianReviewSubscriptionVariables,
  APITypes.OnUpdateRotarianReviewSubscription
>;
export const onUpdateRotaryClub = /* GraphQL */ `subscription OnUpdateRotaryClub(
  $filter: ModelSubscriptionRotaryClubFilterInput
) {
  onUpdateRotaryClub(filter: $filter) {
    camperProfiles {
      nextToken
      __typename
    }
    createdAt
    id
    name
    requiresApplication
    requiresLetterOfRecommendation
    rotarians {
      nextToken
      __typename
    }
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnUpdateRotaryClubSubscriptionVariables,
  APITypes.OnUpdateRotaryClubSubscription
>;
