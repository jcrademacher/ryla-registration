import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'rylaRegistrationStorage',
  access: (allow) => ({
    'camper-documents/{entity_id}/*': [
        allow.groups(['ADMINS']).to(['read', 'write', 'delete']),
        allow.entity('identity').to(['read', 'write', 'delete']),
        allow.groups(['ROTARIANS']).to(['read']),
    ],
  })
});