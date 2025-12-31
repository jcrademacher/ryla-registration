import { type ClientSchema, a, defineData } from "@aws-amplify/backend";
import { createRotarianUser } from "../functions/create-rotarian-user/resource";
import { setUserRoleToCamper } from "../functions/set-user-role-to-camper/resource";
import { listUsers } from "../functions/list-users/resource";
import { setUserGroup } from "../functions/set-user-group/resource";
import { AUTH_GROUPS } from "../auth/utils";
import { deleteUser } from "../functions/delete-user/resource";
import { getUser } from "../functions/get-user/resource";
import { sendEmail } from "../functions/send-email/resource";
import { generateCamperPdf } from "../functions/generate-camper-pdf/resource";
import { sendEmailToAdmins } from "../functions/send-email-to-admins/resource";
import { notifyAdmittedCampers } from "../functions/notify-admitted-campers/resource";
import { sendEmailToClubReps } from "../functions/send-email-to-club-reps/resource";
// import { generateInviteCode } from "../functions/generate-invite-code/resource";
// import { selectUserRole } from "../functions/select-user-role/resource";

/*== STEP 1 ===============================================================
The section below creates a Todo database table with a "content" field. Try
adding a new "isDone" field as a boolean. The authorization rule below
specifies that any user authenticated via an API key can "create", "read",
"update", and "delete" any "Todo" records.
=========================================================================*/
const CamperProfileModel = {
    userSub: a.id().required(),
    identityId: a.string().required(),
    email: a.email().required(),
    firstName: a.string(),
    middleInitial: a.string(),
    lastName: a.string(),
    nickname: a.string(),
    birthdate: a.date(),
    phone: a.phone(),
    gender: a.string(),
    address: a.string(),
    city: a.string(),
    state: a.string(),
    zipcode: a.string(),
    highSchool: a.string(),
    guidanceCounselorName: a.string(),
    guidanceCounselorEmail: a.string(),
    guidanceCounselorPhone: a.phone(),
    dietaryRestrictions: a.string(),
    dietaryRestrictionsNotes: a.string(),
    parent1FirstName: a.string(),
    parent1LastName: a.string(),
    parent1Email: a.email(),
    parent1Phone: a.phone(),
    parent2FirstName: a.string(),
    parent2LastName: a.string(),
    parent2Email: a.email(),
    parent2Phone: a.phone(),
    emergencyContactName: a.string(),
    emergencyContactPhone: a.phone(),
    emergencyContactRelationship: a.string(),
    rotaryClubId: a.id().authorization((allow) => [
        allow.group("ROTARIANS").to(["read", "update"]),
        allow.group("COORDINATORS").to(["read", "update"]),
        allow.group("ADMINS"),
        allow.owner()
    ]),
    rotaryClub: a.belongsTo('RotaryClub', 'rotaryClubId'),
    profileComplete: a.boolean().default(false),
    applicationComplete: a.boolean().default(false),
    applicationSubmittedAt: a.datetime(),
    documentsComplete: a.boolean().default(false),
    rotarianReview: a.hasOne('RotarianReview', 'camperUserSub'),
    attendanceConfirmations: a.integer().default(0),
    arrivedAtCamp: a.boolean().default(false),
    campId: a.id().required(),
    camp: a.belongsTo('Camp', 'campId'),
    documents: a.hasMany('CamperDocument', 'camperUserSub'),
    applicationFilepath: a.string(),
    recommendation: a.hasMany('Recommendation', 'camperUserSub'),
    tshirtSize: a.string()
};

const CamperProfileModelViewState: Record<keyof typeof CamperProfileModel & 'createdAt', any> = {
    ...Object.fromEntries(
        Object.keys(CamperProfileModel).map(key => [key, a.boolean()])
    ),
    createdAt: a.boolean()
};



const schema = a.schema({
    CamperProfileViewState: a.customType(CamperProfileModelViewState),
    CamperProfileFilterState: a.customType({
        profileComplete: a.boolean(),
        applicationComplete: a.boolean(),
        documentsComplete: a.boolean(),
        acceptedCampers: a.boolean(),
        rejectedCampers: a.boolean(),
        confirmedCampers: a.boolean(),
    }),

    Recommendation: a.model({
        camperUserSub: a.id().required(),
        camper: a.belongsTo('CamperProfile', 'camperUserSub'),
        filepath: a.string().authorization((allow) => [
            allow.groups(["ADMINS"]), 
            allow.groups(["ROTARIANS"]).to(["read"]), 
            allow.groups(["COORDINATORS"]).to(["read"]),
            allow.guest().to(['read','update']),
            allow.owner()
        ]),
        emailAddress: a.email().required(),
        camperName: a.string(),
    })
    .authorization((allow) => [
        allow.owner(),
        allow.group("ADMINS").to(['create', 'read', 'update', 'delete']),
        allow.group("ROTARIANS").to(['read']),
        allow.group("COORDINATORS").to(['read']),
        allow.guest().to(['read']),
    ]),

    CamperDocument: a.model({
        camperUserSub: a.id().required(),
        camper: a.belongsTo('CamperProfile', 'camperUserSub'),
        filepath: a.string(),
        received: a.boolean(),
        templateId: a.id().required(),
        template: a.belongsTo('DocumentTemplate', 'templateId'),
        owner: a.string().authorization((allow) => [
            allow.owner().to(['read']),
            allow.group("ADMINS").to(["read", "update", "delete"]),
        ]),
        approved: a.boolean().default(true),
    })
    .identifier(['camperUserSub', 'templateId'])
    .secondaryIndexes((index) => [index('camperUserSub')])
    .authorization((allow) => [
        allow.owner(),
        allow.group("ROTARIANS").to(["read"]),
        allow.group("COORDINATORS").to(["read"]),
        allow.group("ADMINS").to(["read", "create","update", "delete"]),

    ]),

    DocumentTemplate: a.model({
        filepath: a.string(),
        name: a.string(),
        required: a.boolean(),
        type: a.enum(["viewonly", "upload", "mail"]),
        campId: a.id().required(),
        camp: a.belongsTo('Camp', 'campId'),
        camperDocuments: a.hasMany('CamperDocument', 'templateId')
    })
    .authorization((allow) => [
        allow.group("ADMINS").to(["create", "read", "update", "delete"]),
        allow.authenticated().to(["read"])
    ]),

    Camp: a.model({
        name: a.string(),
        startDate: a.datetime().required(),
        endDate: a.datetime().required(),
        applicationOpenDate: a.datetime().required(),
        applicationDeadline: a.datetime().required(),
        medicalFormDeadline: a.datetime(),
        camperProfiles: a.hasMany('CamperProfile', 'campId'),
        viewState: a.ref('CamperProfileViewState'),
        filterState: a.ref('CamperProfileFilterState'),
        documentTemplates: a.hasMany('DocumentTemplate', 'campId'),
    })
        .authorization((allow) => [
            allow.group("ADMINS").to(["create", "read", "update", "delete"]),
            allow.group("ROTARIANS").to(["read"]),
            allow.group("COORDINATORS").to(["read"]),
            allow.authenticated().to(["read"])
        ]),

    RotaryClub: a.model({
        name: a.string().required(),
        rotarians: a.hasMany('RotarianProfile', 'rotaryClubId'),
        camperProfiles: a.hasMany('CamperProfile', 'rotaryClubId'),
        requiresApplication: a.boolean(),
        requiresLetterOfRecommendation: a.boolean(),
        numRequiredLetters: a.integer(),
        requiresInterview: a.boolean()
    })
    .authorization((allow) => [
        allow.authenticated().to(["read"]),
        allow.group("ADMINS").to(["create", "read", "update", "delete"])
    ]),

    RotarianProfile: a.model({
        userSub: a.id().required(),
        firstName: a.string(),
        lastName: a.string(),
        rotaryClubId: a.id(),
        rotaryClub: a.belongsTo('RotaryClub', 'rotaryClubId'),
        email: a.email().required(),
        approved: a.boolean(),
        owner: a.string().authorization((allow) => [
            allow.owner().to(['read']),
            allow.group("ADMINS").to(["create", "read", "update", "delete"]),
        ]),
    })
        .identifier(['userSub'])
        .authorization((allow) => [
            allow.owner(),
            allow.group("ADMINS").to(["create", "read", "update", "delete"]),
        ]),

    GroupRequest: a.model({
        userSub: a.id().required(),
        firstName: a.string().required(),
        lastName: a.string().required(),
        email: a.email().required(),
        group: a.string().required(),
        rotaryClubId: a.id()
    })
        .identifier(['userSub'])
        .authorization((allow) => [
            allow.owner(),
            allow.group("ADMINS").to(["read", "update", "delete"]),
            allow.group("NEW").to(["create"])
        ]),

    RotarianReviewDecision: a.enum(["APPROVED", "REJECTED"]),

    RotarianReview: a.model({
        camperUserSub: a.id().required(),
        camper: a.belongsTo('CamperProfile', 'camperUserSub'),
        review: a.ref('RotarianReviewDecision'),
        camperNotifiedOn: a.datetime().authorization((allow) => [
            allow.group("ADMINS"), 
            allow.group("ROTARIANS").to(["read"]),
            allow.group("COORDINATORS").to(["read"]),
            allow.authenticated().to(["read"])
        ])
    })
        .identifier(['camperUserSub'])
        .authorization((allow) => [
            allow.group("ROTARIANS").to(["read"]),
            allow.group("COORDINATORS"),
            allow.group("ADMINS"),
            allow.authenticated().to(["read"])
        ]),

    CamperProfile: a.model(CamperProfileModel)
        .identifier(['userSub'])
        .secondaryIndexes((index) => [index('campId')])
        .authorization((allow) => [
            allow.owner(),
            allow.group("ROTARIANS").to(["read"]),
            allow.group("COORDINATORS").to(["read"]),
            allow.group("ADMINS").to(["create", "read", "update", "delete"])
        ]),

    createRotarianUser: a
        .mutation()
        .arguments({
            email: a.string().required()
        })
        .authorization((allow) => [allow.group("ADMINS")])
        .handler(a.handler.function(createRotarianUser))
        .returns(a.json()),

    setUserRoleToCamper: a
        .mutation()
        .arguments({
            userSub: a.string().required(),
        })
        .authorization((allow) => [allow.group("NEW"), allow.group("ADMINS")])
        .handler(a.handler.function(setUserRoleToCamper))
        .returns(a.json()),

    setUserGroup: a
        .mutation()
        .arguments({
            userSub: a.string().required(),
            group: a.enum(AUTH_GROUPS),
        })
        .authorization((allow) => [allow.group("ADMINS")])
        .handler(a.handler.function(setUserGroup))
        .returns(a.json()),

    UserProfile: a.customType({
        userSub: a.id().required(),
        email: a.string().required(),
        groupNames: a.string().required().array().required(),
        createdAt: a.datetime().required(),
        verified: a.boolean().required(),
    }),

    listUsers: a
        .query()
        .authorization((allow) => [allow.group("ADMINS")])
        .handler(a.handler.function(listUsers))
        .returns(a.ref('UserProfile').required().array().required()),

    deleteUser: a
        .mutation()
        .arguments({
            userSub: a.string().required()
        })
        .authorization((allow) => [allow.group("ADMINS")])
        .handler(a.handler.function(deleteUser))
        .returns(a.json()),

    getUser: a
        .query()
        .arguments({
            username: a.string().required()
        })
        .authorization((allow) => [allow.group("ADMINS"), allow.group("ROTARIANS"), allow.group("COORDINATORS")])
        .handler(a.handler.function(getUser))
        .returns(a.ref('UserProfile')),

    sendEmail: a
        .mutation()
        .arguments({
            to: a.string().array().required(),
            subject: a.string().required(),
            body: a.string().required(),
            replyTo: a.string()
        })
        .authorization((allow) => [allow.authenticated()])
        .handler(a.handler.function(sendEmail))
        .returns(a.json()),

    sendEmailToAdmins: a
        .mutation()
        .arguments({
            subject: a.string().required(),
            body: a.string().required(),
            replyTo: a.string()
        })
        .authorization((allow) => [allow.authenticated()])
        .handler(a.handler.function(sendEmailToAdmins))
        .returns(a.json()),

    sendEmailToClubReps: a
        .mutation()
        .arguments({
            subject: a.string().required(),
            body: a.string().required(),
            replyTo: a.string(),
            rotaryClubId: a.id().required(),
        })
        .authorization((allow) => [allow.authenticated()])
        .handler(a.handler.function(sendEmailToClubReps))
        .returns(a.json()),
        
    generateCamperPdf: a
        .query()
        .arguments({
            camperSub: a.string().required()
        })
        .authorization((allow) => [allow.group("ADMINS"), allow.group("ROTARIANS"), allow.group("COORDINATORS")])
        .handler(a.handler.function(generateCamperPdf))
        .returns(a.string()),
    // generateInviteCode: a
    //     .mutation()
    //     .authorization((allow) => [allow.group("ADMINS")])
    //     .handler(a.handler.function(generateInviteCode))
    //     .returns(a.json()),

    // selectUserRole: a
    //     .mutation()
    //     .arguments({
    //         userSub: a.string().required(),
    //         role: a.enum(["CAMPERS", "ROTARIANS"]),
    //         inviteCode: a.string()
    //     })
    //     .authorization((allow) => [allow.authenticated()])
    //     .handler(a.handler.function(selectUserRole))
    //     .returns(a.json()),

    // createCamperUser: a
    //     .mutation()
    //     .arguments({
    //         email: a.string().required()
    //     })
    //     .authorization((allow) => [allow.group("ADMINS"), allow.group("ROTARIANS")])
    //     .handler(a.handler.function(createCamperUser))
    //     .returns(a.json())
}).authorization((allow) => [
    allow.resource(generateCamperPdf).to(["query"]),
    allow.resource(notifyAdmittedCampers).to(["query", "mutate"]),
    allow.resource(sendEmailToClubReps).to(["query"]),
]);

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
    schema,
    authorizationModes: {
        defaultAuthorizationMode: "userPool",
    },
});



