import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
    description: { 
        type: String, 
        required: true 
    },
    amount: { 
        type: Number, 
        required: true 
    },
    payer: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    }, // User who paid the expense
    participants: [
        {
            user: { 
                type: mongoose.Schema.Types.ObjectId, 
                ref: 'User' 
            }, // Users involved in this expense
            amountOwed: { 
                type: Number 
            } // Amount each participant owes
        }
    ],
    splitMethod: { 
        type: String, 
        enum: ['equal', 'exact', 'percentage'], 
        required: true 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

export const Expense = mongoose.model('Expense', expenseSchema);
