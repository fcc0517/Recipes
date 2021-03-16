// pages/type/type.js
import config from "../../utils/config"
import api from "../../utils/api"
Page({

  /**
   * 页面的初始数据
   */
  data: {
    types:[
     
    ]
  },
onLoad(){
  this._getTypeRecipe()
},
// 获取所有的菜谱分类
async _getTypeRecipe(){
  let result = await api.findAll(config.typesTable)
  console.log(result);
  this.setData({
    types:result.data
  })
},
_goLists(e){
  console.log(e);
  let {title,typeid,tag} = e.currentTarget.dataset
  console.log(title,typeid,tag);
  wx.navigateTo({
    url: '../list/list?typeid='+typeid+"&title="+title+"&tag="+tag,
  })
}
 
})