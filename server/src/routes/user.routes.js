import express from 'express'
import { userController } from '../controllers/user.controller.js'
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware.js'

const router = express.Router()

router.use(authMiddleware)

router.get('/profile', userController.getProfile)
router.put('/profile', userController.updateProfile)
router.get('/', roleMiddleware(['ADMIN']), userController.getAllUsers)
router.post('/', roleMiddleware(['ADMIN']), userController.createUser)
router.put('/:id', roleMiddleware(['ADMIN']), userController.updateUser)
router.delete('/:id', roleMiddleware(['ADMIN']), userController.deleteUser)

export default router
