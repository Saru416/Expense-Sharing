import express from 'express'
import { addExpense, getIndividualBalanceSheet, getOverallBalanceSheet, downloadBalanceSheetCSV } from '../controllers/expenseControllers.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('user/addExpense',protect,addExpense);
router.get('user/:userId',protect,getIndividualBalanceSheet);
router.get('/overall',protect,getOverallBalanceSheet);
router.get('/download/:userId',protect,downloadBalanceSheetCSV);

export default router;