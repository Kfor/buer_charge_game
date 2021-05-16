// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

import PlayerController from "./PlayerController";

// TODO
// cc.game.setFrameRate(100)

enum PlayerStatus {
    Breathing,
    Falling,
    Falled,
    MoveLeft,
    MoveRight,
}

enum PauseState {
    Pause,
    Start,
}

interface Platform extends cc.Node {
    countScore: boolean;
}

@ccclass
export default class GameManager extends cc.Component {
    
    @property(cc.Node)
    canvas: cc.Node = null;

    @property(cc.Node)
    platformContainer: cc.Node = null;

    @property(cc.Node)
    player: cc.Node = null;

    @property({type: PlayerController})
    public playerCtrl: PlayerController = null;

    @property(cc.Float)
    playerSpeed = 400;
    
    @property({type: cc.Prefab})
    public basicPlatformPrfb: cc.Prefab = null;
    @property({type: cc.Prefab})
    public fallPlatformPrfb: cc.Prefab = null;
    @property({type: cc.Prefab})
    public hurtPlatformPrfb: cc.Prefab = null;
    @property({type: cc.Prefab})
    public travelLeftPlatformPrfb: cc.Prefab = null;
    @property({type: cc.Prefab})
    public travelRightPlatformPrfb: cc.Prefab = null;
    @property({type: cc.Prefab})
    public heartPrfb: cc.Prefab = null;

    private _canvasWidth = 0;
    private _isTouching = false;
    private _touchPos = new cc.Vec2();
    private _platformList : Array<Platform> = [];

    // header

    @property(cc.Node)
    pauseNode: cc.Node = null;
    @property(cc.SpriteFrame)
    pauseSprite: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    startSprite: cc.SpriteFrame = null;
    public pauseState = PauseState.Start;
    private _prevPauseState = PauseState.Start;
    
    @property(cc.Label)
    scoreLabel: cc.Label = null;
    private _score = 0;

    @property(cc.Label)
    timeLabel: cc.Label = null;
    private gameTime = 0;

    @property(cc.Node)
    hpGroup: cc.Node = null;
    @property(cc.SpriteFrame)
    fullHeartSprite: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    emptyHeartSprite: cc.SpriteFrame = null;
    private _playerHpPoint = 3;

    @property(cc.Node)
    pauseContainerNode: cc.Node = null;
    @property(cc.Node)
    resumeContainerNode: cc.Node = null;
    @property(cc.Node)
    endContainerNode: cc.Node = null;

    private _gameFinalSucceed = false;
    private _goalScore = 12;

    @property(cc.Node)
    finishContainerNode: cc.Node = null;
    @property(cc.Node)
    scoreFrameNode: cc.Node = null;
    @property(cc.Node)
    failContainerNode: cc.Node = null;
    @property(cc.Node)
    successContainerNode: cc.Node = null;
    @property(cc.Label)
    successScoreLabel: cc.Label = null;
    @property(cc.Node)
    uploadScoreBtnNode: cc.Node = null;
    
    @property(cc.Node)
    rankListContainer: cc.Node = null;
    @property(cc.Node)
    rankListView: cc.Node = null;
    @property({type: cc.Prefab})
    public listItemPrefab: cc.Prefab = null;
    
    @property(cc.Node)
    footerReplayNode: cc.Node = null;
    @property(cc.Node)
    footershareNode: cc.Node = null;
    @property(cc.Node)
    footerBackNode: cc.Node = null;
    @property(cc.Node)
    footerStoreNode: cc.Node = null;

    // LIFE-CYCLE CALLBACKS:
    

    // onLoad () {}

    onLoad () {
        this.subsystemInit()
        this.eleInit()
        this.eventRegister()
        this.dataInit()
        this.generatePlatform()
    }

    subsystemInit() {
        const manager = cc.director.getCollisionManager();
        manager.enabled = true;
        manager.enabledDebugDraw = true;
        manager.enabledDrawBoundingBox = true;
    }
    
    eleInit() {
        this.pauseContainerNode.active = false;
        this.finishContainerNode.active = false;
    }

    eventRegister() {
        // cc.systemEvent.on(cc.SystemEvent.EventType.DEVICEMOTION, this.onKeyDown, this)
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this)
        this.canvas.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this)
        this.canvas.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this)
        this.canvas.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this)

        this.pauseNode.on('click', () => {
            if (!cc.director.isPaused()) {
                this.pauseContainerNode.active = true;
                cc.director.pause();
            }
        })
        this.resumeContainerNode.on('click', () => {
            if (cc.director.isPaused()) {
                this.pauseContainerNode.active = false;
                cc.director.resume();
            }
        })
        this.endContainerNode.on('click', () => {
            this.endGame();
        })

        
        this.uploadScoreBtnNode.on('click', () => {
            this.uploadScore();
        })

        this.footerReplayNode.on('click', () => {
            cc.director.resume();
            cc.director.loadScene("main");
        })
        this.footershareNode.on('click', () => {
            if (!this._gameFinalSucceed) {
                this.playerCtrl.plusHP();
                this.finishContainerNode.active = false;
                cc.director.resume();
            }
        })
        this.footerBackNode.on('click', () => {
            cc.director.resume();
            cc.director.loadScene("begin");
        })
        this.footerStoreNode.on('click', () => {
            // 商城回调
        })

        this.playerCtrl.node.on('deleteFallPlatform', (platformNode: Platform) => {
            for (let i = 0; i < this._platformList.length; i++) {
                if (this._platformList[i] === platformNode) {
                    this._platformList.splice(i, 1)
                    break;
                }
            }
            this.platformContainer.removeChild(platformNode) // 不知道是否需要这一句
            setTimeout(function () {
                platformNode.destroy();
            }.bind(this), 0);
            if ((platformNode as any)._name !== 'Heart') this.addScore()
        })
    }

    dataInit() {
        this._canvasWidth = this.canvas.getContentSize().width
        this.player.setPosition(0, this.canvas.getContentSize().height/4)
    }

    generatePlatform() {
        const initPlatform = cc.instantiate(this.basicPlatformPrfb) as Platform
        this.platformContainer.addChild(initPlatform)
        initPlatform.setPosition(0, this.canvas.getContentSize().height/4 - 190)
        this._platformList.push(initPlatform)
    }

    onTouchStart(event: cc.Event.EventTouch) {
        this._isTouching = true;
        const location: any = event.getTouches()[0].getLocation()
        this._touchPos.x = location.x
        this._touchPos.y = location.y
    }

    onTouchMove(event: cc.Event.EventTouch) {
        this._isTouching = true;
        const location: any = event.getTouches()[0].getLocation()
        this._touchPos.x = location.x
        this._touchPos.y = location.y
    }

    onTouchEnd(event: cc.Event.EventTouch) {
        this._isTouching = false;
        // const location: any = event.getTouches()[0].getLocation()
        // this._touchPos.x, this._touchPos.y = location.x, location.y
    }

    onKeyDown(event: any) {
        let newPos = new cc.Vec2()
        const speed = 40
        switch(event.keyCode) {
            case cc.macro.KEY.a:
                cc.Vec2.add(newPos, this.player.getPosition(), new cc.Vec2(-speed, 0.0))
                this.player.setPosition(newPos)
                break;
            case cc.macro.KEY.w:
                cc.Vec2.add(newPos, this.player.getPosition(), new cc.Vec2(0.0, speed))
                this.player.setPosition(newPos)
                break;
            case cc.macro.KEY.s:
                cc.Vec2.add(newPos, this.player.getPosition(), new cc.Vec2(0.0, -speed))
                this.player.setPosition(newPos)
                break;
            case cc.macro.KEY.d:
                cc.Vec2.add(newPos, this.player.getPosition(), new cc.Vec2(speed, 0.0))
                this.player.setPosition(newPos)
                break;
            default:
                break;
        }
    }

    // update (dt) {}
    update (deltaTime: number) {
        this.updatePlatforms()
        this.updatePlatformPos()
        this.updateScore()
        this.updateUI(deltaTime)
        if (this._isTouching) {
            if (this._touchPos.x > this._canvasWidth/2) {
                this.playerCtrl.touchMove(this.playerSpeed * deltaTime)
                this.playerCtrl.touchChangeUiStatus(PlayerStatus.MoveRight)
            } else {
                this.playerCtrl.touchMove(-this.playerSpeed * deltaTime)
                this.playerCtrl.touchChangeUiStatus(PlayerStatus.MoveLeft)
            }
        } else {
            this.playerCtrl.touchChangeUiStatus(PlayerStatus.Breathing)
        }
    }

    updatePlatforms() {
        while (
            this._platformList.length > 0
            && this._platformList[0].y > this.canvas.getContentSize().height/2 + 50
        ) {
            // debugger
            const node = this._platformList[0]
            this._platformList.shift()
            this.platformContainer.removeChild(node) // 不知道是否需要这一句
            setTimeout(function () {
                node.destroy();
            }.bind(this), 100);
        }
        while (
            this._platformList.length > 0 
            && this._platformList[this._platformList.length-1].y > -this.canvas.getContentSize().height/2
        ) {
            // debugger
            const lastPos = this._platformList[this._platformList.length-1].y
            this.generateNewPlatform(lastPos)
        }
        // cc.log('last y pos')
        // cc.log(this._platformList[this._platformList.length-1].y)
    }

    generateNewPlatform(lastPos: number) {
        let platformKind: cc.Prefab
        const seed1 = Math.random()
        if (seed1 < 0.3) {
            platformKind = this.basicPlatformPrfb
        } else if (seed1 < 0.5) {
            platformKind = this.fallPlatformPrfb
        } else if (seed1 < 0.7) {
            platformKind = this.hurtPlatformPrfb
        } else if (seed1 < 0.85) {
            platformKind = this.travelLeftPlatformPrfb
        } else {
            platformKind = this.travelRightPlatformPrfb
        }
        const platform = cc.instantiate(platformKind) as Platform
        const minX = platform.width/2 - this.canvas.getContentSize().width/2
        const maxX = this.canvas.getContentSize().width/2 - platform.width/2
        let realX
        const seed = Math.random()
        if (seed < 0.15 &&　platformKind !== this.travelLeftPlatformPrfb) {
            realX = minX
        } else if (seed > 0.85 &&　platformKind !== this.travelRightPlatformPrfb) {
            realX = maxX
        } else {
            realX = (seed * (0.72-0.28) + 0.28) * (maxX - minX) + minX
        }
        const realY = lastPos - (Math.random() * (450 - 350) + 350)
        this.platformContainer.addChild(platform)
        platform.setPosition(realX, realY)
        this._platformList.push(platform)
        if (Math.random() < 0.07 && platformKind !== this.hurtPlatformPrfb) {
            cc.log('create heart')
            const heart = cc.instantiate(this.heartPrfb) as Platform
            this.platformContainer.addChild(heart)
            heart.setPosition(realX, realY + 80)
            this._platformList.push(heart)
        }
    }

    updatePlatformPos() {
        this._platformList.forEach(platform => {
            let newPos = new cc.Vec2()
            cc.Vec2.add(newPos, platform.getPosition(), new cc.Vec2(0, this.playerCtrl._platformDeltaY))
            platform.setPosition(newPos)
        })
        this.playerCtrl._platformDeltaY = 0;
    }

    updateScore() {
        this._platformList.forEach(platform => {
            if (!platform.countScore && platform.position.y > this.player.position.y) {
                platform.countScore = true;
                this.addScore()
            }
        })
        
    }

    updateUI(deltaTime: number) {
        this.updateUIHpPoint()
        this.updateUITime(deltaTime)
        this.updateUIScore()
        this.updateUIPause()
    }

    updateUIHpPoint() {
        if (this._playerHpPoint !== this.playerCtrl.hpPoint) {
            this._playerHpPoint = this.playerCtrl.hpPoint
            const hpSpriteNodes = this.hpGroup.children
            hpSpriteNodes.forEach((node, i) => {
                if (i < this._playerHpPoint) {
                    node.getComponent(cc.Sprite).spriteFrame = this.fullHeartSprite;
                } else {
                    node.getComponent(cc.Sprite).spriteFrame = this.emptyHeartSprite;
                }
            })
            if (this._playerHpPoint === 0) this.endGame()
        }
    }

    updateUITime(deltaTime: number) {
        this.gameTime += deltaTime;
        const minute = Math.floor(this.gameTime / 60);
        const second = Math.floor(this.gameTime - minute*60);
        this.timeLabel.string = `${Appendzero(minute)}:${Appendzero(second)}`

        function Appendzero(obj) {
            if(obj<10) return "0" +""+ obj;
            else return obj;
        }
    }

    updateUIScore() {
        this.scoreLabel.string = `${this._score}`
    }

    updateUIPause() {
        if (this._prevPauseState !== this.pauseState) {
            if (this.pauseState === PauseState.Pause) {
                this.pauseNode.getComponent(cc.Sprite).spriteFrame = this.startSprite;
            } else if (this.pauseState === PauseState.Start) {
                this.pauseNode.getComponent(cc.Sprite).spriteFrame = this.pauseSprite;
            }
            this.pauseState = this._prevPauseState
        }
    }

    addScore(count:number = 1) {
        this._score += count;
        if (this._score >= this._goalScore) this.endGame()
    }

    endGame() {
        if (this._playerHpPoint === 0) {
            this._gameFinalSucceed = false;
            this.failContainerNode.active = true;
            this.successContainerNode.active = false;
        } else if (this._score === this._goalScore) {
            this._gameFinalSucceed = true;
            this.failContainerNode.active = false;
            this.successContainerNode.active = true;
            const second = Math.floor(this.gameTime);
            this.successScoreLabel.string = `${second} s`
        }
        this.finishContainerNode.active = true;
        this.rankListContainer.active = false;
        cc.director.pause();
    }

    uploadScore() {
        // will uploadScore
        'to upload score'
        // const gameTime = this.gameTime
        // const windowAny = window as any
        // if (windowAny.wx && windowAny.cloud) {
        //     const db = windowAny.cloud.database()
        //     db.collection('gamerank').add({
        //     data: {
        //         nickName: '11 lizipei',
        //         costTime: 71,
        //         avatarUrl: '11 example avatarUrl'
        //     },
        //     success: res => {
        //         cc.log('success add')
        //     },
        //     fail: err => {
        //         cc.log('err add')
        //     }
        //     })
        // } else {
        //     cc.log('no wx cloud')
        // }
        
        // after uploaded succeeded, show ranklist
        this.scoreFrameNode.active = false;
        this.createRankList()
        this.rankListContainer.active = true;
    }

    createRankList() {
        // 之后换成查排名前几的数据和这次得分排名
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
        
    }
}
