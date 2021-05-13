// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

(window as any).Global = {
    firstEnterGame: true,
};

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

    start () {
        cc.director.preloadScene("main", function () {
            cc.log("main scene preloaded");
        });

        if ((window as any).Global.firstEnterGame) {
            const loadPic = cc.instantiate(this.loadPicPrefab)
            this.canvas.addChild(loadPic)
            this.scheduleOnce(() => {
                this.canvas.removeChild(loadPic)
                setTimeout(function () {
                    loadPic.destroy();
                }.bind(this), 0);
            }, 1); // dev下展示的时间似乎不是稳定的1s
            (window as any).Global.firstEnterGame = false;
        }
    }

    onLoad () {

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
        // 商城回调
    }

    // update (dt) {}
}
