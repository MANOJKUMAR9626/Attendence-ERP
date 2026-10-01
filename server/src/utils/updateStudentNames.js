import mysql from 'mysql2/promise';

const firstNames = [
  "Aadhav", "Ajith", "Arun", "Ashok", "Bharath", "Dhanush", "Dinesh", "Hari", 
  "Karthi", "Karthik", "Manikandan", "Manoj", "Murugan", "Muthu", "Naveen", 
  "Prabhu", "Pravin", "Rajesh", "Ramesh", "Saravanan", "Sathish", "Senthil", 
  "Siva", "Surya", "Vijay", "Vimal", "Aravind", "Balaji", "Gowtham", "Murali",
  "Abirami", "Anjali", "Bhavana", "Deepa", "Divya", "Gayathri", "Janani", 
  "Kaviya", "Keerthi", "Meena", "Nandhini", "Nithya", "Pavithra", "Priya", 
  "Ramya", "Sandhya", "Shruti", "Sneha", "Soundarya", "Swathi", "Trisha", "Vidhya"
];

const lastNames = [
  "Kumar", "Raj", "Krishnan", "Raman", "Subramanian", "Pandian", "Balan", 
  "Swamy", "Vasan", "Natarajan", "Velu", "Selvam", "Maran", "Pillai", "Iyer", 
  "Naidu", "Gounder", "Thevar", "Nadar", "Chettiar", "Prasad", "Babu"
];

function getRandomName() {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  return firstName;
}

async function updateNames() {
  console.log('Connecting to MySQL database...');
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'exam_hall_management',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  try {
    console.log('Fetching all students...');
    const [students] = await pool.query('SELECT student_id FROM students');
    
    console.log(`Found ${students.length} students. Updating names...`);
    
    // Process in batches
    const batchSize = 1000;
    for (let i = 0; i < students.length; i += batchSize) {
      const batch = students.slice(i, i + batchSize);
      
      const updatePromises = batch.map(student => {
        const name = getRandomName();
        // Generate an email based on the first name
        const email = `${name.toLowerCase()}${Math.floor(Math.random() * 9999)}@smarterp.edu`;
        return pool.query(
          'UPDATE students SET student_name = ?, email = ? WHERE student_id = ?',
          [name, email, student.student_id]
        );
      });

      await Promise.all(updatePromises);
      console.log(`Updated batch ${i / batchSize + 1} (${i + batch.length}/${students.length})`);
    }

    console.log('Successfully updated all student names and emails!');
  } catch (error) {
    console.error('Error updating names:', error);
  } finally {
    await pool.end();
  }
}

updateNames();
