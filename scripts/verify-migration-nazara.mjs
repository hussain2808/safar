import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { readFileSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

const EMAIL = 'hussain2808@gmail.com';

const sourceKey = JSON.parse(readFileSync(join(homedir(), 'Downloads', 'nazara-d2a3e-firebase-adminsdk-fbsvc-06fdaa77d4.json')));
const destKey = JSON.parse(readFileSync(join(homedir(), 'Downloads', 'safar-app-97696-firebase-adminsdk-fbsvc-0fd1ccd5d5.json')));

const sourceApp = initializeApp({ credential: cert(sourceKey) }, 'source');
const destApp = initializeApp({ credential: cert(destKey) }, 'dest');

const sourceDb = getFirestore(sourceApp);
const destDb = getFirestore(destApp);

async function main() {
  const srcUid = (await getAuth(sourceApp).getUserByEmail(EMAIL)).uid;
  const dstUid = (await getAuth(destApp).getUserByEmail(EMAIL)).uid;

  const [srcMemories, dstMemories, dstPhotos] = await Promise.all([
    sourceDb.collection('users').doc(srcUid).collection('memories').get(),
    destDb.collection('users').doc(dstUid).collection('nazaraMemories').get(),
    destDb.collection('users').doc(dstUid).collection('nazaraPhotos').get(),
  ]);

  const srcPhotoCount = srcMemories.docs.reduce((sum, d) => sum + (Array.isArray(d.data().photos) ? d.data().photos.length : 0), 0);

  console.log(`Memories — source: ${srcMemories.size}, dest: ${dstMemories.size} — ${srcMemories.size === dstMemories.size ? 'OK' : 'MISMATCH'}`);
  console.log(`Photos   — source: ${srcPhotoCount}, dest: ${dstPhotos.size} — ${srcPhotoCount === dstPhotos.size ? 'OK' : 'MISMATCH'}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
