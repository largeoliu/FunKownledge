require('LevelManager');
var util = require('util');

cc.Class({
   
    extends: cc.Component,

    properties: {
        MAX_INDEX:3,
        FULL_MARK:3,
        _curAnswerCCB:null,
        _score:0,
        _answerNodes:[]
    },

    // use this for initialization
    onLoad: function () {

        this._game_ui = util.loadCCB("game_mc", this);
        this.node.addChild(this._game_ui);

        setInputControl();

        this._newGame();

        util.playMusic("all/bgm.mp3");
    },

    // called every frame
    update: function (dt) {

    },

    setInputControl: function(){
        var self = this;
        this._touchListener = cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: this.onTouchBegan,
            onTouchMoved: this.onTouchMoved,
            onTouchEnded: this.onTouchEnded,
            onTouchCancelled: this.onTouchCancelled
        }, self.node);

        this._keyListener = cc.eventManager.addListener({
            event: cc.EventListener.KEYBOARD,
            onKeyPressed: this.onKeyPressed,
            onKeyReleased: this.onKeyReleased
        }, self.node);
    },


    exitGame:function(){
        
    },

    _distance:function(pos1, pos2){
        var dx = pos1.x-pos2.x;
        var dy = pos1.y-pos2.y;
        return Math.sqrt(dx * dx + dy * dy);
    },

    onKeyPressed: function (key, event) {
    },

    onKeyReleased: function (key, event) {
        var self = event.getCurrentTarget();
        if(key==cc.KEY["back"]){
            self.exitGame();
        }
    },

    onTouchBegan:function(touch, event) {
        var pos = touch.getLocation();
        var self = event.getCurrentTarget();
        
        for(var i = 1; i<=self.MAX_INDEX; i++){
            var answerNode = self._getAnswerNode(i);
            var answer_pos = answerNode.worldPosition();
            if((self._distance(answer_pos, pos)<answerNode.radius()) && (answerNode.state()==AnswerNodeState.NORMAL)){
                answerNode.active();
                self._curAnswerCCB = answerNode;
                cc.audioEngine.playEffect("all/btn_p.mp3");
                return true;
            }
        }

        return false;
    },

    onTouchMoved:function(touch, event) {
        var pos = touch.getLocation();
        var self = event.getCurrentTarget();

        if(self._curAnswerCCB!=null){
            self._curAnswerCCB.setWorldPosition(pos);
        }
        
    },

    onTouchEnded:function(touch, event) {
        var pos = touch.getLocation();
        var self = event.getCurrentTarget();
        self._check(pos);
    },

    onTouchCancelled:function(touch, event) {
        var pos = touch.getLocation();
        var self = event.getCurrentTarget();
        self._check(pos);
    },

    _check:function(pos){
        if(this._curAnswerCCB == null) return;
        
        var spr = this._getInlaySpr(this._curAnswerCCB.tag());
        var correct = spr.getPosition();
        var dp = this.convertToWorldSpace(this.animateLayer.getPosition());

        correct.x = correct.x+dp.x+spr.getContentSize().width/2;
        correct.y = correct.y+dp.y+spr.getContentSize().height/2;

        if(this._distance(correct, pos)<spr.getContentSize().width/2){
            this._onCorrect();
            cc.audioEngine.playEffect("all/btn_right.mp3");
        }else{
            this._curAnswerCCB.resume();
            cc.audioEngine.playEffect("all/btn_wrong.mp3");
        }

    },

    _onCorrect:function(){
        var inlay = this._getInlaySpr(this._curAnswerCCB.tag());
        inlay.animationManager.runAnimationsForSequenceNamed("out");
        var particle = cc.BuilderReader.load("title_tx", this);
        particle.setPosition(cc.p(inlay.getContentSize().width/2, inlay.getContentSize().height/2));
        particle.setAnchorPoint(cc.p(0.5, 0.5));
        inlay.addChild(particle);

        this._curAnswerCCB.disappear();
        this._score++;
        if(this._score==this.FULL_MARK){
            this._onSuccess();
            this._score = 0;
        }
    },

    _onSuccess:function(){
        var level = LevelManager.getInstance().currentLevel();
        cc.audioEngine.playEffect("level"+level.level+"_"+level.index+".mp3");
        this._level_animate_ccb.animationManager.runAnimationsForSequenceNamed("act");
        this._level_text_ccb.animationManager.runAnimationsForSequenceNamed("act");
        this.menuLayer.animationManager.runAnimationsForSequenceNamed("in");
        if(LevelManager.getInstance().isEnd()){
            this.nextBtn.setVisible(false);
        }
        this.menu.setEnabled(true);
    },

    _createAnswerNodes:function(tag){
        var answerBtnLayer = this.answer_ccb.getChildByTag(1);
        var answerBtn = answerBtnLayer.getChildByTag(tag);
        this._answerNodes[tag] = null;
        this._answerNodes[tag] =  new AnswerNode(answerBtn, this);
    },

    _getAnswerNode:function(tag){
        return this._answerNodes[tag];
    },

    _getInlaySpr:function(tag){
        var level = LevelManager.getInstance().currentLevel();
        return eval("this.jv_"+((level.index-1)*this.MAX_INDEX+tag));
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
                this._touchListener.setEnabled(true);
            });
        }

        var level = LevelManager.getInstance().currentLevel();

        cc.SpriteFrameCache.getInstance().addSpriteFrames("level"+level.level+"_btn.plist");

        this._level_animate_ccb = cc.BuilderReader.load(this._level_ccb_name(level), this);
        this.animateLayer.addChild(this._level_animate_ccb);

        this._level_text_ccb = cc.BuilderReader.load(this._level_word_ccb_name(level), this);
        this.titleLayer.addChild(this._level_text_ccb);

        for(var i = 1; i<=this.MAX_INDEX; i++){
            this._createAnswerNodes(i);
            this._getAnswerNode(i).setSpriteFrame("level"+level.level+"_btn"+((level.index-1)*this.MAX_INDEX+i)+".png");
            this._getAnswerNode(i).resume();
        }
        
        this.answer_ccb.animationManager.runAnimationsForSequenceNamed("in");
                     
        sys.localStorage.setItem("level", level.index+"");
    },

    onReplay:function(){
        this.menu.setEnabled(false);
        this._touchListener.setEnabled(false);
        this._newGame();
    },

    onNext:function(){
        this.menu.setEnabled(false);
        this._touchListener.setEnabled(false);
        LevelManager.getInstance().next();
        this._newGame();
    },

                                
    onClick:function(levelInfo){
        this._level_animate_ccb.animationManager.runAnimationsForSequenceNamed("act");
    },

    onExitGame:function(){
        this.exitGame();
    },

    _level_ccb_name:function(levelInfo){
        var level = levelInfo.level;
        var index = levelInfo.index;
        return "level"+level+"/level"+level+"_"+index;
    },

    _level_word_ccb_name:function(levelInfo){
        return this._level_ccb_name(levelInfo)+"_word";
    }


});
