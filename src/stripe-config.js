import { loadStripe } from '@stripe/stripe-js';

// Replace with your publishable key from Stripe Dashboard
const stripePromise = loadStripe('pk_test_TYooMQauvdEDq54NiTphI7jx');

export { stripePromise };