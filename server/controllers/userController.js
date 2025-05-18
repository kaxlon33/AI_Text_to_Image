import userModel from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Stripe from "stripe";
import transactionModel from "../models/transactionModel.js";

export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await userModel.findOne({ email });

    if (!name || !email || !password) {
      res.status(400).json({
        success: false,
        message: "Missing Details",
      });
    }

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userData = {
      name,
      email,
      password: hashedPassword,
    };

    const newUser = new userModel(userData);
    const user = await newUser.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.status(201).json({
      success: true,
      message: "User Registered Successfully",
      token,
      user: {
        name: user.name,
      },
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const isUser = await userModel.findOne({ email }).select("+password");

    if (!isUser) {
      return res.status(400).json({
        success: false,
        message: "User does not exist",
      });
    }

    const isPassword = await bcrypt.compare(password, isUser.password);

    if (isPassword) {
      const token = jwt.sign({ id: isUser._id }, process.env.JWT_SECRET);
      res.status(200).json({
        success: true,
        message: "User Logged In Successfully",
        token,
        user: {
          name: isUser.name,
        },
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid Credentials",
      });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
    next(error);
  }
};

export const userCredits = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const user = await userModel.findById(userId);
    res.json({
      success: true,
      credits: user.credits,
      user: { name: user.name },
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
    next(error);
  }
};
// d lo myo id nk sit yin middleware folder lo add tl

const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY); // Your Stripe Secret Key

export const paymentStripe = async (req, res) => {
  try {
    const { userId, planId } = req.body;

    if (!userId || !planId) {
      return res.status(400).json({
        success: false,
        message: "Missing Details",
      });
    }

    let credits, plan, amount;
    switch (planId) {
      case "Basic":
        plan = "Basic";
        credits = 100;
        amount = 10;
        break;
      case "Advanced":
        plan = "Advanced";
        credits = 500;
        amount = 50;
        break;
      case "Business":
        plan = "Business";
        credits = 5000;
        amount = 250;
        break;
      default:
        return res
          .status(400)
          .json({ success: false, message: "Invalid Plan" });
    }

    const session = await stripeInstance.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${plan} Plan`,
            },
            unit_amount: amount * 100,
          },
          quantity: 1,
        },
      ],
      success_url: "http://localhost:5173/success",
      cancel_url: "http://localhost:5173/cancel",
      metadata: {
        userId,
        plan,
        credits,
      },
    });

    res.status(200).json({
      success: true,
      sessionId: session.id,
    });
  } catch (error) {
    console.error("Stripe Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyStripePay = async (req, res) => {
  try {
    const { stripepay_order_id } = req.body;

    if (!stripepay_order_id) {
      return res.status(400).json({ success: false, message: "Missing Stripe order ID" });
    }

    // Retrieve the session using Stripe API
    const session = await stripeInstance.checkout.sessions.retrieve(stripepay_order_id);

    if (session.payment_status === "paid") {
      const receiptId = session.metadata?.receipt;
      if (!receiptId) {
        return res.status(400).json({ success: false, message: "Missing receipt ID in Stripe session metadata" });
      }

      const transactionData = await transactionModel.findById(receiptId);
      if (!transactionData) {
        return res.status(404).json({ success: false, message: "Transaction not found" });
      }

      if (transactionData.payment) {
        return res.json({ success: false, message: "Payment Already Done" });
      }

      const userData = await userModel.findById(transactionData.userId);
      if (!userData) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      const updatedBalance = userData.creditBalance + transactionData.credits;
      await userModel.findByIdAndUpdate(userData._id, { creditBalance: updatedBalance });

      await transactionModel.findByIdAndUpdate(transactionData._id, { payment: true });

      return res.json({ success: true, message: "Payment Done" });
    } else {
      return res.json({ success: false, message: "Payment Not Completed" });
    }
  } catch (error) {
    console.error("Stripe verify error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

