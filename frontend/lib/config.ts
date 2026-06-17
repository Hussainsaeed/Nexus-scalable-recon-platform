export const getApiUrl = () => {
  return (
    process.env.NEXT_PUBLIC_API_URL ||
    'https://nexus-backend-5z3j.onrender.com'
  );
};