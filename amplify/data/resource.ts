import { type ClientSchema, a, defineData } from "@aws-amplify/backend";
import { createRotarianUser } from "../functions/create-rotarian-user/resource";
import { setUserRoleToCamper } from "../functions/set-user-role-to-camper/resource";
import { listUsers } from "../functions/list-users/resource";
import { listGroupsForUser } from "../functions/list-groups-for-user/resource";
import { setUserGroup } from "../functions/set-user-group/resource";
import { AUTH_GROUPS } from "../auth/utils";
import { deleteUser } from "../functions/delete-user/resource";
// import { generateInviteCode } from "../functions/generate-invite-code/resource";
// import { selectUserRole } from "../functions/select-user-role/resource";

/*== STEP 1 ===============================================================
The section below creates a Todo database table with a "content" field. Try
adding a new "isDone" field as a boolean. The authorization rule below
specifies that any user authenticated via an API key can "create", "read",
"update", and "delete" any "Todo" records.
=========================================================================*/
const schema = a.schema({

    // InviteCode: a.model({
    //     code: a.string().required(),
    //     expiresAt: a.datetime().required(),
    //     isActive: a.boolean().default(true),
    //     usedBy: a.string(), // userSub of who used it
    //     usedAt: a.datetime(),
    // })
    // .authorization((allow) => [
    //     allow.group("ADMINS").to(["create", "read", "update", "delete"]),
    //     allow.authenticated().to(["read"]), // Users need to read to validate codes
    // ]),
    RotarianProfile: a.model({
        userSub: a.id().required(),
        firstName: a.string(),
        lastName: a.string(),
        rotaryClub: a.string(),
        email: a.email().required(),
        approved: a.boolean()
    })
    .identifier(['userSub'])
    .authorization((allow) => [
        allow.group("ADMINS").to(["read", "update", "delete"]),
        allow.group("NEW").to(["create", "read"]),
        allow.owner().to(["read", "update"])
    ]),

    RotarianReview: a.model({
        camperUserSub: a.id().required(),
        camper: a.belongsTo('CamperProfile', 'camperUserSub'),
        review: a.enum(["APPROVED", "REJECTED", "PENDING"]),
    })
    .authorization((allow) => [
        allow.owner().to(["create", "read", "update", "delete"]), 
        allow.group("ROTARIANS").to(["create", "read"]),
        allow.group("ADMINS").to(["create", "read", "update", "delete"]),
        allow.authenticated().to(["read"])
    ]),

    CamperProfile: a.model({
        userSub: a.id().required(),
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
        sponsoringRotaryClub: a.string(),
        profileComplete: a.boolean().default(false),
        applicationComplete: a.boolean().default(false),
        documentsComplete: a.boolean().default(false),
        rotarianReview: a.hasOne('RotarianReview', 'camperUserSub')
    })
    .identifier(['userSub'])
    .authorization((allow) => [
        allow.owner(), 
        allow.group("ROTARIANS").to(["read"]),
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
        .authorization((allow) => [allow.group("NEW")])
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

    listUsers: a
        .query()
        .authorization((allow) => [allow.group("ADMINS")])
        .handler(a.handler.function(listUsers))
        .returns(a.json()),

    listGroupsForUser: a
        .query()
        .arguments({
            username: a.string().required()
        })
        .authorization((allow) => [allow.group("ADMINS")])
        .handler(a.handler.function(listGroupsForUser))
        .returns(a.json()),

    deleteUser: a
        .mutation()
        .arguments({
            userSub: a.string().required()
        })
        .authorization((allow) => [allow.group("ADMINS")])
        .handler(a.handler.function(deleteUser))
        .returns(a.json())

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
})

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
    schema,
    authorizationModes: {
        defaultAuthorizationMode: "userPool",
    },
});



