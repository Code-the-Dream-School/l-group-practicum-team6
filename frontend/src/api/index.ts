export { apiFetch, ApiError } from './client';

export {
  ApiEndpoints,
  buildVisualizerDetailEndpoint,
  buildVisualizerImageEndpoint,
  buildSavedVisualEndpoint,
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

export { listVisualizers, getDemoVisualizer, getVisualizer } from './visualizers';
