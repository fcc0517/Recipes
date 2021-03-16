// pages/category/category.js
import api from '../../utils/api'
import config from '../../utils/config'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isShow: false,//true是显示  false是不显示
    inValue: '',
    typeAllList: [], //所有的菜谱分类
    setValue: '', //修改的数据
    currentId: ''
  },
  // 1、获取输入框的值
  _inputValue(e) {

    let value = e.detail.value
    console.log(value);
    console.log(this)
    this.setData({
      inValue: value
    })
    // this.setData({
    //   inValue:value
    // })
  },
  // 2、添加菜谱分类
  async _add() {
    let value = this.data.inValue
    // 插入数据库
    // 输入框的值不能为空
    if (value == '') {
      wx.showToast({
        title: '内容不能为空',
        icon: "none"
      })
      return
    }
    // 4判断数据库里面有没有这个分类 findIndex
    let typeAllList = this.data.typeAllList
    let index = typeAllList.findIndex((item, index) => {
      return item.typeName == value
    })
    if (index !== -1) {
      wx.showToast({
        title: '已有该分类',
        icon: "none"
      })
      return
    }
    let result = await api.add(config.typesTable, { typeName: value })
    console.log(result);
    if (result._id) {
      wx.showToast({
        title: '添加成功',
      })
      this.setData({
        inValue: ''
      })
    }
    this._getData()
  },
  // 初始化先获取菜谱
  onLoad() {
    this._getData()
  },

  // 3.获取所有的菜谱分类
  async _getData() {
    let result = await api.findAll(config.typesTable)
    console.log(result)
    if (result == null) {
      this.setData({
        isShow: false
      })
      return
    } else {
      this.setData({
        isShow: true,
        typeAllList: result.data
      })
    }
  },
  //  5删除
  _del(e) {
    let that = this
    wx.showModal({
      title: "确认删除吗?",
      async success(res) {
        if (res.confirm) {
          let id = e.currentTarget.dataset.id
          // console.log(id);
          // 根据id删除数据库的数据
          let result = await api.delById(config.typesTable, id)
          // console.log(result);
          if (result.stats.removed != 0) {
            that._getData()
          }
        }
      }

    })
  },
  // 6获取修改信息
  _set(e) {
    let index = e.currentTarget.dataset.index
    let name = this.data.typeAllList[index].typeName
    console.log(index, name);
    this.setData({
      setValue: name,
      currentId: this.data.typeAllList[index]._id
    })
  },
  // 7执行修改数据
  _update() {
    let that = this
    wx.showModal({
      title: "确定要修改吗？",
      async success(res) {
        if (res.confirm) {
          let id = that.data.currentId
          console.log(id);
          let data = that.data.setValue
          // 如果输入内容为空，提示
          if (data == "") {
            wx.showToast({
              title: '内容不能为空',
              icon: "none"
            })
            return
          }
          let typeAllList = that.data.typeAllList
          // 如果已经有了这个名字，index为-1
          let index = typeAllList.findIndex((item, index) => {
            return item.typeName == data
          })
          // console.log(index);

          if (index != -1) {
            wx.showToast({
              title: '该分类已有',
              icon: "none"
            })
            return
          }
          // 修改数据库
          let result = await api.updateById(config.typesTable, id, { typeName: data })
          // console.log(result, data);
          if (result.stats.updated != 0) {
            wx.showToast({
              title: '修改成功',
              icon: "none"
            })
            that.setData({
              setValue: ""
            })
            that._getData()
          }
        }
      }
    })
  },
})