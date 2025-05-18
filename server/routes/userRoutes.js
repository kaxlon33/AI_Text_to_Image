import express from 'express'
import { registerUser, loginUser, userCredits, paymentStripe, verifyStripePay } from '../controllers/userController.js'
import { auth } from '../middlewares/auth.js'

const userRouter = express.Router()

userRouter.post('/register', registerUser)
userRouter.post('/login', loginUser)
userRouter.get('/credits', auth, userCredits)
userRouter.post('/pay-stripe', auth, paymentStripe)
userRouter.post('/verify-stripe', verifyStripePay)



export default userRouter

// controller and router work together
// http://localhost:4000/api/user/register
// userModel -> userController > userRouter > server.js