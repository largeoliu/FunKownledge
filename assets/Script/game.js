var LevelManager = require('LevelManager');
var Utils = require('Utils');
var AnswerNode = require('AnswerNode');

var s_inlaySprs = ["CCBFile", "CCBFile_1", "CCBFile_2"];

cc.Class({
   
    extends: cc.Component,

    properties: {
        MAX_INDEX:3,
        FULL_MARK:3,
        _curAnswerCCB:null,
        _score:0,
        
        answerNodes:[cc.Node],

        animateLayer: {
            default: null,
            type: cc.Node
        },

        level_text_ccb: cc.Node,
        level_text_spr: cc.Sprite,
        menuLayer: cc.Node
    },

    // use this for initialization
    onLoad: function () {
        this.setInputControl(true);
    },

    start: function(){
        this._newGame();

        Utils.playMusic("resources/Sound/bgm.mp3", true);
    },


    setInputControl: function(on){
        if(on){
            this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchBegan, this);
            this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMoved, this);
            this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnded, this);
            this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchCancelled, this);
        }else{
            this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchBegan, this);
            this.node.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMoved, this);
            this.node.off(cc.Node.EventType.TOUCH_END, this.onTouchEnded, this);
            this.node.off(cc.Node.EventType.TOUCH_CANCEL, this.onTouchCancelled, this);
        }
    },


    exitGame:function(){

    },

    _distance:function(pos1, pos2){
        var dx = pos1.x-pos2.x;
        var dy = pos1.y-pos2.y;
        return Math.sqrt(dx * dx + dy * dy);
    },

    onTouchBegan:function(event) {
        var pos = this.node.convertTouchToNodeSpaceAR(event.touch);
        cc.log("onTouchBegan: "+pos.x+" "+pos.y);

        for(var i = 1; i<=this.MAX_INDEX; i++){
            var answerNode = this._getAnswerNode(i).getComponent("AnswerNode");
            var answer_pos = answerNode.worldPosition();
            cc.log("answer_pos: "+answer_pos.x+" "+answer_pos.y);
            cc.log("distance: "+this._distance(answer_pos, pos));
            cc.log("radius: "+answerNode.radius());
            if((this._distance(answer_pos, pos)<answerNode.radius()) && (answerNode.state()==AnswerNode.AnswerNodeState.NORMAL)){
                answerNode.active();
                this._curAnswerCCB = answerNode;
                Utils.playMusic("resources/Sound/btn_p.mp3");
                return true;
            }
        }

        return false;
    },

    onTouchMoved:function(event) {
        var pos = this.node.convertTouchToNodeSpaceAR(event.touch);

        if(this._curAnswerCCB!=null){
            this._curAnswerCCB.setWorldPosition(pos);
        }
        
    },

    onTouchEnded:function(event) {
        var pos = this.node.convertTouchToNodeSpaceAR(event.touch);
        this._check(pos);
    },

    onTouchCancelled:function(event) {
        var pos = this.node.convertTouchToNodeSpaceAR(event.touch);
        tnis._check(pos);
    },

    _check:function(pos){
        if(this._curAnswerCCB == null) return;
        
        var spr = this._getInlaySpr(this._curAnswerCCB.tag());
        var correct = spr.getPosition();
        var dp = this.node.convertToWorldSpace(this.animateLayer.getPosition());

        correct.x = correct.x+dp.x+spr.getContentSize().width/2;
        correct.y = correct.y+dp.y+spr.getContentSize().height/2;

        if(this._distance(correct, pos)<spr.getContentSize().width/2){
            this._onCorrect();
            Utils.playMusic("resources/Sound/btn_right.mp3");
        }else{
            this._curAnswerCCB.resume();
            Utils.playMusic("resources/Sound/btn_wrong.mp3");
        }

    },

    _onCorrect:function(){
        cc.log("_onCorrect");
        var inlay = this._getInlaySpr(this._curAnswerCCB.tag());
        inlay.getComponent(cc.Animation).play("out");
        Utils.loadCCB("prefab/title_tx", function (particle){
            particle.setPosition(cc.p(inlay.getContentSize().width/2, inlay.getContentSize().height/2));
            particle.setAnchorPoint(cc.p(0.5, 0.5));
            inlay.addChild(particle);
        });

        this._curAnswerCCB.disappear();
        this._score++;
        if(this._score==this.FULL_MARK){
            this._onSuccess();
            this._score = 0;
        }
    },

    _onSuccess:function(){
        var level = LevelManager.getInstance().currentLevel();
        Utils.playMusic("resources/level"+level.level+"/"+level.index+"/level"+level.level+"_"+level.index+".mp3");
        this._level_animate_ccb.getComponent(cc.Animation).play("act");
        this.level_text_ccb.getComponent(cc.Animation).play("act");
        this.menuLayer.active = true;
        this.menuLayer.getComponent(cc.Animation).play("in");
        if(LevelManager.getInstance().isEnd()){
            this.nextBtn.setVisible(false);
        }
    },

    _getAnswerNode:function(tag){
        return this.answerNodes[tag-1];
    },

    _getInlaySpr:function(tag){
        return cc.find(s_inlaySprs[tag-1], this._level_animate_ccb);
    },

    _newGame:function(){
        if(this._level_animate_ccb != null){
            this._level_animate_ccb.removeFromParent();
            this._level_animate_ccb = null;
        }
        if(this._level_text_ccb != null){
            this._level_text_ccb.removeFromParent();
            this._level_text_ccb = null;

            this.menuLayer.animationManager.runAnimationsForSequenceNamed("out");
            this.menuLayer.animationManager.setCompletedAnimationCallback(this, function(){
                this.setInputControl(true);
            });
        }

        var level = LevelManager.getInstance().currentLevel();

        // cc.SpriteFrameCache.getInstance().addSpriteFrames("level"+level.level+"_btn.plist");
        
        Utils.loadCCB(this._level_ccb_name(level), function (node){
            this._level_animate_ccb = node;
            this.animateLayer.addChild(this._level_animate_ccb);
        }.bind(this));

        cc.loader.loadRes(this._level_word_spr_name(level), cc.SpriteFrame, function (err, spriteFrame) {
            this.level_text_spr.getComponent(cc.Sprite).spriteFrame = spriteFrame;
        }.bind(this));


        for(var i = 1; i<=this.MAX_INDEX; i++){
            this._getAnswerNode(i).getComponent("AnswerNode").setSpriteFrame("level"+level.level+"/level"+level.level+"_btn", "level"+level.level+"_btn"+((level.index-1)*this.MAX_INDEX+i));
            this._getAnswerNode(i).getComponent("AnswerNode").resume();
        }
        // this.answer_ccb.animationManager.runAnimationsForSequenceNamed("in");
          
        cc.sys.localStorage.setItem("level", level.index+"");
    },

    onReplay:function(){
        this.menu.setEnabled(false);
        this.setInputControl(false);
        this._newGame();
    },

    onNext:function(){
        this.menu.setEnabled(false);
        this.setInputControl(MSFIDOCredentialAssertion);
        LevelManager.getInstance().next();
        this._newGame();
    },

                                
    onClick:function(levelInfo){
        this._level_animate_ccb.getComponent(cc.Animation).play("act");
    },

    onExitGame:function(){
        this.exitGame();
    },

    _level_ccb_name:function(levelInfo){
        var level = levelInfo.level;
        var index = levelInfo.index;
        return "level"+level+"/"+index+"/level"+level+"_"+index;
    },

    _level_word_spr_name:function(levelInfo){
        var level = levelInfo.level;
        var index = levelInfo.index;
        return "level"+level+"/"+index+"/"+index;
    }


});
