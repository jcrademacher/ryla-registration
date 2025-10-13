import { defineStorage } from '@aws-amplify/backend';

// https://github.com/aws-amplify/amplify-js/issues/54#issuecomment-808501886

export const storage = defineStorage({
  name: 'rylaRegistrationStorage',
  access: (allow) => ({
    'camper-documents/{entity_id}/*': [
      allow.groups(['ADMINS']).to(['read', 'write', 'delete']),
      allow.entity('identity').to(['read', 'write', 'delete']),
      allow.groups(['ROTARIANS']).to(['read']),
    ],

    'templates/*': [
      allow.groups(['ADMINS']).to(['read', 'write', 'delete']),
      allow.authenticated.to(['read']),
    ]
  })
});