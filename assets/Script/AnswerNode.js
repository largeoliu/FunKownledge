var AnswerNodeState = {
    NORMAL:0,
    ACTIVE:1,
    OVER:2
};

cc.Class({

    extends: cc.Component,

    properties: {
        _ccb:null,
        _root:null,
        _originPosition:null,
        _state:AnswerNodeState.NORMAL,
    },

     init:function (ccb, root) {
        this._ccb = ccb;
        this._root = root;
        this._originPosition = this._ccb.getPosition();
    },

    setSpriteFrame:function(name){
        this._ccb.getChildByTag(1).getChildByTag(1).getChildByTag(1).setSpriteFrame(name);
    },

    active:function(){
        this._ccb.animationManager.runAnimationsForSequenceNamed("p");
        this._state = AnswerNodeState.ACTIVE;
    },

    resume:function(){
        this._ccb.setPosition(this._originPosition);
        this._ccb.animationManager.runAnimationsForSequenceNamed("normal");
        this._state = AnswerNodeState.NORMAL; 
    },

    disappear:function(){
        this._ccb.setPosition(this._originPosition);
        this._ccb.animationManager.runAnimationsForSequenceNamed("out");
        this._state = AnswerNodeState.OVER;
    },

    radius:function(){
        return this._ccb.getContentSize().width/2;
    },

    worldPosition:function(){
        var point = this._root.convertToWorldSpace(this._ccb.getPosition());
        point.x += this.radius();
        point.y += this.radius();
        return point;
    },

    setWorldPosition:function(pos){
        var point = this._root.convertToNodeSpace(pos);
        point.x = point.x-this.radius();
        point.y = point.y-this.radius();
        this._ccb.setPosition(point);
    },

    tag:function(){
        return this._ccb.getTag();
    },

    state:function(){
        return this._state;
    }

});
