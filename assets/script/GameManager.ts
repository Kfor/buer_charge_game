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

    // LIFE-CYCLE CALLBACKS:
    

    // onLoad () {}

    start () {
        this.subsystemInit()
        this.eventRegister()
        this.dataInit()
        this.generatePlatform()
    }

    subsystemInit() {
        const manager = cc.director.getCollisionManager();
        manager.enabled = true;
        // manager.enabledDebugDraw = true;
        // manager.enabledDrawBoundingBox = true;
    }

    eventRegister() {
        // cc.systemEvent.on(cc.SystemEvent.EventType.DEVICEMOTION, this.onKeyDown, this)
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this)
        this.canvas.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this)
        this.canvas.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this)
        this.canvas.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this)

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
        if (seed < 0.15) {
            realX = minX
        } else if (seed > 0.85) {
            realX = maxX
        } else {
            realX = (seed * (0.75-0.25) + 0.25) * (maxX - minX) + minX
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
    }

    endGame() {

    }
}
