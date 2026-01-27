const Service = require('node-windows').Service

const svc = new Service({
    name: "nodeBasicService",
    description: "this is our description",
    script: "C:\Users\aleef\Desktop\secret\app\index.html"
})

svc.on('install', function(){
    svc.start()
})

svc.install()