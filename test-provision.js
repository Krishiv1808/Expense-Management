const axios = require('axios');

async function test() {
  try {
    // 1. Create Company and Admin (Signup)
    const email = `testadmin${Date.now()}@test.com`;
    console.log('Registering admin:', email);
    const regRes = await axios.post('http://localhost:5000/api/auth/register', {
      name: 'Admin Test',
      email: email,
      password: 'password123',
      companyName: `Company ${Date.now()}`,
      country: 'India'
    });
    
    const token = regRes.data.token;
    console.log('Admin token received.');

    // 2. Try provisioning a user
    const userEmail = `emp${Date.now()}@test.com`;
    console.log('Provisioning user:', userEmail);
    const provRes = await axios.post('http://localhost:5000/api/users/create', {
      name: 'Emp Test',
      email: userEmail,
      password: 'password123',
      role: 'EMPLOYEE'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('Provisioning successful!', provRes.data);
  } catch (err) {
    console.error('Test Failed!');
    if (err.response) {
      console.error('Response Data:', err.response.data);
    } else {
      console.error('Error:', err.message);
    }
  }
}

test();
