import axios from 'axios';

async function run() {
  try {
    console.log('Sending chat request...');
    // Need to login first or get a valid token if the route is protected.
    // Wait, the route is protected by `protect` middleware!
  } catch (err) {
    console.error(err.response ? err.response.data : err.message);
  }
}
run();
