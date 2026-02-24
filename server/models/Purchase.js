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

        // ── Razorpay fields ──
        razorpayOrderId: { type: String },
        razorpayPaymentId: { type: String },
        razorpaySignature: { type: String },
        paymentStatus: {
            type: String,
            enum: ["pending", "paid", "failed"],
            default: "pending",
        },

        // ── Buyer info captured at checkout ──
        buyerName: { type: String },
        buyerEmail: { type: String },
        buyerPhone: { type: String },

        // ── Email delivery ──
        pdfEmailSent: { type: Boolean, default: false },
    },
    { timestamps: true }
);

// Ensure a user can't purchase the same test twice (only blocks after payment confirmed)
purchaseSchema.index({ userId: 1, testId: 1, paymentStatus: 1 });

const Purchase = mongoose.model("Purchase", purchaseSchema);

export default Purchase;
