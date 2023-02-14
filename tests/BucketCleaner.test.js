import moment from 'moment';
import BucketCleaner from '../src/BucketCleaner.js';

describe('BucketCleaner', () => {

  describe('Find objects to delete', () => {

    test('No files found to delete', () => {

      const cleaner = new BucketCleaner(null);
      cleaner.today = moment('2023-02-10', 'YYYY-MM-DD');

      const objects = [
        { // monthly backup
          Key: 'jhudb-production_2022-02-01.sql.gz'
        },
        { // saturday backup, less than a month old
          Key: 'jhudb-production_2023-01-28.sql.gz'
        },
        { // daily back, less than a week old
          Key: 'jhudb-production_2023-02-08.sql.gz'
        },

      ];

      expect(cleaner.findObjectsToDelete(objects)).toStrictEqual([]);

    });

    test('Files found to delete', () => {

      const cleaner = new BucketCleaner(null);
      cleaner.today = moment('2023-02-10', 'YYYY-MM-DD');

      const objects = [
        { // saturday backup, more than a month old
          Key: 'jhudb-production_2023-01-07.sql.gz'
        },
        { // daily backup, older than a week
          Key: 'jhudb-production_2023-02-02.sql.gz'
        },
      ];

      expect(cleaner.findObjectsToDelete(objects)).toStrictEqual(objects);

    });

    test('Delete files that don\'t fit the pattern', () => {

      const cleaner = new BucketCleaner(null);
      cleaner.today = moment('2023-02-10', 'YYYY-MM-DD');

      const objects = [
        { Key: 'rando.txt' },
        { Key: 'jhudb-production_2023-02-08.sql.gz' },
      ];

      expect(cleaner.findObjectsToDelete(objects)).toStrictEqual([{ Key: 'rando.txt' }]);

    });

  });

});
