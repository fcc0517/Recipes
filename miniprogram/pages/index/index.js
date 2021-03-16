import config from "../../utils/config"
import api from "../../utils/api"
Page({
    data: {
        types: [],
        recipes:[]
    },
    onShow(){
        this._getHotRecipes()
        this._getType()
    },
    // 1请求菜谱数据，根据views进行排序
    async _getHotRecipes(){
        // console.log("热门菜谱");
        let result = await api.findAll(config.recipes,{status:1},{fild:"views",sort:'desc'})
        // console.log(result);
        let arr = []
        if(result != null){
            result.data.map((item,index)=>{
                // console.log(item._openid);
                let  resList = api.findAll(config.usersTable,{_openid:item._openid})
                // console.log(resList);
                arr.push(resList)
            })
            // console.log(arr);
            let arr1 = await Promise.all(arr)
            // console.log(arr1[0].data[0]);
            // console.log(result.data);
            result.data.map((item,index)=>{
                return item.userInfo = arr1[index].data[0].userInfo
            })
            this.setData({
                recipes:result.data
            })
        }
    },
    // 2.请求分类菜谱数据
    async _getType(){
        console.log("请求菜谱分类数据");
        let result = await api.findAll(config.typesTable)
        // console.log(result);
        this.setData({
            types:result.data
        })
        // console.log(this.data.types);
    },
    // 3跳转至全部菜谱页面
    _goTypePage(){
        wx.navigateTo({
          url: '../type/type',
        })
    },
    // 4跳转到List页面
    _goListPage(e){
        // console.log(e);
        let {title,typeid=null,tag} = e.currentTarget.dataset
        wx.navigateTo({
          url: '../list/list?typeid='+typeid+"&title="+title+"&tag="+tag,
        })
    },
    // 5跳转到详情页面
    _goDetailPage(e){
        let {id ,title} = e.currentTarget.dataset
        console.log(id,title);
        wx.navigateTo({
          url: '../detail/detail?id='+id+"&title="+title,
        })
    }
})