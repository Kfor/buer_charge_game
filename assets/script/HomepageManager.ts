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
    
    @property(cc.Node)
    rankList: cc.Node = null;
    @property(cc.Node)
    rankListView: cc.Node = null;
    
    @property({type: cc.Prefab})
    public listItemPrefab: cc.Prefab = null;

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

        this.rankList.active = false;
        this.canvas.on(cc.Node.EventType.TOUCH_START, (event) => {
            if (this.rankList.active === true) {
                this.rankList.active = false;
                event.stopPropagation();
            }
        }, this, true)
        // this.canvas.on('click', () => {
        //     debugger
        //     this.rankList.active = false;
        // }, this, true)
    }

    beginGame() {
        cc.director.loadScene("main");
    }

    showRank() {
        // 之后换成查排名前几的数据
        const datas = [{
            rank: 1,
            avatarUrl: '',
            nickname: 'xxx',
            time: 59,
        }, {
            rank: 2,
            avatarUrl: '',
            nickname: 'xxx2',
            time: 80,
        }, {
            rank: 3,
            avatarUrl: '',
            nickname: 'xxx3',
            time: 99,
        }, {
            rank: 4,
            avatarUrl: '',
            nickname: 'xxx4',
            time: 129,
        },]
        this.rankListView.removeAllChildren()
        let posY = this.rankListView.height/2
        for (let i = 0; i < datas.length; i++) {
            const listItem = cc.instantiate(this.listItemPrefab)
            this.rankListView.addChild(listItem)
            listItem.setPosition(listItem.getPosition().x, posY - listItem.height/2)
            posY -= listItem.height + 4
            listItem.getChildByName("rank").getComponent(cc.Label).string = `${datas[i].rank}`
            listItem.getChildByName("name").getComponent(cc.Label).string = `${datas[i].nickname}`
            listItem.getChildByName("time").getComponent(cc.Label).string = `${datas[i].time}`
            // 加载微信头像
            cc.loader.load({url: datas[i].avatarUrl+'?file=a.png', type: 'png'}, function (err, tex) {      
                listItem.getChildByName("avatar").getComponent(cc.Sprite).spriteFrame=new cc.SpriteFrame(tex)
            });
        }
        
        this.rankList.active = true;
    }

    gotoStore() {
        // 商城回调
    }

    // update (dt) {}
}
