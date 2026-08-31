import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireAdmin }  from '../../middleware/requireAdmin.middleware.js';
import {
    create,
    getAll,
    getOne,
    update,
    remove,
    getMembers,
    addMember,
  } from "./project.controller.js";
const router = Router();


// Create project — admin only
router.post('/', authenticate, requireAdmin, create);
router.post('/:id/members', authenticate, addMember);


// Get all task router
router.get('/', authenticate, getAll);
router.get('/:id', authenticate, getOne);

// Get task members router
router.get('/:id/members', authenticate, getMembers);


// Update task router
router.patch('/:id', authenticate, update);

// Delete task router
router.delete('/:id', authenticate, remove);
export default router;