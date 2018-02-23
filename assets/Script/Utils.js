function loadCCB(file, callback){
    cc.log("addCCB: "+file);
    cc.loader.loadRes(file, cc.Prefab,function (err, prefab) {
        var newNode = cc.instantiate(prefab);
        callback(newNode);
    });
}

function playMusic(file, loop){
    cc.log("playMusic: "+file);
    cc.audioEngine.play(cc.url.raw(file), loop);
}

module.exports = {
    loadCCB: loadCCB,
    playMusic: playMusic
};