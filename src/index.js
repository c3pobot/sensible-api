import log from './logger.js'

import express from 'express'
import compression from 'compression'
import fs from 'fs'

const PORT = process.env.port || 3000
const HOST_INFO_FILE = process.env.HOST_INFO_FILE || '/opt/data/hostInfo.json'

const app = express()
app.use(compression())

async function getHostInfo(){
  try{
    if(!HOST_INFO_FILE) return
    let data = await fs.readFileSync(HOST_INFO_FILE)
    if(data) return JSON.parse(data)
  }catch(e){
    log.error(`error reading ${HOST_INFO_FILE}`)
  }
}

app.get('/hostInfo',  async(req, res)=>{
  try{
    let data = await getHostInfo()
    if(data){
      res.json(data)
    }else{
      res.sendStatus(400)
    }
  }catch(e){
    log.error(e)
    res.sendStatus(500)
  }
})
const server = app.listen(PORT, ()=>{
  log.info(`sensible-api server is listening on ${server.address().port}...`)
})