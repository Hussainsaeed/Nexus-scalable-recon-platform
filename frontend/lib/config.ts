export const getApiUrl = () => {
    if (typeof window === 'undefined') {
      return 'http://localhost:5000';
    }
  
    return (
      localStorage.getItem('apiUrl') ||
      'http://localhost:5000'
    );
  };