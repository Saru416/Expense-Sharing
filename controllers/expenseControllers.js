import { Expense } from '../models/expensemodel.js';
import { User } from '../models/usermodel.js';
import { Parser } from 'json2csv'; 

// Add Expense API
export const addExpense = async (req, res) => {
    const { description, amount, payer, participants, splitMethod } = req.body;

    // Validate input fields
    if (!description || !amount || !payer || !participants || !splitMethod) {
        return res.status(400).json({ message: "All fields are required" });
    }

    // Ensure splitMethod is one of the allowed methods
    if (!['equal', 'exact', 'percentage'].includes(splitMethod)) {
        return res.status(400).json({ message: "Invalid split method" });
    }

    // Calculate how the expense is split based on the splitMethod
    let calculatedParticipants = [];

    try {
        if (splitMethod === 'equal') {
            // Equal split logic
            const share = amount / participants.length;
            calculatedParticipants = participants.map(participant => ({
                user: participant.user,
                amountOwed: share
            }));
        } else if (splitMethod === 'exact') {
            // Exact split logic
            const totalOwed = participants.reduce((sum, participant) => sum + participant.amountOwed, 0);
            if (totalOwed !== amount) {
                return res.status(400).json({ message: "Exact amounts must sum up to the total expense amount" });
            }
            calculatedParticipants = participants.map(participant => ({
                user: participant.user,
                amountOwed: participant.amountOwed
            }));
        } else if (splitMethod === 'percentage') {
            // Percentage split logic
            const totalPercentage = participants.reduce((sum, participant) => sum + participant.percentage, 0);
            if (totalPercentage !== 100) {
                return res.status(400).json({ message: "Percentages must add up to 100%" });
            }
            calculatedParticipants = participants.map(participant => ({
                user: participant.user,
                amountOwed: (participant.percentage / 100) * amount
            }));
        }

        // Create new expense
        const expense = new Expense({
            description,
            amount,
            payer,
            participants: calculatedParticipants,
            splitMethod
        });

        // Save expense in the database
        await expense.save();

        res.status(201).json({
            message: "Expense added successfully",
            expense
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error!" });
    }
};

export const getIndividualBalanceSheet = async (req, res) => {
    const userId = req.params.userId;

    try {
        // Retrieve all expenses where the user is either the payer or a participant
        const userExpenses = await Expense.find({
            $or: [
                { payer: userId }, 
                { 'participants.user': userId }
            ]
        });
        // If no expenses are found for the user
        if (!userExpenses || !userExpenses.length) {
            return res.status(404).json({ message: "No expenses found for this user" });
        }

        let totalPaid = 0;
        let totalOwed = 0;
        let amountOwedToUser = 0;

        userExpenses.forEach(expense => {
            // User is the payer
            if (expense.payer.toString() === userId) {
                const owedByOthers = expense.participants.reduce((sum, participant) => {
                    return sum + participant.amountOwed;
                }, 0);
                totalPaid += expense.amount;
                amountOwedToUser += owedByOthers;
            } 
            // User is a participant
            else {
                const userShare = expense.participants.find(participant => participant.user.toString() === userId);
                if (userShare) {
                    totalOwed += userShare.amountOwed;
                }
            }
        });

        res.status(200).json({
            userId,
            totalPaid,
            totalOwed,
            amountOwedToUser
        });
    } catch (error) {
        console.error("Error retrieving balance sheet:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const getOverallBalanceSheet = async (req, res) => {
    try {
        // Fetch all expenses from the database
        const allExpenses = await Expense.find();

        // Log to see if expenses are retrieved correctly
        if (!allExpenses || !allExpenses.length) {
            return res.status(404).json({ message: "No expenses found" });
        }

        const balances = {};

        // Iterate over each expense to calculate balances
        allExpenses.forEach(expense => {
            const payerId = expense.payer.toString(); // Ensure payerId is a string

            // Initialize balance for payer if not already present
            if (!balances[payerId]) {
                balances[payerId] = {};
            }

            expense.participants.forEach(participant => {
                const participantId = participant.user.toString(); // Ensure participantId is a string
                const amountOwed = participant.amountOwed;

                // Log to see participant data for debugging
                console.log(`Payer: ${payerId}, Participant: ${participantId}, Amount Owed: ${amountOwed}`);

                // Initialize balance for participant if not already present
                if (!balances[participantId]) {
                    balances[participantId] = {};
                }

                // Add to the payer's balance that participant owes
                if (!balances[payerId][participantId]) {
                    balances[payerId][participantId] = 0;
                }
                balances[payerId][participantId] += amountOwed;

                // Add to the participant's balance that they owe the payer
                if (!balances[participantId][payerId]) {
                    balances[participantId][payerId] = 0;
                }
                balances[participantId][payerId] -= amountOwed;
            });
        });

        res.status(200).json({
            message: "Overall balance sheet",
            balances
        });
    } catch (error) {
        // Log the error message for better debugging
        res.status(500).json({ message: "Server error" });
    }
};


export const downloadBalanceSheetCSV = async (req, res) => {
    const userId = req.params.userId;

    try {
        const userExpenses = await Expense.find({
            $or: [
                { payer: userId }, 
                { 'participants.user': userId }
            ]
        });

        let totalPaid = 0;
        let totalOwed = 0;
        let amountOwedToUser = 0;

        const data = [];

        userExpenses.forEach(expense => {
            if (expense.payer.toString() === userId) {
                const owedByOthers = expense.participants.reduce((sum, participant) => {
                    return sum + participant.amountOwed;
                }, 0);
                totalPaid += expense.amount;
                amountOwedToUser += owedByOthers;

                data.push({
                    Description: expense.description,
                    "Amount Paid": expense.amount,
                    "Owed by Others": owedByOthers
                });
            } else {
                const userShare = expense.participants.find(participant => participant.user.toString() === userId).amountOwed;
                totalOwed += userShare;

                data.push({
                    Description: expense.description,
                    "Amount Owed": userShare,
                });
            }
        });

        const fields = ['Description', 'Amount Paid', 'Owed by Others', 'Amount Owed'];
        const parser = new Parser({ fields });
        const csv = parser.parse(data);

        res.header('Content-Type', 'text/csv');
        res.attachment('balance-sheet.csv');
        res.status(200).send(csv);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

