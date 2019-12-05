/**
 * Created by Allen Liu on 2019/12/3.
 */
http://120.35.30.176/3500/notice/d03180adb4de41acbb063875889f9af1/ff8080816eac4e40016eb0fb8468666c/
var a1 = new Promise((resolve)=>{
    setTimeout(()=>{
        console.log(1);
        resolve()
    },2000)
})
var a2 = new Promise((resolve)=>{
    setTimeout(()=>{
        console.log(2);
        resolve('done')
    },3000)
})
var arr = []
arr.push(a1)
arr.push(a2)
Promise.all(arr).then((data)=>{
    console.log(data);
})