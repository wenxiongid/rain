使用前先运行`npm install`

使用`proj.config.js`定义项目选项：

```js
module.exports = {
  mergeCss: false,
  useCDNImg: false
};
```

`mergeCss`定义是否把css样式嵌入到webpack生成的包
`useCDNImg`定义是否把图片文件上传到CDN，若不上传则包含到输出包中

gulp包含以下任务：

|任务名称|先行任务|功能|
|----|----|----|
|webpack|无|使用webpack打包脚本文件和其他资源文件，生成到`dist/js`目录下的`index.js`|
|webpack-dev-server|无|启动本地webpack服务器|
|uploadimg|无|上传图片到CDN或复制到`dist/img`目录|
|replace-cdn|webpack, uploadimg|把`src/*.html`, `src/js/*.js`, `src/css/*.css`中的图片地址替换成CDN地址（若选项中选择不使用CDN则不作处理），并输出到`dist`文件夹下的对应位置|
|default|replace-cdn|把`dist/js/*.js`, `dist/css/*.css`作压缩混淆处理，并声称map文件|
|deploy|default|把`dist`文件打包成`deploy.zip`，不包含map文件|
