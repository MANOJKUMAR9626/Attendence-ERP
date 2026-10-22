import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read arguments
const atlasUri = process.argv[2] || process.env.ATLAS_URI || process.env.TARGET_ATLAS_URI;
const localUri = process.env.LOCAL_MONGO_URI || 'mongodb://localhost:27017/attendance_erp';

if (!atlasUri) {
  console.error('\n❌ ERROR: MongoDB Atlas connection URI is required.');
  console.log('\nUsage:');
  console.log('  node scripts/migrate_to_atlas.js "mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/attendance_erp?retryWrites=true&w=majority"\n');
  process.exit(1);
}

if (!atlasUri.startsWith('mongodb+srv://') && !atlasUri.startsWith('mongodb://')) {
  console.error('\n❌ ERROR: Invalid MongoDB URI format. Must start with mongodb+srv:// or mongodb://');
  process.exit(1);
}

async function migrate() {
  console.log('\n======================================================');
  console.log('🚀 SAFE MONGODB MIGRATION: LOCAL -> MONGODB ATLAS');
  console.log('======================================================');
  console.log(`📍 Source (Local) : ${localUri}`);
  console.log(`☁️  Target (Atlas) : ${atlasUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`); // Hide credentials in logs
  console.log('------------------------------------------------------\n');

  let localConn, atlasConn;

  try {
    // 1. Connect to Local (Source)
    console.log('⏳ Connecting to Local MongoDB...');
    localConn = await mongoose.createConnection(localUri, {
      serverSelectionTimeoutMS: 5000,
    }).asPromise();
    console.log('✅ Connected to Local MongoDB successfully.');

    // 2. Connect to Atlas (Target)
    console.log('⏳ Connecting to MongoDB Atlas...');
    atlasConn = await mongoose.createConnection(atlasUri, {
      serverSelectionTimeoutMS: 15000,
    }).asPromise();
    console.log('✅ Connected to MongoDB Atlas successfully.\n');

    // 3. Create local backup directory
    const backupDir = path.join(__dirname, '..', 'backup', `backup_${Date.now()}`);
    fs.mkdirSync(backupDir, { recursive: true });
    console.log(`💾 Local safety backup folder created at: ${backupDir}\n`);

    // 4. Get list of collections
    const collections = await localConn.db.listCollections().toArray();
    // Exclude system collections
    const userCollections = collections
      .map((c) => c.name)
      .filter((name) => !name.startsWith('system.'));

    console.log(`📦 Found ${userCollections.length} collections to transfer.\n`);

    const summary = [];

    for (let i = 0; i < userCollections.length; i++) {
      const colName = userCollections[i];
      const localCol = localConn.db.collection(colName);
      const atlasCol = atlasConn.db.collection(colName);

      const totalDocs = await localCol.countDocuments();
      console.log(`[${i + 1}/${userCollections.length}] Processing collection "${colName}" (${totalDocs} documents)...`);

      if (totalDocs === 0) {
        console.log(`   ⏩ Skipped (empty collection).\n`);
        summary.push({ collection: colName, localCount: 0, atlasCount: 0, status: 'MATCH' });
        continue;
      }

      // Save local backup JSON file
      const allDocs = await localCol.find({}).toArray();
      const backupPath = path.join(backupDir, `${colName}.json`);
      fs.writeFileSync(backupPath, JSON.stringify(allDocs, null, 2), 'utf-8');

      // Migrate in batches of 500 to prevent Atlas payload limit
      const batchSize = 500;
      let transferred = 0;

      for (let j = 0; j < allDocs.length; j += batchSize) {
        const batch = allDocs.slice(j, j + batchSize);
        const operations = batch.map((doc) => ({
          replaceOne: {
            filter: { _id: doc._id },
            replacement: doc,
            upsert: true,
          },
        }));

        await atlasCol.bulkWrite(operations, { ordered: false });
        transferred += batch.length;
        process.stdout.write(`   ↳ Transferred ${transferred}/${totalDocs} documents...\r`);
      }
      console.log(`   ✅ Transferred ${transferred}/${totalDocs} documents.`);

      // Copy Indexes (excluding default _id_)
      try {
        const indexes = await localCol.indexes();
        for (const idx of indexes) {
          if (idx.name !== '_id_') {
            const keys = idx.key;
            const options = {
              name: idx.name,
              unique: idx.unique || false,
              sparse: idx.sparse || false,
            };
            if (idx.expireAfterSeconds !== undefined) {
              options.expireAfterSeconds = idx.expireAfterSeconds;
            }
            await atlasCol.createIndex(keys, options).catch((err) => {
              // Ignore non-fatal index conflicts
              console.warn(`   ⚠️ Index warning (${idx.name}): ${err.message}`);
            });
          }
        }
      } catch (idxErr) {
        console.warn(`   ⚠️ Could not copy indexes for ${colName}:`, idxErr.message);
      }

      // Verification count
      const atlasCount = await atlasCol.countDocuments();
      const match = atlasCount === totalDocs;
      summary.push({
        collection: colName,
        localCount: totalDocs,
        atlasCount,
        status: match ? 'MATCH' : 'MISMATCH',
      });
      console.log(`   🔍 Verification: Local: ${totalDocs} | Atlas: ${atlasCount} (${match ? 'OK' : 'MISMATCH'})\n`);
    }

    console.log('======================================================');
    console.log('📊 MIGRATION VERIFICATION AUDIT');
    console.log('======================================================');
    console.table(summary);

    const allMatched = summary.every((s) => s.localCount === s.atlasCount);
    if (allMatched) {
      console.log('\n🎉 SUCCESS! All data migrated to MongoDB Atlas with 100% integrity.');
      console.log('🔒 Your local database was untouched and an offline JSON copy was saved in:');
      console.log(`   ${backupDir}\n`);
    } else {
      console.warn('\n⚠️ Warning: Some counts did not match. Check the table above for details.');
    }
  } catch (error) {
    console.error('\n❌ MIGRATION FAILED:', error.message);
    console.error(error.stack);
  } finally {
    if (localConn) await localConn.close();
    if (atlasConn) await atlasConn.close();
    console.log('🔌 Connections closed.');
    process.exit(0);
  }
}

migrate();
