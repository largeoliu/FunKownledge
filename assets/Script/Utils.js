function loadCCB(file, callback){
    cc.log("addCCB: "+file);
    cc.loader.loadRes(file, cc.Prefab,function (err, prefab) {
        var newNode = cc.instantiate(prefab);
        callback(newNode);
    });
}

function playMusic(file){

}

module.exports = {
    loadCCB: loadCCB,
    playMusic: playMusic
};