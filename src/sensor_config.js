export default [
    { name: 'Root Used', topic: 'root_used' },
    { name: 'Root Free', topic: 'root_free' },
    { name: 'CPU Load', topic: 'cpu_load' },
    { name: 'Hostname', topic: 'host_name' },
    { name: 'Boot Time', topic: 'boot_time', config: { device_class: 'timestamp', value_template: "{{ as_datetime(value) }}" } },
    { name: 'Mem Total', topic: 'mem_total' },
    { name: 'Mem Free', topic: 'mem_free' },
    { name: 'Mem Used', topic: 'mem_used' },
    { name: 'Mem Load', topic: 'mem_load' },
    { name: 'Connected', topic: 'connected', type: 'binary_sensor', config: { entity_category: 'diagnostic', device_class : 'connectivity', expire_after: 60 } },
]
