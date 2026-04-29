import joi from "joi";

const name     = joi.string().min(1).max(100).trim();
const amount   = joi.number().precision(2);
const isoDate  = joi.string().isoDate();
const userID   = joi.string().uuid().description("FK to users.UserID");
const category = joi.alternatives().try(
  joi.number().integer().min(1),
  joi.string().min(1)
).description("FK to categories");

export const transactionsSchema = {
  mutableFields: ["Name", "Date", "Amount", "Category", "PaymentMethod"],
  recordSchema: joi.object({
    Name:          name.required(),
    Date:          isoDate.required(),
    Amount:        amount.not(0).required(),
    Category:      joi.string().min(1).max(50).trim().required(),
    PaymentMethod: joi.string().min(1).max(50).trim().required(),
    UserID:        userID.required(),
  }),
};

export const budgetsSchema = {
  mutableFields: ["BudgetName", "UsedAmount", "TotalAmount", "BudgetDate", "CategoryID"],
  recordSchema: joi.object({
    BudgetName:  name.required(),
    TotalAmount: amount.min(0.01).required(),
    UsedAmount:  amount.min(0).default(0),
    BudgetDate:  isoDate.required(),
    UserID:      userID.required(),
    CategoryID:  category.required(),
  }),
};

export const goalsSchema = {
  mutableFields: ["GoalName", "TargetAmount", "TargetDate", "SavedAmount"],
  recordSchema: joi.object({
    GoalName:     name.required(),
    TargetAmount: amount.min(0.01).required(),
    TargetDate:   isoDate.required(),
    SavedAmount:  amount.min(0).default(0),
    UserID:       userID.required(),
  }),
};

export const usersSchema = {
  mutableFields: ["FirstName", "LastName", "Email"],
  recordSchema: joi.object({
    FirstName:    joi.string().min(1).max(50).trim().required(),
    LastName:     joi.string().min(1).max(50).trim().required(),
    Email:        joi.string().email().max(150).lowercase().trim().required(),
    PasswordHash: joi.string().required(),
    UserType:     joi.string().valid("Student", "Admin", "Teacher").default("Student"),
  }),
};