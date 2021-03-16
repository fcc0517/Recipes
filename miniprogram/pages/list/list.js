// pages/list/list.js
import config from "../../utils/config"
import api from "../../utils/api"
Page({

  /**
   * 页面的初始数据
   */
  data: {
    lists: [
    ]
  },
  // 1接收index传来的参数
  onLoad(options) {
    console.log(options.hasOwnProperty('tag'));

    wx.setNavigationBarTitle({
      title: options.title
    })
    this._getData(options.typeid, options.tag)


  },
  // 2根据typeid请求数据
  async _getData(id, tag) {
    // console.log(id);
    let where = []
    let orderBy = []
    switch (tag) {
      case "putong":
        // 普通菜谱的条件
        where = {
          recipeTypeid: id,
          status: 1
        }
        orderBy = {
          fild: "views",
          sort: "desc"
        }
        break
      case "hot":
        // 热门菜谱的条件
        where = {
          status: 1
        }
        orderBy = {
          fild: "views",
          sort: "desc"
        }
        break
      default:
        console.log("其他内容");
    }


    let result = await api.findAll(config.recipes, where, orderBy)
    // console.log(result);
    // 处理用户信息的问题 根据openid查找用户表的数据
    let arr = []
    result.data.map((item,index)=> {
      let resList = api.findAll(config.usersTable,{
        _openid: item._openid
      })
      arr.push(resList)
      // console.log(resList);
    })
    // 解决异步问题
    let arr1 = await Promise.all(arr)
    // console.log(arr1);
    result.data.map((item,index) => {
      return item.userInfo = arr1[index].data[0].userInfo
    })
    console.log(result.data);







    if (result != null) {
      this.setData({
        lists: result.data
      })
    }

  }

})