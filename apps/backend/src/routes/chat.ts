import { Router } from 'express';
import ChatController from '@controllers/chat.controller';
import { authenticateToken } from "middleware/auth.middleware";

const router = Router();

// Conversations
router.post('/conversations/private',authenticateToken, (req, res) => ChatController.createPrivateConversation(req, res));
router.post('/conversations/group',authenticateToken, (req, res) => ChatController.createGroupConversation(req, res));
router.get('/conversations',authenticateToken, (req, res) => ChatController.listConversations(req, res));
router.patch('/conversations/:id/pin',authenticateToken, (req, res) => ChatController.pinConversation(req, res));
router.delete('/conversations/:id/pin',authenticateToken, (req, res) => ChatController.unpinConversation(req, res));

// Messages
router.post('/conversations/:id/messages',authenticateToken, (req, res) => ChatController.sendMessage(req, res));
router.get('/conversations/:id/messages',authenticateToken, (req, res) => ChatController.listMessages(req, res));
router.post('/messages/:id/react',authenticateToken, (req, res) => ChatController.react(req, res));
router.delete('/messages/:id/react',authenticateToken, (req, res) => ChatController.unreact(req, res));

export default router;
