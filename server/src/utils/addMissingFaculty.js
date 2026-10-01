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

function getRandomName() {
  return firstNames[Math.floor(Math.random() * firstNames.length)];
}

async function addFaculty() {
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
    const [departments] = await pool.query('SELECT department_id FROM departments');
    const [[{ currentCount }]] = await pool.query('SELECT COUNT(*) as currentCount FROM faculty');
    
    const targetCount = 412;
    const toInsert = targetCount - currentCount;
    
    if (toInsert <= 0) {
      console.log(`Already have ${currentCount} faculty. No need to insert.`);
      return;
    }

    console.log(`Currently have ${currentCount} faculty. Inserting ${toInsert} new faculty...`);
    
    const designations = ["Professor", "Associate Professor", "Assistant Professor", "Lecturer"];
    
    // Process in batches
    const batchSize = 100;
    for (let i = 0; i < toInsert; i += batchSize) {
      const batchCount = Math.min(batchSize, toInsert - i);
      const values = [];
      
      for (let j = 0; j < batchCount; j++) {
        const name = getRandomName();
        const email = `${name.toLowerCase()}${Math.floor(Math.random() * 9999)}@smarterp.edu`;
        const code = `FAC_AD_${(currentCount + i + j + 1).toString().padStart(3, '0')}`;
        const deptId = departments[Math.floor(Math.random() * departments.length)].department_id;
        const designation = designations[Math.floor(Math.random() * designations.length)];
        
        values.push([code, name, designation, deptId, email, '1234567890', 1, 'Active', Math.floor(Math.random() * 20)]);
      }
      
      await pool.query(
        'INSERT INTO faculty (faculty_code, faculty_name, designation, department_id, email, phone, is_active, leave_status, workload) VALUES ?',
        [values]
      );
      
      console.log(`Inserted batch ${Math.floor(i / batchSize) + 1} (${i + batchCount}/${toInsert})`);
    }

    console.log(`Successfully reached ${targetCount} total faculty members!`);
  } catch (error) {
    console.error('Error inserting faculty:', error);
  } finally {
    await pool.end();
  }
}

addFaculty();
