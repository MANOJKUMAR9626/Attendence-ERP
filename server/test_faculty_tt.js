import axios from 'axios';
async function test() {
  try {
    const r = await axios.post('http://127.0.0.1:5000/api/v1/auth/login', { email: 'fac412@smarterp.edu', password: 'password123' });
    console.log('Login successful');
    const t = await axios.get('http://127.0.0.1:5000/api/v1/faculty/timetable/today', { headers: { Cookie: 'token=' + r.data.token } });
    console.log('Timetable count:', t.data.count);
    console.log(JSON.stringify(t.data.data, null, 2));
  } catch(e) {
    console.log(e.response ? e.response.data : e.message);
  }
}
test();
