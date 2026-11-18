import log from './logger.js'
import mqtt from './mqtt.js'
import getHostInfo from './get_host_info.js'
import sensorConfigs from './sensor_config.js'

const NODE_NAME = process.env.NODE_NAME;
const NODE_IP = process.env.NODE_IP;
const HOST_NAME = `${process.env.NODE_NAME?.replace(/ /g, '')?.toLowerCase()}_host`
const HEAD_LAMP_URL = process.env.HEAD_LAMP_URL
const CLUSTER_NAME = process.env.CLUSTER_NAME || 'c3po'
const CLUSTER_TOPIC_PREFIX = `${(process.env.CLUSTER_NAME || 'c3po')?.toLowerCase()}_cluster`

async function addSensor(sensor = {}, data = {}){
    if(!sensor.topic || !sensor.name) return
    let sensor_config = {
        name: sensor.name,
        state_topic: `sensible/${CLUSTER_TOPIC_PREFIX}/${NODE_NAME}/${sensor.topic}/state`,
        unique_id: `${HOST_NAME}_${sensor.topic}`,
        device: { name: `${NODE_NAME}`, identifiers: [ HOST_NAME ], via_device: `${CLUSTER_TOPIC_PREFIX}_main` }
    }
    if(HEAD_LAMP_URL) sensor_config.device.configuration_url = `${HEAD_LAMP_URL}/c/microk8s/nodes/${NODE_NAME}`
    if(sensor.config){
        sensor_config = { ...sensor_config, ...sensor.config }
    }else{
        if(data.icon) sensor_config.icon = data.icon
        if(data.unit) sensor_config.unit_of_measurement = data.unit
    }
    return await mqtt.publish(`homeassistant/${sensor.type || 'sensor'}/${CLUSTER_TOPIC_PREFIX}/${NODE_NAME}_${sensor.topic}/config`, JSON.stringify(sensor_config), true)
}
async function createMainDevice(){
    let sensor_config = {
        name: `Name`,
        state_topic: `sensible/${CLUSTER_TOPIC_PREFIX}/main/name/state`,
        unique_id: `${CLUSTER_TOPIC_PREFIX}_name`,
        device: { name: `${CLUSTER_NAME} Cluster`, identifiers: [ `${CLUSTER_TOPIC_PREFIX}_main` ] }
    }
    await mqtt.publish(`homeassistant/sensor/${CLUSTER_TOPIC_PREFIX}/main_cluster_name/config`, JSON.stringify(sensor_config), true)
    await mqtt.publish(`sensible/${CLUSTER_TOPIC_PREFIX}/main/name/state`, CLUSTER_NAME)
}
async function init(){
    try{
        if(!mqtt.status()) return setTimeout(init, 5000)
        if(!sensorConfigs || sensorConfigs?.length == 0) return
        let data = await getHostInfo()
        if(!data || data?.length == 0) return setTimeout(init, 5000)
        await createMainDevice()
        for(let i of sensorConfigs) await addSensor(i, data.find(x=>x.id == i.topic))
        sync()
    }catch(e){
        log.error(e)
        setTimeout(init, 5000)
    }
}
async function sync(){
    try{
        let data = await getHostInfo()
        if(data?.length > 0){
            for(let i of data){
                if(i.id == 'host_name') continue
                await mqtt.publish(`sensible/${CLUSTER_TOPIC_PREFIX}/${NODE_NAME}/${i.id}/state`, i?.value)
            }
            await mqtt.publish(`sensible/${CLUSTER_TOPIC_PREFIX}/${NODE_NAME}/connected/state`, 'ON')
            await mqtt.publish(`sensible/${CLUSTER_TOPIC_PREFIX}/${NODE_NAME}/host_name/state`, NODE_NAME)
            await mqtt.publish(`sensible/${CLUSTER_TOPIC_PREFIX}/${NODE_NAME}/host_ip/state`, NODE_IP)
            await mqtt.publish(`sensible/${CLUSTER_TOPIC_PREFIX}/main/name/state`, CLUSTER_NAME)
        }
        setTimeout(sync, 10000)
    }catch(e){
        log.error(e)
        setTimeout(sync, 5000)
    }
}
function start(){
    try{
        init()
    }catch(e){
        log.error(e)
    }
}
export default { start }
