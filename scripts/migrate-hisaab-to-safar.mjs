import { initializeApp } from 'firebase-admin/app';
import { cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { getAuth } from 'firebase-admin/auth';
import { readFileSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

const EMAIL = 'hussain2808@gmail.com';

const sourceKey = JSON.parse(readFileSync(join(homedir(), 'Downloads', 'hisaab-hussain-firebase-adminsdk-fbsvc-2ae78a99bf.json')));
const destKey = JSON.parse(readFileSync(join(homedir(), 'Downloads', 'safar-app-97696-firebase-adminsdk-fbsvc-0fd1ccd5d5.json')));

const sourceApp = initializeApp({ credential: cert(sourceKey), storageBucket: `${sourceKey.project_id}.appspot.com` }, 'source');
const destApp = initializeApp({ credential: cert(destKey), storageBucket: `${destKey.project_id}.appspot.com` }, 'dest');

const sourceDb = getFirestore(sourceApp);
const destDb = getFirestore(destApp);
const sourceBucket = getStorage(sourceApp).bucket();
const destBucket = getStorage(destApp).bucket();

async function main() {
  const sourceUser = await getAuth(sourceApp).getUserByEmail(EMAIL);
  const destUser = await getAuth(destApp).getUserByEmail(EMAIL);
  const srcUid = sourceUser.uid;
  const dstUid = destUser.uid;
  console.log(`Source UID (hisaab-hussain): ${srcUid}`);
  console.log(`Dest UID (safar-app-97696): ${dstUid}`);

  const booksSnap = await sourceDb.collection('users').doc(srcUid).collection('books').get();
  console.log(`Found ${booksSnap.size} book(s)`);

  let txCount = 0;
  let catCount = 0;

  for (const bookDoc of booksSnap.docs) {
    const bookId = bookDoc.id;
    await destDb.collection('users').doc(dstUid).collection('books').doc(bookId).set(bookDoc.data());
    console.log(`  Book "${bookDoc.data().name ?? bookId}" copied`);

    const txSnap = await sourceDb.collection('users').doc(srcUid).collection('books').doc(bookId).collection('transactions').get();
    for (const txDoc of txSnap.docs) {
      await destDb.collection('users').doc(dstUid).collection('books').doc(bookId).collection('transactions').doc(txDoc.id).set(txDoc.data());
      txCount++;
    }

    const catSnap = await sourceDb.collection('users').doc(srcUid).collection('books').doc(bookId).collection('categories').get();
    for (const catDoc of catSnap.docs) {
      await destDb.collection('users').doc(dstUid).collection('books').doc(bookId).collection('categories').doc(catDoc.id).set(catDoc.data());
      catCount++;
    }
  }
  console.log(`Copied ${txCount} transaction(s), ${catCount} categor(y/ies)`);

  const photosSnap = await sourceDb.collection('users').doc(srcUid).collection('photos').get();
  console.log(`Found ${photosSnap.size} photo doc(s)`);

  let photoCount = 0;
  for (const photoDoc of photosSnap.docs) {
    const photoId = photoDoc.id;
    const srcFullPath = `users/${srcUid}/photos/${photoId}`;
    const srcThumbPath = `users/${srcUid}/photos/${photoId}_thumb`;
    const dstFullPath = `users/${dstUid}/photos/${photoId}`;
    const dstThumbPath = `users/${dstUid}/photos/${photoId}_thumb`;

    try {
      const [fullBuf] = await sourceBucket.file(srcFullPath).download();
      await destBucket.file(dstFullPath).save(fullBuf, { contentType: 'image/jpeg' });

      const [thumbBuf] = await sourceBucket.file(srcThumbPath).download();
      await destBucket.file(dstThumbPath).save(thumbBuf, { contentType: 'image/jpeg' });

      const [url] = await destBucket.file(dstFullPath).getSignedUrl({ action: 'read', expires: '01-01-2100' });
      const [thumbUrl] = await destBucket.file(dstThumbPath).getSignedUrl({ action: 'read', expires: '01-01-2100' });

      const data = photoDoc.data();
      await destDb.collection('users').doc(dstUid).collection('photos').doc(photoId).set({
        ...data,
        url,
        thumbUrl,
      });
      photoCount++;
    } catch (err) {
      console.warn(`  Skipping photo ${photoId}: ${err.message}`);
    }
  }
  console.log(`Copied ${photoCount} photo(s)`);
  console.log('Migration complete.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
