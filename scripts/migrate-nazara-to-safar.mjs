import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { getAuth } from 'firebase-admin/auth';
import { readFileSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import { randomUUID } from 'crypto';

const EMAIL = 'hussain2808@gmail.com';

const sourceKey = JSON.parse(readFileSync(join(homedir(), 'Downloads', 'nazara-d2a3e-firebase-adminsdk-fbsvc-06fdaa77d4.json')));
const destKey = JSON.parse(readFileSync(join(homedir(), 'Downloads', 'safar-app-97696-firebase-adminsdk-fbsvc-0fd1ccd5d5.json')));

const sourceApp = initializeApp({ credential: cert(sourceKey), storageBucket: `${sourceKey.project_id}.firebasestorage.app` }, 'source');
const destApp = initializeApp({ credential: cert(destKey), storageBucket: `${destKey.project_id}.firebasestorage.app` }, 'dest');

const sourceDb = getFirestore(sourceApp);
const destDb = getFirestore(destApp);
const sourceBucket = getStorage(sourceApp).bucket();
const destBucket = getStorage(destApp).bucket();

function guessContentType(fileName) {
  const ext = (fileName.split('.').pop() ?? '').toLowerCase();
  if (ext === 'png') return 'image/png';
  if (ext === 'webp') return 'image/webp';
  if (ext === 'gif') return 'image/gif';
  return 'image/jpeg';
}

async function main() {
  const sourceUser = await getAuth(sourceApp).getUserByEmail(EMAIL);
  const destUser = await getAuth(destApp).getUserByEmail(EMAIL);
  const srcUid = sourceUser.uid;
  const dstUid = destUser.uid;
  console.log(`Source UID (nazara-d2a3e): ${srcUid}`);
  console.log(`Dest UID (safar-app-97696): ${dstUid}`);

  const memoriesSnap = await sourceDb.collection('users').doc(srcUid).collection('memories').get();
  console.log(`Found ${memoriesSnap.size} memory/memories`);

  let photoCount = 0;
  let memoryCount = 0;

  for (const memDoc of memoriesSnap.docs) {
    const data = memDoc.data();
    const photoUrls = Array.isArray(data.photos) ? data.photos : [];
    const photoIds = [];

    for (const url of photoUrls) {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`fetch failed: ${res.status}`);
        const buf = Buffer.from(await res.arrayBuffer());

        const urlPath = decodeURIComponent(new URL(url).pathname);
        const fileName = urlPath.split('/').pop() ?? `${randomUUID()}.jpg`;
        const photoId = randomUUID();
        const contentType = guessContentType(fileName);
        const dstPath = `users/${dstUid}/nazara-photos/${photoId}`;

        const downloadToken = randomUUID();
        await destBucket.file(dstPath).save(buf, {
          contentType,
          metadata: { metadata: { firebaseStorageDownloadTokens: downloadToken } },
        });
        const downloadUrl = `https://firebasestorage.googleapis.com/v0/b/${destBucket.name}/o/${encodeURIComponent(dstPath)}?alt=media&token=${downloadToken}`;

        await destDb.collection('users').doc(dstUid).collection('nazaraPhotos').doc(photoId).set({
          id: photoId,
          url: downloadUrl,
          mimeType: contentType,
          fileName,
          createdAt: data.createdAt?.toMillis?.() ?? Date.now(),
        });

        photoIds.push(photoId);
        photoCount++;
      } catch (err) {
        console.warn(`  Skipping photo for memory ${memDoc.id}: ${err.message}`);
      }
    }

    const memoryDoc = {
      id: memDoc.id,
      title: data.title,
      date: data.date?.toMillis?.() ?? Date.now(),
      type: data.type,
      photoIds,
      people: data.people ?? [],
      category: data.category,
      notifyYearly: !!data.notifyYearly,
      isFavorite: !!data.isFavorite,
      createdAt: data.createdAt?.toMillis?.() ?? Date.now(),
      updatedAt: data.updatedAt?.toMillis?.() ?? Date.now(),
    };
    if (data.notes) memoryDoc.notes = data.notes;

    await destDb.collection('users').doc(dstUid).collection('nazaraMemories').doc(memDoc.id).set(memoryDoc);
    memoryCount++;
    console.log(`  Memory "${data.title}" copied (${photoIds.length} photo(s))`);
  }

  console.log(`Copied ${memoryCount} memor(y/ies), ${photoCount} photo(s)`);
  console.log('Migration complete.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
