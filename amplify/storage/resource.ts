import { defineStorage } from '@aws-amplify/backend';
import { generateCamperPdf } from '../functions/generate-camper-pdf/resource';

// https://github.com/aws-amplify/amplify-js/issues/54#issuecomment-808501886
// https://github.com/aws-amplify/amplify-backend/issues/1771

export const storage = defineStorage({
  name: 'rylaRegistrationStorage',
  access: (allow) => ({
    'camper-documents/{entity_id}/*': [
      allow.groups(['ADMINS']).to(['read', 'write', 'delete']),
      allow.entity('identity').to(['read', 'write', 'delete']),
      allow.groups(['ROTARIANS']).to(['read']),
    ],
    'camper-recommendations/*': [
      allow.groups(['ADMINS']).to(['read', 'write', 'delete']),
      allow.groups(['ROTARIANS']).to(['read']),
      allow.authenticated.to(['read', 'write', 'delete']),
      allow.guest.to(['read', 'write']),
    ],

    'templates/*': [
      allow.groups(['ADMINS']).to(['read', 'write', 'delete']),
      allow.authenticated.to(['read']),
    ],
    'camper-packages/*': [
      allow.resource(generateCamperPdf).to(['read', 'write', 'delete']),
      allow.groups(['ADMINS']).to(['read']),
      allow.groups(['ROTARIANS']).to(['read'])
    ]
  })
});