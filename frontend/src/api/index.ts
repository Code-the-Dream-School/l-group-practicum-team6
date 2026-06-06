export { apiFetch, ApiError } from './client';

export {
  buildVisualizerEndpoint,
  buildVisualizerImageEndpoint,
  buildUserVisualEndpoint,
} from './endpoints';

export { getUser, login, register, logout } from './auth';

export {
  updateProfile,
  changePassword,
  deleteAccount,
  getSavedVisuals,
  saveVisual,
  removeVisual,
} from './users';

export { uploadAvatar, deleteAvatar, uploadVisualizerImage, deleteVisualizerImage } from './images';

export {
  listVisualizers,
  getDemoVisualizer,
  getVisualizer,
  getVisualizerTags,
} from './visualizers';

export {
  createAdminVisualizer,
  updateAdminVisualizer,
  deleteAdminVisualizer,
} from './adminVisualizers';
