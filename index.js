const express = require('express')
const cors = require('cors');
const helmet = require('helmet')
const morgan = require('morgan')
const imgur = require('imgur')
const multer = require('multer')

const fs = require('fs')
const path = require('path')

const storage = multer.diskStorage({
    destination: './uploads',
    filename: (req, file, cb) =>{
        cb(
            null, file.filename + '-' + Date.now() + path.extname(file.originalname)
        )
    }
})

const upload = multer({storage:storage})

const app = express()
app.use(cors())
app.use(express.json({extended:false}))
app.use(express.urlencoded({extended:true}))
app.use(helmet())
app.use(morgan('tiny'))
app.use(upload.any())

app.get('/', (req, res)=>{
    res.json({message: 'hello world!'})
})

app.post('/uploads/', async(req, res) =>{
    const file=req.files[0]

    try{
        const url = await imgur.uploadFile(`./uploads/${file.filename}`)
        res.json({url:url.data.link})
        fs.unlinkSync(`./uploads/${file.filename}`)
    }catch(err){
        console.log(err)
        res.status(500).json({message: 'server error'})
    }
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => console.log('Server run at port ', PORT))