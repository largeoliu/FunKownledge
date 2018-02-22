var AnswerNodeState = {
    NORMAL:0,
    ACTIVE:1,
    OVER:2
};

cc.Class({

    extends: cc.Component,

    properties: {
        _originPosition:null,
        _state:AnswerNodeState.NORMAL,
        
        index: cc.Integer,
        root: cc.Node,
        spr: cc.Sprite
    },

    onLoad: function(){
        this._originPosition = this.node.getPosition();
    },

    setSpriteFrame:function(atlasName, frameName){
        cc.log("setSpriteFrame: "+atlasName+"  "+frameName);

        cc.loader.loadRes(atlasName, cc.SpriteAtlas, function (err, atlas) {
            var spriteFrame = atlas.getSpriteFrame(frameName);
            this.spr.getComponent(cc.Sprite).spriteFrame = spriteFrame;
        }.bind(this));
    },

    active:function(){
        this.node.getComponent(cc.Animation).play("p");
        this._state = AnswerNodeState.ACTIVE;
    },

    resume:function(){
        this.node.setPosition(this._originPosition);
        this.node.getComponent(cc.Animation).play("normal");
        this._state = AnswerNodeState.NORMAL; 
    },

    disappear:function(){
        this.node.setPosition(this._originPosition);
        this.node.getComponent(cc.Animation).play("out");
        this._state = AnswerNodeState.OVER;
    },

    radius:function(){
        return this.node.getContentSize().width/2;
    },

    worldPosition:function(){
        var point = this.root.convertToWorldSpace(this.node.getPosition());
        point.x += this.radius();
        point.y += this.radius();
        return point;
    },

    setWorldPosition:function(pos){
        var point = this.root.convertToNodeSpace(pos);
        point.x = point.x-this.radius();
        point.y = point.y-this.radius();
        this.node.setPosition(point);
    },

    tag:function(){
        return this.index;
    },

    state:function(){
        return this._state;
    }

});
