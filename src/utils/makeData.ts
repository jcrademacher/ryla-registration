// import { faker } from "@faker-js/faker";

// // Type definition matching CamperTable.tsx
// import { CamperProfileRowData } from "../pages/camp/CampManagementPage";

// export function generateFakeCamperProfile(): CamperProfileRowData {
//     const firstName = faker.person.firstName();
//     const lastName = faker.person.lastName();
//     const parent1FirstName = faker.person.firstName();
//     const parent1LastName = faker.person.lastName();
//     const parent2FirstName = faker.person.firstName();
//     const parent2LastName = faker.person.lastName();
//     const guidanceCounselorFirstName = faker.person.firstName();
//     const guidanceCounselorLastName = faker.person.lastName();
//     const emergencyContactFirstName = faker.person.firstName();
//     const emergencyContactLastName = faker.person.lastName();

//     // Generate birthdate for someone between 14-18 years old
//     const birthYear = faker.number.int({ min: 2006, max: 2010 });
//     const birthMonth = faker.number.int({ min: 1, max: 12 });
//     const birthDay = faker.number.int({ min: 1, max: 28 });
//     const birthdate = new Date(birthYear, birthMonth - 1, birthDay).toISOString().split('T')[0];

//     // Generate creation date within the last year
//     const createdAt = faker.date.recent({ days: 365 }).toISOString();
//     const updatedAt = faker.date.recent({ days: 30 }).toISOString();

//     return {
//         userSub: faker.string.uuid(),
//         email: faker.internet.email({ firstName, lastName }),
//         firstName,
//         middleInitial: faker.string.alpha({ length: 1, casing: 'upper' }),
//         lastName,
//         nickname: faker.helpers.arrayElement([faker.person.firstName(), '']),
//         birthdate,
//         phone: faker.phone.number(),
//         gender: faker.helpers.arrayElement(['Male', 'Female', 'Non-binary', 'Prefer not to say']),
//         address: faker.location.streetAddress(),
//         city: faker.location.city(),
//         state: faker.location.state({ abbreviated: true }),
//         zipcode: faker.location.zipCode('#####'),
//         highSchool: faker.helpers.arrayElement([
//             'Lincoln High School',
//             'Washington High School',
//             'Roosevelt High School',
//             'Jefferson High School',
//             'Madison High School',
//             'Adams High School',
//             'Monroe High School',
//             'Jackson High School'
//         ]),
//         guidanceCounselorName: `${guidanceCounselorFirstName} ${guidanceCounselorLastName}`,
//         guidanceCounselorEmail: faker.internet.email({ firstName: guidanceCounselorFirstName, lastName: guidanceCounselorLastName }),
//         guidanceCounselorPhone: faker.phone.number(),
//         dietaryRestrictions: faker.helpers.arrayElement([
//             'None',
//             'Vegetarian',
//             'Vegan',
//             'Gluten-Free',
//             'Dairy-Free',
//             'Nut Allergy',
//             'Shellfish Allergy'
//         ]),
//         dietaryRestrictionsNotes: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.3 }) || '',
//         parent1FirstName,
//         parent1LastName,
//         parent1Email: faker.internet.email({ firstName: parent1FirstName, lastName: parent1LastName }),
//         parent1Phone: faker.phone.number(),
//         parent2FirstName,
//         parent2LastName,
//         parent2Email: faker.internet.email({ firstName: parent2FirstName, lastName: parent2LastName }),
//         parent2Phone: faker.phone.number(),
//         emergencyContactName: `${emergencyContactFirstName} ${emergencyContactLastName}`,
//         emergencyContactPhone: faker.phone.number(),
//         sponsoringRotaryClub: faker.helpers.arrayElement([
//             'Rotary Club of Downtown',
//             'Rotary Club of Northside',
//             'Rotary Club of Southside',
//             'Rotary Club of Eastside',
//             'Rotary Club of Westside',
//             'Rotary Club of Central City',
//             'Rotary Club of Suburban',
//             'Rotary Club of Metropolitan'
//         ]),
//         profileComplete: faker.datatype.boolean(),
//         applicationComplete: faker.datatype.boolean(),
//         documentsComplete: faker.datatype.boolean(),
//         attendanceConfirmations: faker.number.int({ min: 0, max: 1 }),
//         createdAt,
//         updatedAt,
//         rotarianReview: {
//             camperUserSub: faker.string.uuid(),
//             review: faker.helpers.arrayElement(['APPROVED', 'REJECTED']),
//             createdAt,
//             updatedAt
//         }
//     };
// }

// export function generateFakeCamperProfiles(count: number): CamperProfileRowData[] {
//     return Array.from({ length: count }, () => generateFakeCamperProfile());
// }
