// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Node)
    startBtn: cc.Node = null;

    @property(cc.Node)
    rankBtn: cc.Node = null;

    @property(cc.Node)
    storeBtn: cc.Node = null;
    
    @property(cc.Node)
    canvas: cc.Node = null;
    
    @property({type: cc.Prefab})
    public loadPicPrefab: cc.Prefab = null;

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        cc.director.preloadScene("main", function () {
            cc.log("main scene preloaded");
        });
    }

    start () {

        const loadPic = cc.instantiate(this.loadPicPrefab)
        this.canvas.addChild(loadPic)
        this.scheduleOnce(() => {
            this.canvas.removeChild(loadPic)
            setTimeout(function () {
                loadPic.destroy();
            }.bind(this), 0);
        }, 1.1) // 感觉1秒钟有点短，但是又不敢弄更长一点

        this.startBtn.on('click', this.beginGame, this)
        this.rankBtn.on('click', this.showRank, this)
        this.storeBtn.on('click', this.gotoStore, this)
    }

    beginGame() {
        cc.director.loadScene("main");
    }

    showRank() {
        
    }

    gotoStore() {
        
    }

    // update (dt) {}
}
