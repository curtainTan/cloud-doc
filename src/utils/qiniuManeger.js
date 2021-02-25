const qiniu = require('qiniu');

class QiniuManeger {
  constructor(accessKey, secretKey, bucket) {
    this.mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
    this.bucket = bucket;

    this.config = new qiniu.conf.Config();
    this.config.zone = qiniu.zone.Zone_z2;

    this.bucketManeger = new qiniu.rs.BucketManager(this.mac, this.config);
  }

  uploadFile(key, localfilePath) {
    const options = {
      scope: this.bucket + ':' + key,
    };
    const putPolicy = new qiniu.rs.PutPolicy(options);
    const uploadToken = putPolicy.uploadToken(this.mac);

    const formUploader = new qiniu.form_up.FormUploader(this.config);
    const putExtra = new qiniu.form_up.PutExtra();

    return new Promise((resolve, reject) => {
      formUploader.putFile(
        uploadToken,
        key,
        localfilePath,
        putExtra,
        this._handleCallback(resolve, reject)
      );
    });
  }

  deleteFile(key) {
    return new Promise((resolve, reject) => {
      this.bucketManeger.delete(this.bucket, key, this._handleCallback(resolve, reject));
    });
  }

  getBucketDomain() {
    const reqURL = `http://api.qiniu.com/v6/domain/list?tbl=${this.bucket}`;
    const digest = qiniu.util.generateAccessToken(this.mac, reqURL);
    return new Promise((resolve, reject) => {
      qiniu.rpc.postWithoutForm(reqURL, digest, this._handleCallback(resolve, reject));
    });
  }

  generateDownloadLink(key) {
    const domainPromise = this.publicBucketDomain
      ? Promise.resolve([this.publicBucketDomain])
      : this.getBucketDomain();

    return domainPromise.then(data => {
      if (Array.isArray(data) && data.length > 0) {
        const pattern = /^https?/;
        this.publicBucketDomain = pattern.test(data[0]) ? data[0] : `http://${data[0]}`;
        return this.bucketManeger.publicDownloadUrl(this.publicBucketDomain, key);
      } else {
        throw Error('域名未找到，请查看储存空间是否过期...');
      }
    });
  }

  _handleCallback(resolve, reject) {
    return (resErr, respBody, respInfo) => {
      if (resErr) {
        throw resErr;
      }
      if (respInfo.statusCode === 200) {
        console.log(respBody);
        resolve(respBody);
      } else {
        reject({
          statusCode: respInfo.statusCode,
          body: respBody,
        });
      }
    };
  }
}

module.exports = QiniuManeger;
