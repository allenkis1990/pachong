/**
 * Created by Allen Liu on 2019/12/4.
 */
let xlsx = require('node-xlsx');
let fs = require('fs')
let path = require('path')
let str = fs.readFileSync(path.resolve(__dirname,'./detail.txt'),'utf8')
str = str.replace(/\s+/g,'').replace(/,$/,'')
let arr = str.split(',')

var dataArr = [
    ['采购人','交货地点','联系人','联系人电话','总价','发布日期','详细网址']
]
for(let i=0;i<arr.length;i++){
    let item = arr[i]
    let itemArr = item.split(':')
    let [organ,shouhuo,address,phone,money,date,url] = itemArr
    // console.log(`采购人:${organ},收货联系人:${shouhuo},交货地点:${address},收货联系人电话:${phone},总价:${money}`)
    dataArr.push([organ,address,shouhuo,phone,money,date,url])
}
// console.log(str);
// console.log(dataArr);
var buffer = xlsx.build([
    {
        name:'list',
        data:dataArr
    }
]);
console.time('生成excel文件总共花费:')
fs.writeFileSync('直购清单.xlsx',buffer,{'flag':'w'});
console.timeEnd('生成excel文件总共花费:')
