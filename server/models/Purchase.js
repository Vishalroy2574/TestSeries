import mongoose from "mongoose";

const purchaseSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        testId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Test",
            required: true,
        },
        amountPaid: {
            type: Number,
            required: true,
            min: 0,
        },
        purchaseDate: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

// Ensure a user can't purchase the same test twice
purchaseSchema.index({ userId: 1, testId: 1 }, { unique: true });

const Purchase = mongoose.model("Purchase", purchaseSchema);

export default Purchase;
