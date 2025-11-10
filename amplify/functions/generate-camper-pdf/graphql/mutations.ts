/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "./API";
type GeneratedMutation<InputType, OutputType> = string & {
  __generatedMutationInput: InputType;
  __generatedMutationOutput: OutputType;
};

export const createCamp = /* GraphQL */ `mutation CreateCamp(
  $condition: ModelCampConditionInput
  $input: CreateCampInput!
) {
  createCamp(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.CreateCampMutationVariables,
  APITypes.CreateCampMutation
>;
export const createCamperDocument = /* GraphQL */ `mutation CreateCamperDocument(
  $condition: ModelCamperDocumentConditionInput
  $input: CreateCamperDocumentInput!
) {
  createCamperDocument(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.CreateCamperDocumentMutationVariables,
  APITypes.CreateCamperDocumentMutation
>;
export const createCamperProfile = /* GraphQL */ `mutation CreateCamperProfile(
  $condition: ModelCamperProfileConditionInput
  $input: CreateCamperProfileInput!
) {
  createCamperProfile(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.CreateCamperProfileMutationVariables,
  APITypes.CreateCamperProfileMutation
>;
export const createDocumentTemplate = /* GraphQL */ `mutation CreateDocumentTemplate(
  $condition: ModelDocumentTemplateConditionInput
  $input: CreateDocumentTemplateInput!
) {
  createDocumentTemplate(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.CreateDocumentTemplateMutationVariables,
  APITypes.CreateDocumentTemplateMutation
>;
export const createRecommendation = /* GraphQL */ `mutation CreateRecommendation(
  $condition: ModelRecommendationConditionInput
  $input: CreateRecommendationInput!
) {
  createRecommendation(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.CreateRecommendationMutationVariables,
  APITypes.CreateRecommendationMutation
>;
export const createRotarianProfile = /* GraphQL */ `mutation CreateRotarianProfile(
  $condition: ModelRotarianProfileConditionInput
  $input: CreateRotarianProfileInput!
) {
  createRotarianProfile(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.CreateRotarianProfileMutationVariables,
  APITypes.CreateRotarianProfileMutation
>;
export const createRotarianReview = /* GraphQL */ `mutation CreateRotarianReview(
  $condition: ModelRotarianReviewConditionInput
  $input: CreateRotarianReviewInput!
) {
  createRotarianReview(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.CreateRotarianReviewMutationVariables,
  APITypes.CreateRotarianReviewMutation
>;
export const createRotarianUser = /* GraphQL */ `mutation CreateRotarianUser($email: String!) {
  createRotarianUser(email: $email)
}
` as GeneratedMutation<
  APITypes.CreateRotarianUserMutationVariables,
  APITypes.CreateRotarianUserMutation
>;
export const createRotaryClub = /* GraphQL */ `mutation CreateRotaryClub(
  $condition: ModelRotaryClubConditionInput
  $input: CreateRotaryClubInput!
) {
  createRotaryClub(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.CreateRotaryClubMutationVariables,
  APITypes.CreateRotaryClubMutation
>;
export const deleteCamp = /* GraphQL */ `mutation DeleteCamp(
  $condition: ModelCampConditionInput
  $input: DeleteCampInput!
) {
  deleteCamp(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.DeleteCampMutationVariables,
  APITypes.DeleteCampMutation
>;
export const deleteCamperDocument = /* GraphQL */ `mutation DeleteCamperDocument(
  $condition: ModelCamperDocumentConditionInput
  $input: DeleteCamperDocumentInput!
) {
  deleteCamperDocument(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.DeleteCamperDocumentMutationVariables,
  APITypes.DeleteCamperDocumentMutation
>;
export const deleteCamperProfile = /* GraphQL */ `mutation DeleteCamperProfile(
  $condition: ModelCamperProfileConditionInput
  $input: DeleteCamperProfileInput!
) {
  deleteCamperProfile(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.DeleteCamperProfileMutationVariables,
  APITypes.DeleteCamperProfileMutation
>;
export const deleteDocumentTemplate = /* GraphQL */ `mutation DeleteDocumentTemplate(
  $condition: ModelDocumentTemplateConditionInput
  $input: DeleteDocumentTemplateInput!
) {
  deleteDocumentTemplate(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.DeleteDocumentTemplateMutationVariables,
  APITypes.DeleteDocumentTemplateMutation
>;
export const deleteRecommendation = /* GraphQL */ `mutation DeleteRecommendation(
  $condition: ModelRecommendationConditionInput
  $input: DeleteRecommendationInput!
) {
  deleteRecommendation(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.DeleteRecommendationMutationVariables,
  APITypes.DeleteRecommendationMutation
>;
export const deleteRotarianProfile = /* GraphQL */ `mutation DeleteRotarianProfile(
  $condition: ModelRotarianProfileConditionInput
  $input: DeleteRotarianProfileInput!
) {
  deleteRotarianProfile(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.DeleteRotarianProfileMutationVariables,
  APITypes.DeleteRotarianProfileMutation
>;
export const deleteRotarianReview = /* GraphQL */ `mutation DeleteRotarianReview(
  $condition: ModelRotarianReviewConditionInput
  $input: DeleteRotarianReviewInput!
) {
  deleteRotarianReview(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.DeleteRotarianReviewMutationVariables,
  APITypes.DeleteRotarianReviewMutation
>;
export const deleteRotaryClub = /* GraphQL */ `mutation DeleteRotaryClub(
  $condition: ModelRotaryClubConditionInput
  $input: DeleteRotaryClubInput!
) {
  deleteRotaryClub(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.DeleteRotaryClubMutationVariables,
  APITypes.DeleteRotaryClubMutation
>;
export const deleteUser = /* GraphQL */ `mutation DeleteUser($userSub: String!) {
  deleteUser(userSub: $userSub)
}
` as GeneratedMutation<
  APITypes.DeleteUserMutationVariables,
  APITypes.DeleteUserMutation
>;
export const sendEmail = /* GraphQL */ `mutation SendEmail(
  $body: String!
  $replyTo: String
  $subject: String!
  $to: String!
) {
  sendEmail(body: $body, replyTo: $replyTo, subject: $subject, to: $to)
}
` as GeneratedMutation<
  APITypes.SendEmailMutationVariables,
  APITypes.SendEmailMutation
>;
export const setUserGroup = /* GraphQL */ `mutation SetUserGroup($group: SetUserGroupGroup, $userSub: String!) {
  setUserGroup(group: $group, userSub: $userSub)
}
` as GeneratedMutation<
  APITypes.SetUserGroupMutationVariables,
  APITypes.SetUserGroupMutation
>;
export const setUserRoleToCamper = /* GraphQL */ `mutation SetUserRoleToCamper($userSub: String!) {
  setUserRoleToCamper(userSub: $userSub)
}
` as GeneratedMutation<
  APITypes.SetUserRoleToCamperMutationVariables,
  APITypes.SetUserRoleToCamperMutation
>;
export const updateCamp = /* GraphQL */ `mutation UpdateCamp(
  $condition: ModelCampConditionInput
  $input: UpdateCampInput!
) {
  updateCamp(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.UpdateCampMutationVariables,
  APITypes.UpdateCampMutation
>;
export const updateCamperDocument = /* GraphQL */ `mutation UpdateCamperDocument(
  $condition: ModelCamperDocumentConditionInput
  $input: UpdateCamperDocumentInput!
) {
  updateCamperDocument(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.UpdateCamperDocumentMutationVariables,
  APITypes.UpdateCamperDocumentMutation
>;
export const updateCamperProfile = /* GraphQL */ `mutation UpdateCamperProfile(
  $condition: ModelCamperProfileConditionInput
  $input: UpdateCamperProfileInput!
) {
  updateCamperProfile(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.UpdateCamperProfileMutationVariables,
  APITypes.UpdateCamperProfileMutation
>;
export const updateDocumentTemplate = /* GraphQL */ `mutation UpdateDocumentTemplate(
  $condition: ModelDocumentTemplateConditionInput
  $input: UpdateDocumentTemplateInput!
) {
  updateDocumentTemplate(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.UpdateDocumentTemplateMutationVariables,
  APITypes.UpdateDocumentTemplateMutation
>;
export const updateRecommendation = /* GraphQL */ `mutation UpdateRecommendation(
  $condition: ModelRecommendationConditionInput
  $input: UpdateRecommendationInput!
) {
  updateRecommendation(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.UpdateRecommendationMutationVariables,
  APITypes.UpdateRecommendationMutation
>;
export const updateRotarianProfile = /* GraphQL */ `mutation UpdateRotarianProfile(
  $condition: ModelRotarianProfileConditionInput
  $input: UpdateRotarianProfileInput!
) {
  updateRotarianProfile(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.UpdateRotarianProfileMutationVariables,
  APITypes.UpdateRotarianProfileMutation
>;
export const updateRotarianReview = /* GraphQL */ `mutation UpdateRotarianReview(
  $condition: ModelRotarianReviewConditionInput
  $input: UpdateRotarianReviewInput!
) {
  updateRotarianReview(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.UpdateRotarianReviewMutationVariables,
  APITypes.UpdateRotarianReviewMutation
>;
export const updateRotaryClub = /* GraphQL */ `mutation UpdateRotaryClub(
  $condition: ModelRotaryClubConditionInput
  $input: UpdateRotaryClubInput!
) {
  updateRotaryClub(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.UpdateRotaryClubMutationVariables,
  APITypes.UpdateRotaryClubMutation
>;
