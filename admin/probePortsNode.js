const http = require('http');
const ports = Array.from({length: 11}, (_,i)=>3000+i);
(async ()=>{
  for (const p of ports){
    try{
      await new Promise((res,rej)=>{
        const req = http.request({method:'GET', hostname:'localhost', port: p, path:'/', timeout: 1000}, (r)=>{
          console.log('port',p,'UP', 'status', r.statusCode);
          r.resume();
          res();
        });
        req.on('error', ()=>{ console.log('port',p,'DOWN'); res(); });
        req.on('timeout', ()=>{ req.destroy(); console.log('port',p,'TIMEOUT'); res(); });
        req.end();
      })
    }catch(e){ console.log('port',p,'ERR',e.message) }
  }
})();
