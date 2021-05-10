// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

import PlayerController from "./PlayerController";

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

@ccclass
export default class GameManager extends cc.Component {
    
    @property(cc.Node)
    canvas: cc.Node;

    @property(cc.Node)
    player: cc.Node;

    @property({type: PlayerController})
    public playerCtrl: PlayerController = null;

    @property(Number)
    playerSpeed: number = 400;
    
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

    private _canvasWidth = 0;
    private _isTouching = false;
    private _touchPos = new cc.Vec2();
    private _platformList : Array<cc.Node> = [];
    private _platformDeltaY = 0;

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
    public hpPoint = 3;
    private _prevHpPoint = 3;

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
        manager.enabledDebugDraw = true;
        manager.enabledDrawBoundingBox = true;
    }

    eventRegister() {
        // cc.systemEvent.on(cc.SystemEvent.EventType.DEVICEMOTION, this.onKeyDown, this)
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this)
        this.canvas.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this)
        this.canvas.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this)
        this.canvas.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this)
    }

    dataInit() {
        this._canvasWidth = this.canvas?.getContentSize().width
        this.player.setPosition(0, this.canvas?.getContentSize().height/4)
    }

    generatePlatform() {
        const initPlatform = cc.instantiate(this.basicPlatformPrfb)
        this.canvas.addChild(initPlatform)
        initPlatform.setPosition(0, this.canvas?.getContentSize().height/4 - 90)
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
        this.updatePlatformPos()
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

    updatePlatformPos() {
        this._platformList.forEach(platform => {
            let newPos = new cc.Vec2()
            cc.Vec2.add(newPos, platform.getPosition(), new cc.Vec2(0, this.playerCtrl._platformDeltaY))
            platform.setPosition(newPos)

            this.playerCtrl._platformDeltaY = 0;
        })
    }

    updateUI(deltaTime: number) {
        if (this._prevHpPoint !== this.hpPoint) {
            this.updateUIHpPoint()
            this.hpPoint = this._prevHpPoint
        }
        this.updateUITime(deltaTime)
        this.updateUIScore()
        if (this._prevPauseState !== this.pauseState) {
            this.updateUIPause()
            this.pauseState = this._prevPauseState
        }
    }

    updateUIHpPoint() {
        if (this.hpPoint !== this._prevHpPoint) {
            const hpSpriteNodes = this.hpGroup.children
            hpSpriteNodes.forEach((node, i) => {
                if (i < this.hpPoint) {
                    node.getComponent(cc.Sprite).spriteFrame = this.fullHeartSprite;
                } else {
                    node.getComponent(cc.Sprite).spriteFrame = this.emptyHeartSprite;
                }
            })
            this._prevHpPoint = this.hpPoint;
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
        if (this.pauseState === PauseState.Pause) {
            this.pauseNode.getComponent(cc.Sprite).spriteFrame = this.startSprite;
        } else if (this.pauseState === PauseState.Start) {
            this.pauseNode.getComponent(cc.Sprite).spriteFrame = this.pauseSprite;
        }
    }

    addScore(count:number = 1) {
        this._score += count;
    }

    plusHP(count:number = 1) {
        if (this.hpPoint < 3) this.hpPoint++;
        // 可能有播放加血音效
    }

    minusHP(count:number = 1) {
        this.hpPoint--;
        if (this.hpPoint === 0) this.endGame()
        // 可能有播放减血音效
    }

    endGame() {

    }
}
