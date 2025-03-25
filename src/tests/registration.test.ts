import fetch from 'node-fetch';

interface RegisterResponse {
  success: boolean;
  message: string;
  user?: {
    name: string;
    phoneNumber: string;
    age: number;
    gender: string;
    email: string;
  };
}

async function testRegistration() {
  const testUser = {
    name: 'Test User',
    phoneNumber: '+1234567890',
    age: 25,
    gender: 'male',
    email: 'test@example.com'
  };

  try {
    console.log('Testing registration with age and gender fields...');
    
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser),
    });

    const data = await response.json() as RegisterResponse;
    
    if (response.ok) {
      console.log('✅ Registration successful!');
      console.log('Response:', data);
      
      // Verify the returned user has the correct fields
      const user = data.user;
      if (user) {
        console.log('\nVerifying user data:');
        console.log(`Name: ${user.name === testUser.name ? '✅' : '❌'}`);
        console.log(`Phone: ${user.phoneNumber === testUser.phoneNumber ? '✅' : '❌'}`);
        console.log(`Age: ${user.age === testUser.age ? '✅' : '❌'}`);
        console.log(`Gender: ${user.gender === testUser.gender ? '✅' : '❌'}`);
        console.log(`Email: ${user.email === testUser.email ? '✅' : '❌'}`);
      } else {
        console.log('❌ User data missing in response');
      }
    } else {
      console.log('❌ Registration failed!');
      console.log('Error:', data.message);
    }
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testRegistration();