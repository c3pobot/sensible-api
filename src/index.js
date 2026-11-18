import log from './logger.js'

import express from 'express'
import compression from 'compression'
import getHostInfo from './get_host_info.js'

import mqttDevice from './mqtt_device.js'

const PORT = process.env.port || 3000
const MQTT_HOST = process.env.MQTT_HOST;

const app = express()
app.use(compression())

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
  if(MQTT_HOST) mqttDevice.start();
})