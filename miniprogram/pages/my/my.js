// pages/my/my.js

import config from "../../utils/config"
import api from "../../utils/api"
import admin from '../../utils/admin'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentIndex: "0",
    userInfo: "", //存储用户信息
    isLogin: false, //是否登录。 false 未登录  true，已经登录
    recipes: [
    //   {
    //   id: "1",
    //   recipeName: "烤苏格兰蛋",
    //   src: "../../imgs/1.jpg",
    //   opacity: 0, //遮罩层默认不显示
    // }
    ],
    types: [{
      typename: "营养菜谱",
      'src': "../../static/type/type01.jpg"
    },
    {
      typename: "儿童菜谱",
      'src': "../../static/type/type02.jpg"
    },
    {
      typename: "家常菜谱",
      'src': "../../static/type/type03.jpg"
    },
    {
      typename: "主食菜谱",
      'src': "../../static/type/type04.jpg"
    },
    {
      typename: "西餐菜谱",
      'src': "../../static/type/type05.jpg"
    },
    {
      typename: "早餐菜谱",
      'src': "../../static/type/type06.jpg"
    },
    ],
    lists: [{
      src: "../../static/list/list01.jpg",
      name: "土豆小番茄披萨",
      userInfo: {
        nickName: "林总小图",
        pic: "../../static/list/users.png"
      },
      views: 999,
      follow: 100
    },
    {
      src: "../../static/list/list02.jpg",
      name: "草莓巧克力三明治",
      userInfo: {
        nickName: "林总小图",
        pic: "../../static/list/users.png"
      },
      views: 88,
      follow: 200
    },
    {
      src: "../../static/list/list03.jpg",
      name: "法师意大利面",
      userInfo: {
        nickName: "林总小图",
        pic: "../../static/list/users.png"
      },
      views: 999,
      follow: 100
    },
    {
      src: "../../static/list/list04.jpg",
      name: "自制拉花",
      userInfo: {
        nickName: "林总小图",
        pic: "../../static/list/users.png"
      },
      views: 999,
      follow: 100
    },
    {
      src: "../../static/list/list05.jpg",
      name: "营养早餐",
      userInfo: {
        nickName: "林总小图",
        pic: "../../static/list/users.png"
      },
      views: 999,
      follow: 100
    }
    ],
  },
  // 处理遮罩层显示问题
  _delStyle(e) {
    // 获取索引
    let index = e.currentTarget.dataset.index;
    // 将所有的列表都设置不显示
    this.data.recipes.map((item) => {
      item.opacity = 0;
    })
    // 将长按的列表项设置为选中
    this.data.recipes[index].opacity = 1;
    this.setData({
      recipes: this.data.recipes
    })

  },
  // 执行删除操作
  _doDelete(e) {
    let index = e.currentTarget.dataset.index;
    // 如果没有显示删除图标，点击删除，直接返回
    if (!this.data.recipes[index].opacity) return;
    let _this = this;
    wx.showModal({
      title: "删除提示",
      content: "您确定删除么？",
      async success(res) {
        if (res.confirm) {
          //执行删除
          // console.log('执行删除')
          let id  = _this.data.recipes[index]._id
          console.log(id)
          // 通过更新方法，改变status的状态
          let result = await api.updateById(config.recipes,id,{status:0})
          console.log(result);
          _this._getreicpes()
        } else {
          //取消删除
          _this.data.recipes[index].opacity = 0;
          _this.setData({
            recipes: _this.data.recipes
          })
        }
      }
    })
  },
  // 1.检测是否授权
  onShow() {
    let that = this
    wx.getSetting({
      success: function (res) {
        // console.log(res);
        if (res.authSetting['scope.userInfo']) {
          // console.log("已经授权"); //已经授权，可以获取用户信息
          // 设置当前的页面
          let userInfo = wx.getStorageSync('userInfo')
          that.setData({
            isLogin: true,
            userInfo
          })
          // 登录之后获取数据
          that._getreicpes()
        } else {
          wx.showToast({
            title: '用户未授权',
            icon: 'none'
          }),
            // 设置当前的页面
            that.setData({
              isLogin: false
            })
        }
      }
    })
  },
  // 2.去登录
  _doLogin(e) {
    let that = this
    // console.log(e);
    if (e.detail.errMsg === "getUserInfo:fail auth deny") {
      wx.showToast({
        title: '登录失败',
        icon: 'none'
      })
      return
    }
    // 授权成功----wx.login （正常工作中的流程）
    //  不使用wx.login的情况下 如何获取openid
    // 3.获取openid 获取云函数
    wx.cloud.callFunction({
      name: "login",
      async success(res) {
        // console.log(res);
        let openid = res.result.openid
        let userInfo = e.detail.userInfo

        let result = await api.findAll(config.usersTable, { _openid: openid })
        console.log(result);
        if (result == null) { //此时为新用户
          let result = await api.add(config.usersTable, { userInfo })
          // console.log(result);
        }
        //  老用户 存入缓存中
        that.setData({
          isLogin: true,
          userInfo
        })
        wx.setStorageSync('userInfo', userInfo)
        wx.setStorageSync('openid', openid)
        // 登录成功之后获取数据
        that._getreicpes()
      }
    })

  },
  // 3.跳转菜单
  _goCate() {
    let openid = wx.getStorageSync('openid')
    if (openid != admin) {
      wx.showToast({
        title: '您不是管理员!!!',
        icon: 'none'
      })
      return
    }
    wx.navigateTo({
      url: '../../pages/category/category',
    })
  },
  // 4选项卡切换
  _checkActive(e) {
    // 拿到传过来的0 1
    let index = e.currentTarget.dataset.index
    this.setData({
      currentIndex: index
    })
  },
  // 5跳转菜谱发布
  _goPbrecipe() {
    wx.navigateTo({
      url: '../pbrecipe/pbrecipe',
    })
  },
  // 6获取数据
  async _getreicpes() {
    // console.log("菜单数据");
    // 根据opedid来查询数据
    let openid = wx.getStorageSync('openid')
    let result = await api.findAll(config.recipes, {_openid:openid,status:1},{fild:"time",sort:'desc'})
    console.log(result);
    if(result != null){
      result.data.map((item,index)=>{
        return item.opacity=0
      })
      this.setData({
        recipes:result.data
      })
    }
    
  }

})