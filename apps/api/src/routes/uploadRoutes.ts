import { Router } from 'express';
import { getUploadSignature, uploadImageDirect } from '../controllers/uploadController';
import { protect } from '../middlewares/auth';

const router = Router();

router.use(protect);
router.get('/sign', getUploadSignature);
router.post('/image', uploadImageDirect);

export default router;
