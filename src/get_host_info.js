import log from './logger.js'
import fs from 'fs'

const HOST_INFO_FILE = process.env.HOST_INFO_FILE || '/opt/data/hostInfo.json'

export default async function (){
  try{
    if(!HOST_INFO_FILE) return
    let data = await fs.readFileSync(HOST_INFO_FILE)
    if(data) return JSON.parse(data)
  }catch(e){
    log.error(`error reading ${HOST_INFO_FILE}`)
  }
}
