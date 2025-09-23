
import { Router } from 'express'; 
import { authenticateToken } from '../middleware/auth.middleware'; 
import { FeedbackController } from '../controllers/feedback.controller'; 


const router = Router(); 
const controller = new FeedbackController(); 

//apply auth to all feedback routes
router.use(authenticateToken); 

//Routes as specified
router.get('/mine', (req, res) => controller.getMine(req, res)); 
router.post('/', (req, res) => controller.create(req, res)); 
router.patch('/:id', (req, res) => controller.update(req, res)); 
router.delete('/:id', (req, res) => controller.remove(req, res)); 


export default router; 
