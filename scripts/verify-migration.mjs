import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { readFileSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

const EMAIL = 'hussain2808@gmail.com';

const sourceKey = JSON.parse(readFileSync(join(homedir(), 'Downloads', 'hisaab-hussain-firebase-adminsdk-fbsvc-2ae78a99bf.json')));
const destKey = JSON.parse(readFileSync(join(homedir(), 'Downloads', 'safar-app-97696-firebase-adminsdk-fbsvc-0fd1ccd5d5.json')));

const sourceApp = initializeApp({ credential: cert(sourceKey) }, 'source');
const destApp = initializeApp({ credential: cert(destKey) }, 'dest');

const sourceDb = getFirestore(sourceApp);
const destDb = getFirestore(destApp);

async function main() {
  const srcUid = (await getAuth(sourceApp).getUserByEmail(EMAIL)).uid;
  const dstUid = (await getAuth(destApp).getUserByEmail(EMAIL)).uid;

  const srcBooks = await sourceDb.collection('users').doc(srcUid).collection('books').get();
  const dstBooks = await destDb.collection('users').doc(dstUid).collection('books').get();

  console.log(`Source books: ${srcBooks.size}, Dest books: ${dstBooks.size}`);
  console.log('');

  for (const bookDoc of srcBooks.docs) {
    const bookId = bookDoc.id;
    const name = bookDoc.data().name ?? bookId;

    const [srcTx, dstTx] = await Promise.all([
      sourceDb.collection('users').doc(srcUid).collection('books').doc(bookId).collection('transactions').get(),
      destDb.collection('users').doc(dstUid).collection('books').doc(bookId).collection('transactions').get(),
    ]);

    const match = srcTx.size === dstTx.size ? 'OK' : 'MISMATCH';
    console.log(`${match.padEnd(8)} "${name}" — source: ${srcTx.size} tx, dest: ${dstTx.size} tx`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
