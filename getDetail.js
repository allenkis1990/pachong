/**
 * Created by Allen Liu on 2019/12/3.
 */
let $http = require('axios')
$http.defaults.timeout = 40000;
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
let fs = require('fs')
let path = require('path')
let colors = require('colors/safe');
var baseUrl = 'http://120.35.30.176'


var str = fs.readFileSync(path.resolve(__dirname,'list.txt'),'utf8')
str = str.replace(/\s+/g,'')
str = str.replace(/,$/,'')
// console.log(str);

var arr = str.split(',')
// console.log(arr);
var num = 50
var curNum = 0
var areaMapper = {
    '省本级':'3500',
    '福州市':'350100',
    '鼓楼区':'350102',
    '台江区':'350104',
    '仓山区':'350104',
    '马尾区':'350105',
    '晋安区':'350111',
    '闽侯县':'350121',
    '连江县':'350122',
    '罗源县':'350123',
    '闽清县':'350124',
    '永泰县':'350125',
    '福清市':'350181',
    '长乐区':'350182',
    '高新区':'350191'
}
var writeArr = []
function xunhuan(){
    var promiseArr = []
    for(let i=0;i<num;i++){
        if(arr[curNum]){
            var item = arr[curNum]
            var itemArea = item.split(':')[0]
            var itemDetailId = item.split(':')[1]
            var date = item.split(':')[2]
            var code = areaMapper[itemArea]
            // console.log(itemArea,itemDetailId)
            promiseArr.push(getDetail(itemDetailId,code,itemArea,date))
        }
        curNum++
    }
    Promise.all(promiseArr).then(function(){
        console.log(curNum);
        if(curNum<=arr.length){
            xunhuan()
        }else{
            var buffer = ''
            writeArr.forEach((item)=>{
                buffer+=`${item.organ}:${item.shouhuo}:${item.address}:${item.phone}:${item.money}:${item.date}:${item.url},\r\n`
            })
            fs.writeFileSync('./detail.txt',buffer,{
                flag:'a'
            })
            console.log(colors.green('detail.txt写入成功'))
            console.timeEnd('detail.txt写入总共花费:')
            return
        }
    })
}

console.time('detail.txt写入总共花费:')
xunhuan()



var methods = {
    outputDetailErrorMsg(msg,areaName,href){
        console.log(colors.red(msg));
        fs.writeFileSync('./detailErr.txt',`${areaName}:${href},\r\n`,{
            flag:'a'
        })
    },
    findDomTextContent(tag,text,document,num){
        var tagLists = Array.from(document.querySelectorAll(tag))
        var idx = -1
        tagLists.forEach((item,index)=>{
            if(item.textContent){
                if(item.textContent.indexOf(text)>-1){
                    idx = index
                }
            }
        })
        return tagLists[idx+num].textContent
    }
}

function getDetail(detailId,code,areaName,date){
    return new Promise((resolve)=>{
        var url = `${baseUrl}/${code}/notice/d03180adb4de41acbb063875889f9af1/${detailId}/`
        $http.get(url).then(function(res){
            console.log(colors.blue(url));
            let html = res.data
            let dom = new JSDOM(html);
            let document = dom.window.document
            var money = html.match(/<span.*?">((\d+)(\.\d+)?)元/)[1]//总价
            var organ = methods.findDomTextContent('span','甲方(采购人)',document,1)//甲方
            var address = methods.findDomTextContent('span','交货地点：',document,1)// 交货地点
            var shouhuo = methods.findDomTextContent('span','收货联系人：',document,1)// 收货联系人
            var phone = methods.findDomTextContent('span','收货联系人：',document,2)// 收货联系人电话
            // console.log(areaName);
            /*fs.writeFileSync('./detail.txt',`${organ}:${shouhuo}:${address}:${phone}:${money}:${date}:${url},\r\n`,{
                flag:'a'
            })*/
            writeArr.push({
                organ:organ,
                shouhuo:shouhuo,
                address:address,
                phone:phone,
                money:money,
                date:date,
                url:url.replace('http://','')
            })
            resolve()
        },function(e){
            methods.outputDetailErrorMsg(`${areaName}路径${url}加载失败`,areaName,url)
            resolve()
        })
    })
}


