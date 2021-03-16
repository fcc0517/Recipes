// pages/pbrecipe/pbrecipe.js
import api from '../../utils/api'
import config from '../../utils/config'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    typesList: '',
    // 根据Uploader的规定的上传的数组的格式 [{url:...},{url:...},{url:...}，{url:...}]
    fileList: [] //用来存上传图片的资料 临时路径
  },
  onLoad() {
    this._getData()
  },
  // 1 先获取所有的菜谱分类数据
  async _getData() {
    let result = await api.findAll(config.typesTable)
    // console.log(result);
    this.setData({
      typesList: result.data
    })
  },
  // 2 选择图片
  _selectImg(e) {
    // console.log(e);
    let tempFilePaths = e.detail.tempFilePaths
    // 遍历返回一个符合规格的数组
    let result = tempFilePaths.map((item, index) => {
      return {
        url: item
      }
    })
    // 数组拼接
    let res = this.data.fileList.concat(result)
    this.setData({
      fileList: res
    })
    // console.log(this.data.fileList);
  },
  // 3删除图片
  _del(e) {
    console.log(e);
    let index = e.detail.index
    console.log(index);
    // 删除图片
    this.data.fileList.splice(index, 1)
  },
  //4 发布菜单
  //  获取菜单名称 菜谱分类 图片(要获取fileid)  做法内容
  async fbcd(e) {
    console.log(e);
    let file = this.data.fileList
    console.log(file);
    // 上传数据库 判断
    let { recipeName, recipeTypeid, recipeMakes  } = e.detail.value
    if (recipeName == '' || recipeTypeid == '' || recipeMakes == '' || this.data.fileList.length == 0) {
      wx.showToast({
        title: '内容不能为空',
        icon: "none"
      })
      return
    }
    let result = await this._uploadFile(file)
    let views = 0
    let follows = 0
    let status = 1 // 1 是正常  0 是删除
    let time = new Date().getTime()
    let arr = await api.add(config.recipes,{
      recipeName,
      recipeTypeid,
      recipeMakes ,
      filesID:result,
      views,
      follows,
      status,
      time
    })
    if(arr._id){
      wx.showToast({
        title: '上传成功',
        icon:"none"
      })
      setTimeout(() => {
        wx.switchTab({
          url: '../my/my',
        })
      }, 2000);
    }
  },
  async _uploadFile(files) {
    // 存储fildId
    let fildId = []
    files.map((item, index) => {
      let exaname = item.url.split('.').pop()
      let cloudPath = new Date().getTime() + index + '.' + exaname
      console.log(cloudPath);
      // 异步操作 没有回调函数，返回一个promise
      let res = wx.cloud.uploadFile({
        cloudPath: "web1026/" + cloudPath, //云端路径
        filePath: item.url, //本地临时路径
        // success(res) {
        //   console.log(res);
        // }
      })
      fildId.push(res)

    })
    let list = await Promise.all(fildId)
    list = list.map((item, index) => {
      return item.fileID
    })
    return list
  }

})