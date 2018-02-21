require("LevelInfo");

var LevelManager = cc.Class({

    ctor:function(){   
        this._curLevel = 0;
        this._curIndex = 1;
        this.MAX_INDEX = 5;
    },

    next:function(){
        this._curIndex = this._curIndex%this.MAX_INDEX+1;
    },

    currentLevel:function(){
        return LevelInfo.create(this._curLevel, this._curIndex);
    },

    isEnd:function(){
        return this._curIndex == this.MAX_INDEX;
    }
});

var s_levelManager = null;
LevelManager.getInstance = function(){
    if(s_levelManager == null){
        s_levelManager = new LevelManager;
        s_levelManager.init();
    }
    return s_levelManager;
}
