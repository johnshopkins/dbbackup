import moment from 'moment';

export default class BucketCleaner {

  constructor(s3client) {
    this.s3client = s3client;
    this.today = moment();
  }

  /**
   * Removes old backups from a bucket
   * @param {string} bucket s3 bucket name
   * @returns Array of deleted objects
   */
  async clean(bucket) {
    const objects = await this.s3client.listObjectsInBucket(bucket);

    if (!objects) {
      return [];
    }

    const toDelete = this.findObjectsToDelete(objects);

    if (toDelete.length === 0) {
      return [];
    }

    return await this.s3client.deleteObjects(bucket, toDelete);
  }

  /**
   * Find objects to delete, based on filename
   * @param {array} objects Array of objects in a buckey
   * @returns Array of objects to delete
   */
  findObjectsToDelete(objects) {
    
    return objects.filter(object => {

      // find the data associated with this object
      const pattern = new RegExp('(\\d{4}-\\d{2}-\\d{2})\.sql\.gz$');
      const match = pattern.exec(object.Key);

      if (!match) {
        // filename doesn't have YYYY-MM-DD pattern, remove
        return true;
      }

      const date = moment(match[1], 'YYYY-MM-DD');

      // keep every backup that was made on the first of every month
      if (date.format('D') === '1') {
        return false;
      }

      // keep every saturday backup that is not older than a month
      if (date.format('d') === '6' && parseInt(this.today.diff(date, 'months')) < 1) {
        return false;
      }

      // keep every daily backup that is not older than a week
      if (parseInt(this.today.diff(date, 'days')) < 7) {
        return false;
      }

      // if nothing caught this file, delete it
      return true;

    });

  }
}
