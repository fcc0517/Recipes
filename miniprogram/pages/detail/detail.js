// pages/detail/detail.js
import config from "../../utils/config"
import api from "../../utils/api"
let db = wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentId: '',
    detailArr: [],
    isfollow: true
  },
  onLoad(options) {
    console.log(options);
    wx.setNavigationBarTitle({
      title: options.title
    })
    this.setData({
      currentId: options.id
    })
    this._getDetail(options.id)
    console.log(this.data.currentId);
  },

  // 根据id请求菜谱的详情数据
  async _getDetail(id) {
    // console.log(id);
    // 更改views字段
    let res = await api.updateById(config.recipes, id, {
      views: db.command.inc(1)
    })
    let result = await api.findById(config.recipes, id)
    console.log(result.data.recipeTypeid);
    //根据菜谱的id查询菜谱的名称
    let recipe = await api.findAll(config.typesTable, { _id: result.data.recipeTypeid })
    console.log(recipe);
    result.data.typeInfo = recipe.data[0]
    // 根据openid  查询用户userinfo
    let info = await api.findAll(config.usersTable, { _openid: result.data._openid })
    result.data.userInfo = info.data[0].userInfo
    this.setData({
      detailArr: result.data
    })
    // 判断用户是否登录  未登录
    let openid = wx.getStorageSync('openid') || null
    if (openid == null) {
      this.setData({
        isfollow: false
      })
      return
    }
    // 已经登录的状态
    let msg = await api.findAll(config.follows, { _openid: openid, recipeID: id })
    console.log(msg);
    if (msg == null) {
      this.setData({
        isfollow: false
      })
      return
    }
    // // 能查到
    // this.setData({
    //   isfollow: true
    // })
  },
  async _dofollow() {
    let openid = wx.getStorageSync('openid') || null
    if (openid == null) {
      wx.showToast({
        title: '请先去登录',
        icon: "none"
      })
      return
    }
    if (this.data.isfollow) {//已经关注
      let where = {
        _openid: openid,
        recipeID: this.data.currentId
      }
      // 取消关注
      let removeInfo = await api.delBywhere(config.follows, where)
      // 更新follows字段
      let updateInfo = await api.updateById(config.recipes, recipeID, {
        follows: db.command.inc(-1)
      })
      this.setData({
        isfollow: false
      })
      return
    } else {
      let where = {
        _openid: openid,
        recipeID: this.data.currentId
      }
      // 执行关注
      let addInfo = await api.add(config.follows, { recipeID: this.data.currentId })
      console.log(addInfo);
      if (addInfo._id) {
        // 添加成功之后更新follows字段
        let updateInfo = await api.updateById(config.recipes, this.data.currentId, {
          follows: db.command.inc(1)
        })
        this.setData({
          isfollow: true
        })
      }
    }

  }
})