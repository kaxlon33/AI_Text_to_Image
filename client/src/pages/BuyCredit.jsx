import React, { useContext } from "react";
import { assets, plans } from "../assets/assets";
import { AppContext } from "../context/AppContext";
import { motion } from "framer-motion";
import { loadStripe } from "@stripe/stripe-js";
import { toast } from "react-toastify";
import axios from "axios";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const BuyCredit = () => {
  const { user, backendUrl, token, setShowLogin } = useContext(AppContext);

  const handleStripeCheckout = async (planId) => {
    if (!user) {
      setShowLogin(true);
      return;
    }

    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/pay-stripe`,
        { planId },
        { headers: { token } }
      );

      if (data.success) {
        const stripe = await stripePromise;
        stripe.redirectToCheckout({ sessionId: data.sessionId });
      } else { 
        toast.error("Failed to create checkout session");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0.2, y: 100 }}
      transition={{ duration: 1 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="min-h-[80vh] text-center pt-14 mb-10"
    >
      <button className="border border-gray-400 px-10 py-2 rounded-full mb-6">
        OUR PLAN
      </button>
      <h1 className="text-center text-3xl font-medium mb-6 sm:mb-10">
        Choose the plan
      </h1>
      <div className="flex flex-wrap justify-center gap-6 text-left">
        {plans.map((e, index) => (
          <div
            key={index}
            className="bg-white shadow-sm border rounded-lg py-12 px-8 text-gray-600 hover:scale-105 transition-all duration-500"
          >
            <img src={assets.logo_icon} alt="" width={40} />
            <p className="mt-3 mb-1 font-semibold">{e.id}</p>
            <p className="text-sm">{e.desc}</p>
            <p className="mt-6">
              <span className="text-3xl font-medium">${e.price}</span> / {e.credits} credits
            </p>
            <button
              onClick={() => handleStripeCheckout(e.id)}
              className="w-full bg-gray-800 text-white mt-8 text-sm rounded-md py-2.5 min-w-52"
            >
              {user ? "Buy Now" : "Get Started"}
            </button>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default BuyCredit;
