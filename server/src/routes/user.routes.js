import express from 'express'
import { userController } from '../controllers/user.controller.js'
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware.js'

const router = express.Router()

router.use(authMiddleware)

router.get('/profile', userController.getProfile)
router.put('/profile', userController.updateProfile)
router.get('/', roleMiddleware(['admin']), userController.getAllUsers)
router.post('/', roleMiddleware(['admin']), userController.createUser)
router.put('/:id', roleMiddleware(['admin']), userController.updateUser)
router.delete('/:id', roleMiddleware(['admin']), userController.deleteUser)

export default router
