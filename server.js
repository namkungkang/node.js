const express = require('express')

const app = express()

app.listen(8080,()=> {
    console.log('http://localhost:8080 에서 실행중')
})

app.get('/',(req,res)=>{
    res.send('반갑다')

})

app.get('/news',(req,res)=> {
        res.send('뉴스임')
})

app.get('/shop',(req,res)=> {
    res.send('쇼핑사이트임')
})