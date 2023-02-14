import * as fs from 'fs';
import {
  DeleteObjectsCommand,
  ListObjectsCommand,
  PutObjectCommand,
  S3Client
} from '@aws-sdk/client-s3';

export default class s3 {

  constructor(accessKeyId, secretAccessKey, region = 'us-east-1') {
    this.client = new S3Client({
      credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey
      },
      region: region,
    });
  }

  /**
   * Get a list of objects in an s3 bucket
   * https://docs.aws.amazon.com/AmazonS3/latest/userguide/example_s3_ListObjects_section.html
   * @param {string} bucket   s3 bucket name
   * @returns Array of objects in the bucket
   */
  async listObjectsInBucket(bucket) {
    const data = await this.client.send(new ListObjectsCommand({
      Bucket: bucket
    }));
    return data.Contents;
  }

  /**
   * Delete objects from an s3 bucket
   * https://docs.aws.amazon.com/AmazonS3/latest/userguide/example_s3_DeleteObjects_section.html
   * @param {string} bucket   s3 bucket name
   * @param {array}  objects  Array of objects to delete
   * @returns Array of deleted obbjects
   */
  async deleteObjects(bucket, objects) {
    const data = await this.client.send(new DeleteObjectsCommand({
      Bucket: bucket,
      Delete: {
        Objects: objects.map(object => {
          return { Key: object.Key };
        })
      }
    }));
    return data.Deleted;
  }

  /**
   * Uploads an object to an s3 bucket
     * https://docs.aws.amazon.com/AmazonS3/latest/userguide/example_s3_PutObject_section.html
   * @param {string} bucket   s3 bucket name
   * @param {string} filename Filename to upload to s3 buckey (used as Key)
   * @param {string} filepath Path to file to upload to s3 bucket
   * @returns 
   */
  async upload(bucket, filename, filepath) {
    return await this.client.send(new PutObjectCommand({
      Bucket: bucket,
      Key: filename,
      Body: fs.createReadStream(filepath),
    }));
  }
}
