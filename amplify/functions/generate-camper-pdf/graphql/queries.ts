/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "./API";
type GeneratedQuery<InputType, OutputType> = string & {
  __generatedQueryInput: InputType;
  __generatedQueryOutput: OutputType;
};

export const generateCamperPdf = /* GraphQL */ `query GenerateCamperPdf($camperSub: String!) {
  generateCamperPdf(camperSub: $camperSub) {
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
` as GeneratedQuery<
  APITypes.GenerateCamperPdfQueryVariables,
  APITypes.GenerateCamperPdfQuery
>;
export const getCamp = /* GraphQL */ `query GetCamp($id: ID!) {
  getCamp(id: $id) {
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
` as GeneratedQuery<APITypes.GetCampQueryVariables, APITypes.GetCampQuery>;
export const getCamperDocument = /* GraphQL */ `query GetCamperDocument($camperUserSub: ID!, $templateId: ID!) {
  getCamperDocument(camperUserSub: $camperUserSub, templateId: $templateId) {
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
` as GeneratedQuery<
  APITypes.GetCamperDocumentQueryVariables,
  APITypes.GetCamperDocumentQuery
>;
export const getCamperProfile = /* GraphQL */ `query GetCamperProfile($userSub: ID!) {
  getCamperProfile(userSub: $userSub) {
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
` as GeneratedQuery<
  APITypes.GetCamperProfileQueryVariables,
  APITypes.GetCamperProfileQuery
>;
export const getDocumentTemplate = /* GraphQL */ `query GetDocumentTemplate($id: ID!) {
  getDocumentTemplate(id: $id) {
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
` as GeneratedQuery<
  APITypes.GetDocumentTemplateQueryVariables,
  APITypes.GetDocumentTemplateQuery
>;
export const getRecommendation = /* GraphQL */ `query GetRecommendation($id: ID!) {
  getRecommendation(id: $id) {
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
` as GeneratedQuery<
  APITypes.GetRecommendationQueryVariables,
  APITypes.GetRecommendationQuery
>;
export const getRotarianProfile = /* GraphQL */ `query GetRotarianProfile($userSub: ID!) {
  getRotarianProfile(userSub: $userSub) {
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
` as GeneratedQuery<
  APITypes.GetRotarianProfileQueryVariables,
  APITypes.GetRotarianProfileQuery
>;
export const getRotarianReview = /* GraphQL */ `query GetRotarianReview($camperUserSub: ID!) {
  getRotarianReview(camperUserSub: $camperUserSub) {
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
` as GeneratedQuery<
  APITypes.GetRotarianReviewQueryVariables,
  APITypes.GetRotarianReviewQuery
>;
export const getRotaryClub = /* GraphQL */ `query GetRotaryClub($id: ID!) {
  getRotaryClub(id: $id) {
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
` as GeneratedQuery<
  APITypes.GetRotaryClubQueryVariables,
  APITypes.GetRotaryClubQuery
>;
export const getUser = /* GraphQL */ `query GetUser($username: String!) {
  getUser(username: $username)
}
` as GeneratedQuery<APITypes.GetUserQueryVariables, APITypes.GetUserQuery>;
export const listCamperDocuments = /* GraphQL */ `query ListCamperDocuments(
  $camperUserSub: ID
  $filter: ModelCamperDocumentFilterInput
  $limit: Int
  $nextToken: String
  $sortDirection: ModelSortDirection
  $templateId: ModelIDKeyConditionInput
) {
  listCamperDocuments(
    camperUserSub: $camperUserSub
    filter: $filter
    limit: $limit
    nextToken: $nextToken
    sortDirection: $sortDirection
    templateId: $templateId
  ) {
    items {
      approved
      camperUserSub
      createdAt
      filepath
      owner
      received
      templateId
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListCamperDocumentsQueryVariables,
  APITypes.ListCamperDocumentsQuery
>;
export const listCamperProfileByRotaryClubId = /* GraphQL */ `query ListCamperProfileByRotaryClubId(
  $filter: ModelCamperProfileFilterInput
  $limit: Int
  $nextToken: String
  $rotaryClubId: ID!
  $sortDirection: ModelSortDirection
) {
  listCamperProfileByRotaryClubId(
    filter: $filter
    limit: $limit
    nextToken: $nextToken
    rotaryClubId: $rotaryClubId
    sortDirection: $sortDirection
  ) {
    items {
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
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListCamperProfileByRotaryClubIdQueryVariables,
  APITypes.ListCamperProfileByRotaryClubIdQuery
>;
export const listCamperProfiles = /* GraphQL */ `query ListCamperProfiles(
  $filter: ModelCamperProfileFilterInput
  $limit: Int
  $nextToken: String
  $sortDirection: ModelSortDirection
  $userSub: ID
) {
  listCamperProfiles(
    filter: $filter
    limit: $limit
    nextToken: $nextToken
    sortDirection: $sortDirection
    userSub: $userSub
  ) {
    items {
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
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListCamperProfilesQueryVariables,
  APITypes.ListCamperProfilesQuery
>;
export const listCamps = /* GraphQL */ `query ListCamps(
  $filter: ModelCampFilterInput
  $limit: Int
  $nextToken: String
) {
  listCamps(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      applicationDeadline
      createdAt
      endDate
      id
      medicalFormDeadline
      startDate
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<APITypes.ListCampsQueryVariables, APITypes.ListCampsQuery>;
export const listDocumentTemplates = /* GraphQL */ `query ListDocumentTemplates(
  $filter: ModelDocumentTemplateFilterInput
  $limit: Int
  $nextToken: String
) {
  listDocumentTemplates(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
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
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListDocumentTemplatesQueryVariables,
  APITypes.ListDocumentTemplatesQuery
>;
export const listGroupsForUser = /* GraphQL */ `query ListGroupsForUser($username: String!) {
  listGroupsForUser(username: $username)
}
` as GeneratedQuery<
  APITypes.ListGroupsForUserQueryVariables,
  APITypes.ListGroupsForUserQuery
>;
export const listRecommendations = /* GraphQL */ `query ListRecommendations(
  $filter: ModelRecommendationFilterInput
  $limit: Int
  $nextToken: String
) {
  listRecommendations(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
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
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListRecommendationsQueryVariables,
  APITypes.ListRecommendationsQuery
>;
export const listRotarianProfiles = /* GraphQL */ `query ListRotarianProfiles(
  $filter: ModelRotarianProfileFilterInput
  $limit: Int
  $nextToken: String
  $sortDirection: ModelSortDirection
  $userSub: ID
) {
  listRotarianProfiles(
    filter: $filter
    limit: $limit
    nextToken: $nextToken
    sortDirection: $sortDirection
    userSub: $userSub
  ) {
    items {
      approved
      createdAt
      email
      firstName
      lastName
      owner
      rotaryClubId
      updatedAt
      userSub
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListRotarianProfilesQueryVariables,
  APITypes.ListRotarianProfilesQuery
>;
export const listRotarianReviews = /* GraphQL */ `query ListRotarianReviews(
  $camperUserSub: ID
  $filter: ModelRotarianReviewFilterInput
  $limit: Int
  $nextToken: String
  $sortDirection: ModelSortDirection
) {
  listRotarianReviews(
    camperUserSub: $camperUserSub
    filter: $filter
    limit: $limit
    nextToken: $nextToken
    sortDirection: $sortDirection
  ) {
    items {
      camperUserSub
      createdAt
      owner
      review
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListRotarianReviewsQueryVariables,
  APITypes.ListRotarianReviewsQuery
>;
export const listRotaryClubs = /* GraphQL */ `query ListRotaryClubs(
  $filter: ModelRotaryClubFilterInput
  $limit: Int
  $nextToken: String
) {
  listRotaryClubs(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      createdAt
      id
      name
      requiresApplication
      requiresLetterOfRecommendation
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListRotaryClubsQueryVariables,
  APITypes.ListRotaryClubsQuery
>;
export const listUsers = /* GraphQL */ `query ListUsers {
  listUsers
}
` as GeneratedQuery<APITypes.ListUsersQueryVariables, APITypes.ListUsersQuery>;
