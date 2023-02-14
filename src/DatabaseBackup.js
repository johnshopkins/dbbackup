import * as fs from 'fs';
import * as path from 'path';
import moment from 'moment';
import { execSync } from 'child_process';

const connectionDefaults = {
  user: 'admin',
  host: 'localhost',
  port: 3306,
};

export default class DatabaseBackup {

  constructor(s3client, backupDir) {
    this.s3client = s3client;
    this.backupDir = backupDir || path.join(process.env.HOME, 'tmp_dbbackup');
    this.removeBackupDir = false;

    this.zippedFilename = ''
  }


  createDumpCommand(filename, dbname, connection = {}, options = []) {

    // merge defaults with connection given by user
    const connectionSettings = { ...connectionDefaults, ...connection };

    let command = `mysqldump -u ${connectionSettings.user} `;

    if (connectionSettings.password === null) {
      command += `--password= `;
    } else if (typeof connectionSettings.password !== 'undefined') {
      command += `--password="${connectionSettings.password}" `;
    } else {
      command += `-p `;
    }

    command += `--host ${connectionSettings.host} --port ${connectionSettings.port} `;

    if (options.length > 0) {
      command += options.map(option => `${option}`).join(' ') + ' ';
    }
    
    command += `${dbname} > ${filename}`;

    return command
  }

  /**
   * Backup a database to the backup directory
   * @param {string} dbname     Name of the database to backup
   * @param {object} connection Database connection settings. Object that has user, password, hosts, and port key/value pairs.
   *                            Any key/value pairs passed into the function by the user will be merged with the defaults.
   * @param {array}  options    Additional options for the mysqldump command as an array of strings.
   *                            Any items passed into the function by the user will not be merged with the defaults.
   */
  backup(dbname, connection, options) {

    // create temp directory if it doesn't exist
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
      this.removeBackupDir = true; // remove when finished
    }

    // create the filename we'll use for this database
    const today = moment().format('YYYY-MM-DD');
    const filename = `${dbname}_${today}.sql`;
    const filepath = path.join(this.backupDir, filename);

    // create the mysql dump command and run it
    const command = this.createDumpCommand(filepath, dbname, connection, options);
    execSync(command);

    // gzip the file
    execSync(`gzip -f ${filepath}`);
    this.filename = `${filename}.gz`;
    this.filepath = `${filepath}.gz`;

    return this;
  }

  /**
   * Send the database file to s3
   * @param {string} bucket s3 bucket name
   */
  async to(bucket) {
    const result = await this.s3client.upload(bucket, this.filename, this.filepath);

    fs.unlinkSync(this.filepath);

    if (this.removeBackupDir) {
      fs.rmSync(this.backupDir, { recursive: true, force: true });
    }

    return result;
  }

}
