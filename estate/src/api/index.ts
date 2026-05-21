export {
  EstateClient,
  EstateApiError,
  getEstateClient,
  configureEstateClient,
} from './estateClient';
export type { EstateClientConfig } from './estateClient';

export {
  fetchAdminProperties,
  fetchAdminProperty,
  createAdminProperty,
  updateAdminProperty,
  deleteAdminProperty,
  fetchPublicProperties,
  fetchPublicProperty,
  fetchPropertyPosts,
  linkPropertyToPost,
  unlinkPropertyPost,
  fetchPropertyTags,
  addPropertyTag,
  removePropertyTag,
  fetchPropertyMedia,
  addPropertyMedia,
  updatePropertyMedia,
  removePropertyMedia,
} from './properties';

export {
  submitInquiry,
  fetchInquiries,
} from './inquiries';

export {
  fetchSettings,
  fetchSetting,
  saveSetting,
} from './settings';
export type { EstateSetting } from './settings';
