import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import hbs from 'hbs'
import path from 'path'
import morgan from 'morgan'
import bodyParser from 'body-parser'
import fileUpload from 'express-fileupload'
import {initTable, initDatabse, insertProduct, getProduct} from './database.js'
import fs from 'fs'

const __dirname = path.resolve()

const app = express()
const db = initDatabse();
initTable(db)


app.use(fileUpload())
app.set('views', __dirname + '/layouts')
app.set('view engine','html')
app.engine('html', hbs.__express)

//log incoming request
app.use(morgan('combined'))

//parser request body
app.use(bodyParser.urlencoded());

//serve static file
app.use('/assets', express.static(__dirname+'/assets'))
app.use('/files', express.static(path.join(__dirname, '/files')))

app.get('/', async (req, res, next) => {
    res.send({ success : true})
})

//get product list
app.get('/product', async (req, res, next) => {   
    // getProduct(db).then(product => {
    //     console.log('Product result',product)
    //     res.render('product')
    // }).catch(error =>{
    //     console.log(error)
    // })

    let product 
    try {
        product = await getProduct(db);
    } catch (error) {
        return next(error)
    }

    console.log('Product result',product)
    res.render('product', {products: product})
})

app.get('/add-product', async (req, res, next) => {   
    res.send(req.query)
})

app.post('/add-product', (req, res, next) => {
    console.log('Request', req.body)
    console.log('file', req.files);
    const fileName = Date.now() + req.files.photo.name;

    fs.writeFile(path.join(__dirname, '/files' ,fileName), req.files.photo.data, (err) => {
        if(err){
            console.log(err)
            return
        }
    })

    //insert product
    insertProduct(db, req.body.name, parseInt(req.body.price), `/files/${fileName}`)

    //redirect
    res.redirect('/product')
})

app.use((err,req,res,next) => {
    res.send(message)
})

app.listen(8000, () => {
    console.log('App listen on port 8000')
})
