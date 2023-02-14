import DatabaseBackup from '../src/DatabaseBackup.js';

describe('DatabaseBackup', () => {

  describe('createDumpCommand', () => {

    test('Defaults', () => {

      const backup = new DatabaseBackup(null);

      const actual = backup.createDumpCommand('filename.sql', 'dbname');
      const expected = 'mysqldump -u admin -p --host localhost --port 3306 dbname > filename.sql';

      expect(actual).toBe(expected);

    });

    test('Connection overrides: null password', () => {

      const backup = new DatabaseBackup(null);

      const actual = backup.createDumpCommand('filename.sql', 'dbname', {
        user: 'root',
        password: null,
        host: 'some_host',
        port: 1234,
      });
      const expected = 'mysqldump -u root --password= --host some_host --port 1234 dbname > filename.sql';

      expect(actual).toBe(expected);

    });

    test('Connection overrides: custom options', () => {

      const backup = new DatabaseBackup(null);

      const actual = backup.createDumpCommand('filename.sql', 'dbname', {}, ['--quick']);
      const expected = 'mysqldump -u admin -p --host localhost --port 3306 --quick dbname > filename.sql';

      expect(actual).toBe(expected);

    });

  });

});
