# Backup database to AWS s3

## Backup a database

```javascript
import { DatabaseBackup, s3 } from 'site-backup';

const s3 = new s3(ACCESS_KEY_ID, SECRET_ACCESS_KEY, REGION);
const backup = new DatabaseBackup(s3);

const data = await backup
  .backup('databasename', { user: 'username' })
  .to(BUCKET_NAME);

// data from the send action
console.log(data);
```

## Remove old backups

What files are kept:
* every backup that was made on the first of every month
* every saturday backup that is not older than a month
* every daily backup that is not older than a week

```javascript
import { BucketCleaner, s3 } from 'site-backup';

const s3 = new s3(ACCESS_KEY_ID, SECRET_ACCESS_KEY, REGION);
const cleaner = new BucketCleaner(s3);

const deleted = await cleaner.clean(BUCKET_TO_CLEAN);

// array of objects that were deleted
console.log(deleted);
```
