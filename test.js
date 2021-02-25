const qiniu = require('qiniu');

const accessKey = 'tGXajI5JmN_znlB3zhh1b3RQQZk0NMUcmX7KRqMa';
const secretKey = 'uzbZ0ocu3cFnHAcNCOK0hCI1McwE0Hj3ik1_qemR';
const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);

// generate uploadToken
var options = {
  scope: 'mycloud-doc',
};

var putPolicy = new qiniu.rs.PutPolicy(options);
var uploadToken = putPolicy.uploadToken(mac);

var config = new qiniu.conf.Config();
// 机房
config.zone = qiniu.zone.Zone_z2;

var localFile = 'D:\\xue\\前端\\electron\\react\\cloud-doc\\README.md';
var formUploader = new qiniu.form_up.FormUploader(config);
var putExtra = new qiniu.form_up.PutExtra();

var key = 'README.md';

// 文件上传
formUploader.putFile(uploadToken, key, localFile, putExtra, function (resErr, respBody, respInfo) {
  if (resErr) {
    console.log('-----err', resErr);
    return;
  }
  if (respInfo.statusCode === 200) {
    console.log(respBody);
  } else {
    console.log(respInfo.statusCode);
    console.log(respBody);
  }
});
