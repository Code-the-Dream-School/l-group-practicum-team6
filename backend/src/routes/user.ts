/*
    Here will be. So magic doors!!!Дописать will communcate with Controllers and Models
*/

import {Router} from 'express';
import { authenticateUser } from '../middleware/authentication';
import {
    showCurrentUser, 
    updateUser, 
    updateUserPassword,
    deleteUser,
    getUserVisuals,
    addVisualToCollection,
    removeVisualFromCollection,
} from '../controllers/user';

const router = Router();

// All routes are req auth 
router.use(authenticateUser)

// User profile , get, edit, remove
router.route('/user')
    .get(showCurrentUser)
    .patch(updateUser)
    .delete(deleteUser);

// Change password
router.route('/user/password')
    .patch(updateUserPassword);

// List of visuals
router.route('/user/visuals')
    .get(getUserVisuals);

// Manage with particular visual, remove , add
router.route('/user/visuals/:id')
    .post(addVisualToCollection)
    .delete(removeVisualFromCollection);

export default router;