const API =
  'http://localhost:5000/api/auth';

export async function loginUser(
  email: string,
  password: string
) {
  const res = await fetch(
    `${API}/login`,
    {
      method: 'POST',

      headers: {
        'Content-Type':
          'application/json',
      },

      body: JSON.stringify({
        email,
        password,
      }),
    }
  );

  return res.json();
}

export async function registerUser(
  name: string,
  email: string,
  password: string
) {
  const res = await fetch(
    `${API}/register`,
    {
      method: 'POST',

      headers: {
        'Content-Type':
          'application/json',
      },

      body: JSON.stringify({
        name,
        email,
        password,
      }),
    }
  );

  return res.json();
}