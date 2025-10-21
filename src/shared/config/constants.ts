export let host: string = `${document.location.protocol.slice(0, -1)}://${document.location.host.split(':')[0]}`

if (document.location.host.split(':')[1]) {
    if (document.location.host.split(':')[1] !== '3000')
        host += ':' + document.location.host.split(':')[1]
    else
        host += ':8000'
} else
    host += ''

export const wsHost = 'wss://test-vapp-03.sgp.ru';
//export const wsHost = 'ws://localhost:8000';