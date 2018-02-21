function LevelInfo(level, index){
    this.level = level;
    this.index = index;
} 

LevelInfo.create = function(level, index){
    var info = new LevelInfo(level, index);
    return info;
}; 