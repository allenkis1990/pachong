/**
 * Created by Allen Liu on 2019/12/2.
 */
// http://120.35.30.176/3500/notice/d03180adb4de41acbb063875889f9af1/ff8080816777ffa801677c3b41521acd/
let $http = require('axios')
$http.defaults.timeout = 10000;
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
let colors = require('colors/safe');
let fs = require('fs')
var areaList = [
    {name:'省本级',code:'3500'},
    {name:'福州市',code:'350100'},
    {name:'鼓楼区',code:'350102'},
    {name:'台江区',code:'350103'},
    {name:'仓山区',code:'350104'},
    {name:'马尾区',code:'350105'},
    {name:'晋安区',code:'350111'},
    {name:'闽侯县',code:'350121'},
    {name:'连江县',code:'350122'},
    {name:'罗源县',code:'350123'},
    {name:'闽清县',code:'350124'},
    {name:'永泰县',code:'350125'},
    {name:'福清市',code:'350181'},
    {name:'长乐区',code:'350182'},
    {name:'高新区',code:'350191'}
]
var baseUrl = 'http://120.35.30.176'
var url = `${baseUrl}/3500/noticelist/d03180adb4de41acbb063875889f9af1/`
let hasLoadArea = false
let totalSize = 0
var areaIdx = 0
var num = 20
let page = 1
// let targetStr = '直购'
// let dateReg = /(2019|201812)/ //只找2019年和2018年12月的

var targetStr = '直购'
var targetStr2 = '议价'
let dateReg = /(2021|202201|202202)/


var writeArr = []
var methods = {
    //获取总页数
    getTotal(document){
        var total = 0
        try{
            var pageBtns = Array.from(document.querySelector('.pageGroup').querySelectorAll('button'))
            var lastBtn = pageBtns[pageBtns.length-1]
            var onclickVal = lastBtn.getAttribute('onclick')
            var pageStrReg = /\?page=(\d+)&*?/
            var pageMatch = onclickVal.match(pageStrReg)
            total = pageMatch[1]
            return Number(total)
        }catch(e){
            console.log(colors.red('获取总页数失败！ '))
            return 0
        }
    },
    outputErrorMsg(msg,page){
        console.log(colors.red(msg));
        areaList[areaIdx] && fs.writeFileSync('./listErr.txt',`${areaList[areaIdx].name}:${page},\r\n`,{
            flag:'a'
        })
    },
    write(){
        //去重
        console.log(writeArr.length,'write');
        writeArr = Array.from(new Set(writeArr))
        let buffer = ''
        for(let i=0;i<writeArr.length;i++){
            let item = writeArr[i]
            buffer+= `${item},\r\n`
        }
        fs.writeFileSync('./list.txt',buffer,{
            flag:'a'
        })
        writeArr = []
    }
}


function getData(page,areaIdx){
    return new Promise((resolve,reject)=>{
        //解决超过areaIdx报错问题
        if(!areaList[areaIdx]){
            reject('overflow')
        }
        if(hasLoadArea&&page>totalSize){
            console.log('大于');
            resolve('done')
        }
        $http.get(url,{params:{
            page: page,
            zone_name: areaList[areaIdx].name,
            zone_code: areaList[areaIdx].code
        }}).then(function(res){
            console.log(colors.blue(`${areaList[areaIdx].name}第${page}页请求`))
            var html = res.data
            //console.log(html);
            //console.log(data);
            const dom = new JSDOM(html);
            let document = dom.window.document
            if(!hasLoadArea){
                totalSize = methods.getTotal(document) || totalSize
                console.log(totalSize);
                hasLoadArea = true
            }

            var list = Array.from(document.querySelectorAll('.gradeX'))
            if(!list.length){
                reject()
            }
            for(let i=0;i<list.length;i++){
                let item = list[i]
                let str = item.querySelectorAll('td')[1].textContent//直购
                let date = item.querySelectorAll('td')[4].textContent
                let dateStr = date.replace(/-/g,'')//20190101
                //等于直购并且是匹配对应年度正则的
                if(dateReg.test(dateStr)){
                    // console.log(dateStr);
                    if(str.includes(targetStr) || str.includes(targetStr2)){
                        var href = item.querySelector('a').getAttribute('href')
                        var detailId = href.split('/')[4]
                        writeArr.push(`${areaList[areaIdx].name}:${detailId}:${date}`)
                    }
                }else{
                    // console.log(dateStr);
                    resolve('done')
                }
            }
            resolve()
        },function(e){
            var msg = `${areaList[areaIdx].name}第${page}页请求失败`
            methods.outputErrorMsg(msg,page)
            resolve()
        })
    })
}

function xunhuan(){
    var promiseArr = []
    for(let i=0;i<num;i++){
        promiseArr.push(getData(page,areaIdx))
        page++
    }
    Promise.all(promiseArr).then(function(data){
        if(data.indexOf('done')>-1){
            methods.write()
            console.log(colors.green(`${areaList[areaIdx].name}查找完毕`));
            areaIdx++
            if(areaIdx>areaList.length-1){
                console.timeEnd('list.txt写入总共花费:')
                console.log(colors.green(`全部查找完毕`));
            }else{
                page = 1
                hasLoadArea = false
            }
        }
        if(page<=totalSize){
            xunhuan()
        }else{
            return
        }
    },function(e){
        if(e!=='overflow'){
            var msg = '验证码过期'
            page = page-num
            methods.outputErrorMsg(msg,page)
        }
    })
}
console.time('list.txt写入总共花费:')
xunhuan()


