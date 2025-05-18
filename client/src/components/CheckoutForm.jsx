import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useContext, useState } from 'react';
import axios from 'axios';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';

const CheckoutForm = ({ planId }) => {
  const { token, backendUrl, loadCreditsData, user } = useContext(AppContext);
  const stripe = useStripe();
  const elements = useElements();

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!stripe || !elements) {
      toast.error('Stripe not loaded');
      setLoading(false);
      return;
    }

    try {
      // Step 1: Create payment intent using actual backend route
      const { data } = await axios.post(
        `${backendUrl}/api/user/pay-stripe`,
        {
          userId: user._id,
          planId: planId,
        },
        {
          headers: { token },
        }
      );

      if (!data.success) {
        toast.error(data.message || 'Payment initialization failed');
        setLoading(false);
        return;
      }

      const { clientSecret } = data;

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (result.error) {
        toast.error(result.error.message);
      } else if (result.paymentIntent.status === 'succeeded') {
        toast.success('Payment successful!');
        loadCreditsData(); 
      }
    } catch (error) {
      toast.error(error.message || 'Payment failed');
    }

    setLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto p-4 bg-white rounded shadow-md space-y-4"
    >
      <CardElement className="p-2 border border-gray-300 rounded" />
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
      >
        {loading ? 'Processing...' : 'Pay Now'}
      </button>
    </form>
  );
};

export default CheckoutForm;
